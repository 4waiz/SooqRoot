/* ============================================================
   SooqRoot, domain model
   The Procurement Operating System for UAE Local Food
   ============================================================ */

/** The theme actually rendered. */
export type Theme = 'light' | 'dark';
/** What the viewer chose - 'system' follows the operating system. */
export type ThemePreference = 'light' | 'dark' | 'system';

export type Grade = 'A' | 'B' | 'Mixed';
export type Unit = 'kg' | 'crates' | 'boxes' | 'jars';
export type Emirate = 'Abu Dhabi' | 'Dubai' | 'Sharjah' | 'Al Ain Region';

export type HealthStatus = 'healthy' | 'attention' | 'risk';

export type ProductCategory =
  | 'vegetable'
  | 'leafygreen'
  | 'fruit'
  | 'herb'
  | 'date'
  | 'fish'
  | 'honey';

/* ---------------- Products ---------------- */

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  category: ProductCategory;
  unit: Unit;
  /** Indicative demo reference price, AED per unit */
  refPrice: number;
  /** Days from commitment to harvest readiness */
  leadDays: number;
  /** Usable days between harvest and delivery before quality degrades */
  shelfLifeDays: number;
  emoji: string;
  /** Tailwind-ish hex used for chart series */
  color: string;
}

/* ---------------- Supply network ---------------- */

export interface FarmCapacityLine {
  productId: string;
  /** Expected harvest volume in the current window */
  expectedHarvest: number;
  /** Already committed to orders */
  committed: number;
  /** Quality / shrinkage reserve held back from commitment */
  reserve: number;
  unit: Unit;
  harvestWindowStart: string; // ISO date
  harvestWindowEnd: string; // ISO date
  gradeProbability: { A: number; B: number };
  packaging: string[];
}

export interface Farm {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  area: string;
  areaAr: string;
  emirate: Emirate;
  /** Normalised 0-100 coordinates on the schematic network canvas */
  x: number;
  y: number;
  /** Real-world location (WGS84) used by the interactive map */
  lat: number;
  lng: number;
  distanceKm: number;
  hectares: number;
  growingMethod: 'Open field' | 'Greenhouse' | 'Hydroponic' | 'Net house' | 'Aquaculture' | 'Apiary';
  certifications: string[];
  preferredLanguage: 'Arabic' | 'English' | 'Urdu';
  contactName: string;
  /** Historical fulfilment rate, 0-100 */
  fulfilmentRate: number;
  /** Quality score, 0-100 */
  qualityScore: number;
  /** Reliability index, 0-100 */
  reliability: number;
  joinedOn: string;
  status: HealthStatus;
  capacity: FarmCapacityLine[];
}

/* ---------------- Buyers & demand ---------------- */

export type BuyerSegment = 'Hotel' | 'Catering' | 'Retail' | 'Restaurant Group' | 'Institutional';

export interface Buyer {
  id: string;
  name: string;
  nameAr: string;
  segment: BuyerSegment;
  emirate: Emirate;
  x: number;
  y: number;
  /** Real-world delivery point (WGS84) */
  lat: number;
  lng: number;
  contactName: string;
  localTargetPct: number;
  monthlySpendAed: number;
  since: string;
  logoTone: string;
}

export type DemandStatus = 'draft' | 'structured' | 'approved' | 'in-cycle' | 'archived';

export interface DemandLine {
  id: string;
  productId: string;
  qty: number;
  unit: Unit;
  grade: Grade;
  packaging: string;
  requiredBy: string; // ISO date
  frequency: 'One-off' | 'Weekly' | 'Twice weekly' | 'Daily';
  deliveryLocation: string;
  preferredOrigin: string;
  notes?: string;
}

export interface Demand {
  id: string;
  ref: string;
  buyerId: string;
  title: string;
  rawText?: string;
  createdAt: string;
  status: DemandStatus;
  lines: DemandLine[];
  /** Populated when structured by the AI demand translator */
  aiConfidence?: number;
  aiNotes?: string[];
  source: 'Portal' | 'AI translator' | 'Email' | 'Contract' | 'Demo';
}

/* ---------------- Procurement cycles ---------------- */

export type CycleStage =
  | 'Demand capture'
  | 'Commitment'
  | 'Harvest'
  | 'Fulfilment'
  | 'Proof';

export interface ProcurementCycle {
  id: string;
  ref: string;
  name: string;
  window: string;
  opensOn: string;
  closesOn: string;
  stage: CycleStage;
  demandIds: string[];
  orderIds: string[];
  committedValueAed: number;
  demandValueAed: number;
  coveragePct: number;
  participatingFarms: number;
}

/* ---------------- Orders & commitments ---------------- */

export type OrderStatus =
  | 'Demand received'
  | 'Committed'
  | 'Harvest scheduled'
  | 'In fulfilment'
  | 'Delivered'
  | 'At risk';

export const ORDER_FLOW: OrderStatus[] = [
  'Demand received',
  'Committed',
  'Harvest scheduled',
  'In fulfilment',
  'Delivered',
];

export interface CommitmentAllocation {
  id: string;
  farmId: string;
  qty: number;
  unit: Unit;
  score: number;
  role: 'primary' | 'backup';
  confidence: number;
  harvestDate: string;
  batchId: string;
  rationale: string[];
}

export interface Order {
  id: string;
  ref: string;
  buyerId: string;
  cycleId: string;
  productId: string;
  qty: number;
  unit: Unit;
  grade: Grade;
  packaging: string;
  requiredBy: string;
  createdAt: string;
  status: OrderStatus;
  valueAed: number;
  /** 0-100 - probability the order fills from local supply */
  confidence: number;
  committedQty: number;
  deliveredQty: number;
  allocations: CommitmentAllocation[];
  health: HealthStatus;
  deliveryLocation: string;
}

/* ---------------- Operations ---------------- */

export type ExceptionType =
  | 'Shortfall'
  | 'Quality'
  | 'Logistics'
  | 'Weather'
  | 'Capacity'
  | 'Documentation';

export type ExceptionSeverity = 'critical' | 'warning' | 'info';

export interface ExceptionItem {
  id: string;
  ref: string;
  type: ExceptionType;
  severity: ExceptionSeverity;
  title: string;
  detail: string;
  orderId?: string;
  farmId?: string;
  raisedAt: string;
  owner: string;
  status: 'open' | 'mitigating' | 'resolved';
  recommendedAction: string;
  impactAed: number;
}

export type FulfilmentStage =
  | 'Harvest'
  | 'Grading'
  | 'Packing'
  | 'Collection'
  | 'Consolidation'
  | 'Delivery';

export interface FulfilmentJob {
  id: string;
  batchId: string;
  orderId: string;
  farmId: string;
  productId: string;
  qty: number;
  unit: Unit;
  stage: FulfilmentStage;
  scheduledFor: string;
  vehicle: string;
  driver: string;
  temperatureC: number;
  progressPct: number;
  health: HealthStatus;
}

export interface BatchPassport {
  id: string;
  batchId: string;
  orderId: string;
  farmId: string;
  buyerId: string;
  productId: string;
  qty: number;
  unit: Unit;
  grade: Grade;
  harvestedOn: string;
  packedOn: string;
  deliveredOn?: string;
  distanceKm: number;
  co2SavedKg: number;
  waterMethod: string;
  certifications: string[];
  checkpoints: { label: string; at: string; by: string; note?: string }[];
  verificationHash: string;
}

/* ---------------- Intelligence ---------------- */

export interface MonthPoint {
  month: string;
  localPct: number;
  targetPct: number;
  importedAed: number;
  localAed: number;
  fillRate: number;
  commitments: number;
  co2SavedKg: number;
  waterSavedM3: number;
  farmIncomeAed: number;
}

export interface CategoryMix {
  category: string;
  localPct: number;
  volumeKg: number;
  color: string;
}

export interface ActivityEvent {
  id: string;
  at: string;
  kind: 'commitment' | 'harvest' | 'delivery' | 'demand' | 'exception' | 'farm' | 'proof';
  title: string;
  detail: string;
  actor: string;
}

export interface HarvestEvent {
  id: string;
  date: string;
  farmId: string;
  productId: string;
  qty: number;
  unit: Unit;
  orderId?: string;
  status: 'scheduled' | 'in-progress' | 'complete';
}

/* ---------------- Copilot ---------------- */

export interface CopilotMessage {
  id: string;
  threadId: string;
  at: string;
  direction: 'outbound' | 'inbound';
  channel: 'WhatsApp' | 'SMS' | 'In-app';
  text: string;
  textAr?: string;
  status: 'sent' | 'delivered' | 'read' | 'replied';
}

export interface CopilotThread {
  id: string;
  farmId: string;
  subject: string;
  updatedAt: string;
  unread: number;
  intent: 'Commitment request' | 'Harvest instruction' | 'Quality note' | 'Logistics' | 'Onboarding';
}

/* ---------------- Session ---------------- */

export interface DemoSession {
  username: string;
  displayName: string;
  role: string;
  loggedInAt: string;
}
