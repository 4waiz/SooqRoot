import {
  Allocation,
  AllocationLine,
  Buyer,
  Confidence,
  Demand,
  DemandLine,
  Farm,
  Grade,
  HarvestInstruction,
  Language,
  ProductCategory,
  RiskScore,
  SubstituteSuggestion,
} from '../types';

interface ProductDef {
  en: string;
  ar: string;
  category: ProductCategory;
  unit: 'kg' | 'boxes' | 'jars';
  keywordsEn: string[];
  keywordsAr: string[];
  defaultPackagingEn: string;
  defaultPackagingAr: string;
}

const PRODUCTS: ProductDef[] = [
  {
    en: 'Tomatoes',
    ar: 'طماطم',
    category: 'vegetable',
    unit: 'kg',
    keywordsEn: ['tomato', 'tomatoes'],
    keywordsAr: ['طماطم', 'بندورة'],
    defaultPackagingEn: '5kg boxes',
    defaultPackagingAr: 'صناديق 5 كجم',
  },
  {
    en: 'Cucumbers',
    ar: 'خيار',
    category: 'vegetable',
    unit: 'kg',
    keywordsEn: ['cucumber', 'cucumbers'],
    keywordsAr: ['خيار'],
    defaultPackagingEn: '5kg boxes',
    defaultPackagingAr: 'صناديق 5 كجم',
  },
  {
    en: 'Lettuce',
    ar: 'خس',
    category: 'leafygreen',
    unit: 'boxes',
    keywordsEn: ['lettuce'],
    keywordsAr: ['خس'],
    defaultPackagingEn: 'standard crates',
    defaultPackagingAr: 'صناديق قياسية',
  },
  {
    en: 'Spinach',
    ar: 'سبانخ',
    category: 'leafygreen',
    unit: 'boxes',
    keywordsEn: ['spinach'],
    keywordsAr: ['سبانخ'],
    defaultPackagingEn: 'standard crates',
    defaultPackagingAr: 'صناديق قياسية',
  },
  {
    en: 'Herbs',
    ar: 'أعشاب طازجة',
    category: 'leafygreen',
    unit: 'boxes',
    keywordsEn: ['herb', 'herbs', 'mint', 'parsley', 'coriander'],
    keywordsAr: ['أعشاب', 'نعناع', 'بقدونس', 'كزبرة'],
    defaultPackagingEn: 'small crates',
    defaultPackagingAr: 'صناديق صغيرة',
  },
  {
    en: 'Sea bass',
    ar: 'قاروص',
    category: 'fish',
    unit: 'kg',
    keywordsEn: ['sea bass', 'seabass', 'bass'],
    keywordsAr: ['قاروص', 'سيباس'],
    defaultPackagingEn: 'iced cooler boxes',
    defaultPackagingAr: 'صناديق مبردة بالثلج',
  },
  {
    en: 'Tilapia',
    ar: 'بلطي',
    category: 'fish',
    unit: 'kg',
    keywordsEn: ['tilapia'],
    keywordsAr: ['بلطي'],
    defaultPackagingEn: 'iced cooler boxes',
    defaultPackagingAr: 'صناديق مبردة بالثلج',
  },
  {
    en: 'Sidr Honey',
    ar: 'عسل السدر',
    category: 'honey',
    unit: 'jars',
    keywordsEn: ['sidr honey', 'sidr'],
    keywordsAr: ['عسل السدر', 'سدر'],
    defaultPackagingEn: '500g labelled jars',
    defaultPackagingAr: 'برطمانات 500 جم مع ملصقات',
  },
  {
    en: 'Local Honey',
    ar: 'عسل محلي',
    category: 'honey',
    unit: 'jars',
    keywordsEn: ['local honey', 'honey'],
    keywordsAr: ['عسل محلي', 'عسل'],
    defaultPackagingEn: '500g labelled jars',
    defaultPackagingAr: 'برطمانات 500 جم مع ملصقات',
  },
];

const DAYS_EN: Record<string, { en: string; ar: string }> = {
  monday: { en: 'Monday', ar: 'الاثنين' },
  tuesday: { en: 'Tuesday', ar: 'الثلاثاء' },
  wednesday: { en: 'Wednesday', ar: 'الأربعاء' },
  thursday: { en: 'Thursday', ar: 'الخميس' },
  friday: { en: 'Friday', ar: 'الجمعة' },
  saturday: { en: 'Saturday', ar: 'السبت' },
  sunday: { en: 'Sunday', ar: 'الأحد' },
};
const DAYS_AR: Record<string, { en: string; ar: string }> = {
  'الاثنين': { en: 'Monday', ar: 'الاثنين' },
  'الثلاثاء': { en: 'Tuesday', ar: 'الثلاثاء' },
  'الأربعاء': { en: 'Wednesday', ar: 'الأربعاء' },
  'الخميس': { en: 'Thursday', ar: 'الخميس' },
  'الجمعة': { en: 'Friday', ar: 'الجمعة' },
  'السبت': { en: 'Saturday', ar: 'السبت' },
  'الأحد': { en: 'Sunday', ar: 'الأحد' },
};

const UAE_CITIES_EN = ['al ain', 'abu dhabi', 'dubai', 'sharjah', 'ras al khaimah', 'fujairah', 'ajman'];
const UAE_CITIES_AR = ['العين', 'أبوظبي', 'دبي', 'الشارقة', 'رأس الخيمة', 'الفجيرة', 'عجمان'];

export interface ParsedDemand {
  lines: DemandLine[];
  interpretation: string;
  interpretationAr: string;
  confidence: number;
}

export function parseDemandText(text: string, lang: Language): ParsedDemand {
  const normalized = text.toLowerCase();
  const lines: DemandLine[] = [];
  let matchCount = 0;
  let totalQty = 0;

  for (const p of PRODUCTS) {
    const keywords = lang === 'ar' ? p.keywordsAr : p.keywordsEn;
    const kwRegex = new RegExp(`(${keywords.map(escapeRx).join('|')})`, 'i');
    const m = normalized.match(kwRegex);
    if (!m) continue;

    // Find a number near this keyword
    const kwIdx = normalized.indexOf(m[1].toLowerCase());
    const windowStart = Math.max(0, kwIdx - 40);
    const windowEnd = Math.min(normalized.length, kwIdx + 40);
    const windowText = normalized.slice(windowStart, windowEnd);
    const qtyMatch = windowText.match(/(\d{1,4})\s*(kg|كجم|boxes?|صناديق|jars?|برطمان\w*)?/);
    if (!qtyMatch) continue;

    const qty = parseInt(qtyMatch[1], 10);
    if (!qty || qty <= 0) continue;

    const unitToken = (qtyMatch[2] || '').toLowerCase();
    let unit = p.unit;
    if (/(kg|كجم)/i.test(unitToken)) unit = 'kg';
    else if (/(box|صناديق|صندوق)/i.test(unitToken)) unit = 'boxes';
    else if (/(jar|برطمان)/i.test(unitToken)) unit = 'jars';

    const gradeMatch = text.match(/grade\s*(a|b)|جودة\s*(أ|ب|a|b)/i);
    let grade: Grade = 'A';
    if (gradeMatch) {
      const g = (gradeMatch[1] || gradeMatch[2] || '').toLowerCase();
      grade = g === 'b' || g === 'ب' ? 'B' : 'A';
    }

    // Packaging detection
    let packagingEn = p.defaultPackagingEn;
    let packagingAr = p.defaultPackagingAr;
    const packMatch = text.match(/(\d+)\s*kg\s*box|صناديق\s*(\d+)\s*كجم/i);
    if (packMatch) {
      const size = packMatch[1] || packMatch[2];
      packagingEn = `${size}kg boxes`;
      packagingAr = `صناديق ${size} كجم`;
    }

    // Delivery window
    let deliveryWindow = '';
    let deliveryWindowAr = '';
    const dayDict = lang === 'ar' ? DAYS_AR : DAYS_EN;
    for (const key of Object.keys(dayDict)) {
      if (text.toLowerCase().includes(key)) {
        deliveryWindow = dayDict[key].en;
        deliveryWindowAr = dayDict[key].ar;
        break;
      }
    }
    if (/morning|صباح/i.test(text)) {
      deliveryWindow = deliveryWindow ? `${deliveryWindow} morning` : 'Morning';
      deliveryWindowAr = deliveryWindowAr ? `صباح ${deliveryWindowAr}` : 'صباحاً';
    } else if (/evening|مساء/i.test(text)) {
      deliveryWindow = deliveryWindow ? `${deliveryWindow} evening` : 'Evening';
      deliveryWindowAr = deliveryWindowAr ? `مساء ${deliveryWindowAr}` : 'مساءً';
    }
    if (!deliveryWindow) {
      deliveryWindow = 'This week';
      deliveryWindowAr = 'هذا الأسبوع';
    }

    // Location
    let locationPref: string | undefined;
    let locationPrefAr: string | undefined;
    const cities = lang === 'ar' ? UAE_CITIES_AR : UAE_CITIES_EN;
    for (let i = 0; i < cities.length; i++) {
      if (text.toLowerCase().includes(cities[i].toLowerCase())) {
        locationPref = UAE_CITIES_EN[i].replace(/\b\w/g, (c) => c.toUpperCase());
        locationPrefAr = UAE_CITIES_AR[i];
        break;
      }
    }

    lines.push({
      id: `line-${Date.now()}-${matchCount}`,
      product: p.en,
      productAr: p.ar,
      category: p.category,
      qty,
      unit,
      grade,
      packaging: packagingEn,
      packagingAr,
      deliveryWindow,
      deliveryWindowAr,
      locationPref,
      locationPrefAr,
    });
    matchCount++;
    totalQty += qty;
  }

  const confidence = Math.min(0.98, 0.55 + matchCount * 0.12);

  const interpretation =
    matchCount === 0
      ? 'Could not confidently detect specific items. Please include product, quantity and day.'
      : `Detected ${matchCount} product line(s) with a total of ~${totalQty} units. The AI inferred grade, packaging and delivery window from keywords and applied UAE-standard defaults where unspecified.`;

  const interpretationAr =
    matchCount === 0
      ? 'لم نتمكّن من التعرّف على عناصر محددة بدقة. يرجى ذكر المنتج والكمية واليوم.'
      : `تم اكتشاف ${matchCount} سطر منتج بإجمالي ~${totalQty} وحدة. استخلص الذكاء الاصطناعي الجودة والتغليف ونافذة التسليم من الكلمات المفتاحية، وطبّق الإعدادات الافتراضية المعتمدة في الإمارات عند غياب التحديد.`;

  return { lines, interpretation, interpretationAr, confidence };
}

function escapeRx(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---- Farmer Copilot ----
export interface CopilotResponse {
  text: string;
  reasoning: string;
  suggestedAction: string;
  confidence: number;
}

export function generateFarmerAdvice(
  input: string,
  farm: Farm,
  demands: Demand[],
  lang: Language
): CopilotResponse {
  const parsed = parseDemandText(input, lang);
  const first = parsed.lines[0];

  if (!first) {
    return {
      text:
        lang === 'ar'
          ? 'من فضلك أخبرني بالمنتج والكمية وموعد الحصاد. مثال: "عندي 300 كجم طماطم الأسبوع القادم".'
          : 'Please tell me the product, quantity, and harvest timing. Example: "I have 300kg tomatoes next week".',
      reasoning:
        lang === 'ar' ? 'لم أتمكّن من استخلاص منتج أو كمية.' : 'Could not extract a product or quantity.',
      suggestedAction:
        lang === 'ar' ? 'أعد الصياغة بذكر المنتج والكمية.' : 'Rephrase including product and quantity.',
      confidence: 0.3,
    };
  }

  // Match against open demand
  const matchingDemandLines = demands
    .filter((d) => d.status !== 'Delivered')
    .flatMap((d) => d.lines.map((l) => ({ buyerId: d.buyerId, demand: d, line: l })))
    .filter((x) => x.line.product === first.product);

  const totalOpen = matchingDemandLines.reduce((s, x) => s + x.line.qty, 0);
  const recommendedGrade = matchingDemandLines[0]?.line.grade || first.grade;
  const packaging = matchingDemandLines[0]?.line.packaging || first.packaging;
  const packagingAr = matchingDemandLines[0]?.line.packagingAr || first.packagingAr;

  const joinPool = totalOpen > first.qty;

  if (lang === 'ar') {
    const text = [
      `هناك طلب مفتوح لحوالي ${totalOpen} ${unitAr(first.unit)} من ${first.productAr}.`,
      `كميتك ${first.qty} ${unitAr(first.unit)} ${joinPool ? 'مطلوبة بالكامل' : 'تغطّي الطلب'}، ونوصي بجودة ${recommendedGrade === 'A' ? 'أ' : 'ب'} وبتغليف ${packagingAr}.`,
      joinPool
        ? 'نوصي بالانضمام إلى تجميع المزارع لتلبية الكمية كاملة.'
        : 'يمكنك التلبية منفرداً أو ضمن التجميع لزيادة الثقة.',
    ].join(' ');
    return {
      text,
      reasoning: `طلب مفتوح ${totalOpen} ${unitAr(first.unit)} · مزرعتك ${farm.nameAr} · مسافة ${farm.distanceKm} كم.`,
      suggestedAction: joinPool
        ? 'انضم إلى التجميع وابدأ التحضير لجودة أ والتعبئة القياسية.'
        : 'سجّل الإمداد الآن لتثبيت التخصيص.',
      confidence: 0.88,
    };
  }

  const text = [
    `There is open demand for about ${totalOpen} ${first.unit} of ${first.product}.`,
    `Your ${first.qty} ${first.unit} ${joinPool ? 'is fully needed' : 'covers the open demand'}. Recommended grade ${recommendedGrade} in ${packaging}.`,
    joinPool
      ? 'Recommend joining the pooled allocation to fill the full volume.'
      : 'You can fulfill solo or as part of the pool for higher confidence.',
  ].join(' ');
  return {
    text,
    reasoning: `Open demand ${totalOpen} ${first.unit} · your farm ${farm.name} · distance ${farm.distanceKm} km.`,
    suggestedAction: joinPool
      ? 'Join the pool and prepare Grade A with standard packaging.'
      : 'Register supply now to lock in allocation.',
    confidence: 0.88,
  };
}

function unitAr(u: 'kg' | 'boxes' | 'jars') {
  if (u === 'kg') return 'كجم';
  if (u === 'boxes') return 'صندوق';
  return 'برطمان';
}

// ---- Risk score ----
export function calculateFulfillmentRisk(allocation: Allocation, farms: Farm[]): RiskScore {
  const reasons: string[] = [];
  const reasonsAr: string[] = [];
  const mitigations: string[] = [];
  const mitigationsAr: string[] = [];
  let score = 0;

  for (const line of allocation.lines) {
    if (line.shortfall > 0) {
      const pct = Math.round((line.shortfall / line.requestedQty) * 100);
      reasons.push(`${line.product} shortfall of ${line.shortfall} ${line.unit} (${pct}%)`);
      reasonsAr.push(`نقص في ${line.productAr} بمقدار ${line.shortfall} (${pct}%)`);
      score += 25 + pct / 2;
      mitigations.push(`Activate backup farm or substitute for ${line.product}`);
      mitigationsAr.push(`فعّل مزرعة احتياطية أو بديلاً للمنتج ${line.productAr}`);
    }
    const probableQty = line.parts
      .filter((p) => p.confidence === 'Probable')
      .reduce((s, p) => s + p.qty, 0);
    if (probableQty > 0) {
      const pct = Math.round((probableQty / Math.max(line.requestedQty, 1)) * 100);
      if (pct >= 15) {
        reasons.push(`${pct}% of ${line.product} is only Probable supply`);
        reasonsAr.push(`${pct}% من إمداد ${line.productAr} محتمل فقط`);
        score += 12;
        mitigations.push(`Confirm ${line.product} supply with farm 48h before harvest`);
        mitigationsAr.push(`أكّد إمداد ${line.productAr} مع المزرعة قبل 48 ساعة من الحصاد`);
      }
    }
    if (line.parts.length >= 3) {
      reasons.push(`${line.product} requires coordination across ${line.parts.length} farms`);
      reasonsAr.push(`يتطلب ${line.productAr} تنسيقاً بين ${line.parts.length} مزارع`);
      score += 6;
      mitigations.push('Stagger pickups to manage multi-farm logistics');
      mitigationsAr.push('جدولة استلامات متتابعة لتنظيم اللوجستيات بين عدة مزارع');
    }
    for (const p of line.parts) {
      const f = farms.find((x) => x.id === p.farmId);
      if (f && f.distanceKm > 50) {
        reasons.push(`Long haul from ${f.name} (${f.distanceKm}km)`);
        reasonsAr.push(`مسافة طويلة من ${f.nameAr} (${f.distanceKm} كم)`);
        score += 6;
        mitigations.push(`Plan cold-chain logistics for ${f.name}`);
        mitigationsAr.push(`خطّط لسلسلة التبريد من ${f.nameAr}`);
        break;
      }
    }
  }

  if (reasons.length === 0) {
    reasons.push('All items allocated to confirmed local farms');
    reasonsAr.push('كل العناصر مخصّصة لمزارع محلية مؤكدة');
    mitigations.push('Maintain communication with farms through harvest');
    mitigationsAr.push('حافظ على التواصل مع المزارع حتى موعد الحصاد');
  }

  const level = score >= 40 ? 'High' : score >= 15 ? 'Medium' : 'Low';
  return {
    level,
    score: Math.round(score),
    reasons,
    reasonsAr,
    mitigations,
    mitigationsAr,
  };
}

// ---- Substitutes ----
const SUBSTITUTE_MAP: Record<string, { product: string; productAr: string }[]> = {
  Lettuce: [
    { product: 'Spinach', productAr: 'سبانخ' },
    { product: 'Herbs', productAr: 'أعشاب طازجة' },
  ],
  Spinach: [
    { product: 'Lettuce', productAr: 'خس' },
    { product: 'Herbs', productAr: 'أعشاب طازجة' },
  ],
  Tomatoes: [{ product: 'Cucumbers', productAr: 'خيار' }],
  Cucumbers: [{ product: 'Tomatoes', productAr: 'طماطم' }],
  'Sea bass': [{ product: 'Tilapia', productAr: 'بلطي' }],
  Tilapia: [{ product: 'Sea bass', productAr: 'قاروص' }],
  'Sidr Honey': [{ product: 'Local Honey', productAr: 'عسل محلي' }],
  'Local Honey': [{ product: 'Sidr Honey', productAr: 'عسل السدر' }],
};

export function suggestSubstitutes(product: string, farms: Farm[]): SubstituteSuggestion[] {
  const alts = SUBSTITUTE_MAP[product] || [];
  const suggestions: SubstituteSuggestion[] = [];
  for (const alt of alts) {
    const providingFarms = farms.filter((f) =>
      f.supplies.some((s) => s.product === alt.product && s.qty > 0)
    );
    if (!providingFarms.length) continue;
    const availableQty = providingFarms
      .flatMap((f) => f.supplies.filter((s) => s.product === alt.product))
      .reduce((s, x) => s + x.qty, 0);
    suggestions.push({
      product: alt.product,
      productAr: alt.productAr,
      availableQty,
      reason: 'Available nearby with similar buyer use case and same delivery window',
      reasonAr: 'متوفّر محلياً مع استخدام مشابه لدى المشتري ونفس نافذة التسليم',
      farmIds: providingFarms.map((f) => f.id),
    });
  }
  return suggestions;
}

// ---- Harvest instructions ----
export function generateHarvestInstructions(
  allocation: Allocation,
  demand: Demand,
  farms: Farm[],
  buyers: Buyer[]
): HarvestInstruction[] {
  const buyer = buyers.find((b) => b.id === demand.buyerId);
  const out: HarvestInstruction[] = [];
  for (const line of allocation.lines) {
    for (const part of line.parts) {
      const f = farms.find((x) => x.id === part.farmId);
      if (!f) continue;
      const supply = f.supplies.find((s) => s.product === line.product);
      out.push({
        batchId: part.batchId,
        farmId: f.id,
        farmName: f.name,
        farmNameAr: f.nameAr,
        buyerName: buyer?.name || '—',
        buyerNameAr: buyer?.nameAr || '—',
        product: line.product,
        productAr: line.productAr,
        qty: part.qty,
        unit: line.unit,
        grade: 'A' as Grade,
        packaging: supply?.packaging || '5kg boxes',
        packagingAr: supply?.packagingAr || 'صناديق 5 كجم',
        harvestDay: supply?.harvestDate || 'Mon evening',
        harvestDayAr: supply?.harvestDate ? mapDayAr(supply.harvestDate) : 'مساء الاثنين',
        pickupTime: '08:00',
        pickupTimeAr: '٨:٠٠ صباحاً',
      });
    }
  }
  return out;
}

function mapDayAr(en: string): string {
  return en
    .replace(/Mon(day)?/i, 'الاثنين')
    .replace(/Tue(sday)?/i, 'الثلاثاء')
    .replace(/Wed(nesday)?/i, 'الأربعاء')
    .replace(/Thu(rsday)?/i, 'الخميس')
    .replace(/Fri(day)?/i, 'الجمعة')
    .replace(/Sat(urday)?/i, 'السبت')
    .replace(/Sun(day)?/i, 'الأحد')
    .replace(/evening/i, 'مساءً')
    .replace(/morning/i, 'صباحاً')
    .replace(/early/i, 'باكراً');
}

// Distance heuristic by city (used as tie-break)
export function cityDistance(a: string, b: string): number {
  if (a.toLowerCase() === b.toLowerCase()) return 0;
  return 50;
}

export type { Confidence };
