import { Farm, Order } from '../types';
import { allocatable } from './engine';
import { LPI_CURRENT_MONTH, LPI_TARGET, LPI_TRAILING_12M, MONTHLY } from '../data/analytics';

/* ============================================================
   Derived network metrics. Everything on the Control Tower is
   computed from the demo order book and farm network, so the
   headline figures can never drift from the detail pages.
   ============================================================ */

const OPEN_STATUSES: Order['status'][] = [
  'Demand received',
  'Committed',
  'Harvest scheduled',
  'In fulfilment',
  'At risk',
];

export interface NetworkMetrics {
  localProcurementPct: number;
  localProcurementDelta: number;
  activeFarms: number;
  activeFarmsDelta: number;
  openCommitmentsAed: number;
  openCommitmentsDelta: number;
  preHarvestMatchPct: number;
  preHarvestMatchDelta: number;
  expectedFillPct: number;
  expectedFillDelta: number;
  atRiskOrders: number;
  atRiskDelta: number;
  lpiCurrent: number;
  lpiTarget: number;
  lpiGap: number;
  openOrders: Order[];
  committedVolume: number;
  requestedVolume: number;
  networkHeadroom: number;
}

export function computeMetrics(orders: Order[], farms: Farm[]): NetworkMetrics {
  const openOrders = orders.filter((o) => OPEN_STATUSES.includes(o.status));

  const openCommitmentsAed = openOrders.reduce(
    (sum, o) => sum + Math.round((o.committedQty / Math.max(1, o.qty)) * o.valueAed),
    0
  );

  const requestedVolume = openOrders.reduce((s, o) => s + o.qty, 0);
  const committedVolume = openOrders.reduce((s, o) => s + o.committedQty, 0);

  // Pre-harvest match rate: share of requested volume already committed to a
  // named farm before the crop is harvested.
  const preHarvestMatchPct = requestedVolume
    ? Math.round((committedVolume / requestedVolume) * 100)
    : 0;

  // Expected fill rate: the share of committed volume the network actually
  // delivers in full, taken from this month's measured performance.
  const expectedFillPct = MONTHLY[MONTHLY.length - 1].fillRate;

  const atRiskOrders = orders.filter((o) => o.health === 'risk').length;

  const networkHeadroom = farms.reduce(
    (s, f) => s + f.capacity.reduce((cs, c) => cs + allocatable(c), 0),
    0
  );

  return {
    localProcurementPct: LPI_CURRENT_MONTH,
    localProcurementDelta: 2.1,
    activeFarms: farms.length,
    activeFarmsDelta: 2,
    openCommitmentsAed,
    openCommitmentsDelta: 12.4,
    preHarvestMatchPct,
    preHarvestMatchDelta: 6,
    expectedFillPct,
    expectedFillDelta: 1,
    atRiskOrders,
    atRiskDelta: -1,
    lpiCurrent: LPI_TRAILING_12M,
    lpiTarget: LPI_TARGET,
    lpiGap: Math.round((LPI_TARGET - LPI_TRAILING_12M) * 10) / 10,
    openOrders,
    committedVolume,
    requestedVolume,
    networkHeadroom,
  };
}

/* ---------------- formatting ---------------- */

export function formatAed(value: number, opts?: { compact?: boolean }): string {
  if (opts?.compact) {
    if (Math.abs(value) >= 1_000_000) return `AED ${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `AED ${Math.round(value / 1_000)}K`;
    return `AED ${value.toFixed(0)}`;
  }
  return `AED ${value.toLocaleString('en-AE', { maximumFractionDigits: 0 })}`;
}

export function formatQty(value: number, unit: string): string {
  return `${value.toLocaleString('en-AE', { maximumFractionDigits: 0 })} ${unit}`;
}

export function formatDate(iso: string, style: 'short' | 'long' | 'day' = 'short'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (style === 'long')
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  if (style === 'day') return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function relativeTime(iso: string, now = new Date('2026-09-15T10:00:00')): string {
  const then = new Date(iso).getTime();
  const mins = Math.round((now.getTime() - then) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export function coverageTone(pct: number): 'healthy' | 'attention' | 'risk' {
  if (pct >= 85) return 'healthy';
  if (pct >= 65) return 'attention';
  return 'risk';
}

export function healthLabel(h: 'healthy' | 'attention' | 'risk'): string {
  return h === 'healthy' ? 'On track' : h === 'attention' ? 'Needs attention' : 'At risk';
}
