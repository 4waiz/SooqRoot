import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  CalendarDays,
  Gauge,
  Languages,
  MapPin,
  MessageSquare,
  Package,
  Ruler,
  ShieldCheck,
  Sprout,
  User,
} from 'lucide-react';
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
} from '../components/ui';
import { Ring } from '../components/ui/Metric';
import { getProduct } from '../data/products';
import { buyerName } from '../data/buyers';
import { HARVEST_EVENTS } from '../data/operations';
import { allocatable } from '../lib/engine';
import { formatDate, healthLabel } from '../lib/metrics';

export function FarmDetail() {
  const { farmId } = useParams();
  const { farms, orders } = useStore();

  const farm = farms.find((f) => f.id === farmId);
  if (!farm) return <Navigate to="/farms" replace />;

  const commitments = orders.flatMap((o) =>
    o.allocations
      .filter((a) => a.farmId === farm.id)
      .map((a) => ({ order: o, allocation: a }))
  );

  const totalCommitted = commitments
    .filter((c) => c.allocation.role === 'primary')
    .reduce((s, c) => s + c.allocation.qty, 0);

  const expected = farm.capacity.reduce((s, c) => s + c.expectedHarvest, 0);
  const available = farm.capacity.reduce((s, c) => s + allocatable(c), 0);
  const reserved = farm.capacity.reduce((s, c) => s + c.reserve, 0);
  const committedInData = farm.capacity.reduce((s, c) => s + c.committed, 0);
  const utilisation = expected ? Math.round((committedInData / expected) * 100) : 0;

  const harvests = HARVEST_EVENTS.filter((h) => h.farmId === farm.id);

  return (
    <div className="space-y-6">
      <Link
        to="/farms"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 transition hover:text-brand-700"
      >
        <ArrowLeft size={14} /> All farms
      </Link>

      <PageHeader
        eyebrow={`Supply Network · ${farm.code}`}
        title={farm.name}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="ar">{farm.nameAr}</span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} /> {farm.area}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Ruler size={13} /> {farm.distanceKm} km to collection point
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sprout size={13} /> {farm.growingMethod} · {farm.hectares} ha
            </span>
          </span>
        }
        actions={
          <>
            <Badge tone={HEALTH_TONE[farm.status]} icon={<HealthDot status={farm.status} />}>
              {healthLabel(farm.status)}
            </Badge>
            <Link to="/copilot" className="sr-btn-secondary">
              <MessageSquare size={15} /> Message farm
            </Link>
          </>
        }
      />

      {/* ---------------- Scores ---------------- */}
      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        <ScoreCard label="Historical fulfilment" value={farm.fulfilmentRate} icon={<Gauge size={15} />} />
        <ScoreCard label="Quality score" value={farm.qualityScore} icon={<ShieldCheck size={15} />} />
        <ScoreCard label="Reliability" value={farm.reliability} icon={<Award size={15} />} />
        <Card className="md:col-span-1 xl:col-span-2">
          <CardHeader title="Capacity utilisation" icon={<Package size={16} />} />
          <div className="mt-3 flex items-center gap-5">
            <Ring
              value={utilisation}
              size={92}
              stroke={10}
              color={utilisation > 85 ? '#c99c57' : '#2a714c'}
              label={<span className="sr-num text-lg leading-none">{utilisation}%</span>}
            />
            <div className="flex-1 space-y-1">
              <DataRow label="Expected harvest" value={`${expected.toLocaleString()} units`} />
              <DataRow label="Current commitments" value={`${committedInData.toLocaleString()} units`} />
              <DataRow label="Quality reserve" value={`${reserved.toLocaleString()} units`} />
              <DataRow
                label="Available for commitment"
                value={
                  <span className="text-brand-700 dark:text-brand-300">
                    {available.toLocaleString()} units
                  </span>
                }
              />
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_minmax(0,340px)]">
        {/* ---------------- Crop lines ---------------- */}
        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Crop capacity"
              subtitle="Forward harvest windows published to the network"
              icon={<Sprout size={16} />}
            />
            <div className="mt-4 space-y-3">
              {farm.capacity.map((c, i) => {
                const p = getProduct(c.productId);
                const avail = allocatable(c);
                const used = c.expectedHarvest ? Math.round((c.committed / c.expectedHarvest) * 100) : 0;
                return (
                  <div
                    key={`${c.productId}-${i}`}
                    className="rounded-xl border border-charcoal-100 p-4 dark:border-charcoal-800"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{p.emoji}</span>
                        <div>
                          <div className="text-sm font-bold text-charcoal-900 dark:text-white">
                            {p.name}
                          </div>
                          <div className="ar text-2xs text-charcoal-400">{p.nameAr}</div>
                        </div>
                      </div>
                      <Badge tone="neutral" icon={<CalendarDays size={10} />}>
                        {formatDate(c.harvestWindowStart)} – {formatDate(c.harvestWindowEnd)}
                      </Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <Stat label="Expected harvest" value={`${c.expectedHarvest.toLocaleString()} ${c.unit}`} />
                      <Stat label="Committed" value={`${c.committed.toLocaleString()} ${c.unit}`} />
                      <Stat label="Quality reserve" value={`${c.reserve.toLocaleString()} ${c.unit}`} />
                      <Stat
                        label="Available"
                        value={`${avail.toLocaleString()} ${c.unit}`}
                        accent="text-brand-700 dark:text-brand-300"
                      />
                    </div>

                    <div className="mt-3">
                      <Progress value={used} tone={used > 85 ? 'attention' : 'healthy'} height="h-1.5" />
                      <div className="mt-1.5 flex items-center justify-between text-2xs text-charcoal-400">
                        <span>{used}% of this window committed</span>
                        <span>
                          Grade A {c.gradeProbability.A}% · Grade B {c.gradeProbability.B}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-charcoal-50 pt-3 dark:border-charcoal-800">
                      {c.packaging.map((pk) => (
                        <span key={pk} className="sr-chip">
                          <Package size={10} /> {pk}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {commitments.length > 0 ? (
            <Card padded={false}>
              <div className="p-5 pb-0">
                <CardHeader
                  title="Current commitments"
                  subtitle={`${totalCommitted.toLocaleString()} units firmly committed across ${
                    new Set(commitments.map((c) => c.order.id)).size
                  } orders`}
                />
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="sr-table min-w-[640px]">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Buyer</th>
                      <th>Product</th>
                      <th className="text-end">Volume</th>
                      <th>Role</th>
                      <th>Harvest</th>
                      <th>Batch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commitments.map(({ order, allocation }) => {
                      const p = getProduct(order.productId);
                      return (
                        <tr key={allocation.batchId}>
                          <td>
                            <Link
                              to={`/orders/${order.id}`}
                              className="font-mono text-xs font-bold hover:text-brand-700"
                            >
                              {order.ref}
                            </Link>
                          </td>
                          <td className="max-w-[150px] truncate text-xs">{buyerName(order.buyerId)}</td>
                          <td className="text-xs">
                            {p.emoji} {p.name}
                          </td>
                          <td className="text-end text-xs font-semibold tabular-nums">
                            {allocation.qty.toLocaleString()} {allocation.unit}
                          </td>
                          <td>
                            <Badge tone={allocation.role === 'primary' ? 'brand' : 'sand'}>
                              {allocation.role}
                            </Badge>
                          </td>
                          <td className="text-xs tabular-nums">{formatDate(allocation.harvestDate)}</td>
                          <td className="font-mono text-2xs text-charcoal-400">{allocation.batchId}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}
        </div>

        {/* ---------------- Profile ---------------- */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Farm profile" icon={<User size={16} />} />
            <div className="mt-3">
              <DataRow label="Farm code" value={<span className="font-mono">{farm.code}</span>} />
              <DataRow label="Emirate" value={farm.emirate} />
              <DataRow label="Area" value={farm.area} />
              <DataRow label="Growing method" value={farm.growingMethod} />
              <DataRow label="Land area" value={`${farm.hectares} hectares`} />
              <DataRow label="Distance to collection" value={`${farm.distanceKm} km`} />
              <DataRow label="Contact" value={farm.contactName} />
              <DataRow
                label="Preferred language"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Languages size={12} /> {farm.preferredLanguage}
                  </span>
                }
              />
              <DataRow label="Joined network" value={formatDate(farm.joinedOn, 'long')} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Certifications" icon={<ShieldCheck size={16} />} />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {farm.certifications.map((c) => (
                <Badge key={c} tone="emerald" icon={<ShieldCheck size={10} />}>
                  {c}
                </Badge>
              ))}
            </div>
          </Card>

          {harvests.length > 0 ? (
            <Card>
              <CardHeader title="Scheduled harvests" icon={<CalendarDays size={16} />} />
              <div className="mt-3 space-y-1.5">
                {harvests.map((h) => {
                  const p = getProduct(h.productId);
                  return (
                    <div
                      key={h.id}
                      className="flex items-center gap-3 rounded-lg bg-canvas-soft px-3 py-2 dark:bg-charcoal-950"
                    >
                      <div className="flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-lg bg-white dark:bg-charcoal-900">
                        <span className="text-[8px] font-bold uppercase text-charcoal-400">
                          {new Date(h.date).toLocaleString('en-GB', { month: 'short' })}
                        </span>
                        <span className="text-2xs font-bold leading-none">{new Date(h.date).getDate()}</span>
                      </div>
                      <span className="flex-1 truncate text-xs font-medium">
                        {p.emoji} {p.name}
                      </span>
                      <span className="text-2xs font-bold tabular-nums text-charcoal-600 dark:text-charcoal-300">
                        {h.qty.toLocaleString()} {h.unit}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function ScoreCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const tone = value >= 92 ? 'healthy' : value >= 85 ? 'attention' : 'risk';
  return (
    <Card>
      <div className="flex items-start justify-between">
        <span className="sr-eyebrow">{label}</span>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-canvas-soft text-charcoal-500 dark:bg-charcoal-950">
          {icon}
        </span>
      </div>
      <div className="sr-num mt-3 text-[1.75rem] leading-none">
        {value}
        <span className="ms-0.5 text-sm font-semibold text-charcoal-400">/100</span>
      </div>
      <Progress value={value} tone={tone} height="h-1.5" className="mt-3" />
    </Card>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <div className="text-2xs uppercase tracking-wider text-charcoal-400">{label}</div>
      <div className={`sr-num mt-0.5 text-sm ${accent ?? ''}`}>{value}</div>
    </div>
  );
}
