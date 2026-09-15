import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  CalendarClock,
  Cpu,
  Gauge,
  Leaf,
  PackageCheck,
  Sprout,
  Target,
  TrendingUp,
  TriangleAlert,
  Truck,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStore } from '../state/AppStore';
import { Badge, Card, CardHeader, HEALTH_HEX, HEALTH_TONE, HealthDot, Progress } from '../components/ui';
import { Metric, Ring } from '../components/ui/Metric';
import { NetworkLegend, NetworkMap } from '../components/viz/NetworkMap';
import { getProduct } from '../data/products';
import { farmName } from '../data/farms';
import { MONTHLY } from '../data/analytics';
import { FULFILMENT_JOBS, HARVEST_EVENTS } from '../data/operations';
import { formatAed, formatDate, formatQty, relativeTime } from '../lib/metrics';
import { ChartTooltip } from '../components/viz/ChartTooltip';

const KIND_ICON = {
  commitment: Cpu,
  harvest: Sprout,
  delivery: Truck,
  demand: PackageCheck,
  exception: TriangleAlert,
  farm: Leaf,
  proof: Activity,
} as const;

export function ControlTower() {
  const { metrics, orders, farms, buyers, exceptions, activity, session } = useStore();

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = session?.displayName.split(' ')[0] ?? 'there';

  /* Upcoming demand — the next orders needing attention, soonest first */
  const upcoming = useMemo(
    () =>
      orders
        .filter((o) => ['Committed', 'Demand received', 'At risk'].includes(o.status))
        .sort((a, b) => a.requiredBy.localeCompare(b.requiredBy))
        .slice(0, 3),
    [orders]
  );

  const links = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'Delivered')
        .flatMap((o) =>
          o.allocations
            .filter((a) => a.role === 'primary')
            .map((a) => ({ farmId: a.farmId, buyerId: o.buyerId, qty: a.qty, health: o.health }))
        ),
    [orders]
  );

  const openExceptions = exceptions.filter((e) => e.status !== 'resolved');

  const trend = MONTHLY.slice(-8).map((m) => ({
    month: m.month,
    local: m.localPct,
    target: m.targetPct,
    fill: m.fillRate,
  }));

  const sparkLocal = MONTHLY.slice(-8).map((m) => m.localPct);
  const sparkFill = MONTHLY.slice(-8).map((m) => m.fillRate);
  const sparkCommit = MONTHLY.slice(-8).map((m) => m.commitments);

  const nextHarvests = HARVEST_EVENTS.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* ---------------- Greeting ---------------- */}
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="sr-h1">
            {greeting}, {firstName}
          </h1>
          <p className="sr-sub mt-1.5">Here&rsquo;s your local sourcing network today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral" icon={<CalendarClock size={12} />}>
            Cycle CY-2610 · October 2026
          </Badge>
          <Link to="/engine" className="sr-btn-primary" >
            <Cpu size={15} />
            Run Commitment Engine
          </Link>
        </div>
      </header>

      {/* ---------------- Metric row ---------------- */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Metric
          label="Local Procurement"
          value={metrics.localProcurementPct.toFixed(1)}
          unit="%"
          delta={metrics.localProcurementDelta}
          deltaSuffix="pp"
          hint="vs last month"
          icon={<Leaf size={15} />}
          accent="#2a714c"
          spark={sparkLocal}
          to="/index"
        />
        <Metric
          label="Active UAE Farms"
          value={metrics.activeFarms}
          delta={metrics.activeFarmsDelta}
          hint="new this quarter"
          icon={<Sprout size={15} />}
          accent="#5ca87e"
          to="/farms"
        />
        <Metric
          label="Open Commitments"
          value={formatAed(metrics.openCommitmentsAed, { compact: true })}
          delta={metrics.openCommitmentsDelta}
          deltaSuffix="%"
          hint="pre-harvest, this cycle"
          icon={<Wallet size={15} />}
          accent="#b07f3e"
          spark={sparkCommit}
          to="/orders"
        />
        <Metric
          label="Pre-Harvest Match Rate"
          value={metrics.preHarvestMatchPct}
          unit="%"
          delta={metrics.preHarvestMatchDelta}
          deltaSuffix="pp"
          hint={`${formatQty(metrics.committedVolume, 'kg')} committed`}
          icon={<Target size={15} />}
          accent="#3c8c61"
          to="/engine"
        />
        <Metric
          label="Expected Fill Rate"
          value={metrics.expectedFillPct}
          unit="%"
          delta={metrics.expectedFillDelta}
          deltaSuffix="pp"
          hint="measured this month"
          icon={<Gauge size={15} />}
          accent="#2f6f8a"
          spark={sparkFill}
          to="/analytics"
        />
        <Metric
          label="At-Risk Orders"
          value={metrics.atRiskOrders}
          delta={metrics.atRiskDelta}
          deltaGoodWhen="down"
          hint="needing intervention"
          icon={<TriangleAlert size={15} />}
          accent="#c4452f"
          to="/exceptions"
        />
      </section>

      {/* ---------------- Target + upcoming demand ---------------- */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,340px)_1fr]">
        <Card className="flex flex-col">
          <CardHeader
            title="Local Procurement Target"
            subtitle="Trailing 12 months across all buyers"
            icon={<Target size={16} />}
          />
          <div className="mt-4 flex flex-1 flex-col items-center justify-center">
            <Ring
              value={(metrics.lpiCurrent / metrics.lpiTarget) * 100}
              target={100}
              size={180}
              stroke={16}
              color="#2a714c"
              label={
                <span className="sr-num text-[2.1rem] leading-none">{metrics.lpiCurrent}%</span>
              }
              sublabel={
                <span className="mt-1 text-2xs font-semibold uppercase tracking-widest text-charcoal-400">
                  Current
                </span>
              }
            />
            <div className="mt-5 grid w-full grid-cols-3 gap-2 text-center">
              <div className="sr-inset px-2 py-2.5">
                <div className="text-2xs uppercase tracking-wider text-charcoal-400">Current</div>
                <div className="sr-num mt-0.5 text-base">{metrics.lpiCurrent}%</div>
              </div>
              <div className="sr-inset px-2 py-2.5">
                <div className="text-2xs uppercase tracking-wider text-charcoal-400">Target</div>
                <div className="sr-num mt-0.5 text-base">{metrics.lpiTarget}%</div>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-2 py-2.5 dark:border-amber-900 dark:bg-amber-900/30">
                <div className="text-2xs uppercase tracking-wider text-amber-600 dark:text-amber-300">
                  Gap
                </div>
                <div className="sr-num mt-0.5 text-base text-amber-700 dark:text-amber-200">
                  {metrics.lpiGap}pp
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-2xs leading-relaxed text-charcoal-400">
              This month is running at {metrics.localProcurementPct}% — above target. Closing the
              trailing gap needs {metrics.lpiGap}pp more sustained local share.
            </p>
            <Link
              to="/index"
              className="sr-btn-secondary mt-4 w-full"
            >
              Open Local Procurement Index
              <ArrowRight size={14} />
            </Link>
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader
            title="Upcoming Demand"
            subtitle="Orders closest to their delivery date"
            icon={<PackageCheck size={16} />}
            action={
              <Link to="/orders" className="sr-btn-ghost !px-2.5 !py-1.5 text-xs">
                All orders <ArrowRight size={13} />
              </Link>
            }
          />
          <div className="mt-4 grid flex-1 gap-3 md:grid-cols-3">
            {upcoming.map((o) => {
              const product = getProduct(o.productId);
              const coverage = Math.round((o.committedQty / o.qty) * 100);
              return (
                <Link
                  key={o.id}
                  to={`/orders/${o.id}`}
                  className="group flex flex-col rounded-xl border border-charcoal-100 bg-canvas-soft p-4 transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:border-charcoal-200 hover:shadow-lift dark:border-charcoal-800 dark:bg-charcoal-950"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg leading-none">{product.emoji}</span>
                      <span className="text-sm font-bold text-charcoal-900 dark:text-white">
                        {product.name}
                      </span>
                    </div>
                    <HealthDot status={o.health} />
                  </div>

                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="sr-num text-2xl leading-none">{o.qty.toLocaleString()}</span>
                    <span className="text-xs font-semibold text-charcoal-400">{o.unit}</span>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-2xs">
                      <span className="text-charcoal-400">Confidence</span>
                      <span
                        className="font-bold"
                        style={{ color: HEALTH_HEX[o.health] }}
                      >
                        {o.confidence}%
                      </span>
                    </div>
                    <Progress value={coverage} tone={o.health} height="h-1.5" />
                    <div className="flex items-center justify-between text-2xs">
                      <span className="text-charcoal-400">Committed</span>
                      <span className="font-semibold text-charcoal-700 dark:text-charcoal-200">
                        {o.committedQty.toLocaleString()} {o.unit}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-charcoal-100 pt-3 dark:border-charcoal-800">
                    <span className="text-2xs text-charcoal-400">
                      Delivery {formatDate(o.requiredBy)}
                    </span>
                    <Badge tone={HEALTH_TONE[o.health]}>{o.ref}</Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      </section>

      {/* ---------------- Network overview ---------------- */}
      <section className="grid gap-4 xl:grid-cols-[1fr_minmax(0,340px)]">
        <Card padded={false} className="overflow-hidden">
          <div className="p-5 pb-0">
            <CardHeader
              title="Network Overview"
              subtitle="Live commitment flows between farms and buyer delivery points"
              icon={<Activity size={16} />}
              action={
                <Link to="/network" className="sr-btn-ghost !px-2.5 !py-1.5 text-xs">
                  Digital twin <ArrowRight size={13} />
                </Link>
              }
            />
          </div>
          <NetworkMap farms={farms} buyers={buyers} links={links} height={340} />
          <div className="border-t border-charcoal-100 px-5 py-3 dark:border-charcoal-800">
            <NetworkLegend />
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Exceptions"
              subtitle={`${openExceptions.length} needing attention`}
              icon={<TriangleAlert size={16} />}
              action={
                <Link to="/exceptions" className="sr-btn-ghost !px-2.5 !py-1.5 text-xs">
                  All <ArrowRight size={13} />
                </Link>
              }
            />
            <div className="mt-3 space-y-2">
              {openExceptions.slice(0, 3).map((e) => (
                <Link
                  key={e.id}
                  to="/exceptions"
                  className="block rounded-xl border border-charcoal-100 p-3 transition hover:border-charcoal-200 hover:bg-canvas-soft dark:border-charcoal-800 dark:hover:bg-charcoal-800"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        background:
                          e.severity === 'critical'
                            ? HEALTH_HEX.risk
                            : e.severity === 'warning'
                              ? HEALTH_HEX.attention
                              : '#2f6f8a',
                      }}
                    />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-charcoal-800 dark:text-charcoal-100">
                        {e.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-2xs text-charcoal-400">
                        <span className="font-mono">{e.ref}</span>
                        <span>·</span>
                        <span>{e.type}</span>
                        {e.impactAed > 0 ? (
                          <>
                            <span>·</span>
                            <span>{formatAed(e.impactAed, { compact: true })} exposure</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Upcoming Harvests"
              subtitle="Next scheduled field operations"
              icon={<Sprout size={16} />}
              action={
                <Link to="/harvest" className="sr-btn-ghost !px-2.5 !py-1.5 text-xs">
                  Calendar <ArrowRight size={13} />
                </Link>
              }
            />
            <div className="mt-3 space-y-1">
              {nextHarvests.map((h) => {
                const p = getProduct(h.productId);
                return (
                  <div
                    key={h.id}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-canvas-soft dark:hover:bg-charcoal-800"
                  >
                    <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-canvas-soft dark:bg-charcoal-950">
                      <span className="text-[9px] font-bold uppercase text-charcoal-400">
                        {new Date(h.date).toLocaleString('en-GB', { month: 'short' })}
                      </span>
                      <span className="text-xs font-bold leading-none text-charcoal-800 dark:text-charcoal-100">
                        {new Date(h.date).getDate()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-charcoal-800 dark:text-charcoal-100">
                        {p.emoji} {p.name} · {h.qty.toLocaleString()} {h.unit}
                      </div>
                      <div className="truncate text-2xs text-charcoal-400">{farmName(h.farmId)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </section>

      {/* ---------------- Trends + activity ---------------- */}
      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader
            title="Local Sourcing Trend"
            subtitle="Local share of buyer spend vs 25% target"
            icon={<TrendingUp size={16} />}
          />
          <div className="mt-4 h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="ct-local" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2a714c" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#2a714c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} domain={[10, 30]} width={38} />
                <Tooltip content={<ChartTooltip suffix="%" />} />
                <Area
                  type="monotone"
                  dataKey="local"
                  name="Local share"
                  stroke="#2a714c"
                  strokeWidth={2.2}
                  fill="url(#ct-local)"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Target"
                  stroke="#b07f3e"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Fulfilment Trend"
            subtitle="Committed volume delivered in full"
            icon={<Truck size={16} />}
            action={
              <Link to="/fulfilment" className="sr-btn-ghost !px-2.5 !py-1.5 text-xs">
                Live <ArrowRight size={13} />
              </Link>
            }
          />
          <div className="mt-4 h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} domain={[80, 100]} width={38} />
                <Tooltip content={<ChartTooltip suffix="%" />} cursor={{ fill: 'rgba(60,140,97,0.06)' }} />
                <Bar dataKey="fill" name="Fill rate" fill="#5ca87e" radius={[4, 4, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-lg bg-canvas-soft px-3 py-2 text-2xs dark:bg-charcoal-950">
            <span className="text-charcoal-400">In fulfilment right now</span>
            <span className="font-bold text-charcoal-800 dark:text-charcoal-100">
              {FULFILMENT_JOBS.length} active batches
            </span>
          </div>
        </Card>

        <Card padded={false}>
          <div className="p-5 pb-0">
            <CardHeader title="Recent Activity" subtitle="Across the network" icon={<Activity size={16} />} />
          </div>
          <div className="mt-3 max-h-[236px] overflow-y-auto px-3 pb-3">
            {activity.slice(0, 8).map((a) => {
              const Icon = KIND_ICON[a.kind] ?? Activity;
              return (
                <div key={a.id} className="flex gap-3 rounded-lg px-2 py-2.5 transition hover:bg-canvas-soft dark:hover:bg-charcoal-800">
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-canvas-soft text-charcoal-500 dark:bg-charcoal-950 dark:text-charcoal-400">
                    <Icon size={13} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold leading-snug text-charcoal-800 dark:text-charcoal-100">
                      {a.title}
                    </div>
                    <div className="mt-0.5 truncate text-2xs text-charcoal-400">{a.detail}</div>
                    <div className="mt-0.5 text-2xs text-charcoal-300 dark:text-charcoal-600">
                      {a.actor} · {relativeTime(a.at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  );
}
