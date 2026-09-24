import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarClock, Check, Layers, PackageCheck } from 'lucide-react';
import { useStore } from '../state/AppStore';
import { Badge, Card, CardHeader, PageHeader, Progress } from '../components/ui';
import { getProduct } from '../data/products';
import { productPhoto } from '../data/media';
import { Avatar } from '../components/ui/Photo';
import { buyerName } from '../data/buyers';
import { formatAed, formatDate } from '../lib/metrics';
import { CycleStage } from '../types';

const STAGES: CycleStage[] = ['Demand capture', 'Commitment', 'Harvest', 'Fulfilment', 'Proof'];

const STAGE_COPY: Record<CycleStage, string> = {
  'Demand capture': 'Buyers submit and structure demand for the window.',
  Commitment: 'The engine allocates demand to farms before anything is planted or picked.',
  Harvest: 'Farms harvest against confirmed commitments on scheduled dates.',
  Fulfilment: 'Grading, packing, consolidation and cold-chain delivery.',
  Proof: 'Batch passports issued and the local procurement index updated.',
};

export function ProcurementCycles() {
  const { cycles, orders } = useStore();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Procurement"
        title="Procurement Cycles"
        subtitle="SooqRoot runs procurement in windows. Each cycle moves demand through commitment, harvest, fulfilment and proof."
        actions={
          <Badge tone="brand" icon={<Layers size={12} />}>
            {cycles.length} cycles
          </Badge>
        }
      />

      {/* ---------------- Stage rail ---------------- */}
      <Card>
        <CardHeader title="The cycle" subtitle="Demand → Commitment → Harvest → Fulfilment → Proof" icon={<CalendarClock size={16} />} />
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {STAGES.map((s, i) => (
            <div key={s} className="relative rounded-xl border border-charcoal-100 p-3.5 dark:border-charcoal-800">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-2xs font-bold text-white">
                {i + 1}
              </span>
              <div className="mt-2 text-xs font-bold text-charcoal-900 dark:text-white">{s}</div>
              <p className="mt-1 text-2xs leading-relaxed text-charcoal-500 dark:text-charcoal-400">
                {STAGE_COPY[s]}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* ---------------- Cycles ---------------- */}
      <div className="space-y-4">
        {cycles.map((cycle) => {
          const cycleOrders = orders.filter((o) => o.cycleId === cycle.id);
          const stageIdx = STAGES.indexOf(cycle.stage);
          return (
            <Card key={cycle.id} padded={false}>
              <div className="flex flex-col gap-4 border-b border-charcoal-100 p-5 dark:border-charcoal-800 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-2xs font-bold text-charcoal-400">{cycle.ref}</span>
                    <Badge
                      tone={
                        cycle.stage === 'Commitment'
                          ? 'brand'
                          : cycle.stage === 'Proof'
                            ? 'emerald'
                            : cycle.stage === 'Demand capture'
                              ? 'sky'
                              : 'violet'
                      }
                    >
                      {cycle.stage}
                    </Badge>
                  </div>
                  <h3 className="sr-h3 mt-1">{cycle.name}</h3>
                  <p className="sr-sub mt-0.5 text-xs">
                    {cycle.window} · opens {formatDate(cycle.opensOn)} · closes {formatDate(cycle.closesOn)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:text-end">
                  <div>
                    <div className="text-2xs uppercase tracking-wider text-charcoal-400">Demand</div>
                    <div className="sr-num mt-0.5 text-base">
                      {formatAed(cycle.demandValueAed, { compact: true })}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xs uppercase tracking-wider text-charcoal-400">Committed</div>
                    <div className="sr-num mt-0.5 text-base text-brand-700 dark:text-brand-300">
                      {formatAed(cycle.committedValueAed, { compact: true })}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xs uppercase tracking-wider text-charcoal-400">Coverage</div>
                    <div className="sr-num mt-0.5 text-base">{cycle.coveragePct}%</div>
                  </div>
                  <div>
                    <div className="text-2xs uppercase tracking-wider text-charcoal-400">Farms</div>
                    <div className="sr-num mt-0.5 text-base">{cycle.participatingFarms}</div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4">
                <div className="flex items-center gap-1">
                  {STAGES.map((s, i) => (
                    <React.Fragment key={s}>
                      <span
                        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                          i < stageIdx
                            ? 'bg-brand-600 text-white'
                            : i === stageIdx
                              ? 'border-2 border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-100'
                              : 'border-2 border-charcoal-200 text-charcoal-300 dark:border-charcoal-700'
                        }`}
                      >
                        {i < stageIdx ? <Check size={9} strokeWidth={3} /> : i + 1}
                      </span>
                      {i < STAGES.length - 1 ? (
                        <span
                          className={`h-0.5 flex-1 rounded-full ${
                            i < stageIdx ? 'bg-brand-500' : 'bg-charcoal-100 dark:bg-charcoal-800'
                          }`}
                        />
                      ) : null}
                    </React.Fragment>
                  ))}
                </div>
                <Progress value={cycle.coveragePct} tone={cycle.coveragePct >= 85 ? 'healthy' : 'attention'} className="mt-4" />

                {cycleOrders.length > 0 ? (
                  <div className="mt-4 min-w-0 overflow-x-auto">
                    <table className="sr-table min-w-[640px]">
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Buyer</th>
                          <th>Product</th>
                          <th className="text-end">Volume</th>
                          <th className="text-end">Committed</th>
                          <th>Delivery</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {cycleOrders.map((o) => {
                          const p = getProduct(o.productId);
                          return (
                            <tr key={o.id}>
                              <td className="font-mono text-2xs font-bold">{o.ref}</td>
                              <td className="max-w-[160px] truncate text-xs">{buyerName(o.buyerId)}</td>
                              <td className="text-xs">
                                <span className="inline-flex items-center gap-2">
                                  <Avatar src={productPhoto(o.productId, 48, 48)} alt={p.name} size={22} tint={p.color} fallback={p.emoji} />
                                  {p.name}
                                </span>
                              </td>
                              <td className="text-end text-xs tabular-nums">
                                {o.qty.toLocaleString()} {o.unit}
                              </td>
                              <td className="text-end text-xs font-semibold tabular-nums">
                                {Math.round((o.committedQty / o.qty) * 100)}%
                              </td>
                              <td className="text-xs tabular-nums">{formatDate(o.requiredBy)}</td>
                              <td className="text-end">
                                <Link
                                  to={`/orders/${o.id}`}
                                  className="inline-flex items-center gap-1 text-2xs font-semibold text-charcoal-400 transition hover:text-brand-700"
                                >
                                  Open <ArrowRight size={11} />
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-charcoal-200 p-5 text-center dark:border-charcoal-700">
                    <PackageCheck size={20} className="mx-auto text-charcoal-300" />
                    <p className="mt-2 text-xs font-semibold text-charcoal-600 dark:text-charcoal-300">
                      No orders in this cycle yet
                    </p>
                    <p className="mt-0.5 text-2xs text-charcoal-400">
                      Demand capture opens {formatDate(cycle.opensOn, 'long')}.
                    </p>
                    <Link to="/demand" className="sr-btn-secondary mt-3 text-xs">
                      Capture demand <ArrowRight size={13} />
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
