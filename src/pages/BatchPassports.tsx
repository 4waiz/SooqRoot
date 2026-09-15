import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Droplets,
  Fingerprint,
  Leaf,
  MapPin,
  Package,
  Printer,
  ShieldCheck,
  Sprout,
} from 'lucide-react';
import { useStore } from '../state/AppStore';
import { Badge, Button, Card, CardHeader, DataRow, Modal, PageHeader } from '../components/ui';
import { getProduct } from '../data/products';
import { getFarm } from '../data/farms';
import { getBuyer } from '../data/buyers';
import { BATCH_PASSPORTS } from '../data/operations';
import { formatDate } from '../lib/metrics';
import { BatchPassport } from '../types';

export function BatchPassports() {
  const { orders } = useStore();
  const [open, setOpen] = useState<BatchPassport | null>(null);

  const totalCo2 = BATCH_PASSPORTS.reduce((s, p) => s + p.co2SavedKg, 0);
  const avgDistance =
    BATCH_PASSPORTS.reduce((s, p) => s + p.distanceKm, 0) / Math.max(1, BATCH_PASSPORTS.length);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Batch Passports"
        subtitle="Auditable proof of local sourcing. Every delivered batch carries its farm, harvest date, chain of custody and measured impact."
        actions={
          <>
            <Badge tone="emerald" icon={<ShieldCheck size={12} />}>
              {BATCH_PASSPORTS.length} issued
            </Badge>
            <Badge tone="brand" icon={<Leaf size={12} />}>
              {totalCo2.toLocaleString()} kg CO₂e avoided
            </Badge>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-4">
        <Tile label="Passports issued" value={BATCH_PASSPORTS.length.toString()} />
        <Tile label="Average food miles" value={`${avgDistance.toFixed(1)} km`} />
        <Tile label="CO₂e avoided" value={`${totalCo2.toLocaleString()} kg`} />
        <Tile label="Verification" value="100%" hint="Every batch checkpoint signed" />
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {BATCH_PASSPORTS.map((p) => {
          const product = getProduct(p.productId);
          const farm = getFarm(p.farmId);
          const buyer = getBuyer(p.buyerId);
          return (
            <button
              key={p.id}
              onClick={() => setOpen(p)}
              className="sr-card sr-card-hover group overflow-hidden p-0 text-start"
            >
              <div className="flex items-center justify-between bg-brand-gradient px-4 py-3 text-white">
                <div>
                  <div className="font-mono text-2xs font-semibold text-white/70">{p.batchId}</div>
                  <div className="mt-0.5 text-sm font-bold">
                    {product.emoji} {product.name}
                  </div>
                </div>
                <ShieldCheck size={20} className="text-white/85" />
              </div>

              <div className="p-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="sr-num text-2xl leading-none">{p.qty.toLocaleString()}</span>
                  <span className="text-xs font-semibold text-charcoal-400">{p.unit}</span>
                  <Badge tone="neutral" className="ms-auto">
                    Grade {p.grade}
                  </Badge>
                </div>

                <div className="mt-3 space-y-1.5 text-2xs">
                  <div className="flex items-center gap-1.5 text-charcoal-500 dark:text-charcoal-400">
                    <Sprout size={11} /> {farm?.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-charcoal-500 dark:text-charcoal-400">
                    <Package size={11} /> {buyer?.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-charcoal-500 dark:text-charcoal-400">
                    <MapPin size={11} /> {p.distanceKm} km · harvested {formatDate(p.harvestedOn)}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 dark:bg-brand-900/30">
                  <span className="text-2xs font-semibold text-brand-700 dark:text-brand-200">
                    CO₂e avoided
                  </span>
                  <span className="text-xs font-bold text-brand-700 dark:text-brand-200">
                    {p.co2SavedKg} kg
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-charcoal-100 pt-3 text-2xs text-charcoal-400 dark:border-charcoal-800">
                  <span className="inline-flex items-center gap-1 font-mono">
                    <Fingerprint size={10} /> {p.verificationHash}
                  </span>
                  <span className="font-semibold text-brand-600 group-hover:underline">View passport</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <PassportModal passport={open} onClose={() => setOpen(null)} orders={orders} />
    </div>
  );
}

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-4">
      <div className="sr-eyebrow">{label}</div>
      <div className="sr-num mt-2 text-2xl leading-none">{value}</div>
      {hint ? <div className="mt-1.5 text-2xs text-charcoal-400">{hint}</div> : null}
    </Card>
  );
}

function PassportModal({
  passport,
  onClose,
  orders,
}: {
  passport: BatchPassport | null;
  onClose: () => void;
  orders: ReturnType<typeof useStore>['orders'];
}) {
  if (!passport) return null;
  const product = getProduct(passport.productId);
  const farm = getFarm(passport.farmId);
  const buyer = getBuyer(passport.buyerId);
  const order = orders.find((o) => o.id === passport.orderId);

  return (
    <Modal
      open={Boolean(passport)}
      onClose={onClose}
      title={`Batch Passport · ${passport.batchId}`}
      subtitle="Auditable record of origin, custody and impact"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button icon={<Printer size={15} />} onClick={() => window.print()}>
            Print for buyer
          </Button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <div className="rounded-xl bg-brand-gradient p-5 text-white">
            <div className="text-2xs font-semibold uppercase tracking-widest text-white/65">
              Verified local batch
            </div>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl leading-none">{product.emoji}</span>
              <div>
                <div className="font-display text-2xl font-bold leading-none">
                  {passport.qty.toLocaleString()}
                  <span className="ms-1 text-sm font-semibold text-white/70">{passport.unit}</span>
                </div>
                <div className="mt-1 text-sm font-semibold">{product.name}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-white/15 pt-3 font-mono text-2xs text-white/70">
              <Fingerprint size={12} /> {passport.verificationHash}
            </div>
          </div>

          <div className="mt-4">
            <DataRow label="Batch ID" value={<span className="font-mono">{passport.batchId}</span>} />
            <DataRow
              label="Order"
              value={
                order ? (
                  <Link to={`/orders/${order.id}`} className="hover:text-brand-700" onClick={onClose}>
                    {order.ref}
                  </Link>
                ) : (
                  '—'
                )
              }
            />
            <DataRow label="Grade" value={`Grade ${passport.grade}`} />
            <DataRow label="Farm" value={farm?.name ?? '—'} />
            <DataRow label="Buyer" value={buyer?.name ?? '—'} />
            <DataRow label="Harvested" value={formatDate(passport.harvestedOn, 'long')} />
            <DataRow label="Packed" value={formatDate(passport.packedOn, 'long')} />
            {passport.deliveredOn ? (
              <DataRow label="Delivered" value={formatDate(passport.deliveredOn, 'long')} />
            ) : null}
          </div>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-2">
            <ImpactTile
              icon={<MapPin size={14} />}
              label="Food miles"
              value={`${passport.distanceKm} km`}
            />
            <ImpactTile
              icon={<Leaf size={14} />}
              label="CO₂e avoided"
              value={`${passport.co2SavedKg} kg`}
            />
          </div>

          <div className="mt-3 rounded-xl border border-charcoal-100 p-3.5 dark:border-charcoal-800">
            <div className="flex items-center gap-2 text-2xs font-bold uppercase tracking-wider text-charcoal-500">
              <Droplets size={12} /> Water method
            </div>
            <p className="mt-1.5 text-xs text-charcoal-700 dark:text-charcoal-200">
              {passport.waterMethod}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {passport.certifications.map((c) => (
              <Badge key={c} tone="emerald" icon={<ShieldCheck size={10} />}>
                {c}
              </Badge>
            ))}
          </div>

          <div className="mt-4">
            <div className="sr-eyebrow mb-3">Chain of custody</div>
            <ol className="relative space-y-3 border-s border-charcoal-100 ps-5 dark:border-charcoal-800">
              {passport.checkpoints.map((c, i) => (
                <li key={i} className="relative">
                  <span className="absolute -start-[25px] mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-white">
                    <Check size={9} strokeWidth={3} />
                  </span>
                  <div className="text-xs font-bold text-charcoal-900 dark:text-white">{c.label}</div>
                  <div className="mt-0.5 text-2xs text-charcoal-400">
                    {c.at} · {c.by}
                  </div>
                  {c.note ? (
                    <div className="mt-1 rounded-md bg-canvas-soft px-2 py-1 text-2xs text-charcoal-600 dark:bg-charcoal-950 dark:text-charcoal-300">
                      {c.note}
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ImpactTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-charcoal-100 p-3 dark:border-charcoal-800">
      <div className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-charcoal-400">
        {icon} {label}
      </div>
      <div className="sr-num mt-1.5 text-lg">{value}</div>
    </div>
  );
}
