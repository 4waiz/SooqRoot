import { useId } from 'react';
import { CountUp, useSettle } from './Motion';
import { useChartColors } from '../../lib/theme';

/* ============================================================
   TargetGauge. A semicircle that shows a value against a
   target honestly: the arc is drawn on a real 0 → max scale,
   the shortfall to target is shaded amber, and a second marker
   can show a leading indicator (e.g. this month's run-rate).
   ============================================================ */

interface Props {
  value: number;
  target: number;
  /** Top of the scale. */
  max?: number;
  /** Optional leading indicator, e.g. the current month. */
  marker?: { value: number; label: string };
  label?: string;
  size?: number;
}

export function TargetGauge({ value, target, max = 40, marker, label = 'local share', size = 280 }: Props) {
  const uid = useId().replace(/:/g, '');
  const chart = useChartColors();

  const stroke = size * 0.07;
  const r = size / 2 - stroke;
  const cx = size / 2;
  const cy = size / 2;
  const height = size / 2 + stroke + 26;

  const pct = (v: number) => Math.max(0, Math.min(100, (v / max) * 100));
  const shown = useSettle(pct(value), 120);
  const gapStart = pct(value);
  const gapLen = Math.max(0, pct(target) - pct(value));
  const shownGap = useSettle(gapLen, 700);

  const point = (v: number, radius = r) => {
    const theta = Math.PI * (1 - pct(v) / 100);
    return { x: cx + radius * Math.cos(theta), y: cy - radius * Math.sin(theta) };
  };

  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const tIn = point(target, r - stroke * 0.95);
  const tOut = point(target, r + stroke * 0.95);
  const tLabel = point(target, r + stroke * 1.9);
  const m = marker ? point(marker.value) : null;
  const mLabel = marker ? point(marker.value, r - stroke * 1.9) : null;

  return (
    <div className="relative w-full" style={{ maxWidth: size }}>
      <svg
        viewBox={`0 0 ${size} ${height}`}
        className="h-auto w-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`${label}: ${value}% against a ${target}% target`}
      >
        <defs>
          <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={chart.brandDeep} />
            <stop offset="100%" stopColor={chart.brand} />
          </linearGradient>
          <pattern id={`${uid}-hatch`} width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="#c99c57" opacity="0.35" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#c99c57" strokeWidth="3" />
          </pattern>
        </defs>

        {/* track */}
        <path d={arcPath} fill="none" stroke={chart.grid} strokeWidth={stroke} strokeLinecap="round" />

        {/* shortfall to target */}
        <path
          d={arcPath}
          fill="none"
          stroke={`url(#${uid}-hatch)`}
          strokeWidth={stroke}
          pathLength={100}
          strokeDasharray={`0 ${gapStart} ${shownGap} 100`}
          style={{ transition: 'stroke-dasharray 900ms cubic-bezier(0.16,1,0.3,1)' }}
        />

        {/* value */}
        <path
          d={arcPath}
          fill="none"
          stroke={`url(#${uid}-fill)`}
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${shown} 100`}
          style={{ transition: 'stroke-dasharray 1200ms cubic-bezier(0.16,1,0.3,1)' }}
        />

        {/* target tick + label */}
        <line
          x1={tIn.x}
          y1={tIn.y}
          x2={tOut.x}
          y2={tOut.y}
          className="stroke-charcoal-800 dark:stroke-charcoal-100"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <text
          x={tLabel.x}
          y={tLabel.y}
          textAnchor={tLabel.x > cx + 4 ? 'start' : tLabel.x < cx - 4 ? 'end' : 'middle'}
          dominantBaseline="middle"
          className="fill-charcoal-600 dark:fill-charcoal-300"
          fontSize={11}
          fontWeight={700}
        >
          Target {target}%
        </text>

        {/* leading indicator */}
        {m && mLabel && marker ? (
          <g>
            <circle cx={m.x} cy={m.y} r={stroke * 0.42} fill="#ffffff" className="dark:fill-charcoal-900" />
            <circle cx={m.x} cy={m.y} r={stroke * 0.42} fill="none" stroke={chart.brand} strokeWidth={2.5} />
            <text
              x={mLabel.x}
              y={mLabel.y}
              textAnchor="end"
              dominantBaseline="middle"
              fill={chart.brand}
              fontSize={10}
              fontWeight={700}
            >
              {marker.label}
            </text>
          </g>
        ) : null}

        {/* scale ends */}
        <text x={cx - r} y={cy + stroke + 12} textAnchor="middle" className="fill-charcoal-400" fontSize={10} fontWeight={600}>
          0%
        </text>
        <text x={cx + r} y={cy + stroke + 12} textAnchor="middle" className="fill-charcoal-400" fontSize={10} fontWeight={600}>
          {max}%
        </text>
      </svg>

      <div
        className="pointer-events-none absolute inset-x-0 flex flex-col items-center text-center"
        style={{ top: `${(1 - (height - size * 0.34) / height) * 0}%`, bottom: `${(26 / height) * 100}%` }}
      >
        <span className="sr-num text-[clamp(1.6rem,7vw,2.35rem)] leading-none">
          <CountUp value={value} decimals={1} suffix="%" />
        </span>
        <span className="mt-1 px-2 text-2xs font-semibold uppercase tracking-widest text-charcoal-400">
          {label}
        </span>
      </div>
    </div>
  );
}
