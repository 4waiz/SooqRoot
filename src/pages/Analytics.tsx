import React, { useMemo, useState } from 'react';
import { BarChart3, Gauge, Sprout, TrendingUp, Wallet } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStore } from '../state/AppStore';
import { Card, CardHeader, PageHeader, Progress, Segmented } from '../components/ui';
import { ChartTooltip } from '../components/viz/ChartTooltip';
import { CATEGORY_MIX, MONTHLY } from '../data/analytics';
import { getProduct } from '../data/products';
import { farmPhoto } from '../data/media';
import { Avatar } from '../components/ui/Photo';
import { useChartColors } from '../lib/theme';
import { buyerName } from '../data/buyers';
import { formatAed } from '../lib/metrics';

export function Analytics() {
  const { orders, farms, metrics } = useStore();
  const chart = useChartColors();
  const [range, setRange] = useState<'6' | '12'>('12');

  const data = useMemo(() => (range === '6' ? MONTHLY.slice(-6) : MONTHLY), [range]);

  const productMix = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders) map[o.productId] = (map[o.productId] ?? 0) + o.valueAed;
    return Object.entries(map)
      .map(([id, value]) => ({ name: getProduct(id).name, value, color: getProduct(id).color }))
      .sort((a, b) => b.value - a.value);
  }, [orders]);

  const buyerMix = useMemo(() => {
    const map: Record<string, { value: number; volume: number }> = {};
    for (const o of orders) {
      const e = (map[o.buyerId] ??= { value: 0, volume: 0 });
      e.value += o.valueAed;
      e.volume += o.qty;
    }
    return Object.entries(map)
      .map(([id, v]) => ({ name: buyerName(id).split(' ').slice(0, 2).join(' '), ...v }))
      .sort((a, b) => b.value - a.value);
  }, [orders]);

  const farmPerformance = useMemo(
    () =>
      [...farms]
        .sort((a, b) => b.fulfilmentRate - a.fulfilmentRate)
        .map((f) => ({
          id: f.id,
          name: f.code,
          fullName: f.name,
          fulfilment: f.fulfilmentRate,
          quality: f.qualityScore,
          reliability: f.reliability,
        })),
    [farms]
  );

  const totalValue = orders.reduce((s, o) => s + o.valueAed, 0);
  const totalVolume = orders.reduce((s, o) => s + o.qty, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Intelligence"
        title="Analytics"
        subtitle="Network performance across demand, commitment, fulfilment and producer quality."
        actions={
          <Segmented
            value={range}
            onChange={setRange}
            options={[
              { value: '6', label: '6 months' },
              { value: '12', label: '12 months' },
            ]}
          />
        }
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Order book value" value={formatAed(totalValue, { compact: true })} icon={<Wallet size={15} />} />
        <Tile label="Volume under management" value={`${(totalVolume / 1000).toFixed(1)}t`} icon={<BarChart3 size={15} />} />
        <Tile label="Commitments this month" value={MONTHLY[MONTHLY.length - 1].commitments.toString()} icon={<Sprout size={15} />} />
        <Tile label="Fill rate" value={`${metrics.expectedFillPct}%`} icon={<Gauge size={15} />} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Commitments and fill rate"
            subtitle="Volume commitments issued against delivery performance"
            icon={<TrendingUp size={16} />}
          />
          <div className="mt-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="an-commit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chart.brand} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={chart.brand} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis yAxisId="l" tickLine={false} axisLine={false} width={38} />
                <YAxis yAxisId="r" orientation="right" domain={[80, 100]} tickLine={false} axisLine={false} width={34} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                <Area
                  yAxisId="l"
                  type="monotone"
                  dataKey="commitments"
                  name="Commitments"
                  stroke={chart.brand}
                  strokeWidth={2.2}
                  fill="url(#an-commit)"
                />
                <Line
                  yAxisId="r"
                  type="monotone"
                  dataKey="fillRate"
                  name="Fill rate %"
                  stroke={chart.brandDeep}
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Farmgate income"
            subtitle="Value flowing to UAE producers each month"
            icon={<Wallet size={16} />}
          />
          <div className="mt-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tickFormatter={(v) => `${Math.round(v / 1000)}K`}
                />
                <Tooltip
                  content={<ChartTooltip formatter={(v) => formatAed(Number(v), { compact: true })} />}
                  cursor={{ fill: chart.cursor }}
                />
                <Bar dataKey="farmIncomeAed" name="Farmgate income" fill={chart.brand} radius={[4, 4, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader title="Order value by crop" subtitle="Current order book" />
          <div className="mt-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productMix}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={2}
                  stroke="none"
                >
                  {productMix.map((p) => (
                    <Cell key={p.name} fill={p.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip formatter={(v) => formatAed(Number(v), { compact: true })} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {productMix.slice(0, 5).map((p) => (
              <div key={p.name} className="flex items-center gap-2 text-2xs">
                <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                <span className="flex-1 truncate text-charcoal-600 dark:text-charcoal-300">{p.name}</span>
                <span className="font-bold tabular-nums">{formatAed(p.value, { compact: true })}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Order value by buyer" subtitle="Concentration across accounts" />
          <div className="mt-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buyerMix} layout="vertical" margin={{ top: 4, right: 20, left: 6, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${Math.round(v / 1000)}K`}
                />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={86} />
                <Tooltip
                  content={<ChartTooltip formatter={(v) => formatAed(Number(v), { compact: true })} />}
                  cursor={{ fill: 'rgba(60,140,97,0.05)' }}
                />
                <Bar dataKey="value" name="Order value" fill={chart.brand} radius={[0, 5, 5, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 rounded-lg bg-canvas-soft p-3 text-2xs leading-relaxed text-charcoal-500 dark:bg-charcoal-950 dark:text-charcoal-400">
            No single buyer exceeds 35% of the order book, the same concentration discipline the
            commitment engine applies on the supply side.
          </p>
        </Card>

        <Card>
          <CardHeader title="Category local share" subtitle="Where local supply is strongest" />
          <div className="mt-4 space-y-3">
            {CATEGORY_MIX.map((c) => (
              <div key={c.category}>
                <div className="mb-1.5 flex items-center justify-between text-2xs">
                  <span className="font-semibold text-charcoal-700 dark:text-charcoal-200">{c.category}</span>
                  <span className="font-bold tabular-nums">{c.localPct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-charcoal-100 dark:bg-charcoal-800">
                  <div
                    className="h-full rounded-full transition-[width] duration-700"
                    style={{ width: `${c.localPct}%`, background: c.color }}
                  />
                </div>
                <div className="mt-1 text-2xs text-charcoal-400">
                  {c.volumeKg.toLocaleString()} kg annual volume
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <CardHeader
            title="Producer performance"
            subtitle="Fulfilment, quality and reliability across the farm network"
            icon={<Sprout size={16} />}
          />
        </div>
        <div className="mt-4 h-[280px] px-5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={farmPerformance} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis domain={[60, 100]} tickLine={false} axisLine={false} width={38} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(60,140,97,0.05)' }} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
              <Bar dataKey="fulfilment" name="Fulfilment" fill={chart.brandDeep} radius={[3, 3, 0, 0]} maxBarSize={14} />
              <Bar dataKey="quality" name="Quality" fill={chart.brand} radius={[3, 3, 0, 0]} maxBarSize={14} />
              <Bar dataKey="reliability" name="Reliability" fill={chart.soft} radius={[3, 3, 0, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="p-5 pt-3">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {farmPerformance.slice(0, 4).map((f) => (
              <div key={f.name} className="rounded-xl border border-charcoal-100 p-3 dark:border-charcoal-800">
                <div className="flex items-center gap-2">
                  <Avatar src={farmPhoto(f.id, 48, 48)} alt={f.fullName} size={22} />
                  <span className="min-w-0 flex-1 truncate text-2xs font-bold text-charcoal-700 dark:text-charcoal-200">
                    {f.fullName}
                  </span>
                  <span className="font-mono text-2xs text-charcoal-400">{f.name}</span>
                </div>
                <Progress value={f.fulfilment} tone="healthy" height="h-1.5" className="mt-2" />
                <div className="mt-1.5 text-2xs text-charcoal-400">{f.fulfilment}% fulfilment</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function Tile({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <span className="sr-eyebrow">{label}</span>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900 dark:text-brand-200">
          {icon}
        </span>
      </div>
      <div className="sr-num mt-3 text-2xl leading-none">{value}</div>
    </Card>
  );
}
