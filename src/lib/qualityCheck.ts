import { Grade } from '../types';
import { getProduct } from '../data/products';

/* ============================================================
   Quality Check, SIMULATED grading.

   This is NOT a trained model and makes no real agronomic
   judgement. It reads simple colour statistics out of the
   captured frame (mean hue, saturation, brightness and their
   spread) and maps them onto a plausible grading report using
   fixed thresholds, so the same photo always produces the same
   result and the numbers move when the picture changes.

   Every surface that shows a result must label it as a demo
   simulation, see QualityCheck.tsx.
   ============================================================ */

export interface ImageStats {
  meanH: number;
  meanS: number;
  meanV: number;
  /** Spread of brightness - a proxy for blemishes and shadowing. */
  stdV: number;
  /** Spread of hue - a proxy for ripeness consistency. */
  stdH: number;
  /** Share of very dark pixels - a proxy for bruising. */
  darkShare: number;
  /** Share of blown-out pixels - a proxy for glare, which lowers confidence. */
  glareShare: number;
  sharpness: number;
}

export interface QualityFinding {
  key: string;
  label: string;
  /** 0-100, higher is better. */
  score: number;
  detail: string;
}

export interface QualityResult {
  productId: string;
  grade: Grade;
  gradeConfidence: number;
  /** 0-100 overall quality index. */
  score: number;
  findings: QualityFinding[];
  defects: string[];
  shelfLifeDays: number;
  recommendation: string;
  packing: string;
  capturedAt: string;
  stats: ImageStats;
  /** Low when the photo itself is poor (dark, blurry, glared). */
  imageQuality: number;
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, max === 0 ? 0 : d / max, max];
}

/** Circular mean for hue, so reds either side of 0° average correctly. */
function circularMean(degrees: number[]): { mean: number; spread: number } {
  if (!degrees.length) return { mean: 0, spread: 0 };
  let sx = 0;
  let sy = 0;
  for (const d of degrees) {
    const r = (d * Math.PI) / 180;
    sx += Math.cos(r);
    sy += Math.sin(r);
  }
  sx /= degrees.length;
  sy /= degrees.length;
  const mean = ((Math.atan2(sy, sx) * 180) / Math.PI + 360) % 360;
  const R = Math.sqrt(sx * sx + sy * sy);
  return { mean, spread: Math.sqrt(Math.max(0, -2 * Math.log(Math.max(1e-6, R)))) * (180 / Math.PI) };
}

export function analyseImageData(data: ImageData): ImageStats {
  const { data: px, width, height } = data;
  const hues: number[] = [];
  let sumS = 0;
  let sumV = 0;
  let sumV2 = 0;
  let dark = 0;
  let glare = 0;
  let n = 0;

  // Sample a grid rather than every pixel - fast and stable.
  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 12000)));
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const [h, s, v] = rgbToHsv(px[i], px[i + 1], px[i + 2]);
      if (s > 0.12) hues.push(h);
      sumS += s;
      sumV += v;
      sumV2 += v * v;
      if (v < 0.16) dark++;
      if (v > 0.97 && s < 0.12) glare++;
      n++;
    }
  }
  n = Math.max(1, n);
  const meanV = sumV / n;
  const varV = Math.max(0, sumV2 / n - meanV * meanV);
  const { mean: meanH, spread: stdH } = circularMean(hues);

  // Cheap sharpness proxy: mean absolute luminance difference between neighbours.
  let grad = 0;
  let gn = 0;
  for (let y = 1; y < height - 1; y += step) {
    for (let x = 1; x < width - 1; x += step) {
      const i = (y * width + x) * 4;
      const j = (y * width + x + 1) * 4;
      grad += Math.abs(px[i] - px[j]);
      gn++;
    }
  }

  return {
    meanH,
    meanS: sumS / n,
    meanV,
    stdV: Math.sqrt(varV),
    stdH,
    darkShare: dark / n,
    glareShare: glare / n,
    sharpness: gn ? grad / gn : 0,
  };
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

/** Expected hue band per crop, used to score colour development. */
const HUE_TARGET: Record<string, { hue: number; tolerance: number; name: string }> = {
  'p-tomato': { hue: 8, tolerance: 45, name: 'deep red' },
  'p-cucumber': { hue: 100, tolerance: 45, name: 'even green' },
  'p-leafy': { hue: 105, tolerance: 45, name: 'fresh green' },
  'p-capsicum': { hue: 45, tolerance: 90, name: 'mixed colour' },
  'p-eggplant': { hue: 285, tolerance: 55, name: 'deep purple' },
  'p-herbs': { hue: 110, tolerance: 40, name: 'vivid green' },
  'p-dates': { hue: 28, tolerance: 45, name: 'amber brown' },
  'p-honey': { hue: 38, tolerance: 45, name: 'golden amber' },
  'p-seabass': { hue: 200, tolerance: 120, name: 'silver' },
};

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export function gradeFromStats(stats: ImageStats, productId: string): QualityResult {
  const product = getProduct(productId);
  const target = HUE_TARGET[productId] ?? { hue: stats.meanH, tolerance: 90, name: 'expected colour' };

  // Image quality first - a bad photo lowers confidence, not the grade.
  const exposure = 100 - clamp(Math.abs(stats.meanV - 0.55) * 220);
  const glarePenalty = clamp(stats.glareShare * 400);
  const focus = clamp((stats.sharpness / 18) * 100);
  const imageQuality = Math.round(clamp(exposure * 0.45 + focus * 0.4 + (100 - glarePenalty) * 0.15));

  const colourMatch = clamp(100 - (hueDistance(stats.meanH, target.hue) / target.tolerance) * 100);
  const uniformity = clamp(100 - (stats.stdH / 40) * 100);
  const saturation = clamp((stats.meanS / 0.52) * 100);
  const blemish = clamp(100 - stats.darkShare * 260);
  const surface = clamp(100 - (stats.stdV / 0.30) * 100);

  const findings: QualityFinding[] = [
    {
      key: 'colour',
      label: 'Colour development',
      score: Math.round(colourMatch),
      detail: `Mean hue ${Math.round(stats.meanH)}° against a ${target.name} reference for ${product.name.toLowerCase()}.`,
    },
    {
      key: 'uniformity',
      label: 'Colour uniformity',
      score: Math.round(uniformity),
      detail: `Hue spread ${stats.stdH.toFixed(1)}° across the sample. Lower means a more consistent pack.`,
    },
    {
      key: 'saturation',
      label: 'Ripeness intensity',
      score: Math.round(saturation),
      detail: `Mean saturation ${(stats.meanS * 100).toFixed(0)}%.`,
    },
    {
      key: 'blemish',
      label: 'Blemish and bruising',
      score: Math.round(blemish),
      detail: `${(stats.darkShare * 100).toFixed(1)}% of the frame reads as dark patches.`,
    },
    {
      key: 'surface',
      label: 'Surface consistency',
      score: Math.round(surface),
      detail: `Brightness spread ${(stats.stdV * 100).toFixed(0)}, high values suggest uneven skin or shadowing.`,
    },
  ];

  const weights: Record<string, number> = {
    colour: 0.3,
    uniformity: 0.22,
    saturation: 0.16,
    blemish: 0.2,
    surface: 0.12,
  };
  const score = Math.round(findings.reduce((s, f) => s + f.score * weights[f.key], 0));

  const grade: Grade = score >= 78 ? 'A' : score >= 58 ? 'B' : 'Mixed';
  const gradeConfidence = Math.round(clamp(score * 0.55 + imageQuality * 0.45));

  const defects: string[] = [];
  if (blemish < 70) defects.push('Dark patches consistent with bruising or over-ripeness');
  if (uniformity < 65) defects.push('Mixed ripeness across the sample, consider re-sorting');
  if (colourMatch < 60) defects.push(`Colour outside the ${target.name} band for ${product.name.toLowerCase()}`);
  if (surface < 60) defects.push('Uneven surface or shadowing on the skin');
  if (imageQuality < 55) defects.push('Photo quality is low. Re-shoot in even light for a firmer read');

  const shelfLifeDays = Math.max(
    1,
    Math.round(product.shelfLifeDays * (0.55 + (score / 100) * 0.6))
  );

  const recommendation =
    grade === 'A'
      ? 'Clears the Grade A band. Pack to the buyer spec and hold below 14°C until collection.'
      : grade === 'B'
        ? 'Sits in the Grade B band. Suitable for processing or a mixed-grade line, not a Grade A contract.'
        : 'Below the contracted bands. Re-sort before packing, or route to a substitution.';

  const packing =
    grade === 'A' ? '5kg reusable crates, single layer' : 'Mixed-grade cartons, sorted by size';

  return {
    productId,
    grade,
    gradeConfidence,
    score,
    findings,
    defects,
    shelfLifeDays,
    recommendation,
    packing,
    capturedAt: new Date().toISOString(),
    stats,
    imageQuality,
  };
}
