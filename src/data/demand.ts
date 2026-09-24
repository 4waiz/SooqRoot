import { Demand } from '../types';

/** Demo buyer demand records feeding the October 2026 cycle. */
export const DEMANDS: Demand[] = [
  {
    id: 'dem-001',
    ref: 'DM-2601',
    buyerId: 'buyer-emirates-catering',
    title: 'October tomato programme, twice weekly',
    rawText:
      'We need around ten tonnes of good quality tomatoes next month, split into Monday and Thursday deliveries, packed in 5kg reusable crates.',
    createdAt: '2026-09-11',
    status: 'approved',
    source: 'AI translator',
    aiConfidence: 96,
    aiNotes: [
      '"around ten tonnes" resolved to 10,000 kg',
      '"good quality" mapped to Grade A against your contract spec',
      '"Monday and Thursday" resolved to a twice-weekly schedule',
      'Procurement window inferred as October 2026 from "next month"',
    ],
    lines: [
      {
        id: 'dl-001',
        productId: 'p-tomato',
        qty: 10000,
        unit: 'kg',
        grade: 'A',
        packaging: '5kg reusable crates',
        requiredBy: '2026-10-22',
        frequency: 'Twice weekly',
        deliveryLocation: 'Abu Dhabi, Mussafah DC',
        preferredOrigin: 'UAE, Al Ain Region preferred',
        notes: 'Monday and Thursday delivery slots, 06:00-09:00.',
      },
    ],
  },
  {
    id: 'dem-002',
    ref: 'DM-2602',
    buyerId: 'buyer-jebel-hospitality',
    title: 'Hotel weekly produce order',
    createdAt: '2026-09-02',
    status: 'in-cycle',
    source: 'Portal',
    lines: [
      {
        id: 'dl-002',
        productId: 'p-tomato',
        qty: 9000,
        unit: 'kg',
        grade: 'A',
        packaging: '5kg reusable crates',
        requiredBy: '2026-10-12',
        frequency: 'Weekly',
        deliveryLocation: 'Al Ain, Central Kitchen',
        preferredOrigin: 'UAE only',
      },
      {
        id: 'dl-003',
        productId: 'p-herbs',
        qty: 340,
        unit: 'kg',
        grade: 'A',
        packaging: 'Clamshell',
        requiredBy: '2026-10-18',
        frequency: 'Weekly',
        deliveryLocation: 'Al Ain, Central Kitchen',
        preferredOrigin: 'UAE only',
      },
    ],
  },
  {
    id: 'dem-003',
    ref: 'DM-2603',
    buyerId: 'buyer-freshmart',
    title: 'Supermarket replenishment, leafy greens',
    createdAt: '2026-09-04',
    status: 'in-cycle',
    source: 'Contract',
    lines: [
      {
        id: 'dl-004',
        productId: 'p-leafy',
        qty: 2000,
        unit: 'kg',
        grade: 'A',
        packaging: 'Vented crates',
        requiredBy: '2026-10-16',
        frequency: 'Twice weekly',
        deliveryLocation: 'Dubai, Al Quoz DC',
        preferredOrigin: 'UAE preferred, GCC acceptable',
        notes: 'Shelf-life requirement: 5 days minimum on arrival.',
      },
    ],
  },
  {
    id: 'dem-004',
    ref: 'DM-2604',
    buyerId: 'buyer-sustainable-city',
    title: 'SEE Institute campus F&B, November pilot',
    createdAt: '2026-09-13',
    status: 'structured',
    source: 'Portal',
    lines: [
      {
        id: 'dl-005',
        productId: 'p-leafy',
        qty: 1200,
        unit: 'kg',
        grade: 'A',
        packaging: 'Cold-chain totes',
        requiredBy: '2026-10-20',
        frequency: 'Weekly',
        deliveryLocation: 'Dubai, The Sustainable City',
        preferredOrigin: 'UAE only, sub-100km preferred',
        notes: 'Local sourcing proof required for every delivery.',
      },
    ],
  },
];

/** One-click demand presets on the Buyer Demand page. */
export interface DemandPreset {
  id: string;
  label: string;
  description: string;
  buyerId: string;
  lines: {
    productId: string;
    qty: number;
    grade: 'A' | 'B' | 'Mixed';
    packaging: string;
    requiredBy: string;
    frequency: 'One-off' | 'Weekly' | 'Twice weekly' | 'Daily';
  }[];
}

export const DEMAND_PRESETS: DemandPreset[] = [
  {
    id: 'preset-hotel',
    label: 'Hotel Weekly Produce Order',
    description: 'Standing weekly basket for a 400-key property with three outlets.',
    buyerId: 'buyer-jebel-hospitality',
    lines: [
      {
        productId: 'p-tomato',
        qty: 2400,
        grade: 'A',
        packaging: '5kg reusable crates',
        requiredBy: '2026-10-19',
        frequency: 'Weekly',
      },
      {
        productId: 'p-cucumber',
        qty: 1200,
        grade: 'A',
        packaging: '5kg reusable crates',
        requiredBy: '2026-10-19',
        frequency: 'Weekly',
      },
      {
        productId: 'p-leafy',
        qty: 600,
        grade: 'A',
        packaging: 'Vented crates',
        requiredBy: '2026-10-19',
        frequency: 'Weekly',
      },
    ],
  },
  {
    id: 'preset-catering',
    label: 'Catering Contract',
    description: 'High-volume institutional catering, twice-weekly drops.',
    buyerId: 'buyer-emirates-catering',
    lines: [
      {
        productId: 'p-tomato',
        qty: 6000,
        grade: 'A',
        packaging: '5kg reusable crates',
        requiredBy: '2026-10-23',
        frequency: 'Twice weekly',
      },
      {
        productId: 'p-capsicum',
        qty: 900,
        grade: 'Mixed',
        packaging: '5kg reusable crates',
        requiredBy: '2026-10-23',
        frequency: 'Twice weekly',
      },
    ],
  },
  {
    id: 'preset-retail',
    label: 'Supermarket Replenishment',
    description: 'Daily store replenishment across 14 branches.',
    buyerId: 'buyer-freshmart',
    lines: [
      {
        productId: 'p-leafy',
        qty: 1800,
        grade: 'A',
        packaging: 'Vented crates',
        requiredBy: '2026-10-17',
        frequency: 'Daily',
      },
      {
        productId: 'p-dates',
        qty: 2500,
        grade: 'A',
        packaging: '1kg gift boxes',
        requiredBy: '2026-10-27',
        frequency: 'Weekly',
      },
    ],
  },
];
