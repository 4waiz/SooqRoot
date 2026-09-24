import { asset } from '../lib/assets';

/* ============================================================
   Image registry.

   Every photograph in the product is referenced from here, so
   swapping an image, or moving to self-hosted copies, is a
   one-line change.

   • Unsplash photos are hotlinked, exactly as the original
     prototype did. Unsplash's CDN resizes and crops on request.
   • The two SooqRoot scene images (the desert agri-network
     render and the dashboard mockup) are self-hosted from
     /public/images.

   Anything without a verified photo returns undefined and the
   UI falls back to a tinted tile, never a mismatched picture.
   ============================================================ */

export function unsplash(id: string, width: number, height?: number): string {
  const size = height ? `&w=${width}&h=${height}` : `&w=${width}`;
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop${size}&q=72`;
}

/* ---------------- SooqRoot scenes (self-hosted) ---------------- */

export const SCENE = {
  agriNetwork: (size: 900 | 1600 = 1600) => asset(`images/agri-network-${size}.webp`),
  dashboardMockup: (size: 900 | 1600 = 1600) => asset(`images/dashboard-mockup-${size}.webp`),
};

/* ---------------- Farms ---------------- */

const FARM_PHOTO_IDS: Record<string, string> = {
  'farm-alain-018': '1591857177580-dc82b9ac4e1e', // raised beds under net house
  'farm-alkhazna': '1556801712-76c8eb07bbc9', // hydroponic lettuce (original prototype)
  'farm-oasis-greens': '1622383563227-04401ab4e5ea', // seedling in hand (original prototype)
  'farm-green-horizon': '1523348837708-15d4a09cfac2', // greenhouse seedlings
  'farm-falaj': '1560493676-04071c5f467b', // open-field rows
  'farm-desert-bloom': '1530836369250-ef72a3f5cda8', // greenhouse propagation trays
  'farm-emirates-leaf': '1621460248083-6271cc4437a8', // potting herbs
  'farm-liwa-fresh': '1542401886-65d6c61db217', // Liwa dunes
  'farm-sweihan-valley': '1586771107445-d3ca888129ff', // young crop rows
  'farm-remah-organic': '1563514227147-6d2ff665a6a0', // organic field rows
  'farm-alwagan-dates': '1473973266408-ed4e27abdd47', // apiary
  'farm-yahar-aqua': '1498654200943-1088dd4438ae', // fresh catch (original prototype)
};

export function farmPhoto(farmId: string, width = 800, height?: number): string | undefined {
  const id = FARM_PHOTO_IDS[farmId];
  return id ? unsplash(id, width, height) : undefined;
}

/* ---------------- Products ---------------- */

const PRODUCT_PHOTO_IDS: Record<string, string> = {
  'p-tomato': '1592924357228-91a4daadcfea',
  'p-cucumber': '1604977042946-1eecc30f269e',
  'p-leafy': '1622206151226-18ca2c9ab4a1',
  'p-capsicum': '1563565375-f3fdfdbefa83',
  'p-eggplant': '1615484477201-9f4953340fab',
  'p-herbs': '1618375569909-3c8616cf7733',
  'p-honey': '1558642452-9d2a7deb7f62', // original prototype
  'p-seabass': '1510130387422-82bed34b37e9',
  // p-dates: no verified photograph - rendered as a tinted tile
};

export function productPhoto(productId: string, width = 600, height?: number): string | undefined {
  const id = PRODUCT_PHOTO_IDS[productId];
  return id ? unsplash(id, width, height) : undefined;
}

/* ---------------- Buyers ---------------- */

const BUYER_PHOTO_IDS: Record<string, string> = {
  'buyer-jebel-hospitality': '1414235077428-338989a2e8c0', // hotel dining
  'buyer-emirates-catering': '1512621776951-a57141f2eefd', // catering bowl
  'buyer-freshmart': '1542838132-92c53300491e', // supermarket produce
  'buyer-sustainable-city': '1506484381205-f7945653044d', // community market
  'buyer-marina-restaurants': '1555396273-367ea4eb4db5', // restaurant floor
};

export function buyerPhoto(buyerId: string, width = 600, height?: number): string | undefined {
  const id = BUYER_PHOTO_IDS[buyerId];
  return id ? unsplash(id, width, height) : undefined;
}

/* ---------------- Operational scenes ---------------- */

export const STOCK = {
  fieldHero: '1500937386664-56d1dfef3854', // original prototype landing hero
  produceDark: '1518843875459-f738682238a6',
  produceFlatlay: '1610348725531-843dff563e2c',
  aerialField: '1627920769842-6887c6df05ca',
  goldenField: '1500382017468-9049fed747ef',
  greenSunset: '1620200423727-8127f75d7f53',
  warehouse: '1586528116311-ad8dd3c8310d',
  truck: '1601584115197-04ecc0da31d7',
  desertRoad: '1519003722824-194d4455a60c',
  highwayTruck: '1592838064575-70ed626d3a0e', // original prototype
} as const;

export function stock(key: keyof typeof STOCK, width = 1600, height?: number): string {
  return unsplash(STOCK[key], width, height);
}
