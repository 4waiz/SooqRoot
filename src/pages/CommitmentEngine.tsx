import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  Cpu,
  Layers,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
} from 'lucide-react';
import { useStore } from '../state/AppStore';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  HEALTH_HEX,
  PageHeader,
  Progress,
  Select,
} from '../components/ui';
import { PRODUCTS, getProduct } from '../data/products';
import { FARM_MAP } from '../data/farms';
import { networkWithout } from '../data/orders';
import {
  CANONICAL_REQUEST,
  CONCENTRATION_CAP,
  BACKUP_CAP,
  EngineRequest,
  EngineResult,
  runCommitmentEngine,
} from '../lib/engine';
import { formatAed, formatDate } from '../lib/metrics';
import { Grade } from '../types';

const SIGNAL_LABELS: Record<string, string> = {
  reliability: 'Reliability',
  fulfilment: 'Fulfilment history',
  grade: 'Grade fit',
  proximity: 'Distance',
  harvest: 'Harvest date fit',
  packaging: 'Packaging',
  headroom: 'Headroom',
};

export function CommitmentEngine() {
  const { orders, commitOrder, pushActivity } = useStore();

  const [req, setReq] = useState<EngineRequest>(CANONICAL_REQUEST);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [traceShown, setTraceShown] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [issued, setIssued] = useState(false);
  const timers = useRef<number[]>([]);

  const network = useMemo(() => networkWithout(req.orderRef), [req.orderRef]);
  const result: EngineResult = useMemo(() => runCommitmentEngine(req, network), [req, network]);
  const product = getProduct(req.productId);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const reset = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    setPhase('idle');
    setTraceShown(0);
    setRevealed(0);
    setIssued(false);
  };

  const run = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    setPhase('running');
    setTraceShown(0);
    setRevealed(0);
    setIssued(false);

    result.trace.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setTraceShown(i + 1), 320 * (i + 1)));
    });

    const afterTrace = 320 * result.trace.length + 200;
    const allocations = [...result.primary, ...result.backup];
    allocations.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setRevealed(i + 1), afterTrace + 180 * i));
    });
    timers.current.push(
      window.setTimeout(() => setPhase('done'), afterTrace + 180 * allocations.length + 120)
    );
  };

  const matchingOrder = orders.find(
    (o) => o.productId === req.productId && o.qty === req.qty && o.requiredBy === req.requiredBy
  );

  const issue = () => {
    if (matchingOrder) {
      commitOrder(matchingOrder.id, [...result.primary, ...result.backup], result.primaryQty + result.backupQty);
      pushActivity({
        kind: 'commitment',
        title: `Commitment pack issued for ${matchingOrder.ref}`,
        detail: `${result.primary.length} primary farms · ${result.backup.length} backup · ${result.coveragePct}% coverage`,
        actor: 'Commitment engine',
      });
    }
    setIssued(true);
  };

  const allAllocations = [...result.primary, ...result.backup];
  const visible = phase === 'idle' ? [] : allAllocations.slice(0, revealed);
  const showAll = phase === 'done';

  const value = result.primaryQty * product.refPrice;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Procurement"
        title="Commitment Engine"
        subtitle="Deterministic pre-harvest allocation. One buyer order is split across the farm network under explicit supply-risk rules — the same inputs always produce the same commitment pack."
        actions={
          <>
            {phase !== 'idle' ? (
              <Button variant="secondary" icon={<RotateCcw size={15} />} onClick={reset}>
                Reset
              </Button>
            ) : null}
            <Button icon={<Play size={15} />} onClick={run} loading={phase === 'running'}>
              {phase === 'running' ? 'Allocating' : 'Run Commitment Engine'}
            </Button>
          </>
        }
      />

      {/* ---------------- Order + rules ---------------- */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,380px)_1fr]">
        <Card>
          <CardHeader title="Buyer order" subtitle="The request being allocated" icon={<Target size={16} />} />
          <div className="mt-4 rounded-xl bg-brand-gradient p-5 text-white">
            <div className="flex items-center gap-2 text-2xs font-semibold uppercase tracking-widest text-white/70">
              <span className="font-mono">{req.orderRef}</span>
              <span>·</span>
              <span>Grade {req.grade}</span>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl leading-none">{product.emoji}</span>
              <div>
                <div className="font-display text-3xl font-bold leading-none tracking-tight">
                  {req.qty.toLocaleString()}
                  <span className="ms-1 text-base font-semibold text-white/70">{req.unit}</span>
                </div>
                <div className="mt-1 text-sm font-semibold text-white/85">{product.name}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/15 pt-3 text-xs">
              <div>
                <div className="text-white/60">Required by</div>
                <div className="font-semibold">{formatDate(req.requiredBy, 'long')}</div>
              </div>
              <div>
                <div className="text-white/60">Packaging</div>
                <div className="font-semibold">{req.packaging}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Select
              label="Product"
              value={req.productId}
              onChange={(e) => {
                reset();
                setReq((r) => ({
                  ...r,
                  productId: e.target.value,
                  unit: getProduct(e.target.value).unit,
                }));
              }}
            >
              {PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            <Select
              label="Grade"
              value={req.grade}
              onChange={(e) => {
                reset();
                setReq((r) => ({ ...r, grade: e.target.value as Grade }));
              }}
            >
              {(['A', 'B', 'Mixed'] as Grade[]).map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </Select>
            <div>
              <label className="sr-label" htmlFor="ce-qty">
                Quantity
              </label>
              <input
                id="ce-qty"
                type="number"
                min={100}
                step={100}
                value={req.qty}
                onChange={(e) => {
                  reset();
                  setReq((r) => ({ ...r, qty: Number(e.target.value) || 0 }));
                }}
                className="sr-input focus:ring-brand-300"
              />
            </div>
            <div>
              <label className="sr-label" htmlFor="ce-date">
                Required by
              </label>
              <input
                id="ce-date"
                type="date"
                value={req.requiredBy}
                onChange={(e) => {
                  reset();
                  setReq((r) => ({ ...r, requiredBy: e.target.value }));
                }}
                className="sr-input focus:ring-brand-300"
              />
            </div>
          </div>
        </Card>

        {/* ---------------- Allocation ---------------- */}
        <Card className="flex flex-col">
          <CardHeader
            title="Allocation across the farm network"
            subtitle={
              phase === 'idle'
                ? 'Run the engine to split this order across farms'
                : `${result.primary.length} primary farms · ${result.backup.length} backup`
            }
            icon={<Layers size={16} />}
            action={
              showAll ? (
                <Badge tone={result.coveragePct >= 100 ? 'emerald' : result.coveragePct >= 80 ? 'amber' : 'rose'}>
                  {result.coveragePct}% coverage
                </Badge>
              ) : null
            }
          />

          {phase === 'idle' ? (
            <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-charcoal-200 py-14 text-center dark:border-charcoal-700">
              <Cpu size={30} className="text-charcoal-300 dark:text-charcoal-600" />
              <p className="mt-3 max-w-sm text-sm font-semibold text-charcoal-600 dark:text-charcoal-300">
                {result.candidates.length} harvest windows in the network can serve this order
              </p>
              <p className="sr-sub mt-1 max-w-sm text-xs">
                The engine scores each on reliability, fulfilment history, grade fit, distance, harvest
                timing, packaging and headroom — then splits the order under the concentration limit.
              </p>
              <Button className="mt-5" icon={<Play size={15} />} onClick={run}>
                Run Commitment Engine
              </Button>
            </div>
          ) : (
            <>
              <div className="mt-4 space-y-2">
                {visible.map((a, i) => {
                  const farm = FARM_MAP[a.farmId];
                  if (!farm) return null;
                  const share = (a.qty / req.qty) * 100;
                  const isBackup = a.role === 'backup';
                  return (
                    <div
                      key={a.id}
                      className={`rounded-xl border p-3.5 animate-in ${
                        isBackup
                          ? 'border-dashed border-sand-300 bg-sand-50 dark:border-sand-600 dark:bg-sand-600/10'
                          : 'border-charcoal-100 bg-white dark:border-charcoal-800 dark:bg-charcoal-900'
                      }`}
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-canvas-soft font-mono text-2xs font-bold text-charcoal-500 dark:bg-charcoal-950">
                          {isBackup ? 'B' : i + 1}
                        </span>
                        <Link
                          to={`/farms/${farm.id}`}
                          className="min-w-0 flex-1 truncate text-sm font-bold text-charcoal-900 hover:text-brand-700 dark:text-white"
                        >
                          {farm.name}
                        </Link>
                        <Badge tone={isBackup ? 'sand' : 'brand'}>{isBackup ? 'Backup' : 'Primary'}</Badge>
                        <span className="sr-num text-lg">
                          {a.qty.toLocaleString()}
                          <span className="ms-1 text-2xs font-semibold text-charcoal-400">{a.unit}</span>
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-3">
                        <Progress
                          value={share * (100 / (CONCENTRATION_CAP * 100))}
                          tone={isBackup ? 'attention' : 'healthy'}
                          height="h-1.5"
                          className="flex-1"
                        />
                        <span className="shrink-0 text-2xs font-semibold tabular-nums text-charcoal-400">
                          {share.toFixed(1)}% of order
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-charcoal-400">
                        <span className="font-mono">{a.batchId}</span>
                        <span>·</span>
                        <span>Score {a.score.toFixed(1)}</span>
                        <span>·</span>
                        <span>Harvest {formatDate(a.harvestDate)}</span>
                        <span>·</span>
                        <span>{farm.distanceKm} km</span>
                        <span>·</span>
                        <span>{farm.fulfilmentRate}% fulfilment</span>
                      </div>

                      {showAll ? (
                        <p className="mt-2 border-t border-charcoal-50 pt-2 text-2xs leading-relaxed text-charcoal-500 dark:border-charcoal-800 dark:text-charcoal-400">
                          {a.rationale[a.rationale.length - 1]}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {showAll ? (
                <div className="mt-4 grid gap-3 border-t border-charcoal-100 pt-4 dark:border-charcoal-800 sm:grid-cols-4">
                  <Totals label="Total primary commitment" value={result.primaryQty} unit={req.unit} tone="#2a714c" />
                  <Totals label="Backup cover" value={result.backupQty} unit={req.unit} tone="#b07f3e" />
                  <Totals
                    label="Fulfilment coverage"
                    value={result.coveragePct}
                    unit="%"
                    tone={result.coveragePct >= 100 ? '#2a714c' : '#c99c57'}
                  />
                  <Totals
                    label="Committed value"
                    value={value}
                    unit=""
                    tone="#2f6f8a"
                    format={(v) => formatAed(v, { compact: true })}
                  />
                </div>
              ) : null}

              {showAll ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-canvas-soft p-3.5 dark:bg-charcoal-950">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={18} className="text-brand-600" />
                    <div>
                      <div className="text-xs font-bold text-charcoal-800 dark:text-charcoal-100">
                        {issued ? 'Commitment pack issued' : 'Commitment pack ready'}
                      </div>
                      <div className="text-2xs text-charcoal-400">
                        {issued
                          ? `${result.farmsEngaged} farms notified through the Farmer Copilot.`
                          : `${result.farmsEngaged} farms · ${formatAed(value, { compact: true })} · issue to lock pre-harvest commitments.`}
                      </div>
                    </div>
                  </div>
                  {issued ? (
                    <Link to="/copilot" className="sr-btn-secondary !py-2 text-xs">
                      Open Farmer Copilot <ChevronRight size={14} />
                    </Link>
                  ) : (
                    <Button size="sm" icon={<Send size={14} />} onClick={issue}>
                      Issue commitments
                    </Button>
                  )}
                </div>
              ) : null}
            </>
          )}
        </Card>
      </section>

      {/* ---------------- Trace + scoring ---------------- */}
      <section className="grid gap-4 xl:grid-cols-[1fr_minmax(0,420px)]">
        <Card padded={false}>
          <div className="p-5 pb-0">
            <CardHeader
              title="Engine trace"
              subtitle="Every decision the allocator made, in order"
              icon={<Terminal size={16} />}
            />
          </div>
          <div className="mt-4 space-y-0 px-5 pb-5">
            {result.trace.map((line, i) => {
              const shown = phase === 'idle' ? false : i < traceShown;
              return (
                <div
                  key={i}
                  className={`flex gap-3 border-s-2 py-2.5 ps-4 transition-all duration-300 ${
                    shown
                      ? 'border-brand-500 opacity-100'
                      : 'border-charcoal-100 opacity-30 dark:border-charcoal-800'
                  }`}
                >
                  <span className="font-mono text-2xs font-bold text-charcoal-300 dark:text-charcoal-600">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs leading-relaxed text-charcoal-700 dark:text-charcoal-300">
                    {line}
                  </span>
                </div>
              );
            })}
            {phase === 'idle' ? (
              <p className="mt-2 text-2xs italic text-charcoal-400">
                Trace appears step by step when the engine runs.
              </p>
            ) : null}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Supply-risk rules" subtitle="Applied to every allocation" icon={<ShieldCheck size={16} />} />
            <div className="mt-4 space-y-3">
              <RuleRow
                title="Concentration limit"
                value={`${Math.round(CONCENTRATION_CAP * 100)}%`}
                body="No single farm carries more than this share of one order — but never less than an even split across the eligible pool, so the cap can never cause an under-fill."
              />
              <RuleRow
                title="Backup cover limit"
                value={`${Math.round(BACKUP_CAP * 100)}%`}
                body="Backup farms stand behind at most this share each. Backup cover is contingent — it does not consume network capacity."
              />
              <RuleRow
                title="Freshness gate"
                value={`${product.shelfLifeDays} days`}
                body={`Harvest windows closing more than ${product.shelfLifeDays} days before delivery cannot serve this order at all.`}
              />
              <RuleRow
                title="Primary gate"
                value="Grade ≥ 60%"
                body="Farms whose harvest window closes after the delivery date, or whose grade probability falls below 60%, are held as backup rather than primary."
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Scoring model"
              subtitle="Weighted signals behind every farm rank"
              icon={<Sparkles size={16} />}
            />
            <div className="mt-4 space-y-2.5">
              {(result.candidates[0]?.signals ?? []).map((s) => (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="w-[112px] shrink-0 text-2xs font-semibold text-charcoal-600 dark:text-charcoal-300">
                    {SIGNAL_LABELS[s.key] ?? s.label}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-charcoal-100 dark:bg-charcoal-800">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${s.weight * 100 * 4.55}%` }}
                    />
                  </div>
                  <span className="w-9 shrink-0 text-end font-mono text-2xs font-bold tabular-nums text-charcoal-500">
                    {Math.round(s.weight * 100)}%
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 border-t border-charcoal-100 pt-3 text-2xs leading-relaxed text-charcoal-400 dark:border-charcoal-800">
              Weights sum to 100. The engine is fully deterministic — no randomness anywhere in the
              allocation path.
            </p>
          </Card>
        </div>
      </section>

      {/* ---------------- Candidate table ---------------- */}
      <Card padded={false}>
        <div className="p-5 pb-0">
          <CardHeader
            title="Scored candidates"
            subtitle={`Every harvest window in the network evaluated for this order`}
          />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="sr-table min-w-[900px]">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Farm</th>
                <th>Harvest window</th>
                <th>Available</th>
                <th>Grade {req.grade}</th>
                <th>Distance</th>
                <th>Fulfilment</th>
                <th>Score</th>
                <th>Pool</th>
              </tr>
            </thead>
            <tbody>
              {result.candidates.map((c, i) => {
                const allocated = allAllocations.find((a) => a.farmId === c.farm.id);
                return (
                  <tr key={`${c.farm.id}-${c.line.harvestWindowStart}`}>
                    <td className="font-mono text-2xs text-charcoal-400">{i + 1}</td>
                    <td>
                      <Link
                        to={`/farms/${c.farm.id}`}
                        className="text-xs font-semibold hover:text-brand-700"
                      >
                        {c.farm.name}
                      </Link>
                      <div className="text-2xs text-charcoal-400">{c.farm.area}</div>
                    </td>
                    <td className="text-2xs tabular-nums">
                      {formatDate(c.line.harvestWindowStart)} – {formatDate(c.line.harvestWindowEnd)}
                    </td>
                    <td className="text-xs font-semibold tabular-nums">
                      {c.available.toLocaleString()} {c.line.unit}
                    </td>
                    <td className="text-xs tabular-nums">
                      {req.grade === 'A'
                        ? c.line.gradeProbability.A
                        : req.grade === 'B'
                          ? c.line.gradeProbability.A + c.line.gradeProbability.B
                          : 100}
                      %
                    </td>
                    <td className="text-xs tabular-nums">{c.farm.distanceKm} km</td>
                    <td className="text-xs tabular-nums">{c.farm.fulfilmentRate}%</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold tabular-nums">
                          {c.score.toFixed(1)}
                        </span>
                        <span className="h-1 w-12 overflow-hidden rounded-full bg-charcoal-100 dark:bg-charcoal-800">
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: `${c.score}%`,
                              background: c.eligibility === 'primary' ? HEALTH_HEX.healthy : HEALTH_HEX.attention,
                            }}
                          />
                        </span>
                      </div>
                    </td>
                    <td>
                      {allocated ? (
                        <Badge tone={allocated.role === 'primary' ? 'emerald' : 'sand'}>
                          <Check size={10} /> {allocated.qty.toLocaleString()}
                        </Badge>
                      ) : (
                        <Badge tone="neutral">{c.eligibility}</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Totals({
  label,
  value,
  unit,
  tone,
  format,
}: {
  label: string;
  value: number;
  unit: string;
  tone: string;
  format?: (v: number) => string;
}) {
  return (
    <div className="rounded-xl border border-charcoal-100 p-3 dark:border-charcoal-800">
      <div className="text-2xs uppercase tracking-wider text-charcoal-400">{label}</div>
      <div className="sr-num mt-1 text-xl" style={{ color: tone }}>
        {format ? format(value) : value.toLocaleString()}
        {unit ? <span className="ms-1 text-2xs font-semibold text-charcoal-400">{unit}</span> : null}
      </div>
    </div>
  );
}

function RuleRow({ title, value, body }: { title: string; value: string; body: string }) {
  return (
    <div className="rounded-xl bg-canvas-soft p-3 dark:bg-charcoal-950">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-charcoal-800 dark:text-charcoal-100">{title}</span>
        <span className="font-mono text-xs font-bold text-brand-700 dark:text-brand-200">{value}</span>
      </div>
      <p className="mt-1 text-2xs leading-relaxed text-charcoal-500 dark:text-charcoal-400">{body}</p>
    </div>
  );
}
