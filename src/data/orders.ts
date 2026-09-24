import { Farm, Order, ProcurementCycle } from '../types';
import { runCommitmentEngine } from '../lib/engine';
import { FARMS } from './farms';
import { getProduct } from './products';

/* ============================================================
   DEMO ORDER BOOK, October 2026 procurement window.
   Allocations are produced by the real commitment engine at
   module load, so the numbers on screen are always consistent
   with the algorithm rather than typed in by hand.
   ============================================================ */

interface OrderSeed {
  ref: string;
  buyerId: string;
  cycleId: string;
  productId: string;
  qty: number;
  grade: Order['grade'];
  packaging: string;
  requiredBy: string;
  createdAt: string;
  status: Order['status'];
  confidence: number;
  deliveredQty?: number;
  health: Order['health'];
  deliveryLocation: string;
  /** Override the engine result when the demo needs a partial commitment. */
  committedOverride?: number;
}

/**
 * Orders are built against a working copy of the farm network so that two
 * orders can never commit the same kilogram twice. Firm (primary) commitments
 * consume capacity; backup cover is contingent and does not.
 */
const LEDGER: Farm[] = FARMS.map((f) => ({
  ...f,
  capacity: f.capacity.map((c) => ({ ...c })),
}));

function consume(farmId: string, productId: string, qty: number, harvestDate: string): void {
  const farm = LEDGER.find((f) => f.id === farmId);
  if (!farm) return;
  const line =
    farm.capacity.find((c) => c.productId === productId && c.harvestWindowEnd >= harvestDate) ??
    farm.capacity.find((c) => c.productId === productId);
  if (line) line.committed += qty;
}

const SEEDS: OrderSeed[] = [
  {
    ref: 'SR-2601',
    buyerId: 'buyer-jebel-hospitality',
    cycleId: 'cycle-oct-2026',
    productId: 'p-tomato',
    qty: 9000,
    grade: 'A',
    packaging: '5kg reusable crates',
    requiredBy: '2026-10-12',
    createdAt: '2026-09-02',
    status: 'Committed',
    confidence: 94,
    health: 'healthy',
    deliveryLocation: 'Al Ain, Central Kitchen',
    committedOverride: 8400,
  },
  {
    ref: 'SR-2602',
    buyerId: 'buyer-emirates-catering',
    cycleId: 'cycle-oct-2026',
    productId: 'p-cucumber',
    qty: 4500,
    grade: 'A',
    packaging: '5kg reusable crates',
    requiredBy: '2026-10-14',
    createdAt: '2026-09-03',
    status: 'Committed',
    confidence: 77,
    health: 'attention',
    deliveryLocation: 'Abu Dhabi, Mussafah DC',
    committedOverride: 3100,
  },
  {
    ref: 'SR-2603',
    buyerId: 'buyer-freshmart',
    cycleId: 'cycle-oct-2026',
    productId: 'p-leafy',
    qty: 2000,
    grade: 'A',
    packaging: 'Vented crates',
    requiredBy: '2026-10-16',
    createdAt: '2026-09-04',
    status: 'At risk',
    confidence: 52,
    health: 'risk',
    deliveryLocation: 'Dubai, Al Quoz DC',
    committedOverride: 800,
  },
  {
    ref: 'SR-2604',
    buyerId: 'buyer-marina-restaurants',
    cycleId: 'cycle-oct-2026',
    productId: 'p-herbs',
    qty: 340,
    grade: 'A',
    packaging: 'Clamshell',
    requiredBy: '2026-10-18',
    createdAt: '2026-09-05',
    status: 'Harvest scheduled',
    confidence: 88,
    health: 'healthy',
    deliveryLocation: 'Abu Dhabi, Corniche',
  },
  {
    ref: 'SR-2605',
    buyerId: 'buyer-sustainable-city',
    cycleId: 'cycle-oct-2026',
    productId: 'p-leafy',
    qty: 1200,
    grade: 'A',
    packaging: 'Cold-chain totes',
    requiredBy: '2026-10-20',
    createdAt: '2026-09-06',
    status: 'Committed',
    confidence: 91,
    health: 'attention',
    deliveryLocation: 'Dubai, The Sustainable City',
  },
  {
    ref: 'SR-2606',
    buyerId: 'buyer-freshmart',
    cycleId: 'cycle-oct-2026',
    productId: 'p-dates',
    qty: 4800,
    grade: 'A',
    packaging: '1kg gift boxes',
    requiredBy: '2026-10-26',
    createdAt: '2026-09-07',
    status: 'Committed',
    confidence: 89,
    health: 'healthy',
    deliveryLocation: 'Dubai, Al Quoz DC',
  },
  {
    ref: 'SR-2607',
    buyerId: 'buyer-marina-restaurants',
    cycleId: 'cycle-oct-2026',
    productId: 'p-seabass',
    qty: 620,
    grade: 'A',
    packaging: 'Iced cooler boxes',
    requiredBy: '2026-10-15',
    createdAt: '2026-09-08',
    status: 'In fulfilment',
    confidence: 95,
    health: 'healthy',
    deliveryLocation: 'Abu Dhabi, Corniche',
  },
  {
    ref: 'SR-2608',
    buyerId: 'buyer-emirates-catering',
    cycleId: 'cycle-oct-2026',
    productId: 'p-capsicum',
    qty: 1400,
    grade: 'Mixed',
    packaging: '5kg reusable crates',
    requiredBy: '2026-10-24',
    createdAt: '2026-09-09',
    status: 'At risk',
    confidence: 61,
    health: 'risk',
    deliveryLocation: 'Abu Dhabi, Mussafah DC',
  },
  {
    ref: 'SR-2609',
    buyerId: 'buyer-jebel-hospitality',
    cycleId: 'cycle-sep-2026',
    productId: 'p-cucumber',
    qty: 3600,
    grade: 'A',
    packaging: '5kg reusable crates',
    requiredBy: '2026-09-12',
    createdAt: '2026-08-14',
    status: 'Delivered',
    confidence: 96,
    deliveredQty: 3600,
    health: 'healthy',
    deliveryLocation: 'Al Ain, Central Kitchen',
  },
  {
    ref: 'SR-2610',
    buyerId: 'buyer-emirates-catering',
    cycleId: 'cycle-oct-2026',
    productId: 'p-tomato',
    qty: 10000,
    grade: 'A',
    packaging: '5kg reusable crates',
    requiredBy: '2026-10-22',
    createdAt: '2026-09-11',
    status: 'Demand received',
    confidence: 92,
    health: 'healthy',
    deliveryLocation: 'Abu Dhabi, Mussafah DC',
  },
  {
    ref: 'SR-2611',
    buyerId: 'buyer-sustainable-city',
    cycleId: 'cycle-sep-2026',
    productId: 'p-herbs',
    qty: 180,
    grade: 'A',
    packaging: 'Clamshell',
    requiredBy: '2026-09-09',
    createdAt: '2026-08-20',
    status: 'Delivered',
    confidence: 97,
    deliveredQty: 180,
    health: 'healthy',
    deliveryLocation: 'Dubai, The Sustainable City',
  },
  {
    ref: 'SR-2612',
    buyerId: 'buyer-freshmart',
    cycleId: 'cycle-sep-2026',
    productId: 'p-eggplant',
    qty: 1500,
    grade: 'Mixed',
    packaging: '10kg cartons',
    requiredBy: '2026-09-11',
    createdAt: '2026-08-22',
    status: 'Delivered',
    confidence: 93,
    deliveredQty: 1455,
    health: 'attention',
    deliveryLocation: 'Dubai, Al Quoz DC',
  },
  {
    ref: 'SR-2613',
    buyerId: 'buyer-jebel-hospitality',
    cycleId: 'cycle-oct-2026',
    productId: 'p-dates',
    qty: 2000,
    grade: 'A',
    packaging: '1kg gift boxes',
    requiredBy: '2026-10-28',
    createdAt: '2026-09-12',
    status: 'Committed',
    confidence: 90,
    health: 'healthy',
    deliveryLocation: 'Al Ain, Central Kitchen',
  },
  {
    ref: 'SR-2614',
    buyerId: 'buyer-freshmart',
    cycleId: 'cycle-oct-2026',
    productId: 'p-capsicum',
    qty: 3000,
    grade: 'Mixed',
    packaging: '5kg reusable crates',
    requiredBy: '2026-10-27',
    createdAt: '2026-09-13',
    status: 'Committed',
    confidence: 79,
    health: 'attention',
    deliveryLocation: 'Dubai, Al Quoz DC',
  },
  {
    ref: 'SR-2615',
    buyerId: 'buyer-marina-restaurants',
    cycleId: 'cycle-oct-2026',
    productId: 'p-eggplant',
    qty: 4500,
    grade: 'Mixed',
    packaging: '10kg cartons',
    requiredBy: '2026-10-25',
    createdAt: '2026-09-14',
    status: 'Committed',
    confidence: 86,
    health: 'healthy',
    deliveryLocation: 'Abu Dhabi, Corniche',
  },
  {
    ref: 'SR-2616',
    buyerId: 'buyer-freshmart',
    cycleId: 'cycle-oct-2026',
    productId: 'p-dates',
    qty: 4600,
    grade: 'A',
    packaging: '1kg gift boxes',
    requiredBy: '2026-10-29',
    createdAt: '2026-09-15',
    status: 'Demand received',
    confidence: 74,
    health: 'attention',
    deliveryLocation: 'Dubai, Al Quoz DC',
    committedOverride: 700,
  },
];

function buildOrder(seed: OrderSeed): Order {
  const product = getProduct(seed.productId);
  const historical = seed.status === 'Delivered';

  const result = historical
    ? null
    : runCommitmentEngine(
        {
          productId: seed.productId,
          qty: seed.qty,
          unit: product.unit,
          grade: seed.grade,
          requiredBy: seed.requiredBy,
          packaging: seed.packaging,
          orderRef: seed.ref,
        },
        LEDGER
      );

  let allocations = result ? [...result.primary, ...result.backup] : [];
  let committedQty = result ? result.primaryQty + result.backupQty : seed.qty;

  // Trim the engine result when the demo narrative calls for a partially
  // committed order (the Control Tower "upcoming demand" cards).
  if (seed.committedOverride !== undefined) {
    const trimmed: typeof allocations = [];
    let budget = seed.committedOverride;
    for (const a of allocations) {
      if (budget <= 0) break;
      const qty = Math.min(a.qty, budget);
      trimmed.push({ ...a, qty });
      budget -= qty;
    }
    allocations = trimmed;
    committedQty = trimmed.reduce((s, a) => s + a.qty, 0);
  }

  // Firm commitments consume network capacity for every order that follows.
  for (const a of allocations) {
    if (a.role === 'primary') consume(a.farmId, seed.productId, a.qty, a.harvestDate);
  }

  return {
    id: `order-${seed.ref.toLowerCase()}`,
    ref: seed.ref,
    buyerId: seed.buyerId,
    cycleId: seed.cycleId,
    productId: seed.productId,
    qty: seed.qty,
    unit: product.unit,
    grade: seed.grade,
    packaging: seed.packaging,
    requiredBy: seed.requiredBy,
    createdAt: seed.createdAt,
    status: seed.status,
    valueAed: Math.round(seed.qty * product.refPrice),
    confidence: seed.confidence,
    committedQty,
    deliveredQty: seed.deliveredQty ?? 0,
    allocations,
    health: seed.health,
    deliveryLocation: seed.deliveryLocation,
  };
}

export const ORDERS: Order[] = SEEDS.map(buildOrder);

/**
 * The live network state: farm capacity after every firm commitment in the
 * order book has been booked against it. This - not the raw seed file - is
 * what the application reads, so "expected = committed + reserve + available"
 * holds everywhere on screen.
 */
export const NETWORK_FARMS: Farm[] = LEDGER;

/**
 * Network capacity with one order's firm commitments released again, so the
 * commitment engine can be re-run for that order without double-counting the
 * volume it already holds.
 */
export function networkWithout(orderRef?: string): Farm[] {
  const clone: Farm[] = NETWORK_FARMS.map((f) => ({
    ...f,
    capacity: f.capacity.map((c) => ({ ...c })),
  }));
  const order = orderRef ? ORDERS.find((o) => o.ref === orderRef) : undefined;
  if (!order) return clone;

  for (const a of order.allocations) {
    if (a.role !== 'primary') continue;
    const farm = clone.find((f) => f.id === a.farmId);
    if (!farm) continue;
    const line =
      farm.capacity.find(
        (c) => c.productId === order.productId && c.harvestWindowEnd >= a.harvestDate
      ) ?? farm.capacity.find((c) => c.productId === order.productId);
    if (line) line.committed = Math.max(0, line.committed - a.qty);
  }
  return clone;
}

export const CYCLES: ProcurementCycle[] = [
  {
    id: 'cycle-oct-2026',
    ref: 'CY-2610',
    name: 'October 2026, Main Window',
    window: '1-31 October 2026',
    opensOn: '2026-09-01',
    closesOn: '2026-10-31',
    stage: 'Commitment',
    demandIds: ['dem-001', 'dem-002', 'dem-003', 'dem-004'],
    orderIds: ORDERS.filter((o) => o.cycleId === 'cycle-oct-2026').map((o) => o.id),
    committedValueAed: 0,
    demandValueAed: 0,
    coveragePct: 0,
    participatingFarms: 11,
  },
  {
    id: 'cycle-sep-2026',
    ref: 'CY-2609',
    name: 'September 2026, Closing',
    window: '1-30 September 2026',
    opensOn: '2026-08-01',
    closesOn: '2026-09-30',
    stage: 'Proof',
    demandIds: [],
    orderIds: ORDERS.filter((o) => o.cycleId === 'cycle-sep-2026').map((o) => o.id),
    committedValueAed: 0,
    demandValueAed: 0,
    coveragePct: 0,
    participatingFarms: 9,
  },
  {
    id: 'cycle-nov-2026',
    ref: 'CY-2611',
    name: 'November 2026, Opening',
    window: '1-30 November 2026',
    opensOn: '2026-10-01',
    closesOn: '2026-11-30',
    stage: 'Demand capture',
    demandIds: [],
    orderIds: [],
    committedValueAed: 0,
    demandValueAed: 0,
    coveragePct: 0,
    participatingFarms: 4,
  },
];

// Derive cycle roll-ups from the order book so they can never drift.
for (const cycle of CYCLES) {
  const orders = ORDERS.filter((o) => o.cycleId === cycle.id);
  cycle.demandValueAed = orders.reduce((s, o) => s + o.valueAed, 0);
  cycle.committedValueAed = orders.reduce(
    (s, o) => s + Math.round((o.committedQty / Math.max(1, o.qty)) * o.valueAed),
    0
  );
  cycle.coveragePct = cycle.demandValueAed
    ? Math.round((cycle.committedValueAed / cycle.demandValueAed) * 100)
    : 0;
}

export const CYCLE_MAP: Record<string, ProcurementCycle> = Object.fromEntries(
  CYCLES.map((c) => [c.id, c])
);
