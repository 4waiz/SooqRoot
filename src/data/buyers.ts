import { Buyer } from '../types';

/** DEMO BUYERS - fictional commercial accounts. */
export const BUYERS: Buyer[] = [
  {
    id: 'buyer-jebel-hospitality',
    name: 'Jebel Hospitality Group',
    nameAr: 'مجموعة جبل للضيافة',
    segment: 'Hotel',
    emirate: 'Al Ain Region',
    x: 86,
    y: 51,
    lat: 24.217,
    lng: 55.7564,
    contactName: 'Reem Al Hosani',
    localTargetPct: 30,
    monthlySpendAed: 412000,
    since: '2025-02-01',
    logoTone: 'brand',
  },
  {
    id: 'buyer-emirates-catering',
    name: 'Emirates Catering Collective',
    nameAr: 'تجمع الإمارات للتموين',
    segment: 'Catering',
    emirate: 'Abu Dhabi',
    x: 30,
    y: 52,
    lat: 24.3486,
    lng: 54.5043,
    contactName: 'Tariq Bin Salem',
    localTargetPct: 25,
    monthlySpendAed: 688000,
    since: '2024-11-15',
    logoTone: 'sand',
  },
  {
    id: 'buyer-freshmart',
    name: 'FreshMart Retail',
    nameAr: 'فريش مارت للتجزئة',
    segment: 'Retail',
    emirate: 'Dubai',
    x: 34,
    y: 18,
    lat: 25.1384,
    lng: 55.2306,
    contactName: 'Priya Nair',
    localTargetPct: 22,
    monthlySpendAed: 940000,
    since: '2025-04-03',
    logoTone: 'sky',
  },
  {
    id: 'buyer-sustainable-city',
    name: 'The Sustainable City F&B',
    nameAr: 'المدينة المستدامة للأغذية',
    segment: 'Institutional',
    emirate: 'Dubai',
    x: 28,
    y: 26,
    lat: 25.0305,
    lng: 55.2719,
    contactName: 'Layla Haddad',
    localTargetPct: 45,
    monthlySpendAed: 186000,
    since: '2025-09-01',
    logoTone: 'emerald',
  },
  {
    id: 'buyer-marina-restaurants',
    name: 'Marina Restaurant Group',
    nameAr: 'مجموعة مطاعم المارينا',
    segment: 'Restaurant Group',
    emirate: 'Abu Dhabi',
    x: 24,
    y: 44,
    lat: 24.4765,
    lng: 54.3419,
    contactName: 'Georges Aoun',
    localTargetPct: 28,
    monthlySpendAed: 255000,
    since: '2025-06-20',
    logoTone: 'amber',
  },
];

export const BUYER_MAP: Record<string, Buyer> = Object.fromEntries(BUYERS.map((b) => [b.id, b]));

export function getBuyer(id: string): Buyer | undefined {
  return BUYER_MAP[id];
}

export function buyerName(id: string): string {
  return BUYER_MAP[id]?.name ?? 'Unknown buyer';
}
