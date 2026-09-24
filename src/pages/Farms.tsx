import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, LayoutGrid, List, MapPin, Search, Sprout } from 'lucide-react';
import { useStore } from '../state/AppStore';
import {
  Badge,
  Card,
  EmptyState,
  HEALTH_TONE,
  HealthDot,
  PageHeader,
  Progress,
  Segmented,
} from '../components/ui';
import { getProduct } from '../data/products';
import { farmPhoto, productPhoto } from '../data/media';
import { Avatar, Photo } from '../components/ui/Photo';
import { Reveal } from '../components/ui/Motion';
import { allocatable } from '../lib/engine';
import { healthLabel } from '../lib/metrics';
import { Farm } from '../types';

export function Farms() {
  const { farms } = useStore();
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<'all' | Farm['emirate']>('all');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return farms.filter((f) => {
      if (region !== 'all' && f.emirate !== region) return false;
      if (!q) return true;
      return `${f.name} ${f.code} ${f.area} ${f.growingMethod} ${f.contactName}`
        .toLowerCase()
        .includes(q);
    });
  }, [farms, query, region]);

  const regions = useMemo(
    () => Array.from(new Set(farms.map((f) => f.emirate))),
    [farms]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Supply Network"
        title="Farms"
        subtitle="Every producer publishing forward capacity into the SooqRoot network."
        actions={
          <>
            <Badge tone="brand" icon={<Sprout size={12} />}>
              {farms.length} active producers
            </Badge>
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { value: 'grid', label: 'Cards', icon: <LayoutGrid size={12} /> },
                { value: 'table', label: 'Table', icon: <List size={12} /> },
              ]}
            />
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setRegion('all')}
            className={`sr-chip transition ${region === 'all' ? 'border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-100' : ''}`}
          >
            All regions
          </button>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`sr-chip transition ${region === r ? 'border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-100' : ''}`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search size={14} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search farms…"
            className="sr-input py-2 ps-9 text-xs focus:ring-brand-300"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState icon={<Sprout size={26} />} title="No farms match" hint="Adjust the region filter or search." />
        </Card>
      ) : view === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((f, i) => (
            <Reveal key={f.id} delay={(i % 3) * 80}>
              <FarmCard farm={f} />
            </Reveal>
          ))}
        </div>
      ) : (
        <Card padded={false}>
          <div className="min-w-0 overflow-x-auto">
            <table className="sr-table min-w-[900px]">
              <thead>
                <tr>
                  <th>Farm</th>
                  <th>Region</th>
                  <th>Method</th>
                  <th className="text-end">Distance</th>
                  <th className="text-end">Capacity</th>
                  <th className="text-end">Available</th>
                  <th>Fulfilment</th>
                  <th>Quality</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((f) => {
                  const expected = f.capacity.reduce((s, c) => s + c.expectedHarvest, 0);
                  const available = f.capacity.reduce((s, c) => s + allocatable(c), 0);
                  return (
                    <tr key={f.id} className="group">
                      <td>
                        <Link to={`/farms/${f.id}`} className="flex items-center gap-2.5 hover:text-brand-700">
                          <Avatar src={farmPhoto(f.id, 80, 80)} alt={f.name} size={30} />
                          <HealthDot status={f.status} />
                          <span className="text-xs font-semibold">{f.name}</span>
                          <span className="font-mono text-2xs text-charcoal-400">{f.code}</span>
                        </Link>
                      </td>
                      <td className="text-xs">{f.area}</td>
                      <td className="text-xs">{f.growingMethod}</td>
                      <td className="text-end text-xs tabular-nums">{f.distanceKm} km</td>
                      <td className="text-end text-xs font-semibold tabular-nums">
                        {expected.toLocaleString()}
                      </td>
                      <td className="text-end text-xs font-semibold tabular-nums text-brand-700 dark:text-brand-300">
                        {available.toLocaleString()}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={f.fulfilmentRate}
                            tone={f.fulfilmentRate >= 92 ? 'healthy' : f.fulfilmentRate >= 86 ? 'attention' : 'risk'}
                            height="h-1.5"
                            className="w-14"
                          />
                          <span className="text-2xs font-bold tabular-nums">{f.fulfilmentRate}%</span>
                        </div>
                      </td>
                      <td className="text-xs font-semibold tabular-nums">{f.qualityScore}</td>
                      <td>
                        <Badge tone={HEALTH_TONE[f.status]}>{healthLabel(f.status)}</Badge>
                      </td>
                      <td className="text-end">
                        <Link
                          to={`/farms/${f.id}`}
                          className="inline-flex rounded-lg p-1.5 text-charcoal-300 transition group-hover:bg-charcoal-100 group-hover:text-charcoal-700 dark:group-hover:bg-charcoal-800"
                          aria-label={`Open ${f.name}`}
                        >
                          <ChevronRight size={15} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function FarmCard({ farm }: { farm: Farm }) {
  const expected = farm.capacity.reduce((s, c) => s + c.expectedHarvest, 0);
  const available = farm.capacity.reduce((s, c) => s + allocatable(c), 0);
  const committed = farm.capacity.reduce((s, c) => s + c.committed, 0);
  const utilisation = expected ? Math.round((committed / expected) * 100) : 0;

  return (
    <Link
      to={`/farms/${farm.id}`}
      className="sr-card sr-card-hover group flex h-full flex-col overflow-hidden"
    >
      <div className="relative h-36 overflow-hidden">
        <Photo
          src={farmPhoto(farm.id, 720, 300)}
          alt={farm.name}
          className="h-full w-full"
          imgClassName="transition-transform duration-700 ease-spring group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-charcoal-950/15 to-transparent" />
        <span className="absolute end-3 top-3 rounded-lg bg-white/90 px-2 py-1 font-mono text-2xs font-bold text-charcoal-700 shadow-sm backdrop-blur dark:bg-charcoal-900/90 dark:text-charcoal-200">
          {farm.code}
        </span>
        <span className="absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-charcoal-700 shadow-sm backdrop-blur dark:bg-charcoal-900/90 dark:text-charcoal-200">
          <HealthDot status={farm.status} />
          {farm.growingMethod}
        </span>
        <div className="absolute inset-x-4 bottom-3">
          <h3 className="truncate text-base font-bold text-white drop-shadow">{farm.name}</h3>
          <div className="ar text-xs text-white/80">{farm.nameAr}</div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 pt-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-charcoal-400">
        <span className="inline-flex items-center gap-1">
          <MapPin size={11} /> {farm.area}
        </span>
        <span>·</span>
        <span>{farm.distanceKm} km to collection</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {Array.from(new Set(farm.capacity.map((c) => c.productId)))
          .slice(0, 4)
          .map((id) => {
            const p = getProduct(id);
            return (
              <span key={id} className="sr-chip !py-0.5 !ps-0.5">
                <Avatar src={productPhoto(id, 48, 48)} alt={p.name} size={18} tint={p.color} fallback={p.emoji} className="!ring-0" />
                {p.name}
              </span>
            );
          })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-canvas-soft p-3 dark:bg-charcoal-950">
        <div>
          <div className="text-2xs uppercase tracking-wider text-charcoal-400">Expected</div>
          <div className="sr-num mt-0.5 text-sm">{expected.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-2xs uppercase tracking-wider text-charcoal-400">Available</div>
          <div className="sr-num mt-0.5 text-sm text-brand-700 dark:text-brand-300">
            {available.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-2xs uppercase tracking-wider text-charcoal-400">Committed</div>
          <div className="sr-num mt-0.5 text-sm">{committed.toLocaleString()}</div>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between text-2xs">
          <span className="text-charcoal-400">Capacity utilisation</span>
          <span className="font-bold text-charcoal-700 dark:text-charcoal-200">{utilisation}%</span>
        </div>
        <Progress value={utilisation} tone={utilisation > 85 ? 'attention' : 'healthy'} height="h-1.5" />
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-charcoal-100 pt-3 dark:border-charcoal-800">
        <div className="flex gap-3 text-2xs">
          <span>
            <span className="text-charcoal-400">Fulfilment </span>
            <span className="font-bold text-charcoal-700 dark:text-charcoal-200">{farm.fulfilmentRate}%</span>
          </span>
          <span>
            <span className="text-charcoal-400">Quality </span>
            <span className="font-bold text-charcoal-700 dark:text-charcoal-200">{farm.qualityScore}</span>
          </span>
        </div>
        <ChevronRight
          size={15}
          className="text-charcoal-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
        />
      </div>
      </div>
    </Link>
  );
}
