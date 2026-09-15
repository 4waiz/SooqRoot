import { useMemo, useState } from 'react';
import { Buyer, Farm } from '../../types';
import { HEALTH_HEX } from '../ui';

/* ============================================================
   Schematic UAE supply-network canvas.

   Not a GIS map — a designed abstraction of the Abu Dhabi /
   Al Ain growing belt with farm nodes, buyer nodes and the
   commitment flows between them.
   ============================================================ */

export interface NetworkLink {
  farmId: string;
  buyerId: string;
  qty: number;
  health: 'healthy' | 'attention' | 'risk';
}

interface Props {
  farms: Farm[];
  buyers: Buyer[];
  links: NetworkLink[];
  height?: number;
  selectedFarmId?: string | null;
  onSelectFarm?: (id: string | null) => void;
  compact?: boolean;
}

/** Horizontal scale so the canvas reads as a wide landscape rather than a square. */
const SX = 1.55;
const px = (x: number) => x * SX;

export function NetworkMap({
  farms,
  buyers,
  links,
  height = 420,
  selectedFarmId,
  onSelectFarm,
  compact,
}: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const active = hover ?? selectedFarmId ?? null;

  const farmPos = useMemo(
    () => Object.fromEntries(farms.map((f) => [f.id, { x: f.x, y: f.y }])),
    [farms]
  );
  const buyerPos = useMemo(
    () => Object.fromEntries(buyers.map((b) => [b.id, { x: b.x, y: b.y }])),
    [buyers]
  );

  const maxQty = Math.max(1, ...links.map((l) => l.qty));

  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ height }}>
      <svg
        viewBox="0 0 155 78"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="nm-land" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f5ecd9" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#f1f8f3" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="nm-sea" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#bcd8e4" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#bcd8e4" stopOpacity="0.05" />
          </linearGradient>
          <pattern id="nm-rows" width="2.2" height="2.2" patternTransform="rotate(28)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="2.2" stroke="#2a714c" strokeWidth="0.12" opacity="0.13" />
          </pattern>
        </defs>

        {/* Landmass abstraction: coast on the left, inland desert to the right */}
        <path
          d="M0,0 L155,0 L155,78 L0,78 Z"
          fill="url(#nm-land)"
          className="dark:opacity-20"
        />
        <path d="M0,0 L155,0 L155,78 L0,78 Z" fill="url(#nm-rows)" />
        <path
          d="M0,26 C9,32 6,44 15,50 C23,55 18,64 12,70 L0,74 Z"
          fill="url(#nm-sea)"
        />

        {/* Growing-belt band */}
        <path
          d="M53,58 C74,66 102,64 143,52 L149,62 C108,76 71,78 46,68 Z"
          fill="#3c8c61"
          opacity="0.05"
        />

        {/* Region labels */}
        <g className="fill-charcoal-400 dark:fill-charcoal-500" fontSize="2.1" fontWeight="600">
          <text x="5" y="20" opacity="0.75">ARABIAN GULF</text>
          <text x="34" y="64" opacity="0.75">ABU DHABI</text>
          <text x="118" y="72" opacity="0.75">AL AIN REGION</text>
          <text x="47" y="12" opacity="0.75">DUBAI</text>
        </g>

        {/* Commitment flows */}
        <g>
          {links.map((l, i) => {
            const f = farmPos[l.farmId];
            const b = buyerPos[l.buyerId];
            if (!f || !b) return null;
            const dim = active !== null && active !== l.farmId;
            const fx = px(f.x);
            const bx = px(b.x);
            const mx = (fx + bx) / 2;
            const my = (f.y + b.y) / 2 - Math.abs(fx - bx) * 0.14 - 3;
            const w = 0.18 + (l.qty / maxQty) * 0.75;
            return (
              <path
                key={`${l.farmId}-${l.buyerId}-${i}`}
                d={`M${fx},${f.y} Q${mx},${my} ${bx},${b.y}`}
                fill="none"
                stroke={HEALTH_HEX[l.health]}
                strokeWidth={w}
                strokeLinecap="round"
                opacity={dim ? 0.08 : active === l.farmId ? 0.95 : 0.4}
                strokeDasharray="1.6 1.2"
                className={active === l.farmId ? 'animate-dash' : ''}
                style={{ transition: 'opacity 250ms' }}
              />
            );
          })}
        </g>

        {/* Buyer nodes */}
        <g>
          {buyers.map((b) => (
            <g key={b.id}>
              <rect
                x={px(b.x) - 1.9}
                y={b.y - 1.9}
                width="3.8"
                height="3.8"
                rx="1.1"
                className="fill-charcoal-800 dark:fill-white"
                opacity={active ? 0.55 : 0.9}
              />
              <rect
                x={px(b.x) - 1.9}
                y={b.y - 1.9}
                width="3.8"
                height="3.8"
                rx="1.1"
                fill="none"
                className="stroke-white dark:stroke-charcoal-900"
                strokeWidth="0.35"
              />
              {!compact ? (
                <text
                  x={px(b.x)}
                  y={b.y + 5.2}
                  textAnchor="middle"
                  fontSize="1.85"
                  fontWeight="600"
                  className="fill-charcoal-500 dark:fill-charcoal-400"
                >
                  {b.name.split(' ')[0]}
                </text>
              ) : null}
            </g>
          ))}
        </g>

        {/* Farm nodes */}
        <g>
          {farms.map((f) => {
            const isActive = active === f.id;
            const dim = active !== null && !isActive;
            return (
              <g
                key={f.id}
                onMouseEnter={() => setHover(f.id)}
                onClick={() => onSelectFarm?.(selectedFarmId === f.id ? null : f.id)}
                className={onSelectFarm ? 'cursor-pointer' : ''}
                opacity={dim ? 0.35 : 1}
                style={{ transition: 'opacity 250ms' }}
              >
                <circle cx={px(f.x)} cy={f.y} r={isActive ? 4.4 : 3.2} fill={HEALTH_HEX[f.status]} opacity="0.16" />
                <circle
                  cx={px(f.x)}
                  cy={f.y}
                  r={isActive ? 2 : 1.55}
                  fill={HEALTH_HEX[f.status]}
                  stroke="#ffffff"
                  strokeWidth="0.4"
                  style={{ transition: 'r 200ms' }}
                />
                {!compact ? (
                  <text
                    x={px(f.x)}
                    y={f.y - 4.4}
                    textAnchor="middle"
                    fontSize="1.85"
                    fontWeight={isActive ? 700 : 500}
                    className="fill-charcoal-600 dark:fill-charcoal-300"
                  >
                    {f.code}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Hover card */}
      {active ? (
        <FarmTip farm={farms.find((f) => f.id === active)!} links={links.filter((l) => l.farmId === active)} buyers={buyers} />
      ) : null}
    </div>
  );
}

function FarmTip({
  farm,
  links,
  buyers,
}: {
  farm: Farm;
  links: NetworkLink[];
  buyers: Buyer[];
}) {
  const total = links.reduce((s, l) => s + l.qty, 0);
  return (
    <div className="pointer-events-none absolute bottom-3 start-3 max-w-[260px] rounded-xl border border-charcoal-100 bg-white/95 p-3 shadow-lift backdrop-blur dark:border-charcoal-700 dark:bg-charcoal-900/95">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: HEALTH_HEX[farm.status] }} />
        <span className="text-sm font-semibold text-charcoal-900 dark:text-white">{farm.name}</span>
      </div>
      <div className="mt-0.5 text-2xs text-charcoal-500">
        {farm.area} · {farm.distanceKm} km · {farm.growingMethod}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 border-t border-charcoal-100 pt-2 dark:border-charcoal-800">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-charcoal-400">Committed</div>
          <div className="text-xs font-bold text-charcoal-800 dark:text-charcoal-100">
            {total.toLocaleString()} kg
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-charcoal-400">Buyers</div>
          <div className="text-xs font-bold text-charcoal-800 dark:text-charcoal-100">
            {new Set(links.map((l) => l.buyerId)).size} of {buyers.length}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NetworkLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-2xs text-charcoal-500 dark:text-charcoal-400">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ background: HEALTH_HEX.healthy }} /> Farm — on track
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ background: HEALTH_HEX.attention }} /> Farm — attention
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ background: HEALTH_HEX.risk }} /> Farm — at risk
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-[3px] bg-charcoal-800 dark:bg-white" /> Buyer delivery point
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-px w-5 border-t border-dashed border-charcoal-400" /> Commitment flow
      </span>
    </div>
  );
}
