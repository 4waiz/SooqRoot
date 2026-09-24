import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronRight,
  Cpu,
  MapPin,
  Package,
  ShieldCheck,
  Sprout,
  Truck,
} from 'lucide-react';
import { useStore } from '../state/AppStore';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DataRow,
  HEALTH_TONE,
  HealthDot,
  PageHeader,
  Progress,
} from '../components/ui';
import { getProduct } from '../data/products';
import { buyerPhoto, farmPhoto, productPhoto } from '../data/media';
import { Avatar, Photo } from '../components/ui/Photo';
import { getBuyer } from '../data/buyers';
import { getFarm } from '../data/farms';
import { BATCH_PASSPORTS, FULFILMENT_JOBS } from '../data/operations';
import { formatAed, formatDate, healthLabel } from '../lib/metrics';
import { ORDER_FLOW } from '../types';

export function OrderDetail() {
  const { orderId } = useParams();
  const { orders, cycles, advanceOrder, pushActivity } = useStore();

  const order = orders.find((o) => o.id === orderId);
  if (!order) return <Navigate to="/orders" replace />;

  const product = getProduct(order.productId);
  const buyer = getBuyer(order.buyerId);
  const cycle = cycles.find((c) => c.id === order.cycleId);
  const coverage = Math.round((order.committedQty / order.qty) * 100);
  const primary = order.allocations.filter((a) => a.role === 'primary');
  const backup = order.allocations.filter((a) => a.role === 'backup');
  const jobs = FULFILMENT_JOBS.filter((j) => j.orderId === order.id);
  const passports = BATCH_PASSPORTS.filter((p) => p.orderId === order.id);

  const stageIndex = ORDER_FLOW.indexOf(order.status);
  const activeStage = stageIndex === -1 ? 1 : stageIndex;

  return (
    <div className="space-y-6">
      <Link
        to="/orders"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 transition hover:text-brand-700"
      >
        <ArrowLeft size={14} /> All orders
      </Link>

      <PageHeader
        eyebrow={`Order · ${cycle?.name ?? 'Procurement cycle'}`}
        title={`${order.ref}, ${product.name}`}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <Building2 size={13} /> {buyer?.name}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} /> {order.deliveryLocation}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Package size={13} /> {order.packaging}
            </span>
          </span>
        }
        actions={
          <>
            <Badge tone={HEALTH_TONE[order.health]} icon={<HealthDot status={order.health} />}>
              {healthLabel(order.health)}
            </Badge>
            {order.status !== 'Delivered' ? (
              <Button
                icon={<ChevronRight size={15} />}
                onClick={() => {
                  advanceOrder(order.id);
                  pushActivity({
                    kind: 'commitment',
                    title: `${order.ref} advanced from ${order.status}`,
                    detail: `${product.name} · ${buyer?.name}`,
                    actor: 'Awaiz Ahmed',
                  });
                }}
              >
                Advance stage
              </Button>
            ) : null}
          </>
        }
      />

      {/* ---------------- Lifecycle ---------------- */}
      <Card>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
          {ORDER_FLOW.map((stage, i) => {
            const done = i < activeStage;
            const current = i === activeStage;
            return (
              <React.Fragment key={stage}>
                <div className="flex flex-1 items-center gap-2.5">
                  <span
                    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-2xs font-bold transition ${
                      done
                        ? 'bg-brand-600 text-white'
                        : current
                          ? 'border-2 border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-100'
                          : 'border-2 border-charcoal-200 text-charcoal-300 dark:border-charcoal-700'
                    }`}
                  >
                    {done ? <Check size={13} strokeWidth={3} /> : i + 1}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      done || current
                        ? 'text-charcoal-800 dark:text-charcoal-100'
                        : 'text-charcoal-400 dark:text-charcoal-600'
                    }`}
                  >
                    {stage}
                  </span>
                </div>
                {i < ORDER_FLOW.length - 1 ? (
                  <span
                    className={`hidden h-0.5 flex-1 rounded-full sm:block ${
                      done ? 'bg-brand-500' : 'bg-charcoal-100 dark:bg-charcoal-800'
                    }`}
                  />
                ) : null}
              </React.Fragment>
            );
          })}
        </div>
        {order.status === 'At risk' ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-900/30 dark:text-rose-200">
            This order is flagged at risk, commitment coverage is {coverage}% against a{' '}
            {formatDate(order.requiredBy, 'long')} delivery date.{' '}
            <Link to="/exceptions" className="font-bold underline">
              Review exceptions
            </Link>
          </div>
        ) : null}
      </Card>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,340px)_1fr]">
        {/* ---------------- Summary ---------------- */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Order summary" icon={<Package size={16} />} />
            <div className="mt-4 overflow-hidden rounded-xl bg-canvas-soft dark:bg-charcoal-950">
              <Photo
                src={productPhoto(order.productId, 640, 200)}
                alt={product.name}
                tint={product.color}
                fallback={product.emoji}
                className="h-24 w-full"
              />
              <div className="p-4">
              <div className="flex items-end gap-2">
                <div>
                  <div className="sr-num text-2xl leading-none">
                    {order.qty.toLocaleString()}
                    <span className="ms-1 text-xs font-semibold text-charcoal-400">{order.unit}</span>
                  </div>
                  <div className="mt-0.5 text-2xs text-charcoal-400">Grade {order.grade}</div>
                </div>
              </div>
              <Progress value={coverage} tone={order.health} className="mt-3" />
              <div className="mt-2 flex items-center justify-between text-2xs">
                <span className="text-charcoal-400">
                  {order.committedQty.toLocaleString()} {order.unit} committed
                </span>
                <span className="font-bold text-charcoal-700 dark:text-charcoal-200">{coverage}%</span>
              </div>
              </div>
            </div>

            <div className="mt-3">
              <DataRow label="Order value" value={formatAed(order.valueAed)} />
              <DataRow label="Confidence" value={`${order.confidence}%`} />
              <DataRow label="Required by" value={formatDate(order.requiredBy, 'long')} />
              <DataRow label="Created" value={formatDate(order.createdAt, 'long')} />
              <DataRow label="Cycle" value={cycle?.ref ?? ', '} />
              <DataRow label="Delivery point" value={order.deliveryLocation} />
              <DataRow label="Packaging" value={order.packaging} />
              {order.deliveredQty > 0 ? (
                <DataRow
                  label="Delivered"
                  value={`${order.deliveredQty.toLocaleString()} ${order.unit}`}
                />
              ) : null}
            </div>
          </Card>

          {buyer ? (
            <Card>
              <CardHeader title="Buyer" icon={<Building2 size={16} />} />
              <div className="mt-3">
                <div className="flex items-center gap-3">
                  <Avatar src={buyerPhoto(buyer.id, 96, 96)} alt={buyer.name} size={40} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-charcoal-900 dark:text-white">{buyer.name}</div>
                    <div className="ar text-xs text-charcoal-400">{buyer.nameAr}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <DataRow label="Segment" value={buyer.segment} />
                  <DataRow label="Emirate" value={buyer.emirate} />
                  <DataRow label="Contact" value={buyer.contactName} />
                  <DataRow label="Local target" value={`${buyer.localTargetPct}%`} />
                  <DataRow label="Monthly spend" value={formatAed(buyer.monthlySpendAed, { compact: true })} />
                </div>
              </div>
            </Card>
          ) : null}
        </div>

        {/* ---------------- Allocations ---------------- */}
        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader
              title="Farm commitments"
              subtitle={`${primary.length} primary · ${backup.length} backup`}
              icon={<Sprout size={16} />}
              action={
                <Link to="/engine" className="sr-btn-ghost !px-2.5 !py-1.5 text-xs">
                  <Cpu size={13} /> Re-run engine
                </Link>
              }
            />

            {order.allocations.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-charcoal-200 p-6 text-center dark:border-charcoal-700">
                <p className="text-xs font-semibold text-charcoal-600 dark:text-charcoal-300">
                  {order.status === 'Delivered'
                    ? 'This order closed in a previous cycle, see its batch passports below.'
                    : 'No commitments yet. Run the commitment engine to allocate this order.'}
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {order.allocations.map((a) => {
                  const farm = getFarm(a.farmId);
                  if (!farm) return null;
                  const share = (a.qty / order.qty) * 100;
                  return (
                    <div
                      key={a.id}
                      className={`rounded-xl border p-3.5 ${
                        a.role === 'backup'
                          ? 'border-dashed border-sand-300 bg-sand-50 dark:border-sand-600 dark:bg-sand-600/10'
                          : 'border-charcoal-100 dark:border-charcoal-800'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <Avatar src={farmPhoto(farm.id, 64, 64)} alt={farm.name} size={28} />
                        <HealthDot status={farm.status} />
                        <Link
                          to={`/farms/${farm.id}`}
                          className="min-w-0 flex-1 truncate text-sm font-bold hover:text-brand-700"
                        >
                          {farm.name}
                        </Link>
                        <Badge tone={a.role === 'primary' ? 'brand' : 'sand'}>{a.role}</Badge>
                        <span className="sr-num text-base">
                          {a.qty.toLocaleString()}
                          <span className="ms-1 text-2xs font-semibold text-charcoal-400">{a.unit}</span>
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <Progress
                          value={share * 4}
                          tone={a.role === 'primary' ? 'healthy' : 'attention'}
                          height="h-1.5"
                          className="flex-1"
                        />
                        <span className="shrink-0 text-2xs font-semibold tabular-nums text-charcoal-400">
                          {share.toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-charcoal-400">
                        <span className="font-mono">{a.batchId}</span>
                        <span>·</span>
                        <span>Harvest {formatDate(a.harvestDate)}</span>
                        <span>·</span>
                        <span>{farm.area}</span>
                        <span>·</span>
                        <span>{farm.distanceKm} km</span>
                        <span>·</span>
                        <span>Confidence {a.confidence}%</span>
                      </div>
                      <ul className="mt-2 space-y-0.5 border-t border-charcoal-50 pt-2 dark:border-charcoal-800">
                        {a.rationale.map((r, i) => (
                          <li key={i} className="text-2xs leading-relaxed text-charcoal-500 dark:text-charcoal-400">
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {jobs.length > 0 ? (
            <Card>
              <CardHeader
                title="Fulfilment"
                subtitle="Batches moving through the chain"
                icon={<Truck size={16} />}
                action={
                  <Link to="/fulfilment" className="sr-btn-ghost !px-2.5 !py-1.5 text-xs">
                    Board <ChevronRight size={13} />
                  </Link>
                }
              />
              <div className="mt-3 space-y-2">
                {jobs.map((j) => (
                  <div
                    key={j.id}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-charcoal-100 p-3 dark:border-charcoal-800"
                  >
                    <span className="font-mono text-2xs font-bold text-charcoal-500">{j.batchId}</span>
                    <Badge tone="sky">{j.stage}</Badge>
                    <span className="text-xs font-semibold">
                      {j.qty.toLocaleString()} {j.unit}
                    </span>
                    <span className="text-2xs text-charcoal-400">{j.vehicle} · {j.temperatureC}°C</span>
                    <Progress value={j.progressPct} tone={j.health} height="h-1.5" className="ms-auto w-24" />
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {passports.length > 0 ? (
            <Card>
              <CardHeader
                title="Batch passports"
                subtitle="Auditable proof of local sourcing"
                icon={<ShieldCheck size={16} />}
                action={
                  <Link to="/passports" className="sr-btn-ghost !px-2.5 !py-1.5 text-xs">
                    All <ChevronRight size={13} />
                  </Link>
                }
              />
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {passports.map((p) => {
                  const farm = getFarm(p.farmId);
                  return (
                    <Link
                      key={p.id}
                      to="/passports"
                      className="rounded-xl border border-charcoal-100 p-3 transition hover:border-brand-200 hover:bg-brand-50 dark:border-charcoal-800 dark:hover:bg-brand-900"
                    >
                      <div className="font-mono text-2xs font-bold text-charcoal-500">{p.batchId}</div>
                      <div className="mt-1 text-xs font-semibold">{farm?.name}</div>
                      <div className="mt-1 flex items-center gap-2 text-2xs text-charcoal-400">
                        <span>{p.qty.toLocaleString()} {p.unit}</span>
                        <span>·</span>
                        <span>{p.distanceKm} km</span>
                        <span>·</span>
                        <span className="text-brand-600">{p.co2SavedKg} kg CO₂e saved</span>
                      </div>
                    </Link>
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
