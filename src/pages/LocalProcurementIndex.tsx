import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Building2, Target, TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStore } from '../state/AppStore';
import { Badge, Card, CardHeader, PageHeader, Progress } from '../components/ui';
import { Ring } from '../components/ui/Metric';
import { ChartTooltip } from '../components/viz/ChartTooltip';
import { BUYER_LPI, CATEGORY_MIX, MONTHLY } from '../data/analytics';
import { getBuyer } from '../data/buyers';
import { formatAed } from '../lib/metrics';

export function LocalProcurementIndex() {
  const { metrics } = useStore();

  const trend = MONTHLY.map((m) => ({
    month: m.month,
    local: m.localPct,
    target: m.targetPct,
  }));

  const spendSplit = MONTHLY.slice(-6).map((m) => ({
    month: m.month,
    local: Math.round(m.localAed / 1000),
    imported: Math.round(m.importedAed / 1000),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Intelligence"
        title="Local Procurement Index"
        subtitle="The single number that tells a commercial buyer how much of their food spend genuinely comes from UAE farms — measured, not estimated."
        actions={
          <Badge tone="brand" icon={<Activity size={12} />}>
            Trailing 12 months
          </Badge>
        }
      />

      {/* ---------------- Headline ---------------- */}
      <section className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
        <Card className="flex flex-col items-center justify-center py-8">
          <Ring
            value={(metrics.lpiCurrent / metrics.lpiTarget) * 100}
            target={100}
            size={200}
            stroke={18}
            color="#2a714c"
            label={<span className="sr-num text-[2.5rem] leading-none">{metrics.lpiCurrent}%</span>}
            sublabel={
              <span className="mt-1.5 text-2xs font-semibold uppercase leading-tight tracking-wider text-charcoal-400">
                Local
                <br />
                Procurement Index
              </span>
            }
          />
          <div className="mt-6 grid w-full grid-cols-3 gap-2 px-2 text-center">
            <div className="sr-inset px-2 py-3">
              <div className="text-2xs uppercase tracking-wider text-charcoal-400">Current</div>
              <div className="sr-num mt-1 text-lg">{metrics.lpiCurrent}%</div>
            </div>
            <div className="sr-inset px-2 py-3">
              <div className="text-2xs uppercase tracking-wider text-charcoal-400">Target</div>
              <div className="sr-num mt-1 text-lg">{metrics.lpiTarget}%</div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-2 py-3 dark:border-amber-900 dark:bg-amber-900/30">
              <div className="text-2xs uppercase tracking-wider text-amber-600 dark:text-amber-300">Gap</div>
              <div className="sr-num mt-1 text-lg text-amber-700 dark:text-amber-200">
                {metrics.lpiGap}pp
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-xs px-4 text-center text-2xs leading-relaxed text-charcoal-400">
            The current month is running at{' '}
            <span className="font-bold text-brand-600">{metrics.localProcurementPct}%</span> — above
            target. Holding that rate closes the trailing gap in roughly two quarters.
          </p>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Index over 12 months"
              subtitle="Local share of total food spend against the 25% target"
              icon={<TrendingUp size={16} />}
            />
            <div className="mt-4 h-[210px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lpi-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2a714c" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="#2a714c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} domain={[10, 30]} width={40} />
                  <Tooltip content={<ChartTooltip suffix="%" />} />
                  <Area
                    type="monotone"
                    dataKey="local"
                    name="Local share"
                    stroke="#2a714c"
                    strokeWidth={2.4}
                    fill="url(#lpi-fill)"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Target"
                    stroke="#b07f3e"
                    strokeWidth={1.5}
                    strokeDasharray="5 4"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Spend shift: local vs imported"
              subtitle="AED thousands per month"
              icon={<Building2 size={16} />}
            />
            <div className="mt-4 h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendSplit} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={44} />
                  <Tooltip content={<ChartTooltip prefix="AED " suffix="K" />} cursor={{ fill: 'rgba(60,140,97,0.05)' }} />
                  <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                  <Bar dataKey="local" name="Local" stackId="s" fill="#2a714c" radius={[0, 0, 0, 0]} maxBarSize={34} />
                  <Bar dataKey="imported" name="Imported" stackId="s" fill="#d9dcdd" radius={[5, 5, 0, 0]} maxBarSize={34} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </section>

      {/* ---------------- Buyer breakdown ---------------- */}
      <section className="grid gap-4 xl:grid-cols-2">
        <Card padded={false}>
          <div className="p-5 pb-0">
            <CardHeader
              title="Index by buyer"
              subtitle="Each account against its own local sourcing commitment"
              icon={<Target size={16} />}
            />
          </div>
          <div className="mt-4 space-y-3 px-5 pb-5">
            {BUYER_LPI.map((b) => {
              const buyer = getBuyer(b.buyerId);
              const onTarget = b.localPct >= b.targetPct;
              return (
                <div key={b.buyerId} className="rounded-xl border border-charcoal-100 p-3.5 dark:border-charcoal-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-charcoal-900 dark:text-white">
                        {buyer?.name}
                      </div>
                      <div className="mt-0.5 text-2xs text-charcoal-400">
                        {buyer?.segment} · {formatAed(b.spendAed, { compact: true })}/month
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="sr-num text-lg">{b.localPct}%</span>
                      <Badge tone={onTarget ? 'emerald' : 'amber'}>
                        {onTarget ? 'On target' : `${(b.targetPct - b.localPct).toFixed(1)}pp short`}
                      </Badge>
                    </div>
                  </div>
                  <div className="relative mt-3">
                    <Progress value={(b.localPct / 50) * 100} tone={onTarget ? 'healthy' : 'attention'} height="h-2" />
                    <span
                      className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full bg-charcoal-800 dark:bg-white"
                      style={{ left: `${(b.targetPct / 50) * 100}%` }}
                      title={`Target ${b.targetPct}%`}
                    />
                  </div>
                  <div className="mt-1.5 text-2xs text-charcoal-400">
                    Target {b.targetPct}% · marker shows the buyer&rsquo;s own commitment
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Local share by category"
            subtitle="Where local supply is strong — and where the gap sits"
            icon={<Activity size={16} />}
          />
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={CATEGORY_MIX}
                layout="vertical"
                margin={{ top: 4, right: 30, left: 16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} unit="%" />
                <YAxis
                  type="category"
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  width={92}
                />
                <Tooltip content={<ChartTooltip suffix="%" />} cursor={{ fill: 'rgba(60,140,97,0.05)' }} />
                <Bar dataKey="localPct" name="Local share" radius={[0, 5, 5, 0]} maxBarSize={22}>
                  {CATEGORY_MIX.map((c) => (
                    <Cell key={c.category} fill={c.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 rounded-xl bg-canvas-soft p-3.5 dark:bg-charcoal-950">
            <p className="text-2xs leading-relaxed text-charcoal-500 dark:text-charcoal-400">
              Dates and honey are already majority-local. Fish and vegetables carry the largest
              addressable gap — and the largest volume — so they drive most of the index movement.
            </p>
            <Link to="/analytics" className="sr-btn-secondary mt-3 !py-1.5 text-2xs">
              Open analytics <ArrowRight size={12} />
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
