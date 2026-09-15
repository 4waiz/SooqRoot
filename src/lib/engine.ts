import { CommitmentAllocation, Farm, FarmCapacityLine, Grade, Unit } from '../types';
import { FARMS } from '../data/farms';
import { getProduct } from '../data/products';

/* ============================================================
   SooqRoot Commitment Engine
   ------------------------------------------------------------
   Deterministic pre-harvest allocation. Given a buyer order it
   scores every farm in the network on eight weighted signals,
   then splits the order across farms under two risk rules:

     • CONCENTRATION_CAP — no single farm carries more than 23%
       of one order (supply-concentration risk).
     • BACKUP_CAP — no single backup farm is asked to stand
       behind more than 5% of one order.

   The same inputs always produce the same output. There is no
   randomness anywhere in this file.
   ============================================================ */

export const CONCENTRATION_CAP = 0.23;
export const BACKUP_CAP = 0.05;

/**
 * Allocations round down to a whole lot so crate counts stay clean.
 * Small orders use a finer lot than bulk ones.
 */
export function lotSize(qty: number): number {
  if (qty >= 2000) return 50;
  if (qty >= 500) return 25;
  return 10;
}

export interface EngineRequest {
  productId: string;
  qty: number;
  unit: Unit;
  grade: Grade;
  requiredBy: string;
  packaging?: string;
  buyerLocation?: string;
  orderRef?: string;
}

export interface ScoredCandidate {
  farm: Farm;
  line: FarmCapacityLine;
  available: number;
  score: number;
  signals: EngineSignal[];
  eligibility: 'primary' | 'backup';
  reason: string;
}

export interface EngineSignal {
  key: string;
  label: string;
  weight: number;
  /** 0-100 */
  value: number;
  note: string;
}

export interface EngineResult {
  request: EngineRequest;
  candidates: ScoredCandidate[];
  primary: CommitmentAllocation[];
  backup: CommitmentAllocation[];
  primaryQty: number;
  backupQty: number;
  coveragePct: number;
  shortfall: number;
  farmsEngaged: number;
  networkAvailable: number;
  /** Deterministic narrative of what the engine did, in order. */
  trace: string[];
}

/* ---------------- helpers ---------------- */

export function allocatable(line: FarmCapacityLine): number {
  return Math.max(0, line.expectedHarvest - line.committed - line.reserve);
}

function dayDiff(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86_400_000);
}

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

function floorTo(n: number, lot: number): number {
  return Math.floor(n / lot) * lot;
}

function gradeFit(line: FarmCapacityLine, grade: Grade): number {
  if (grade === 'A') return line.gradeProbability.A;
  if (grade === 'B') return clamp(line.gradeProbability.A + line.gradeProbability.B);
  return 100;
}

/* ---------------- scoring ---------------- */

const WEIGHTS = {
  reliability: 0.22,
  fulfilment: 0.2,
  grade: 0.18,
  proximity: 0.14,
  harvest: 0.12,
  packaging: 0.08,
  headroom: 0.06,
} as const;

export function scoreFarm(
  farm: Farm,
  line: FarmCapacityLine,
  req: EngineRequest
): { score: number; signals: EngineSignal[] } {
  const available = allocatable(line);
  const slackDays = dayDiff(line.harvestWindowEnd, req.requiredBy);

  const proximityValue = clamp(100 - farm.distanceKm * 0.85);
  // Ideal: harvest lands 1-6 days before the delivery date.
  const harvestValue =
    slackDays < 0 ? clamp(45 + slackDays * 6) : clamp(100 - Math.abs(slackDays - 3) * 7);
  const packagingValue = req.packaging
    ? line.packaging.some((p) => p.toLowerCase().includes(req.packaging!.toLowerCase().slice(0, 6)))
      ? 100
      : 58
    : 85;
  const headroomValue = clamp((available / Math.max(1, line.expectedHarvest)) * 100);
  const gradeValue = gradeFit(line, req.grade);

  const signals: EngineSignal[] = [
    {
      key: 'reliability',
      label: 'Reliability index',
      weight: WEIGHTS.reliability,
      value: farm.reliability,
      note: `${farm.reliability}/100 across ${farm.capacity.length} active crop lines`,
    },
    {
      key: 'fulfilment',
      label: 'Historical fulfilment',
      weight: WEIGHTS.fulfilment,
      value: farm.fulfilmentRate,
      note: `${farm.fulfilmentRate}% of committed volume delivered in full`,
    },
    {
      key: 'grade',
      label: 'Grade compatibility',
      weight: WEIGHTS.grade,
      value: gradeValue,
      note: `Grade ${req.grade} probability ${Math.round(gradeValue)}%`,
    },
    {
      key: 'proximity',
      label: 'Collection distance',
      weight: WEIGHTS.proximity,
      value: proximityValue,
      note: `${farm.distanceKm} km to consolidation point`,
    },
    {
      key: 'harvest',
      label: 'Harvest date fit',
      weight: WEIGHTS.harvest,
      value: harvestValue,
      note:
        slackDays < 0
          ? `Window closes ${Math.abs(slackDays)}d after delivery date`
          : `Harvest completes ${slackDays}d before delivery`,
    },
    {
      key: 'packaging',
      label: 'Packaging capability',
      weight: WEIGHTS.packaging,
      value: packagingValue,
      note: line.packaging.join(', '),
    },
    {
      key: 'headroom',
      label: 'Uncommitted headroom',
      weight: WEIGHTS.headroom,
      value: headroomValue,
      note: `${available.toLocaleString()} ${line.unit} free of ${line.expectedHarvest.toLocaleString()} expected`,
    },
  ];

  const score = signals.reduce((sum, s) => sum + s.value * s.weight, 0);
  return { score: Math.round(score * 10) / 10, signals };
}

/* ---------------- allocation ---------------- */

function batchId(orderRef: string, farm: Farm, index: number): string {
  return `${orderRef}-${farm.code}-${String(index + 1).padStart(2, '0')}`;
}

function commitmentDate(line: FarmCapacityLine, requiredBy: string): string {
  const end = new Date(line.harvestWindowEnd);
  const target = new Date(requiredBy);
  target.setDate(target.getDate() - 1);
  return (end < target ? end : target).toISOString().slice(0, 10);
}

export function runCommitmentEngine(req: EngineRequest, farms: Farm[] = FARMS): EngineResult {
  const orderRef = req.orderRef ?? 'SR-ORD';
  const trace: string[] = [];
  const product = getProduct(req.productId);
  const lot = lotSize(req.qty);

  /* 1 — gather candidates across every harvest window in the network */
  const candidates: ScoredCandidate[] = [];
  for (const farm of farms) {
    for (const line of farm.capacity) {
      if (line.productId !== req.productId) continue;
      const available = allocatable(line);
      if (available <= 0) continue;

      // Freshness gate — produce harvested more than one shelf life before the
      // delivery date cannot serve this order at all.
      const slackDays = dayDiff(line.harvestWindowEnd, req.requiredBy);
      if (slackDays > product.shelfLifeDays) continue;

      const { score, signals } = scoreFarm(farm, line, req);
      const windowEndsAfterDelivery = slackDays < 0;
      const gradeTooLow = gradeFit(line, req.grade) < 60;

      const eligibility: 'primary' | 'backup' =
        windowEndsAfterDelivery || gradeTooLow ? 'backup' : 'primary';

      const reason = windowEndsAfterDelivery
        ? `Harvest window closes ${new Date(line.harvestWindowEnd).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
          })} — after the delivery date, so held as backup cover.`
        : gradeTooLow
          ? `Grade ${req.grade} probability below the 60% primary threshold — held as backup cover.`
          : `Harvest completes ${slackDays}d before delivery, inside the ${product.shelfLifeDays}-day freshness window.`;

      candidates.push({ farm, line, available, score, signals, eligibility, reason });
    }
  }

  candidates.sort((a, b) => b.score - a.score || a.farm.distanceKm - b.farm.distanceKm);

  const networkAvailable = candidates.reduce((s, c) => s + c.available, 0);
  trace.push(
    `Scanned ${farms.length} farms — ${candidates.length} harvest windows carry ${product.name} inside the ${product.shelfLifeDays}-day freshness window (${networkAvailable.toLocaleString()} ${req.unit} available).`
  );

  const primaryPool = candidates.filter((c) => c.eligibility === 'primary');
  const backupPool = candidates.filter((c) => c.eligibility === 'backup');
  trace.push(
    `${primaryPool.length} clear the primary gate (harvest completes by ${req.requiredBy}, grade ${req.grade} probability ≥ 60%). ${backupPool.length} held as backup cover.`
  );

  // Concentration limit spreads supply risk, but never below an even split of
  // the order across the eligible pool — the cap must not cause an under-fill.
  const evenSplit = req.qty / Math.max(1, primaryPool.length);
  const perFarmCap = floorTo(Math.max(req.qty * CONCENTRATION_CAP, evenSplit), lot);
  trace.push(
    `Concentration limit applied: ${perFarmCap.toLocaleString()} ${req.unit} per farm — the greater of ${Math.round(
      CONCENTRATION_CAP * 100
    )}% of the order and an even split across ${primaryPool.length} eligible windows.`
  );

  /* 2 — allocate primary */
  const primary: CommitmentAllocation[] = [];
  let remaining = req.qty;
  primaryPool.forEach((cand, i) => {
    if (remaining <= 0) return;
    const take = floorTo(Math.min(cand.available, perFarmCap, remaining), lot);
    if (take <= 0) return;
    remaining -= take;
    primary.push({
      id: `alloc-p-${i}`,
      farmId: cand.farm.id,
      qty: take,
      unit: req.unit,
      score: cand.score,
      role: 'primary',
      confidence: Math.round(clamp(cand.score + (cand.farm.fulfilmentRate - 90) * 0.4)),
      harvestDate: commitmentDate(cand.line, req.requiredBy),
      batchId: batchId(orderRef, cand.farm, i),
      rationale: [
        `Score ${cand.score.toFixed(1)} — rank ${i + 1} of ${primaryPool.length} eligible farms.`,
        take === perFarmCap
          ? `Capped at the ${Math.round(CONCENTRATION_CAP * 100)}% concentration limit.`
          : `Full uncommitted volume of ${cand.available.toLocaleString()} ${req.unit} taken.`,
        `${cand.farm.distanceKm} km out • ${cand.farm.fulfilmentRate}% historical fulfilment • Grade ${req.grade} probability ${Math.round(gradeFit(cand.line, req.grade))}%.`,
      ],
    });
  });

  const primaryQty = primary.reduce((s, a) => s + a.qty, 0);
  trace.push(
    `Primary commitment built across ${primary.length} farms — ${primaryQty.toLocaleString()} ${req.unit} of ${req.qty.toLocaleString()} ${req.unit} requested.`
  );

  /* 3 — backup cover */
  const shortfall = Math.max(0, req.qty - primaryQty);
  const backupPerFarmCap = Math.max(lot, floorTo(req.qty * BACKUP_CAP, lot));
  const backupTarget = Math.max(shortfall, backupPerFarmCap);
  const backup: CommitmentAllocation[] = [];
  let backupRemaining = backupTarget;

  backupPool.forEach((cand, i) => {
    if (backupRemaining <= 0) return;
    const take = floorTo(Math.min(cand.available, backupPerFarmCap, backupRemaining), lot);
    if (take <= 0) return;
    backupRemaining -= take;
    backup.push({
      id: `alloc-b-${i}`,
      farmId: cand.farm.id,
      qty: take,
      unit: req.unit,
      score: cand.score,
      role: 'backup',
      confidence: Math.round(clamp(cand.score - 6)),
      harvestDate: cand.line.harvestWindowEnd,
      batchId: batchId(orderRef, cand.farm, primary.length + i),
      rationale: [cand.reason, `Backup cover capped at ${Math.round(BACKUP_CAP * 100)}% of order volume per farm.`],
    });
  });

  const backupQty = backup.reduce((s, a) => s + a.qty, 0);
  if (shortfall > 0) {
    trace.push(
      `Shortfall of ${shortfall.toLocaleString()} ${req.unit} covered by ${backup.length} backup farms (${backupQty.toLocaleString()} ${req.unit}).`
    );
  } else {
    trace.push(
      `Order fully covered by primary farms. ${backupQty.toLocaleString()} ${req.unit} of backup cover held as insurance.`
    );
  }

  const coveragePct = Math.min(100, Math.round(((primaryQty + backupQty) / req.qty) * 100));
  trace.push(`Fulfilment coverage ${coveragePct}% — commitment pack ready to issue to farms.`);

  return {
    request: req,
    candidates,
    primary,
    backup,
    primaryQty,
    backupQty,
    coveragePct,
    shortfall,
    farmsEngaged: primary.length + backup.length,
    networkAvailable,
    trace,
  };
}

/** The scenario the Control Tower and Commitment Engine pages open with. */
export const CANONICAL_REQUEST: EngineRequest = {
  productId: 'p-tomato',
  qty: 10000,
  unit: 'kg',
  grade: 'A',
  requiredBy: '2026-10-22',
  packaging: '5kg reusable crates',
  buyerLocation: 'Al Ain',
  orderRef: 'SR-2610',
};
