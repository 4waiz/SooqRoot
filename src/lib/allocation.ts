import {
  Allocation,
  AllocationLine,
  AllocationPart,
  Buyer,
  Confidence,
  Demand,
  Farm,
  FarmSupply,
} from '../types';
import { calculateFulfillmentRisk, suggestSubstitutes } from './ai';

const CONFIDENCE_RANK: Record<Confidence, number> = {
  Confirmed: 3,
  Probable: 2,
  Stretch: 1,
};

function makeBatchId(demandId: string, farmId: string, idx: number): string {
  const dpart = demandId.slice(-4).toUpperCase();
  const fpart = farmId.slice(-4).toUpperCase();
  return `SR-${dpart}-${fpart}-${idx + 1}`;
}

export function runAllocation(
  demand: Demand,
  farms: Farm[],
  buyers: Buyer[]
): Allocation {
  const buyer = buyers.find((b) => b.id === demand.buyerId);
  const buyerCity = buyer?.location || '';

  // Track per-farm-per-product remaining capacity so splitting across lines doesn't double-count
  const remaining: Record<string, Record<string, number>> = {};
  for (const f of farms) {
    remaining[f.id] = {};
    for (const s of f.supplies) {
      remaining[f.id][s.product] = s.qty;
    }
  }

  const lines: AllocationLine[] = [];
  let partCounter = 0;

  for (const demandLine of demand.lines) {
    interface Candidate {
      farm: Farm;
      supply: FarmSupply;
      available: number;
    }
    const candidates: Candidate[] = [];
    for (const f of farms) {
      const supply = f.supplies.find((s) => s.product === demandLine.product);
      if (!supply) continue;
      const available = remaining[f.id][demandLine.product] ?? 0;
      if (available <= 0) continue;
      candidates.push({ farm: f, supply, available });
    }

    candidates.sort((a, b) => {
      // (a) exact grade match
      const aGrade = a.supply.grade === demandLine.grade ? 0 : 1;
      const bGrade = b.supply.grade === demandLine.grade ? 0 : 1;
      if (aGrade !== bGrade) return aGrade - bGrade;
      // (b) confidence
      const cDiff =
        CONFIDENCE_RANK[b.supply.confidence] - CONFIDENCE_RANK[a.supply.confidence];
      if (cDiff !== 0) return cDiff;
      // (c) same-city preferred
      const aLocal = a.farm.location.toLowerCase() === buyerCity.toLowerCase() ? 0 : 1;
      const bLocal = b.farm.location.toLowerCase() === buyerCity.toLowerCase() ? 0 : 1;
      if (aLocal !== bLocal) return aLocal - bLocal;
      // (d) distance
      if (a.farm.distanceKm !== b.farm.distanceKm) return a.farm.distanceKm - b.farm.distanceKm;
      // (e) larger capacity first
      return b.available - a.available;
    });

    const parts: AllocationPart[] = [];
    let remainingDemand = demandLine.qty;

    for (const cand of candidates) {
      if (remainingDemand <= 0) break;
      const take = Math.min(cand.available, remainingDemand);
      if (take <= 0) continue;
      parts.push({
        farmId: cand.farm.id,
        qty: take,
        confidence: cand.supply.confidence,
        batchId: makeBatchId(demand.id, cand.farm.id, partCounter++),
      });
      remainingDemand -= take;
      remaining[cand.farm.id][demandLine.product] = cand.available - take;
    }

    const filledQty = demandLine.qty - remainingDemand;
    const shortfall = Math.max(0, remainingDemand);

    // Backup farms are remaining candidates that didn't get picked but still have capacity
    const chosenFarmIds = new Set(parts.map((p) => p.farmId));
    const backupFarmIds = candidates
      .filter((c) => !chosenFarmIds.has(c.farm.id) && c.available > 0)
      .slice(0, 2)
      .map((c) => c.farm.id);

    const substitutes = shortfall > 0 ? suggestSubstitutes(demandLine.product, farms) : [];

    lines.push({
      demandLineId: demandLine.id,
      product: demandLine.product,
      productAr: demandLine.productAr,
      requestedQty: demandLine.qty,
      unit: demandLine.unit,
      parts,
      filledQty,
      shortfall,
      backupFarmIds,
      substitutes,
    });
  }

  const allocation: Allocation = {
    id: `alloc-${Date.now()}`,
    demandId: demand.id,
    createdAt: Date.now(),
    lines,
    risk: { level: 'Low', score: 0, reasons: [], reasonsAr: [], mitigations: [], mitigationsAr: [] },
  };
  allocation.risk = calculateFulfillmentRisk(allocation, farms);
  return allocation;
}

export function computeBuyerMetrics(
  demand: Demand,
  allocation: Allocation | undefined,
  farms: Farm[]
) {
  if (!allocation) {
    const totalRequested = demand.lines.reduce((s, l) => s + l.qty, 0);
    return {
      localPct: 0,
      matchedQty: 0,
      totalRequested,
      shortfallQty: totalRequested,
      farmsInvolved: 0,
      wasteRiskReducedKg: 0,
      status: demand.status,
    };
  }
  const totalRequested = demand.lines.reduce((s, l) => s + l.qty, 0);
  const matchedQty = allocation.lines.reduce((s, l) => s + l.filledQty, 0);
  const shortfallQty = allocation.lines.reduce((s, l) => s + l.shortfall, 0);
  const farmIds = new Set(
    allocation.lines.flatMap((l) => l.parts.map((p) => p.farmId))
  );
  const farmsInvolved = farmIds.size;
  // "Local" here = farm located in UAE (all seed farms are UAE)
  const localPct = matchedQty > 0 ? 1 : 0;
  // Simulated waste reduction: 12% of matched quantity "saved" by pre-harvest commitment
  const wasteRiskReducedKg = Math.round(matchedQty * 0.12);

  return {
    localPct,
    matchedQty,
    totalRequested,
    shortfallQty,
    farmsInvolved,
    wasteRiskReducedKg,
    status: demand.status,
  };
}

export function computeOperatorMetrics(
  demands: Demand[],
  allocations: Allocation[],
  farms: Farm[]
) {
  const farmsInvolved = new Set<string>();
  let matchedQty = 0;
  let requestedQty = 0;
  let wasteRiskReducedKg = 0;

  for (const d of demands) {
    requestedQty += d.lines.reduce((s, l) => s + l.qty, 0);
    const a = allocations.find((x) => x.demandId === d.id);
    if (a) {
      for (const line of a.lines) {
        matchedQty += line.filledQty;
        for (const p of line.parts) farmsInvolved.add(p.farmId);
      }
      wasteRiskReducedKg += a.lines.reduce((s, l) => s + l.filledQty, 0) * 0.12;
    }
  }
  const fillRate = requestedQty > 0 ? matchedQty / requestedQty : 0;

  return {
    fillRate,
    localPct: matchedQty > 0 ? 1 : 0,
    farmsInvolved: farmsInvolved.size,
    matchedBeforeHarvest: Math.round(matchedQty),
    wasteRiskReducedKg: Math.round(wasteRiskReducedKg),
  };
}
