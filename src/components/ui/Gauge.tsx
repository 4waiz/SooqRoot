import { useId } from 'react';
import { useCountUp, useSettle } from './Motion';
import { useChartColors } from '../../lib/theme';

/* ============================================================
   TargetGauge. A semicircle that shows a value against a
   target honestly: the arc is drawn on a real 0 to max scale,
   the shortfall to target is shaded amber, and a second marker
   can show a leading indicator (e.g. this month's run-rate).

   Every label is drawn inside the SVG so it scales with the
   gauge and sits on geometry rather than on guessed offsets.
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

export function TargetGauge({ value, target, max = 40, marker, label = 'Local share', size = 280 }: Props) {
  const uid = useId().replace(/:/g, '');
  const chart = useChartColors();

  /* ---- geometry -------------------------------------------------
     The viewBox carries explicit padding: padTop for the target
     callout that sits outside the arc, padX for the scale ends,
     and a bottom band for the 0 / max labels. ------------------- */
  const stroke = size * 0.075;
  const padTop = size * 0.11;
  const padX = size * 0.06;
  const r = (size - padX * 2) / 2 - stroke / 2;
  const cx = size / 2;
  const cy = padTop + r + stroke / 2;
  const height = cy + stroke / 2 + size * 0.095;

  const pct = (v: number) => Math.max(0, Math.min(100, (v / max) * 100));
  const shown = useSettle(pct(value), 120);
  const gapStart = pct(value);
  const gapLen = Math.max(0, pct(target) - pct(value));
  const shownGap = useSettle(gapLen, 700);
  const counted = useCountUp(value);

  const point = (v: number, radius = r) => {
    const theta = Math.PI * (1 - pct(v) / 100);
    return { x: cx + radius * Math.cos(theta), y: cy - radius * Math.sin(theta) };
  };

  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const tIn = point(target, r - stroke * 0.56);
  const tOut = point(target, r + stroke * 0.56);
  const tLabel = point(target, r + stroke * 1.15);
  const m = marker ? point(marker.value) : null;

  /* Text baselines inside the open area under the apex. */
  const valueY = cy - r * 0.5;
  const capY = cy - size * 0.1;
  const markY = cy - size * 0.036;
  const capSize = size * (label.length > 16 ? 0.035 : 0.042);

  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: size }}>
      <svg
        viewBox={`0 0 ${size} ${height}`}
        className="h-auto w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`${label}: ${value}% against a ${target}% target${
          marker ? `, ${marker.label}` : ''
        }`}
      >
        <defs>
          <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={chart.brandDeep} />
            <stop offset="100%" stopColor={chart.brand} />
          </linearGradient>
          <pattern
            id={`${uid}-hatch`}
            width="6"
            height="6"
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="6" height="6" fill="#c99c57" opacity="0.32" />
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

        {/* target tick + callout */}
        <line
          x1={tIn.x}
          y1={tIn.y}
          x2={tOut.x}
          y2={tOut.y}
          stroke={chart.surface}
          strokeWidth={3}
          strokeLinecap="butt"
        />
        <text
          x={tLabel.x}
          y={tLabel.y}
          textAnchor={tLabel.x > cx + 4 ? 'start' : tLabel.x < cx - 4 ? 'end' : 'middle'}
          dominantBaseline="middle"
          className="fill-charcoal-500 dark:fill-charcoal-300"
          fontSize={size * 0.042}
          fontWeight={700}
        >
          Target {target}%
        </text>

        {/* leading indicator: dot on the arc, caption below the value */}
        {m ? (
          <>
            <circle cx={m.x} cy={m.y} r={stroke * 0.44} fill={chart.surface} />
            <circle cx={m.x} cy={m.y} r={stroke * 0.24} fill={chart.brand} />
          </>
        ) : null}

        {/* value */}
        <text
          x={cx}
          y={valueY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-charcoal-900 dark:fill-white"
          fontSize={size * 0.145}
          fontWeight={800}
          letterSpacing="-0.02em"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {counted.toFixed(1)}%
        </text>

        {/* caption */}
        <text
          x={cx}
          y={capY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-charcoal-400"
          fontSize={capSize}
          fontWeight={600}
          letterSpacing="0.09em"
        >
          {label.toUpperCase()}
        </text>

        {marker ? (
          <text
            x={cx}
            y={markY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={chart.brand}
            fontSize={size * 0.04}
            fontWeight={700}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {marker.label}
          </text>
        ) : null}

        {/* scale ends */}
        <text
          x={cx - r}
          y={cy + stroke / 2 + size * 0.05}
          textAnchor="middle"
          className="fill-charcoal-400"
          fontSize={size * 0.038}
          fontWeight={600}
        >
          0%
        </text>
        <text
          x={cx + r}
          y={cy + stroke / 2 + size * 0.05}
          textAnchor="middle"
          className="fill-charcoal-400"
          fontSize={size * 0.038}
          fontWeight={600}
        >
          {max}%
        </text>
      </svg>
    </div>
  );
}
