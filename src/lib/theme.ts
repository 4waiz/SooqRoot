import { useStore } from '../state/AppStore';

/* ============================================================
   Theme-aware colour helpers for places Tailwind classes can't
   reach. Recharts props, SVG fills and data-driven accents.
   ============================================================ */

export interface ChartColors {
  grid: string;
  axis: string;
  /** Neutral series, e.g. "imported" against "local". */
  muted: string;
  cursor: string;
  /** Pale committed-vs-delivered bar. */
  soft: string;
  brand: string;
  brandDeep: string;
  surface: string;
}

const LIGHT: ChartColors = {
  grid: '#eceeee',
  axis: '#848a8e',
  muted: '#d9dcdd',
  cursor: 'rgba(60,140,97,0.06)',
  soft: '#badec7',
  brand: '#2a714c',
  brandDeep: '#1d4733',
  surface: '#ffffff',
};

const DARK: ChartColors = {
  grid: '#232829',
  axis: '#6f767a',
  muted: '#3a4043',
  cursor: 'rgba(140,198,164,0.08)',
  soft: '#2f5a43',
  brand: '#5ca87e',
  brandDeep: '#8dc6a4',
  surface: '#121517',
};

export function useChartColors(): ChartColors {
  const { theme } = useStore();
  return theme === 'dark' ? DARK : LIGHT;
}

/** Mix a hex colour toward white. amount 0..1 */
export function lighten(hex: string, amount: number): string {
  const n = hex.replace('#', '');
  const full = n.length === 3 ? n.split('').map((c) => c + c).join('') : n;
  const num = parseInt(full, 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const r = mix((num >> 16) & 255);
  const g = mix((num >> 8) & 255);
  const b = mix(num & 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * A data colour (product, series, accent) adjusted so it stays readable as text
 * or an icon on the current surface. Dark brand greens and reds are too dim on
 * charcoal, so they are lifted toward white in dark mode.
 */
export function useReadableColor() {
  const { theme } = useStore();
  return (hex: string) => (theme === 'dark' ? lighten(hex, 0.45) : hex);
}
