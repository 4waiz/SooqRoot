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
import {
  calculateFulfillmentRisk,
  calculateFulfillmentRiskWithAI,
  suggestSubstitutes,
  suggestSubstitutesWithAI,
} from './ai';
import { callGroqJson, isGroqConfigured } from './groq';

interface GroqAllocationPart {
  farmId?: string;
  qty?: number;
}

interface GroqAllocationLine {
  demandLineId?: string;
  product?: string;
  parts?: GroqAllocationPart[];
}

interface GroqAllocationResponse {
  lines?: GroqAllocationLine[];
}

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
      const key = productKey(s.product);
      remaining[f.id][key] = (remaining[f.id][key] || 0) + s.qty;
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
    const demandProductKey = productKey(demandLine.product);
    for (const f of farms) {
      const supply = f.supplies.find((s) => productKey(s.product) === demandProductKey);
      if (!supply) continue;
      const available = remaining[f.id][demandProductKey] ?? 0;
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
      remaining[cand.farm.id][demandProductKey] = cand.available - take;
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

function roundQty(qty: number): number {
  return Math.round(qty * 100) / 100;
}

function productKey(product: string): string {
  return product
    .toLowerCase()
    .replace(/[^\p{L}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/s$/i, '');
}

export async function runAllocationWithAI(
  demand: Demand,
  farms: Farm[],
  buyers: Buyer[]
): Promise<Allocation> {
  const allocation = isGroqConfigured()
    ? await runAiAllocation(demand, farms, buyers)
    : runAllocation(demand, farms, buyers);

  const lines = await Promise.all(
    allocation.lines.map(async (line) => {
      if (line.shortfall <= 0) return line;
      return {
        ...line,
        substitutes: await suggestSubstitutesWithAI(line.product, farms),
      };
    })
  );

  const enrichedAllocation = { ...allocation, lines };
  return {
    ...enrichedAllocation,
    risk: await calculateFulfillmentRiskWithAI(enrichedAllocation, farms),
  };
}

async function runAiAllocation(
  demand: Demand,
  farms: Farm[],
  buyers: Buyer[]
): Promise<Allocation> {
  const fallback = runAllocation(demand, farms, buyers);

  try {
    const buyer = buyers.find((b) => b.id === demand.buyerId);
    const result = await callGroqJson<GroqAllocationResponse>(
      [
        {
          role: 'system',
          content:
            'You are the SooqRoot operator allocation agent. Allocate buyer demand across farms before harvest. Return only JSON with key lines. Each line must include demandLineId, product, and parts. Each part must include farmId and qty. Use only supplied farm ids. Never allocate a product from a farm that does not list that product. Never exceed farm supply or requested demand. Prefer exact grade, higher confidence, same buyer location, shorter distance, then larger capacity. Split across farms when one farm cannot fulfill the request.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            buyer,
            demand: {
              id: demand.id,
              lines: demand.lines.map((line) => ({
                id: line.id,
                product: line.product,
                productAr: line.productAr,
                qty: line.qty,
                unit: line.unit,
                grade: line.grade,
                deliveryWindow: line.deliveryWindow,
                locationPref: line.locationPref,
              })),
            },
            farms: farms.map((farm) => ({
              id: farm.id,
              name: farm.name,
              location: farm.location,
              distanceKm: farm.distanceKm,
              confidenceLevel: farm.confidenceLevel,
              supplies: farm.supplies.map((supply) => ({
                product: supply.product,
                productAr: supply.productAr,
                qty: supply.qty,
                unit: supply.unit,
                grade: supply.grade,
                confidence: supply.confidence,
                harvestDate: supply.harvestDate,
              })),
            })),
            responseSchema: {
              lines: [
                {
                  demandLineId: 'Demand line id from demand.lines',
                  product: 'Demand product name',
                  parts: [{ farmId: 'Farm id from farms', qty: 'number' }],
                },
              ],
            },
          }),
        },
      ],
      { temperature: 0.15, maxTokens: 1400 }
    );

    const allocation = sanitizeAiAllocation(result, demand, farms);
    return allocation.lines.some((line) => line.parts.length > 0) ? allocation : fallback;
  } catch {
    return fallback;
  }
}

function sanitizeAiAllocation(
  result: GroqAllocationResponse,
  demand: Demand,
  farms: Farm[]
): Allocation {
  const remaining: Record<string, Record<string, number>> = {};
  for (const farm of farms) {
    remaining[farm.id] = {};
    for (const supply of farm.supplies) {
      const key = productKey(supply.product);
      remaining[farm.id][key] = (remaining[farm.id][key] || 0) + supply.qty;
    }
  }

  const aiLines = Array.isArray(result.lines) ? result.lines : [];
  const lines: AllocationLine[] = [];
  let partCounter = 0;

  for (const demandLine of demand.lines) {
    const aiLine = aiLines.find(
      (line) =>
        line.demandLineId === demandLine.id ||
        String(line.product || '').toLowerCase() === demandLine.product.toLowerCase()
    );
    const parts: AllocationPart[] = [];
    let remainingDemand = demandLine.qty;
    const demandProductKey = productKey(demandLine.product);

    for (const part of aiLine?.parts || []) {
      if (remainingDemand <= 0) break;

      const farm = farms.find((f) => f.id === part.farmId);
      const supply = farm?.supplies.find(
        (s) => productKey(s.product) === demandProductKey && s.unit === demandLine.unit
      );
      if (!farm || !supply) continue;

      const available = remaining[farm.id][demandProductKey] ?? 0;
      const requestedQty = Number(part.qty);
      if (!Number.isFinite(requestedQty) || requestedQty <= 0 || available <= 0) continue;

      const take = roundQty(Math.min(requestedQty, available, remainingDemand));
      if (take <= 0) continue;

      parts.push({
        farmId: farm.id,
        qty: take,
        confidence: supply.confidence,
        batchId: makeBatchId(demand.id, farm.id, partCounter++),
      });
      remainingDemand = roundQty(remainingDemand - take);
      remaining[farm.id][demandProductKey] = roundQty(available - take);
    }

    const filledQty = roundQty(demandLine.qty - remainingDemand);
    const shortfall = roundQty(Math.max(0, remainingDemand));
    const chosenFarmIds = new Set(parts.map((p) => p.farmId));
    const backupFarmIds = farms
      .filter((farm) => {
        const supply = farm.supplies.find(
          (s) => productKey(s.product) === demandProductKey && s.unit === demandLine.unit
        );
        const available = remaining[farm.id]?.[demandProductKey] ?? 0;
        return supply && available > 0 && !chosenFarmIds.has(farm.id);
      })
      .slice(0, 2)
      .map((farm) => farm.id);

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
      substitutes: shortfall > 0 ? suggestSubstitutes(demandLine.product, farms) : [],
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
