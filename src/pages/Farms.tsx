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
          {rows.map((f) => (
            <FarmCard key={f.id} farm={f} />
          ))}
        </div>
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
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
                        <Link to={`/farms/${f.id}`} className="flex items-center gap-2 hover:text-brand-700">
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
      className="sr-card sr-card-hover group flex flex-col p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <HealthDot status={farm.status} />
            <h3 className="truncate text-sm font-bold text-charcoal-900 dark:text-white">{farm.name}</h3>
          </div>
          <div className="ar mt-0.5 text-xs text-charcoal-400">{farm.nameAr}</div>
        </div>
        <span className="shrink-0 rounded-lg bg-canvas-soft px-2 py-1 font-mono text-2xs font-bold text-charcoal-500 dark:bg-charcoal-950">
          {farm.code}
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-charcoal-400">
        <span className="inline-flex items-center gap-1">
          <MapPin size={11} /> {farm.area}
        </span>
        <span>·</span>
        <span>{farm.distanceKm} km</span>
        <span>·</span>
        <span>{farm.growingMethod}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {Array.from(new Set(farm.capacity.map((c) => c.productId)))
          .slice(0, 4)
          .map((id) => {
            const p = getProduct(id);
            return (
              <span key={id} className="sr-chip">
                {p.emoji} {p.name}
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
    </Link>
  );
}
