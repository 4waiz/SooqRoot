import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettle } from './Motion';
import { useReadableColor } from '../../lib/theme';

/* ============================================================
   Metric tile, the Control Tower's core information unit.
   ============================================================ */

export interface MetricProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  delta?: number;
  deltaSuffix?: string;
  deltaGoodWhen?: 'up' | 'down';
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  accent?: string;
  to?: string;
  spark?: number[];
}

export function Metric({
  label,
  value,
  unit,
  delta,
  deltaSuffix = '',
  deltaGoodWhen = 'up',
  hint,
  icon,
  accent = '#2a714c',
  to,
  spark,
}: MetricProps) {
  const readable = useReadableColor();
  const hasDelta = typeof delta === 'number' && delta !== 0;
  const isUp = (delta ?? 0) > 0;
  const good = deltaGoodWhen === 'up' ? isUp : !isUp;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="sr-eyebrow leading-tight">{label}</span>
        {icon ? (
          <span
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: `${accent}1f`, color: readable(accent) }}
          >
            {icon}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="sr-num text-[1.75rem] leading-none">{value}</span>
        {unit ? (
          <span className="text-sm font-semibold text-charcoal-400 dark:text-charcoal-500">{unit}</span>
        ) : null}
      </div>

      <div className="mt-2 flex items-center gap-2">
        {hasDelta ? (
          <span
            className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-2xs font-bold ${
              good
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-900 dark:text-rose-200'
            }`}
          >
            {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(delta!)}
            {deltaSuffix}
          </span>
        ) : (
          <span className="inline-flex items-center gap-0.5 rounded-md bg-charcoal-100 px-1.5 py-0.5 text-2xs font-bold text-charcoal-500 dark:bg-charcoal-800 dark:text-charcoal-400">
            <Minus size={11} />
          </span>
        )}
        {hint ? (
          <span className="truncate text-2xs text-charcoal-400 dark:text-charcoal-500">{hint}</span>
        ) : null}
      </div>

      {spark && spark.length > 1 ? <Sparkline points={spark} color={accent} /> : null}
    </>
  );

  const cls =
    'sr-card sr-card-hover group relative overflow-hidden p-4 text-start w-full block';

  if (to) {
    return (
      <Link to={to} className={cls}>
        {body}
        <span
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 ease-spring group-hover:scale-x-100"
          style={{ background: accent }}
        />
      </Link>
    );
  }
  return <div className={cls}>{body}</div>;
}

export function Sparkline({
  points,
  color = '#2a714c',
  height = 28,
}: {
  points: number[];
  color?: string;
  height?: number;
}) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 100;
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => [i * step, height - ((p - min) / range) * (height - 4) - 2]);
  const d = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${d} L${w},${height} L0,${height} Z`;
  const gid = `sg-${color.replace('#', '')}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
      className="mt-3 h-7 w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ---------------- Radial gauge ---------------- */

export function Ring({
  value,
  size = 160,
  stroke = 14,
  label,
  sublabel,
  color = '#2a714c',
  trackColor,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: React.ReactNode;
  sublabel?: React.ReactNode;
  color?: string;
  trackColor?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = useSettle(Math.max(0, Math.min(100, value)), 80);
  const dash = (pct / 100) * c;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={trackColor ? '' : 'stroke-charcoal-100 dark:stroke-charcoal-800'}
          stroke={trackColor}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          style={{ transition: 'stroke-dasharray 900ms cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center"
        style={{ paddingInline: stroke + 6 }}
      >
        {label}
        {sublabel}
      </div>
    </div>
  );
}
