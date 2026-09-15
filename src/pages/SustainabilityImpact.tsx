import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Droplets,
  Leaf,
  Package,
  Recycle,
  Route,
  ShieldCheck,
  Sprout,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStore } from '../state/AppStore';
import { Badge, Card, CardHeader, PageHeader, Progress } from '../components/ui';
import { ChartTooltip } from '../components/viz/ChartTooltip';
import { IMPACT, MONTHLY } from '../data/analytics';
import { BATCH_PASSPORTS } from '../data/operations';
import { formatAed } from '../lib/metrics';

export function SustainabilityImpact() {
  const { farms, metrics } = useStore();

  const trend = MONTHLY.map((m) => ({
    month: m.month,
    co2: Math.round(m.co2SavedKg / 1000),
    water: Math.round(m.waterSavedM3),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Intelligence"
        title="Sustainability Impact"
        subtitle="What shortening the food supply chain actually delivers — measured per batch, rolled up across the network."
        actions={
          <Badge tone="emerald" icon={<Leaf size={12} />}>
            Year to date
          </Badge>
        }
      />

      {/* ---------------- Headline impact ---------------- */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ImpactCard
          icon={<Leaf size={17} />}
          label="CO₂e avoided"
          value={`${(IMPACT.co2SavedKgYtd / 1000).toFixed(1)}t`}
          hint="vs an imported-equivalent baseline"
          accent="#2a714c"
        />
        <ImpactCard
          icon={<Droplets size={17} />}
          label="Water saved"
          value={`${IMPACT.waterSavedM3Ytd.toLocaleString()} m³`}
          hint="through efficient local irrigation methods"
          accent="#2f6f8a"
        />
        <ImpactCard
          icon={<Route size={17} />}
          label="Food miles avoided"
          value={`${(IMPACT.foodMilesAvoidedKm / 1000).toLocaleString()}K km`}
          hint="freight distance removed from the chain"
          accent="#b07f3e"
        />
        <ImpactCard
          icon={<Users size={17} />}
          label="Farmgate income"
          value={formatAed(IMPACT.farmIncomeAedYtd, { compact: true })}
          hint={`across ${IMPACT.smallholdersEngaged} UAE producers`}
          accent="#5ca87e"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_minmax(0,360px)]">
        <Card>
          <CardHeader
            title="Impact over 12 months"
            subtitle="CO₂e avoided (tonnes) and water saved (m³) per month"
            icon={<Leaf size={16} />}
          />
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="imp-co2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2a714c" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#2a714c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="imp-water" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2f6f8a" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#2f6f8a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis yAxisId="l" tickLine={false} axisLine={false} width={34} />
                <YAxis yAxisId="r" orientation="right" tickLine={false} axisLine={false} width={44} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  yAxisId="l"
                  type="monotone"
                  dataKey="co2"
                  name="CO₂e avoided (t)"
                  stroke="#2a714c"
                  strokeWidth={2.2}
                  fill="url(#imp-co2)"
                />
                <Area
                  yAxisId="r"
                  type="monotone"
                  dataKey="water"
                  name="Water saved (m³)"
                  stroke="#2f6f8a"
                  strokeWidth={2}
                  fill="url(#imp-water)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Circularity" subtitle="Packaging and waste" icon={<Recycle size={16} />} />
            <div className="mt-4 space-y-4">
              <Stat
                label="Reusable crates in circulation"
                value={IMPACT.reusableCratesInCirculation.toLocaleString()}
                progress={78}
                caption="78% of network volume now moves in reusable packaging"
              />
              <Stat
                label="Post-harvest wastage reduction"
                value={`${IMPACT.wastageReductionPct}%`}
                progress={IMPACT.wastageReductionPct}
                caption="Pre-harvest commitment removes the guesswork that drives over-planting"
              />
              <Stat
                label="Average farmgate price uplift"
                value={`+${IMPACT.avgFarmgatePriceUpliftPct}%`}
                progress={IMPACT.avgFarmgatePriceUpliftPct * 3}
                caption="vs the spot market rate producers previously accepted"
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Proof of sourcing"
              subtitle="Every delivered batch is evidenced"
              icon={<ShieldCheck size={16} />}
            />
            <div className="mt-3 space-y-2">
              {BATCH_PASSPORTS.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl bg-canvas-soft p-3 dark:bg-charcoal-950"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200">
                    <Package size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-2xs font-bold text-charcoal-500">
                      {p.batchId}
                    </div>
                    <div className="text-2xs text-charcoal-400">
                      {p.distanceKm} km · {p.co2SavedKg} kg CO₂e avoided
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/passports" className="sr-btn-secondary mt-3 w-full text-xs">
              All batch passports <ArrowRight size={13} />
            </Link>
          </Card>
        </div>
      </section>

      {/* ---------------- Producer impact ---------------- */}
      <Card>
        <CardHeader
          title="Producer impact"
          subtitle="What pre-harvest commitment changes for a farm"
          icon={<Sprout size={16} />}
        />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Narrative
            title="Certainty before planting"
            body="A confirmed commitment before the crop is in the ground lets a producer plan labour, inputs and cash flow instead of gambling on the spot market."
          />
          <Narrative
            title="Fewer intermediaries"
            body={`Buyer demand reaches the farm directly. Farmgate prices in the network sit ${IMPACT.avgFarmgatePriceUpliftPct}% above the spot rate producers previously accepted.`}
          />
          <Narrative
            title="Less waste, shorter chain"
            body={`Average delivery distance across the network is under 30 km. Post-harvest wastage is down ${IMPACT.wastageReductionPct}% because volume is matched to demand before harvest.`}
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MiniStat label="Producers engaged" value={farms.length.toString()} />
          <MiniStat
            label="Avg distance to buyer"
            value={`${(farms.reduce((s, f) => s + f.distanceKm, 0) / farms.length).toFixed(1)} km`}
          />
          <MiniStat label="Local procurement index" value={`${metrics.lpiCurrent}%`} />
          <MiniStat label="Network fill rate" value={`${metrics.expectedFillPct}%`} />
        </div>
      </Card>
    </div>
  );
}

function ImpactCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <Card className="relative overflow-hidden p-5">
      <span
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ background: accent }}
      />
      <span
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: `${accent}16`, color: accent }}
      >
        {icon}
      </span>
      <div className="sr-num mt-3 text-2xl leading-none">{value}</div>
      <div className="mt-1.5 text-xs font-semibold text-charcoal-700 dark:text-charcoal-200">{label}</div>
      <div className="mt-1 text-2xs leading-relaxed text-charcoal-400">{hint}</div>
    </Card>
  );
}

function Stat({
  label,
  value,
  progress,
  caption,
}: {
  label: string;
  value: string;
  progress: number;
  caption: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-200">{label}</span>
        <span className="sr-num text-base">{value}</span>
      </div>
      <Progress value={Math.min(100, progress)} tone="healthy" height="h-1.5" className="mt-2" />
      <p className="mt-1.5 text-2xs leading-relaxed text-charcoal-400">{caption}</p>
    </div>
  );
}

function Narrative({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-charcoal-100 p-4 dark:border-charcoal-800">
      <div className="text-xs font-bold text-charcoal-900 dark:text-white">{title}</div>
      <p className="mt-1.5 text-2xs leading-relaxed text-charcoal-500 dark:text-charcoal-400">{body}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-canvas-soft p-3.5 dark:bg-charcoal-950">
      <div className="text-2xs uppercase tracking-wider text-charcoal-400">{label}</div>
      <div className="sr-num mt-1 text-lg">{value}</div>
    </div>
  );
}
