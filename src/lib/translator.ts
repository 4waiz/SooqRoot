import { Grade, Unit } from '../types';
import { PRODUCTS } from '../data/products';

/* ============================================================
   AI Demand Translator
   ------------------------------------------------------------
   Turns free-text buyer language into a structured demand line.
   This runs entirely in the browser, no external model is
   called, but the parse is genuine: it reads quantities,
   multipliers, grade language, packaging, delivery cadence and
   the procurement window out of the sentence.
   ============================================================ */

export interface TranslatedField {
  key: string;
  label: string;
  value: string;
  /** The phrase from the buyer's text this field was derived from. */
  from?: string;
  confidence: number;
}

export interface TranslationResult {
  productId: string | null;
  qty: number | null;
  unit: Unit;
  grade: Grade;
  packaging: string;
  schedule: string;
  window: string;
  frequency: 'One-off' | 'Weekly' | 'Twice weekly' | 'Daily';
  requiredBy: string;
  fields: TranslatedField[];
  confidence: number;
  notes: string[];
}

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  fifteen: 15,
  twenty: 20,
  thirty: 30,
  fifty: 50,
  hundred: 100,
};

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

/** "next month" is resolved relative to the demo clock. */
const DEMO_TODAY = new Date('2026-09-15');

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function matchProduct(text: string): { id: string; term: string } | null {
  const t = text.toLowerCase();
  // Longest product name first so "leafy greens" beats "greens".
  const ordered = [...PRODUCTS].sort((a, b) => b.name.length - a.name.length);
  for (const p of ordered) {
    const base = p.name.toLowerCase();
    const singular = base.replace(/e?s$/, '');
    for (const term of [base, singular, p.nameAr]) {
      if (term.length > 2 && t.includes(term)) return { id: p.id, term };
    }
  }
  const aliases: Record<string, string> = {
    tomato: 'p-tomato',
    cucumber: 'p-cucumber',
    lettuce: 'p-leafy',
    salad: 'p-leafy',
    greens: 'p-leafy',
    rocket: 'p-leafy',
    spinach: 'p-leafy',
    pepper: 'p-capsicum',
    capsicum: 'p-capsicum',
    aubergine: 'p-eggplant',
    brinjal: 'p-eggplant',
    basil: 'p-herbs',
    mint: 'p-herbs',
    coriander: 'p-herbs',
    herb: 'p-herbs',
    date: 'p-dates',
    honey: 'p-honey',
    bass: 'p-seabass',
    fish: 'p-seabass',
  };
  for (const [alias, id] of Object.entries(aliases)) {
    if (t.includes(alias)) return { id, term: alias };
  }
  return null;
}

function parseQuantity(text: string): { qty: number; unit: Unit; from: string } | null {
  const t = text.toLowerCase();

  // "10 tonnes", "ten tonnes", "2.5t"
  const tonne = t.match(/(\d[\d,.]*|[a-z]+)\s*(tonnes?|tons?|t\b)/);
  if (tonne) {
    const raw = tonne[1].replace(/,/g, '');
    const n = Number.isNaN(Number(raw)) ? NUMBER_WORDS[raw] : Number(raw);
    if (n) return { qty: Math.round(n * 1000), unit: 'kg', from: tonne[0].trim() };
  }

  // "9,000 kg", "500kg"
  const kg = t.match(/(\d[\d,.]*)\s*(kilograms?|kilos?|kgs?|kg)\b/);
  if (kg) return { qty: Math.round(Number(kg[1].replace(/,/g, ''))), unit: 'kg', from: kg[0].trim() };

  // "400 crates" / "120 boxes" / "60 jars"
  const packs = t.match(/(\d[\d,.]*)\s*(crates?|boxes?|jars?)\b/);
  if (packs) {
    const unit = packs[2].startsWith('crate') ? 'crates' : packs[2].startsWith('box') ? 'boxes' : 'jars';
    return { qty: Math.round(Number(packs[1].replace(/,/g, ''))), unit: unit as Unit, from: packs[0].trim() };
  }

  // Bare number near the product
  const bare = t.match(/\b(\d{2,6})\b/);
  if (bare) return { qty: Number(bare[1]), unit: 'kg', from: bare[0] };

  return null;
}

function parseGrade(text: string): { grade: Grade; from: string; confidence: number } {
  const t = text.toLowerCase();
  if (/grade\s*a\b|premium|top quality|best quality|first grade/.test(t))
    return { grade: 'A', from: t.match(/grade\s*a\b|premium|top quality|best quality|first grade/)![0], confidence: 97 };
  if (/good quality|high quality|quality produce/.test(t))
    return { grade: 'A', from: t.match(/good quality|high quality|quality produce/)![0], confidence: 88 };
  if (/grade\s*b\b|standard grade|processing grade|second grade/.test(t))
    return { grade: 'B', from: t.match(/grade\s*b\b|standard grade|processing grade|second grade/)![0], confidence: 95 };
  if (/mixed grade|any grade|mixed/.test(t))
    return { grade: 'Mixed', from: 'mixed', confidence: 90 };
  return { grade: 'A', from: '', confidence: 64 };
}

function parsePackaging(text: string): { packaging: string; from: string; confidence: number } {
  const t = text.toLowerCase();
  const m = t.match(/(\d+)\s*kg\s*(reusable\s*)?(crates?|boxes?|cartons?)/);
  if (m) {
    const kind = m[3].startsWith('crate') ? 'crates' : m[3].startsWith('box') ? 'boxes' : 'cartons';
    return {
      packaging: `${m[1]}kg ${m[2] ? 'reusable ' : ''}${kind}`,
      from: m[0],
      confidence: 96,
    };
  }
  if (/reusable/.test(t)) return { packaging: '5kg reusable crates', from: 'reusable', confidence: 82 };
  if (/vented/.test(t)) return { packaging: 'Vented crates', from: 'vented', confidence: 90 };
  if (/clamshell|punnet/.test(t))
    return { packaging: t.includes('punnet') ? 'Punnets' : 'Clamshell', from: t.includes('punnet') ? 'punnet' : 'clamshell', confidence: 92 };
  if (/cold.?chain|chilled|iced/.test(t))
    return { packaging: 'Cold-chain totes', from: t.match(/cold.?chain|chilled|iced/)![0], confidence: 88 };
  if (/gift box/.test(t)) return { packaging: '1kg gift boxes', from: 'gift box', confidence: 93 };
  return { packaging: '5kg reusable crates', from: '', confidence: 58 };
}

function parseSchedule(text: string): {
  schedule: string;
  frequency: TranslationResult['frequency'];
  from: string;
  confidence: number;
} {
  const t = text.toLowerCase();
  const found = DAYS.filter((d) => t.includes(d));
  if (found.length >= 2) {
    const labels = found.map(titleCase);
    return {
      schedule: labels.join(' + '),
      frequency: found.length === 2 ? 'Twice weekly' : 'Daily',
      from: found.join(' and '),
      confidence: 95,
    };
  }
  if (found.length === 1)
    return { schedule: titleCase(found[0]), frequency: 'Weekly', from: found[0], confidence: 92 };
  if (/twice a week|two deliveries|bi-?weekly/.test(t))
    return { schedule: 'Twice weekly', frequency: 'Twice weekly', from: 'twice a week', confidence: 88 };
  if (/daily|every day/.test(t))
    return { schedule: 'Daily', frequency: 'Daily', from: 'daily', confidence: 93 };
  if (/weekly|every week/.test(t))
    return { schedule: 'Weekly', frequency: 'Weekly', from: 'weekly', confidence: 90 };
  if (/one.?off|single delivery|once/.test(t))
    return { schedule: 'One-off', frequency: 'One-off', from: 'one-off', confidence: 89 };
  return { schedule: 'Weekly', frequency: 'Weekly', from: '', confidence: 55 };
}

function parseWindow(text: string): {
  window: string;
  requiredBy: string;
  from: string;
  confidence: number;
} {
  const t = text.toLowerCase();

  for (let i = 0; i < MONTHS.length; i++) {
    if (t.includes(MONTHS[i])) {
      const year = i < DEMO_TODAY.getMonth() ? DEMO_TODAY.getFullYear() + 1 : DEMO_TODAY.getFullYear();
      const last = new Date(year, i + 1, 0);
      return {
        window: `${titleCase(MONTHS[i])} ${year}`,
        requiredBy: new Date(Date.UTC(year, i, Math.min(22, last.getDate())))
          .toISOString()
          .slice(0, 10),
        from: MONTHS[i],
        confidence: 96,
      };
    }
  }

  if (/next month/.test(t)) {
    const d = new Date(DEMO_TODAY);
    d.setMonth(d.getMonth() + 1);
    return {
      window: `${titleCase(MONTHS[d.getMonth()])} ${d.getFullYear()}`,
      requiredBy: new Date(Date.UTC(d.getFullYear(), d.getMonth(), 22)).toISOString().slice(0, 10),
      from: 'next month',
      confidence: 92,
    };
  }
  if (/next week/.test(t)) {
    const d = new Date(DEMO_TODAY);
    d.setDate(d.getDate() + 7);
    return {
      window: `Week of ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
      requiredBy: d.toISOString().slice(0, 10),
      from: 'next week',
      confidence: 90,
    };
  }
  if (/this month/.test(t)) {
    return {
      window: `${titleCase(MONTHS[DEMO_TODAY.getMonth()])} ${DEMO_TODAY.getFullYear()}`,
      requiredBy: new Date(Date.UTC(DEMO_TODAY.getFullYear(), DEMO_TODAY.getMonth(), 28))
        .toISOString()
        .slice(0, 10),
      from: 'this month',
      confidence: 88,
    };
  }

  const d = new Date(DEMO_TODAY);
  d.setMonth(d.getMonth() + 1);
  return {
    window: `${titleCase(MONTHS[d.getMonth()])} ${d.getFullYear()}`,
    requiredBy: new Date(Date.UTC(d.getFullYear(), d.getMonth(), 22)).toISOString().slice(0, 10),
    from: '',
    confidence: 52,
  };
}

export function translateDemand(text: string): TranslationResult {
  const product = matchProduct(text);
  const quantity = parseQuantity(text);
  const grade = parseGrade(text);
  const packaging = parsePackaging(text);
  const schedule = parseSchedule(text);
  const window = parseWindow(text);

  const fields: TranslatedField[] = [
    {
      key: 'crop',
      label: 'Crop',
      value: product ? PRODUCTS.find((p) => p.id === product.id)!.name : 'Not detected',
      from: product?.term,
      confidence: product ? 98 : 0,
    },
    {
      key: 'qty',
      label: 'Quantity',
      value: quantity ? `${quantity.qty.toLocaleString()} ${quantity.unit}` : 'Not detected',
      from: quantity?.from,
      confidence: quantity ? 95 : 0,
    },
    {
      key: 'grade',
      label: 'Grade',
      value: `Grade ${grade.grade}`,
      from: grade.from || undefined,
      confidence: grade.confidence,
    },
    {
      key: 'packaging',
      label: 'Packaging',
      value: packaging.packaging,
      from: packaging.from || undefined,
      confidence: packaging.confidence,
    },
    {
      key: 'schedule',
      label: 'Schedule',
      value: schedule.schedule,
      from: schedule.from || undefined,
      confidence: schedule.confidence,
    },
    {
      key: 'window',
      label: 'Procurement window',
      value: window.window,
      from: window.from || undefined,
      confidence: window.confidence,
    },
  ];

  const scored = fields.filter((f) => f.confidence > 0);
  const confidence = scored.length
    ? Math.round(scored.reduce((s, f) => s + f.confidence, 0) / scored.length)
    : 0;

  const notes: string[] = [];
  if (quantity && /tonnes?|tons?/i.test(quantity.from))
    notes.push(`"${quantity.from}" resolved to ${quantity.qty.toLocaleString()} kg`);
  if (grade.from && grade.grade === 'A' && grade.confidence < 95)
    notes.push(`"${grade.from}" mapped to Grade A against the buyer contract spec`);
  if (schedule.from && schedule.frequency === 'Twice weekly')
    notes.push(`"${schedule.from}" resolved to a twice-weekly delivery schedule`);
  if (window.from === 'next month')
    notes.push(`Procurement window inferred as ${window.window} from "next month"`);
  if (!product) notes.push('No crop matched, select one manually before approving');
  if (packaging.confidence < 60) notes.push('Packaging defaulted to the buyer’s standard 5kg reusable crates');

  return {
    productId: product?.id ?? null,
    qty: quantity?.qty ?? null,
    unit: quantity?.unit ?? 'kg',
    grade: grade.grade,
    packaging: packaging.packaging,
    schedule: schedule.schedule,
    window: window.window,
    frequency: schedule.frequency,
    requiredBy: window.requiredBy,
    fields,
    confidence,
    notes,
  };
}

export const TRANSLATOR_SAMPLES = [
  'We need around ten tonnes of good quality tomatoes next month, split into Monday and Thursday deliveries, packed in 5kg reusable crates.',
  'Looking for 2,000 kg of leafy greens in October for our Dubai stores, vented crates, twice a week.',
  'Can you supply 600 kg premium capsicum next month in 5kg crates, weekly delivery to Mussafah?',
];
