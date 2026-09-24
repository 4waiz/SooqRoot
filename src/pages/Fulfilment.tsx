import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Snowflake, Thermometer, Truck, User } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStore } from '../state/AppStore';
import {
  Badge,
  Card,
  CardHeader,
  HealthDot,
  PageHeader,
  Progress,
  Segmented,
} from '../components/ui';
import { ChartTooltip } from '../components/viz/ChartTooltip';
import { getProduct } from '../data/products';
import { productPhoto } from '../data/media';
import { Avatar } from '../components/ui/Photo';
import { useChartColors } from '../lib/theme';
import { farmName } from '../data/farms';
import { FULFILMENT_JOBS } from '../data/operations';
import { WEEKLY_FILL } from '../data/analytics';
import { formatDate, formatTime } from '../lib/metrics';
import { FulfilmentStage } from '../types';

const STAGES: FulfilmentStage[] = [
  'Harvest',
  'Grading',
  'Packing',
  'Collection',
  'Consolidation',
  'Delivery',
];

export function Fulfilment() {
  const { orders } = useStore();
  const chart = useChartColors();
  const [view, setView] = useState<'board' | 'list'>('board');

  const byStage = useMemo(() => {
    const map: Record<string, typeof FULFILMENT_JOBS> = {};
    for (const s of STAGES) map[s] = [];
    for (const j of FULFILMENT_JOBS) map[j.stage]?.push(j);
    return map;
  }, []);

  const totalVolume = FULFILMENT_JOBS.reduce((s, j) => s + j.qty, 0);
  const avgTemp =
    FULFILMENT_JOBS.reduce((s, j) => s + j.temperatureC, 0) / Math.max(1, FULFILMENT_JOBS.length);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Fulfilment"
        subtitle="Batches moving from field to buyer dock, harvest, grading, packing, collection, consolidation and delivery."
        actions={
          <>
            <Badge tone="brand" icon={<Truck size={12} />}>
              {FULFILMENT_JOBS.length} active batches
            </Badge>
            <Badge tone="sky" icon={<Snowflake size={12} />}>
              Avg {avgTemp.toFixed(1)}°C
            </Badge>
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { value: 'board', label: 'Board' },
                { value: 'list', label: 'List' },
              ]}
            />
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryTile label="Batches in motion" value={FULFILMENT_JOBS.length.toString()} />
        <SummaryTile label="Volume in transit" value={`${totalVolume.toLocaleString()} kg`} />
        <SummaryTile
          label="Cold-chain compliance"
          value="100%"
          hint="All batches inside their temperature band"
        />
        <SummaryTile label="On-time delivery (W37)" value={`${WEEKLY_FILL[WEEKLY_FILL.length - 1].onTime}%`} />
      </section>

      {view === 'board' ? (
        <div className="grid gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {STAGES.map((stage) => (
            <div key={stage} className="flex flex-col">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-2xs font-bold uppercase tracking-wider text-charcoal-500 dark:text-charcoal-400">
                  {stage}
                </span>
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-charcoal-100 px-1 text-[10px] font-bold text-charcoal-500 dark:bg-charcoal-800">
                  {byStage[stage].length}
                </span>
              </div>
              <div className="flex-1 space-y-2 rounded-xl bg-canvas-soft p-2 dark:bg-charcoal-950">
                {byStage[stage].length === 0 ? (
                  <div className="rounded-lg border border-dashed border-charcoal-200 py-6 text-center text-2xs text-charcoal-300 dark:border-charcoal-800">
                    Empty
                  </div>
                ) : (
                  byStage[stage].map((j) => {
                    const p = getProduct(j.productId);
                    const order = orders.find((o) => o.id === j.orderId);
                    return (
                      <Link
                        key={j.id}
                        to={order ? `/orders/${order.id}` : '/fulfilment'}
                        className="block rounded-lg border border-charcoal-100 bg-white p-2.5 transition hover:border-brand-200 hover:shadow-soft dark:border-charcoal-800 dark:bg-charcoal-900"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-mono text-[10px] font-bold text-charcoal-400">
                            {j.batchId}
                          </span>
                          <HealthDot status={j.health} />
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 text-xs font-bold text-charcoal-900 dark:text-white">
                          <Avatar src={productPhoto(j.productId, 48, 48)} alt={p.name} size={20} tint={p.color} fallback={p.emoji} />
                          {j.qty.toLocaleString()} {j.unit}
                        </div>
                        <div className="mt-0.5 truncate text-2xs text-charcoal-400">
                          {farmName(j.farmId)}
                        </div>
                        <Progress value={j.progressPct} tone={j.health} height="h-1" className="mt-2" />
                        <div className="mt-1.5 flex items-center justify-between text-[10px] text-charcoal-400">
                          <span className="inline-flex items-center gap-0.5">
                            <Thermometer size={9} /> {j.temperatureC}°C
                          </span>
                          <span>{formatTime(j.scheduledFor)}</span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card padded={false}>
          <div className="min-w-0 overflow-x-auto">
            <table className="sr-table min-w-[900px]">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Farm</th>
                  <th>Product</th>
                  <th className="text-end">Volume</th>
                  <th>Stage</th>
                  <th>Progress</th>
                  <th>Vehicle</th>
                  <th>Temp</th>
                  <th>Scheduled</th>
                </tr>
              </thead>
              <tbody>
                {FULFILMENT_JOBS.map((j) => {
                  const p = getProduct(j.productId);
                  const order = orders.find((o) => o.id === j.orderId);
                  return (
                    <tr key={j.id}>
                      <td>
                        <Link
                          to={order ? `/orders/${order.id}` : '/fulfilment'}
                          className="font-mono text-2xs font-bold hover:text-brand-700"
                        >
                          {j.batchId}
                        </Link>
                      </td>
                      <td className="text-xs">{farmName(j.farmId)}</td>
                      <td className="text-xs">
                        <span className="inline-flex items-center gap-2">
                          <Avatar src={productPhoto(j.productId, 48, 48)} alt={p.name} size={22} tint={p.color} fallback={p.emoji} />
                          {p.name}
                        </span>
                      </td>
                      <td className="text-end text-xs font-semibold tabular-nums">
                        {j.qty.toLocaleString()} {j.unit}
                      </td>
                      <td>
                        <Badge tone="sky">{j.stage}</Badge>
                      </td>
                      <td className="min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <Progress value={j.progressPct} tone={j.health} height="h-1.5" className="w-16" />
                          <span className="text-2xs font-bold tabular-nums">{j.progressPct}%</span>
                        </div>
                      </td>
                      <td className="text-2xs">
                        <div className="font-medium">{j.vehicle}</div>
                        <div className="inline-flex items-center gap-1 text-charcoal-400">
                          <User size={9} /> {j.driver}
                        </div>
                      </td>
                      <td className="text-xs tabular-nums">{j.temperatureC}°C</td>
                      <td className="text-2xs tabular-nums">
                        {formatDate(j.scheduledFor)} {formatTime(j.scheduledFor)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Weekly fulfilment performance"
          subtitle="Committed volume against delivered and on-time"
          icon={<Package size={16} />}
        />
        <div className="mt-4 h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WEEKLY_FILL} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} domain={[80, 100]} width={42} />
              <Tooltip content={<ChartTooltip suffix="%" />} cursor={{ fill: chart.cursor }} />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              <Bar dataKey="committed" name="Committed" fill={chart.soft} radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="delivered" name="Delivered" fill={chart.brand} radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="onTime" name="On time" fill={chart.brandDeep} radius={[4, 4, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function SummaryTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-4">
      <div className="sr-eyebrow">{label}</div>
      <div className="sr-num mt-2 text-2xl leading-none">{value}</div>
      {hint ? <div className="mt-1.5 text-2xs text-charcoal-400">{hint}</div> : null}
    </Card>
  );
}
