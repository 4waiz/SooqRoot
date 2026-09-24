
interface Payload {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

export function ChartTooltip({
  active,
  payload,
  label,
  suffix = '',
  prefix = '',
  formatter,
}: {
  active?: boolean;
  payload?: Payload[];
  label?: string | number;
  suffix?: string;
  prefix?: string;
  formatter?: (v: number | string, name?: string) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-charcoal-100 bg-white/95 px-3 py-2 shadow-lift backdrop-blur dark:border-charcoal-700 dark:bg-charcoal-900/95">
      {label !== undefined ? (
        <div className="mb-1 text-2xs font-bold uppercase tracking-wider text-charcoal-400">{label}</div>
      ) : null}
      <div className="space-y-0.5">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            <span className="text-charcoal-500 dark:text-charcoal-400">{p.name}</span>
            <span className="ms-auto font-bold tabular-nums text-charcoal-900 dark:text-white">
              {formatter && p.value !== undefined
                ? formatter(p.value, p.name)
                : `${prefix}${typeof p.value === 'number' ? p.value.toLocaleString() : p.value}${suffix}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
