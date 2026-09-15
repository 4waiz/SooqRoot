import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Filter, Layers, Network, Sprout } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  DataRow,
  HEALTH_TONE,
  HealthDot,
  PageHeader,
  Progress,
  Segmented,
} from '../components/ui';
import { NetworkLegend, NetworkMap } from '../components/viz/NetworkMap';
import { ChartTooltip } from '../components/viz/ChartTooltip';
import { PRODUCTS, getProduct } from '../data/products';
import { allocatable } from '../lib/engine';
import { formatDate, healthLabel } from '../lib/metrics';

export function SupplyTwin() {
  const { farms, buyers, orders, metrics } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [productFilter, setProductFilter] = useState<'all' | string>('all');

  const links = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'Delivered')
        .filter((o) => productFilter === 'all' || o.productId === productFilter)
        .flatMap((o) =>
          o.allocations
            .filter((a) => a.role === 'primary')
            .map((a) => ({ farmId: a.farmId, buyerId: o.buyerId, qty: a.qty, health: o.health }))
        ),
    [orders, productFilter]
  );

  const productSupply = useMemo(() => {
    const map: Record<string, { expected: number; committed: number; available: number }> = {};
    for (const f of farms) {
      for (const c of f.capacity) {
        const e = (map[c.productId] ??= { expected: 0, committed: 0, available: 0 });
        e.expected += c.expectedHarvest;
        e.committed += c.committed;
        e.available += allocatable(c);
      }
    }
    return PRODUCTS.filter((p) => map[p.id]).map((p) => ({
      name: p.name,
      productId: p.id,
      color: p.color,
      ...map[p.id],
      utilisation: Math.round((map[p.id].committed / Math.max(1, map[p.id].expected)) * 100),
    }));
  }, [farms]);

  const selectedFarm = farms.find((f) => f.id === selected);

  const totals = useMemo(
    () => ({
      expected: productSupply.reduce((s, p) => s + p.expected, 0),
      available: productSupply.reduce((s, p) => s + p.available, 0),
      committed: productSupply.reduce((s, p) => s + p.committed, 0),
    }),
    [productSupply]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Supply Network"
        title="Supply Digital Twin"
        subtitle="A live model of what the UAE farm network can actually deliver, where it sits, and which buyer demand it is already carrying."
        actions={
          <>
            <Badge tone="brand" icon={<Sprout size={12} />}>
              {farms.length} farms
            </Badge>
            <Badge tone="neutral" icon={<Layers size={12} />}>
              {totals.available.toLocaleString()} units uncommitted
            </Badge>
          </>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_minmax(0,320px)]">
        <Card padded={false} className="overflow-hidden">
          <div className="flex flex-col gap-3 p-5 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <CardHeader
              title="Network canvas"
              subtitle="Farm nodes, buyer delivery points and active commitment flows"
              icon={<Network size={16} />}
            />
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="sr-input w-auto shrink-0 py-2 pe-8 text-xs focus:ring-brand-300"
              aria-label="Filter flows by product"
            >
              <option value="all">All products</option>
              {PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <NetworkMap
            farms={farms}
            buyers={buyers}
            links={links}
            height={430}
            selectedFarmId={selected}
            onSelectFarm={setSelected}
          />
          <div className="border-t border-charcoal-100 px-5 py-3 dark:border-charcoal-800">
            <NetworkLegend />
          </div>
        </Card>

        <div className="space-y-4">
          {selectedFarm ? (
            <Card>
              <CardHeader
                title={selectedFarm.name}
                subtitle={`${selectedFarm.area} · ${selectedFarm.distanceKm} km`}
                icon={<HealthDot status={selectedFarm.status} />}
                action={
                  <Badge tone={HEALTH_TONE[selectedFarm.status]}>{healthLabel(selectedFarm.status)}</Badge>
                }
              />
              <div className="mt-3">
                <DataRow label="Growing method" value={selectedFarm.growingMethod} />
                <DataRow label="Land area" value={`${selectedFarm.hectares} ha`} />
                <DataRow label="Fulfilment" value={`${selectedFarm.fulfilmentRate}%`} />
                <DataRow label="Quality score" value={selectedFarm.qualityScore} />
                <DataRow
                  label="Available"
                  value={`${selectedFarm.capacity.reduce((s, c) => s + allocatable(c), 0).toLocaleString()} units`}
                />
              </div>
              <div className="mt-3 space-y-2">
                {selectedFarm.capacity.map((c, i) => {
                  const p = getProduct(c.productId);
                  return (
                    <div key={i} className="rounded-lg bg-canvas-soft p-2.5 dark:bg-charcoal-950">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold">
                          {p.emoji} {p.name}
                        </span>
                        <span className="font-bold tabular-nums text-brand-700 dark:text-brand-300">
                          {allocatable(c).toLocaleString()} {c.unit}
                        </span>
                      </div>
                      <div className="mt-1 text-2xs text-charcoal-400">
                        {formatDate(c.harvestWindowStart)} – {formatDate(c.harvestWindowEnd)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link to={`/farms/${selectedFarm.id}`} className="sr-btn-secondary mt-3 w-full text-xs">
                Open full profile
              </Link>
            </Card>
          ) : (
            <Card>
              <CardHeader title="Network totals" subtitle="Across the current window" icon={<Activity size={16} />} />
              <div className="mt-3">
                <DataRow label="Expected harvest" value={`${totals.expected.toLocaleString()} units`} />
                <DataRow label="Committed" value={`${totals.committed.toLocaleString()} units`} />
                <DataRow
                  label="Uncommitted headroom"
                  value={
                    <span className="text-brand-700 dark:text-brand-300">
                      {totals.available.toLocaleString()} units
                    </span>
                  }
                />
                <DataRow label="Active buyers" value={buyers.length} />
                <DataRow label="Active flows" value={links.length} />
              </div>
              <p className="mt-3 rounded-lg bg-canvas-soft p-3 text-2xs leading-relaxed text-charcoal-500 dark:bg-charcoal-950 dark:text-charcoal-400">
                Select a farm node on the canvas to isolate its commitment flows and inspect its
                published capacity.
              </p>
            </Card>
          )}

          <Card>
            <CardHeader title="Health distribution" icon={<Filter size={16} />} />
            <div className="mt-3 space-y-2.5">
              {(['healthy', 'attention', 'risk'] as const).map((status) => {
                const count = farms.filter((f) => f.status === status).length;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-2xs font-semibold capitalize text-charcoal-600 dark:text-charcoal-300">
                      {healthLabel(status)}
                    </span>
                    <Progress value={(count / farms.length) * 100} tone={status} height="h-2" className="flex-1" />
                    <span className="w-6 shrink-0 text-end text-2xs font-bold tabular-nums">{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </section>

      {/* ---------------- Supply by product ---------------- */}
      <Card>
        <CardHeader
          title="Supply headroom by crop"
          subtitle="Expected harvest against what is already committed"
          icon={<Layers size={16} />}
        />
        <div className="mt-4 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productSupply} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-12} textAnchor="end" height={50} />
              <YAxis tickLine={false} axisLine={false} width={54} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(60,140,97,0.05)' }} />
              <Bar dataKey="committed" name="Committed" stackId="a" radius={[0, 0, 0, 0]} maxBarSize={44}>
                {productSupply.map((p) => (
                  <Cell key={p.productId} fill={p.color} fillOpacity={0.95} />
                ))}
              </Bar>
              <Bar dataKey="available" name="Available" stackId="a" radius={[5, 5, 0, 0]} maxBarSize={44}>
                {productSupply.map((p) => (
                  <Cell key={p.productId} fill={p.color} fillOpacity={0.28} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {productSupply.map((p) => (
            <div key={p.productId} className="rounded-xl border border-charcoal-100 p-3 dark:border-charcoal-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{getProduct(p.productId).emoji} {p.name}</span>
                <span className="text-2xs font-bold tabular-nums text-charcoal-500">{p.utilisation}%</span>
              </div>
              <Progress
                value={p.utilisation}
                tone={p.utilisation > 85 ? 'attention' : 'healthy'}
                height="h-1.5"
                className="mt-2"
              />
              <div className="mt-1.5 flex justify-between text-2xs text-charcoal-400">
                <span>{p.committed.toLocaleString()} committed</span>
                <span className="text-brand-600 dark:text-brand-300">
                  {p.available.toLocaleString()} free
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
