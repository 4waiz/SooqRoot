import { CategoryMix, MonthPoint } from '../types';

/* ============================================================
   DEMO ANALYTICS, 12 months of network performance.
   The trailing-12-month local procurement index lands at 21.7%
   against a 25% target; the current month is running at 26.4%.
   ============================================================ */

export const MONTHLY: MonthPoint[] = [
  { month: 'Oct 25', localPct: 14.2, targetPct: 25, importedAed: 2_410_000, localAed: 399_000, fillRate: 88, commitments: 41, co2SavedKg: 9_800, waterSavedM3: 1_240, farmIncomeAed: 331_000 },
  { month: 'Nov 25', localPct: 15.6, targetPct: 25, importedAed: 2_380_000, localAed: 440_000, fillRate: 89, commitments: 47, co2SavedKg: 10_900, waterSavedM3: 1_380, farmIncomeAed: 366_000 },
  { month: 'Dec 25', localPct: 17.1, targetPct: 25, importedAed: 2_520_000, localAed: 520_000, fillRate: 90, commitments: 54, co2SavedKg: 12_600, waterSavedM3: 1_610, farmIncomeAed: 432_000 },
  { month: 'Jan 26', localPct: 18.4, targetPct: 25, importedAed: 2_610_000, localAed: 588_000, fillRate: 91, commitments: 61, co2SavedKg: 14_200, waterSavedM3: 1_820, farmIncomeAed: 488_000 },
  { month: 'Feb 26', localPct: 19.2, targetPct: 25, importedAed: 2_540_000, localAed: 604_000, fillRate: 92, commitments: 66, co2SavedKg: 14_900, waterSavedM3: 1_910, farmIncomeAed: 501_000 },
  { month: 'Mar 26', localPct: 20.8, targetPct: 25, importedAed: 2_480_000, localAed: 651_000, fillRate: 92, commitments: 72, co2SavedKg: 16_100, waterSavedM3: 2_060, farmIncomeAed: 540_000 },
  { month: 'Apr 26', localPct: 21.5, targetPct: 25, importedAed: 2_390_000, localAed: 654_000, fillRate: 93, commitments: 78, co2SavedKg: 16_400, waterSavedM3: 2_110, farmIncomeAed: 543_000 },
  { month: 'May 26', localPct: 20.1, targetPct: 25, importedAed: 2_280_000, localAed: 573_000, fillRate: 91, commitments: 69, co2SavedKg: 14_300, waterSavedM3: 1_840, farmIncomeAed: 476_000 },
  { month: 'Jun 26', localPct: 19.4, targetPct: 25, importedAed: 2_190_000, localAed: 527_000, fillRate: 90, commitments: 63, co2SavedKg: 13_200, waterSavedM3: 1_690, farmIncomeAed: 437_000 },
  { month: 'Jul 26', localPct: 22.7, targetPct: 25, importedAed: 2_240_000, localAed: 658_000, fillRate: 93, commitments: 74, co2SavedKg: 16_500, waterSavedM3: 2_120, farmIncomeAed: 546_000 },
  { month: 'Aug 26', localPct: 24.3, targetPct: 25, importedAed: 2_360_000, localAed: 758_000, fillRate: 95, commitments: 83, co2SavedKg: 19_000, waterSavedM3: 2_430, farmIncomeAed: 629_000 },
  { month: 'Sep 26', localPct: 26.4, targetPct: 25, importedAed: 2_310_000, localAed: 829_000, fillRate: 96, commitments: 91, co2SavedKg: 20_800, waterSavedM3: 2_660, farmIncomeAed: 688_000 },
];

/** Trailing-12-month weighted local share - the headline Local Procurement Index. */
export const LPI_TRAILING_12M = 21.7;
export const LPI_TARGET = 25;
export const LPI_CURRENT_MONTH = 26.4;

export const CATEGORY_MIX: CategoryMix[] = [
  { category: 'Vegetables', localPct: 34.1, volumeKg: 186_400, color: '#2a714c' },
  { category: 'Leafy greens', localPct: 41.8, volumeKg: 48_200, color: '#5ca87e' },
  { category: 'Herbs', localPct: 62.5, volumeKg: 7_900, color: '#8dc6a4' },
  { category: 'Dates', localPct: 88.3, volumeKg: 94_600, color: '#8d6430' },
  { category: 'Fish', localPct: 19.4, volumeKg: 21_300, color: '#2f6f8a' },
  { category: 'Honey', localPct: 71.2, volumeKg: 3_100, color: '#c99c57' },
];

/** Fulfilment performance by week for the operations view. */
export const WEEKLY_FILL = [
  { week: 'W32', committed: 96, delivered: 94, onTime: 92 },
  { week: 'W33', committed: 98, delivered: 95, onTime: 94 },
  { week: 'W34', committed: 97, delivered: 96, onTime: 93 },
  { week: 'W35', committed: 99, delivered: 97, onTime: 96 },
  { week: 'W36', committed: 98, delivered: 96, onTime: 95 },
  { week: 'W37', committed: 100, delivered: 98, onTime: 97 },
];

/** Buyer-level local sourcing performance. */
export const BUYER_LPI = [
  { buyerId: 'buyer-sustainable-city', localPct: 47.2, targetPct: 45, spendAed: 186_000 },
  { buyerId: 'buyer-jebel-hospitality', localPct: 31.4, targetPct: 30, spendAed: 412_000 },
  { buyerId: 'buyer-marina-restaurants', localPct: 26.8, targetPct: 28, spendAed: 255_000 },
  { buyerId: 'buyer-emirates-catering', localPct: 23.1, targetPct: 25, spendAed: 688_000 },
  { buyerId: 'buyer-freshmart', localPct: 17.9, targetPct: 22, spendAed: 940_000 },
];

/** Sustainability roll-up for the current cycle. */
export const IMPACT = {
  co2SavedKgYtd: 188_700,
  waterSavedM3Ytd: 23_870,
  foodMilesAvoidedKm: 1_284_000,
  farmIncomeAedYtd: 5_977_000,
  wastageReductionPct: 31,
  reusableCratesInCirculation: 18_400,
  avgFarmgatePriceUpliftPct: 18,
  smallholdersEngaged: 12,
};

/** Recognition & milestones. */
export const RECOGNITION = [
  {
    id: 'rec-01',
    title: 'Universities Hackathon: Farm to Market',
    award: '2nd Place',
    org: 'UAE Universities Hackathon',
    date: '2026-08-30',
    detail:
      'Recognised for turning fragmented smallholder supply into pre-harvest commitments that commercial buyers can actually contract against.',
  },
  {
    id: 'rec-02',
    title: 'SEE Institute Engagement',
    award: 'Invited Session',
    org: 'The Sustainable City, Dubai',
    date: '2026-09-22',
    detail:
      'Working session on local food procurement infrastructure and measurable sustainability reporting for institutional buyers.',
  },
  {
    id: 'rec-03',
    title: 'Farm network reaches 12 producers',
    award: 'Milestone',
    org: 'SooqRoot',
    date: '2026-09-01',
    detail:
      'Twelve UAE farms across Al Ain, Al Khazna, Sweihan, Remah and Liwa now publishing forward capacity into the network.',
  },
  {
    id: 'rec-04',
    title: 'First 100% pre-harvest committed order',
    award: 'Milestone',
    org: 'SooqRoot',
    date: '2026-07-14',
    detail:
      'A 10-tonne tomato order fully covered by pre-harvest commitments across five farms with backup cover held in reserve.',
  },
];
