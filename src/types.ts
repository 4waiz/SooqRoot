export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';
export type Role = 'landing' | 'buyer' | 'farmer' | 'operator';
export type Page =
  | 'landing'
  | 'buyer'
  | 'farmer'
  | 'operator'
  | 'validation'
  | 'impact'
  | 'business'
  | 'pitch';

export type Confidence = 'Confirmed' | 'Probable' | 'Stretch';
export type Grade = 'A' | 'B';
export type ProductCategory = 'vegetable' | 'fruit' | 'fish' | 'honey' | 'leafygreen' | 'other';

export type OrderStatus =
  | 'Request'
  | 'Structured'
  | 'Allocated'
  | 'HarvestInstructed'
  | 'Packed'
  | 'PickedUp'
  | 'Delivered';

export const ORDER_STATUSES: OrderStatus[] = [
  'Request',
  'Structured',
  'Allocated',
  'HarvestInstructed',
  'Packed',
  'PickedUp',
  'Delivered',
];

export interface Farm {
  id: string;
  name: string;
  nameAr: string;
  location: string;
  locationAr: string;
  distanceKm: number;
  photo: string;
  supplies: FarmSupply[];
  confidenceLevel: Confidence;
}

export interface FarmSupply {
  product: string;
  productAr: string;
  category: ProductCategory;
  qty: number;
  unit: 'kg' | 'boxes' | 'jars';
  grade: Grade;
  confidence: Confidence;
  packaging: string;
  packagingAr: string;
  harvestDate?: string;
}

export interface Buyer {
  id: string;
  name: string;
  nameAr: string;
  location: string;
  locationAr: string;
  type: string;
  typeAr: string;
}

export interface DemandLine {
  id: string;
  product: string;
  productAr: string;
  category: ProductCategory;
  qty: number;
  unit: 'kg' | 'boxes' | 'jars';
  grade: Grade;
  packaging: string;
  packagingAr: string;
  deliveryWindow: string;
  deliveryWindowAr: string;
  locationPref?: string;
  locationPrefAr?: string;
}

export interface Demand {
  id: string;
  buyerId: string;
  rawText: string;
  createdAt: number;
  lines: DemandLine[];
  status: OrderStatus;
  aiInterpretation?: string;
  aiInterpretationAr?: string;
  aiConfidence?: number;
}

export interface AllocationPart {
  farmId: string;
  qty: number;
  confidence: Confidence;
  batchId: string;
}

export interface AllocationLine {
  demandLineId: string;
  product: string;
  productAr: string;
  requestedQty: number;
  unit: 'kg' | 'boxes' | 'jars';
  parts: AllocationPart[];
  filledQty: number;
  shortfall: number;
  backupFarmIds: string[];
  substitutes: SubstituteSuggestion[];
}

export interface SubstituteSuggestion {
  product: string;
  productAr: string;
  availableQty: number;
  reason: string;
  reasonAr: string;
  farmIds: string[];
}

export interface Allocation {
  id: string;
  demandId: string;
  createdAt: number;
  lines: AllocationLine[];
  risk: RiskScore;
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface RiskScore {
  level: RiskLevel;
  score: number;
  reasons: string[];
  reasonsAr: string[];
  mitigations: string[];
  mitigationsAr: string[];
}

export interface HarvestInstruction {
  batchId: string;
  farmId: string;
  farmName: string;
  farmNameAr: string;
  buyerName: string;
  buyerNameAr: string;
  product: string;
  productAr: string;
  qty: number;
  unit: 'kg' | 'boxes' | 'jars';
  grade: Grade;
  packaging: string;
  packagingAr: string;
  harvestDay: string;
  harvestDayAr: string;
  pickupTime: string;
  pickupTimeAr: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'copilot';
  text: string;
  reasoning?: string;
  suggestedAction?: string;
  confidence?: number;
}
