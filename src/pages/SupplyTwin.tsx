import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Filter, Layers, MapPin, Network, Sprout, X } from 'lucide-react';
import { useStore } from '../state/AppStore';
import {
  Badge,
  Card,
  CardHeader,
  DataRow,
  HEALTH_HEX,
  HEALTH_TONE,
  HealthDot,
  PageHeader,
  Progress,
} from '../components/ui';
import { Avatar, Photo } from '../components/ui/Photo';
import { CountUp, Reveal, useSettle } from '../components/ui/Motion';
import { MapLegend, SupplyMap } from '../components/viz/SupplyMap';
import { PRODUCTS, getProduct } from '../data/products';
import { farmPhoto, productPhoto } from '../data/media';
import { allocatable } from '../lib/engine';
import { formatDate, healthLabel } from '../lib/metrics';

export function SupplyTwin() {
  const { farms, buyers, orders } = useStore();
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
    const map: Record<string, { expected: number; committed: number; reserve: number; available: number; farms: Set<string> }> = {};
    for (const f of farms) {
      for (const c of f.capacity) {
        const e = (map[c.productId] ??= { expected: 0, committed: 0, reserve: 0, available: 0, farms: new Set() });
        e.expected += c.expectedHarvest;
        e.committed += c.committed;
        e.reserve += c.reserve;
        e.available += allocatable(c);
        e.farms.add(f.id);
      }
    }
    return PRODUCTS.filter((p) => map[p.id])
      .map((p) => ({
        product: p,
        ...map[p.id],
        farmIds: Array.from(map[p.id].farms),
        utilisation: Math.round((map[p.id].committed / Math.max(1, map[p.id].expected)) * 100),
      }))
      .sort((a, b) => b.expected - a.expected);
  }, [farms]);

  const totals = useMemo(
    () => ({
      expected: productSupply.reduce((s, p) => s + p.expected, 0),
      available: productSupply.reduce((s, p) => s + p.available, 0),
      committed: productSupply.reduce((s, p) => s + p.committed, 0),
    }),
    [productSupply]
  );

  const selectedFarm = farms.find((f) => f.id === selected);
  const maxExpected = Math.max(1, ...productSupply.map((p) => p.expected));

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

      <section className="grid gap-4 xl:grid-cols-[1fr_minmax(0,340px)]">
        <Card padded={false} className="flex flex-col overflow-hidden">
          <div className="flex flex-col gap-3 p-5 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <CardHeader
              title="Live network"
              subtitle="Farms at their real locations, buyer delivery points and every firm commitment in motion"
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
          <div className="px-3">
            <SupplyMap
              farms={farms}
              buyers={buyers}
              links={links}
              height={560}
              selectedFarmId={selected}
              onSelectFarm={setSelected}
              intro
            />
          </div>
          <div className="px-5 py-3">
            <MapLegend />
          </div>
        </Card>

        <div className="min-w-0 space-y-4">
          {selectedFarm ? (
            <Card padded={false} className="overflow-hidden animate-in" key={selectedFarm.id}>
              <div className="relative h-36">
                <Photo
                  src={farmPhoto(selectedFarm.id, 720, 300)}
                  alt={selectedFarm.name}
                  className="h-full w-full"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/85 via-charcoal-950/20 to-transparent" />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute end-3 top-3 rounded-full bg-white/90 p-1.5 text-charcoal-700 shadow transition hover:bg-white dark:bg-charcoal-900/90 dark:text-charcoal-200"
                  aria-label="Clear selection"
                >
                  <X size={14} />
                </button>
                <div className="absolute inset-x-4 bottom-3 text-white">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: HEALTH_HEX[selectedFarm.status] }} />
                    <span className="text-base font-bold drop-shadow">{selectedFarm.name}</span>
                  </div>
                  <div className="mt-0.5 inline-flex items-center gap-1 text-2xs text-white/85">
                    <MapPin size={11} /> {selectedFarm.area} · {selectedFarm.lat.toFixed(3)}°N {selectedFarm.lng.toFixed(3)}°E
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <Badge tone={HEALTH_TONE[selectedFarm.status]}>{healthLabel(selectedFarm.status)}</Badge>
                  <span className="font-mono text-2xs text-charcoal-400">{selectedFarm.code}</span>
                </div>
                <div className="mt-2">
                  <DataRow label="Growing method" value={`${selectedFarm.growingMethod} · ${selectedFarm.hectares} ha`} />
                  <DataRow label="Distance to collection" value={`${selectedFarm.distanceKm} km`} />
                  <DataRow label="Fulfilment · quality" value={`${selectedFarm.fulfilmentRate}% · ${selectedFarm.qualityScore}`} />
                </div>
                <div className="mt-3 space-y-2">
                  {selectedFarm.capacity.map((c, i) => {
                    const p = getProduct(c.productId);
                    const used = c.expectedHarvest ? Math.round((c.committed / c.expectedHarvest) * 100) : 0;
                    return (
                      <div key={i} className="flex items-center gap-3 rounded-xl bg-canvas-soft p-2.5 dark:bg-charcoal-950">
                        <Avatar src={productPhoto(c.productId, 80, 80)} alt={p.name} size={32} tint={p.color} fallback={p.emoji} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-charcoal-800 dark:text-charcoal-100">{p.name}</span>
                            <span className="font-bold tabular-nums text-brand-700 dark:text-brand-300">
                              {allocatable(c).toLocaleString()} {c.unit}
                            </span>
                          </div>
                          <Progress value={used} tone={used > 85 ? 'attention' : 'healthy'} height="h-1" className="mt-1.5" />
                          <div className="mt-1 text-[10px] text-charcoal-400">
                            {formatDate(c.harvestWindowStart)}, {formatDate(c.harvestWindowEnd)} · {used}% committed
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link to={`/farms/${selectedFarm.id}`} className="sr-btn-secondary mt-4 w-full text-xs">
                  Open full profile <ArrowRight size={13} />
                </Link>
              </div>
            </Card>
          ) : (
            <Card>
              <CardHeader title="Network totals" subtitle="Across the current window" icon={<Layers size={16} />} />
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Total label="Expected harvest" value={totals.expected} />
                <Total label="Committed" value={totals.committed} />
                <Total label="Uncommitted" value={totals.available} accent />
                <Total label="Live flows" value={links.length} />
              </div>
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-2xs">
                  <span className="text-charcoal-400">Network utilisation</span>
                  <span className="font-bold text-charcoal-700 dark:text-charcoal-200">
                    {Math.round((totals.committed / Math.max(1, totals.expected)) * 100)}%
                  </span>
                </div>
                <Progress value={(totals.committed / Math.max(1, totals.expected)) * 100} tone="brand" height="h-2" />
              </div>
              <p className="mt-4 rounded-xl bg-canvas-soft p-3 text-2xs leading-relaxed text-charcoal-500 dark:bg-charcoal-950 dark:text-charcoal-400">
                Click any farm on the map to fly to it, isolate its commitment flows and inspect its
                published capacity.
              </p>
              <div className="mt-4">
                <div className="sr-eyebrow mb-2">Farms in the network</div>
                <div className="flex flex-wrap gap-1.5">
                  {farms.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelected(f.id)}
                      className="group relative"
                      title={f.name}
                      aria-label={`Select ${f.name}`}
                    >
                      <Avatar src={farmPhoto(f.id, 80, 80)} alt={f.name} size={34} className="transition-transform duration-200 group-hover:scale-110" />
                      <span
                        className="absolute -bottom-0.5 -end-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-charcoal-900"
                        style={{ background: HEALTH_HEX[f.status] }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title="Health distribution" icon={<Filter size={16} />} />
            <div className="mt-3 space-y-2.5">
              {(['healthy', 'attention', 'risk'] as const).map((status) => {
                const count = farms.filter((f) => f.status === status).length;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-2xs font-semibold text-charcoal-600 dark:text-charcoal-300">
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

      {/* ---------------- Supply headroom by crop ---------------- */}
      <Reveal>
        <Card>
          <CardHeader
            title="Supply headroom by crop"
            subtitle="Expected harvest split into what is committed, held in quality reserve, and still free to commit"
            icon={<Layers size={16} />}
            action={
              <div className="hidden items-center gap-3 text-2xs text-charcoal-500 dark:text-charcoal-400 md:flex">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-brand-600 dark:bg-brand-400" /> Committed
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-sand-300 dark:bg-sand-500" /> Reserve
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm border border-brand-400 bg-brand-100 dark:bg-brand-900" /> Free
                </span>
              </div>
            }
          />

          <div className="mt-5 space-y-2">
            {productSupply.map((row, i) => (
              <CropRow key={row.product.id} row={row} maxExpected={maxExpected} delay={i * 70} />
            ))}
          </div>
        </Card>
      </Reveal>
    </div>
  );
}

function Total({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-canvas-soft p-3 dark:bg-charcoal-950">
      <div className="text-[10px] uppercase tracking-wider text-charcoal-400">{label}</div>
      <div className={`sr-num mt-1 text-lg ${accent ? '!text-brand-700 dark:!text-brand-300' : ''}`}>
        <CountUp value={value} />
      </div>
    </div>
  );
}

function CropRow({
  row,
  maxExpected,
  delay,
}: {
  row: {
    product: ReturnType<typeof getProduct>;
    expected: number;
    committed: number;
    reserve: number;
    available: number;
    farmIds: string[];
    utilisation: number;
  };
  maxExpected: number;
  delay: number;
}) {
  const { product: p } = row;
  const scale = useSettle(100, 150 + delay);
  // Bar width is proportional to volume so crops compare honestly; segments show the split.
  const widthPct = Math.max(6, (row.expected / maxExpected) * 100);
  const seg = (v: number) => `${(v / Math.max(1, row.expected)) * 100}%`;
  const tone = row.utilisation > 90 ? 'text-rose-600 dark:text-rose-300' : row.utilisation > 80 ? 'text-amber-600 dark:text-amber-300' : 'text-brand-700 dark:text-brand-300';

  return (
    <div className="group grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1 rounded-xl px-2 py-2 transition hover:bg-canvas-soft dark:hover:bg-charcoal-950 sm:grid-cols-[auto_150px_1fr_auto]">
      <Avatar src={productPhoto(p.id, 96, 96)} alt={p.name} size={40} tint={p.color} fallback={p.emoji} />
      <div className="min-w-0">
        <div className="truncate text-sm font-bold text-charcoal-900 dark:text-white">{p.name}</div>
        <div className="flex items-center gap-1.5 text-[10px] text-charcoal-400">
          <span>{row.farmIds.length} farm{row.farmIds.length === 1 ? '' : 's'}</span>
          <span className="flex -space-x-1.5">
            {row.farmIds.slice(0, 4).map((id) => (
              <Avatar key={id} src={farmPhoto(id, 48, 48)} alt={id} size={16} />
            ))}
          </span>
        </div>
      </div>

      <div className="col-span-2 sm:col-span-1">
        <div className="h-3.5 w-full overflow-hidden rounded-full bg-charcoal-100/70 dark:bg-charcoal-800/70">
          <div
            className="flex h-full origin-left overflow-hidden rounded-full transition-transform duration-1000 ease-spring"
            style={{ width: `${widthPct}%`, transform: `scaleX(${scale / 100})` }}
          >
            <div className="h-full bg-brand-600 dark:bg-brand-400" style={{ width: seg(row.committed) }} title={`${row.committed.toLocaleString()} committed`} />
            <div className="h-full bg-sand-300 dark:bg-sand-500" style={{ width: seg(row.reserve) }} title={`${row.reserve.toLocaleString()} reserve`} />
            <div className="h-full border-y border-e border-brand-400/60 bg-brand-100 dark:bg-brand-900" style={{ width: seg(row.available) }} title={`${row.available.toLocaleString()} free`} />
          </div>
        </div>
      </div>

      <div className="col-span-2 flex items-center justify-between gap-4 text-2xs sm:col-span-1 sm:justify-end">
        <span className="tabular-nums text-charcoal-500 dark:text-charcoal-400">
          <span className="font-semibold text-charcoal-800 dark:text-charcoal-100">{row.expected.toLocaleString()}</span> {p.unit} expected
        </span>
        <span className="w-24 text-end tabular-nums">
          <span className="font-bold text-brand-700 dark:text-brand-300">{row.available.toLocaleString()}</span>{' '}
          <span className="text-charcoal-400">free</span>
        </span>
        <span className={`w-10 text-end font-bold tabular-nums ${tone}`}>{row.utilisation}%</span>
      </div>
    </div>
  );
}
