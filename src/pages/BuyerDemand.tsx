import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ClipboardList,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
  Zap,
} from 'lucide-react';
import { useStore } from '../state/AppStore';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Input,
  PageHeader,
  Progress,
  Select,
  Textarea,
} from '../components/ui';
import { PRODUCTS, getProduct } from '../data/products';
import { productPhoto } from '../data/media';
import { Avatar } from '../components/ui/Photo';
import { DEMAND_PRESETS } from '../data/demand';
import { formatAed, formatDate } from '../lib/metrics';
import { translateDemand, TranslationResult, TRANSLATOR_SAMPLES } from '../lib/translator';
import { Demand, DemandLine, Grade, Unit } from '../types';

const PACKAGING_OPTIONS = [
  '5kg reusable crates',
  '10kg cartons',
  'Vented crates',
  'Cold-chain totes',
  'Clamshell',
  'Punnets',
  '1kg gift boxes',
  'Iced cooler boxes',
];

const FREQUENCIES: DemandLine['frequency'][] = ['One-off', 'Weekly', 'Twice weekly', 'Daily'];

const LOCATIONS = [
  'Al Ain. Central Kitchen',
  'Abu Dhabi. Mussafah DC',
  'Abu Dhabi. Corniche',
  'Dubai. Al Quoz DC',
  'Dubai. The Sustainable City',
];

const ORIGINS = [
  'UAE only',
  'UAE. Al Ain Region preferred',
  'UAE preferred, GCC acceptable',
  'UAE only, sub-100km preferred',
];

interface DraftLine {
  key: string;
  productId: string;
  qty: number;
  unit: Unit;
  grade: Grade;
  packaging: string;
  requiredBy: string;
  frequency: DemandLine['frequency'];
  deliveryLocation: string;
  preferredOrigin: string;
  notes: string;
}

function blankLine(): DraftLine {
  return {
    key: `l-${Math.random().toString(36).slice(2, 8)}`,
    productId: 'p-tomato',
    qty: 1000,
    unit: 'kg',
    grade: 'A',
    packaging: '5kg reusable crates',
    requiredBy: '2026-10-22',
    frequency: 'Weekly',
    deliveryLocation: LOCATIONS[1],
    preferredOrigin: ORIGINS[0],
    notes: '',
  };
}

export function BuyerDemand() {
  const { buyers, demands, addDemand, approveDemand, pushActivity } = useStore();
  const [params, setParams] = useSearchParams();

  const [buyerId, setBuyerId] = useState(params.get('buyer') ?? buyers[0].id);
  const [title, setTitle] = useState('');
  const [lines, setLines] = useState<DraftLine[]>([blankLine()]);
  const [justApproved, setJustApproved] = useState<string | null>(null);

  useEffect(() => {
    if (params.get('buyer')) {
      setBuyerId(params.get('buyer')!);
      params.delete('buyer');
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buyer = buyers.find((b) => b.id === buyerId) ?? buyers[0];

  const draftValue = lines.reduce((s, l) => s + l.qty * getProduct(l.productId).refPrice, 0);

  const updateLine = (key: string, patch: Partial<DraftLine>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const applyPreset = (presetId: string) => {
    const preset = DEMAND_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setBuyerId(preset.buyerId);
    setTitle(preset.label);
    setLines(
      preset.lines.map((l) => ({
        ...blankLine(),
        productId: l.productId,
        qty: l.qty,
        unit: getProduct(l.productId).unit,
        grade: l.grade,
        packaging: l.packaging,
        requiredBy: l.requiredBy,
        frequency: l.frequency,
        deliveryLocation:
          LOCATIONS.find((loc) => loc.includes(preset.buyerId.includes('jebel') ? 'Al Ain' : 'DC')) ??
          LOCATIONS[1],
      }))
    );
  };

  const submitDemand = (
    source: Demand['source'],
    extra?: { rawText?: string; aiConfidence?: number; aiNotes?: string[] }
  ) => {
    const ref = `DM-${Math.floor(2620 + Math.random() * 79)}`;
    const demand: Demand = {
      id: `dem-${Date.now()}`,
      ref,
      buyerId,
      title: title.trim() || `${buyer.name}, ${getProduct(lines[0].productId).name} programme`,
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'approved',
      source,
      rawText: extra?.rawText,
      aiConfidence: extra?.aiConfidence,
      aiNotes: extra?.aiNotes,
      lines: lines.map((l, i) => ({
        id: `${ref}-${i + 1}`,
        productId: l.productId,
        qty: l.qty,
        unit: l.unit,
        grade: l.grade,
        packaging: l.packaging,
        requiredBy: l.requiredBy,
        frequency: l.frequency,
        deliveryLocation: l.deliveryLocation,
        preferredOrigin: l.preferredOrigin,
        notes: l.notes || undefined,
      })),
    };
    addDemand(demand);
    pushActivity({
      kind: 'demand',
      title: `${buyer.name} submitted ${lines.reduce((s, l) => s + l.qty, 0).toLocaleString()} ${lines[0].unit} of demand`,
      detail: `${demand.ref} · ${lines.length} line${lines.length > 1 ? 's' : ''} · ${source}`,
      actor: buyer.contactName,
    });
    setJustApproved(demand.ref);
    window.setTimeout(() => setJustApproved(null), 4000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Procurement"
        title="Buyer Demand"
        subtitle="Capture commercial demand in the buyer's own language, structure it, and release it into the procurement cycle."
        actions={
          <Badge tone="brand" icon={<ClipboardList size={12} />}>
            {demands.length} demand records
          </Badge>
        }
      />

      {justApproved ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-900 dark:text-brand-100 animate-in">
          <Check size={16} />
          Demand {justApproved} approved and added to the October 2026 procurement pipeline.
        </div>
      ) : null}

      <AiTranslator
        onApply={(result) => {
          if (!result.productId || !result.qty) return;
          setLines([
            {
              ...blankLine(),
              productId: result.productId,
              qty: result.qty,
              unit: result.unit,
              grade: result.grade,
              packaging: result.packaging,
              requiredBy: result.requiredBy,
              frequency: result.frequency,
            },
          ]);
        }}
        onApprove={(result) => {
          if (!result.productId || !result.qty) return;
          setLines([
            {
              ...blankLine(),
              productId: result.productId,
              qty: result.qty,
              unit: result.unit,
              grade: result.grade,
              packaging: result.packaging,
              requiredBy: result.requiredBy,
              frequency: result.frequency,
            },
          ]);
          window.setTimeout(
            () =>
              submitDemand('AI translator', {
                rawText: result.rawText,
                aiConfidence: result.confidence,
                aiNotes: result.notes,
              }),
            80
          );
        }}
      />

      {/* ---------------- Manual builder ---------------- */}
      <Card>
        <CardHeader
          title="Structured demand builder"
          subtitle="Build or refine a demand record line by line"
          icon={<ClipboardList size={16} />}
          action={
            <div className="flex flex-wrap items-center gap-1.5">
              {DEMAND_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  title={p.description}
                  className="sr-chip transition hover:border-brand-300 hover:text-brand-700"
                >
                  <Zap size={11} />
                  {p.label}
                </button>
              ))}
            </div>
          }
        />

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Select label="Buyer" value={buyerId} onChange={(e) => setBuyerId(e.target.value)}>
            {buyers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}, {b.segment}
              </option>
            ))}
          </Select>
          <Input
            label="Demand title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="October produce programme"
            containerClassName="md:col-span-2"
          />
        </div>

        <div className="mt-5 space-y-3">
          {lines.map((l, idx) => {
            const product = getProduct(l.productId);
            return (
              <div
                key={l.key}
                className="rounded-xl border border-charcoal-100 bg-canvas-soft p-4 dark:border-charcoal-800 dark:bg-charcoal-950"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-charcoal-700 dark:text-charcoal-200">
                    <Avatar src={productPhoto(l.productId, 64, 64)} alt={product.name} size={26} tint={product.color} fallback={product.emoji} />
                    Line {idx + 1}
                    <span className="font-mono text-2xs font-medium text-charcoal-400">
                      {formatAed(l.qty * product.refPrice, { compact: true })}
                    </span>
                  </span>
                  {lines.length > 1 ? (
                    <button
                      onClick={() => setLines((p) => p.filter((x) => x.key !== l.key))}
                      className="rounded-lg p-1.5 text-charcoal-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900"
                      aria-label="Remove line"
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Select
                    label="Product"
                    value={l.productId}
                    onChange={(e) =>
                      updateLine(l.key, {
                        productId: e.target.value,
                        unit: getProduct(e.target.value).unit,
                      })
                    }
                  >
                    {PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Select>
                  <Input
                    label="Quantity"
                    type="number"
                    min={0}
                    value={l.qty}
                    onChange={(e) => updateLine(l.key, { qty: Number(e.target.value) || 0 })}
                  />
                  <Select
                    label="Unit"
                    value={l.unit}
                    onChange={(e) => updateLine(l.key, { unit: e.target.value as Unit })}
                  >
                    {(['kg', 'crates', 'boxes', 'jars'] as Unit[]).map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </Select>
                  <Select
                    label="Grade"
                    value={l.grade}
                    onChange={(e) => updateLine(l.key, { grade: e.target.value as Grade })}
                  >
                    {(['A', 'B', 'Mixed'] as Grade[]).map((g) => (
                      <option key={g} value={g}>
                        Grade {g}
                      </option>
                    ))}
                  </Select>
                  <Input
                    label="Required delivery date"
                    type="date"
                    value={l.requiredBy}
                    onChange={(e) => updateLine(l.key, { requiredBy: e.target.value })}
                  />
                  <Select
                    label="Packaging"
                    value={l.packaging}
                    onChange={(e) => updateLine(l.key, { packaging: e.target.value })}
                  >
                    {PACKAGING_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Select>
                  <Select
                    label="Delivery frequency"
                    value={l.frequency}
                    onChange={(e) =>
                      updateLine(l.key, { frequency: e.target.value as DemandLine['frequency'] })
                    }
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </Select>
                  <Select
                    label="Delivery location"
                    value={l.deliveryLocation}
                    onChange={(e) => updateLine(l.key, { deliveryLocation: e.target.value })}
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </Select>
                  <Select
                    label="Preferred origin"
                    value={l.preferredOrigin}
                    onChange={(e) => updateLine(l.key, { preferredOrigin: e.target.value })}
                    containerClassName="sm:col-span-2"
                  >
                    {ORIGINS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                  <Input
                    label="Notes"
                    value={l.notes}
                    onChange={(e) => updateLine(l.key, { notes: e.target.value })}
                    placeholder="Delivery slot, shelf-life requirement…"
                    containerClassName="lg:col-span-2"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => setLines((p) => [...p, blankLine()])}>
            Add line
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-end">
              <div className="text-2xs uppercase tracking-wider text-charcoal-400">Indicative value</div>
              <div className="sr-num text-lg">{formatAed(draftValue, { compact: true })}</div>
            </div>
            <Button icon={<Check size={15} />} onClick={() => submitDemand('Portal')}>
              Approve Demand
            </Button>
          </div>
        </div>
      </Card>

      {/* ---------------- Demand register ---------------- */}
      <Card padded={false}>
        <div className="p-5 pb-0">
          <CardHeader title="Demand register" subtitle="Every demand record in the current and next cycle" />
        </div>
        <div className="mt-4 min-w-0 overflow-x-auto">
          {demands.length === 0 ? (
            <EmptyState title="No demand captured yet" hint="Use the builder above to create your first record." />
          ) : (
            <table className="sr-table min-w-[820px]">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Buyer</th>
                  <th>Title</th>
                  <th>Lines</th>
                  <th>Volume</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {demands.map((d) => {
                  const volume = d.lines.reduce((s, l) => s + l.qty, 0);
                  const buyerRec = buyers.find((b) => b.id === d.buyerId);
                  return (
                    <tr key={d.id}>
                      <td className="font-mono text-xs font-semibold">{d.ref}</td>
                      <td className="text-xs">{buyerRec?.name ?? ', '}</td>
                      <td className="max-w-[240px] truncate text-xs font-medium">{d.title}</td>
                      <td className="text-xs tabular-nums">{d.lines.length}</td>
                      <td className="text-xs font-semibold tabular-nums">
                        {volume.toLocaleString()} {d.lines[0]?.unit}
                      </td>
                      <td>
                        <Badge tone={d.source === 'AI translator' ? 'violet' : 'neutral'}>
                          {d.source === 'AI translator' ? <Sparkles size={10} /> : null}
                          {d.source}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          tone={
                            d.status === 'approved'
                              ? 'emerald'
                              : d.status === 'in-cycle'
                                ? 'brand'
                                : d.status === 'structured'
                                  ? 'sky'
                                  : 'neutral'
                          }
                        >
                          {d.status}
                        </Badge>
                      </td>
                      <td className="text-end">
                        {d.status === 'structured' ? (
                          <button
                            onClick={() => approveDemand(d.id)}
                            className="sr-btn-ghost !px-2.5 !py-1 text-2xs"
                          >
                            Approve <ArrowRight size={11} />
                          </button>
                        ) : (
                          <span className="text-2xs text-charcoal-300">
                            {formatDate(d.createdAt)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   AI Demand Translator
   ============================================================ */

function AiTranslator({
  onApply,
  onApprove,
}: {
  onApply: (r: TranslationResult & { rawText: string }) => void;
  onApprove: (r: TranslationResult & { rawText: string }) => void;
}) {
  const [text, setText] = useState(TRANSLATOR_SAMPLES[0]);
  const [phase, setPhase] = useState<'idle' | 'working' | 'done'>('idle');
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<(TranslationResult & { rawText: string }) | null>(null);
  const timers = useRef<number[]>([]);

  const STEPS = [
    'Reading buyer language',
    'Resolving crop and volume',
    'Mapping grade and packaging',
    'Inferring schedule and window',
    'Structuring demand record',
  ];

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const run = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    setPhase('working');
    setStep(0);
    setResult(null);
    STEPS.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setStep(i + 1), 240 * (i + 1)));
    });
    timers.current.push(
      window.setTimeout(
        () => {
          setResult({ ...translateDemand(text), rawText: text });
          setPhase('done');
        },
        240 * STEPS.length + 220
      )
    );
  };

  return (
    <Card className="overflow-hidden border-brand-100 dark:border-brand-900">
      <CardHeader
        title="AI Demand Translator"
        subtitle="Paste what the buyer actually wrote. SooqRoot turns it into a structured, commitable demand record."
        icon={<Wand2 size={16} />}
        action={<Badge tone="violet" icon={<Sparkles size={10} />}>On-device</Badge>}
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <Textarea
            label="Buyer request"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[136px] font-[450]"
            placeholder="We need around ten tonnes of good quality tomatoes next month…"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TRANSLATOR_SAMPLES.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setText(s);
                  setPhase('idle');
                  setResult(null);
                }}
                className="sr-chip transition hover:border-brand-300 hover:text-brand-700"
              >
                Sample {i + 1}
              </button>
            ))}
          </div>
          <Button
            className="mt-3 w-full"
            icon={<Sparkles size={15} />}
            onClick={run}
            loading={phase === 'working'}
          >
            {phase === 'working' ? 'Structuring' : 'Structure with AI'}
          </Button>
        </div>

        <div className="rounded-xl border border-charcoal-100 bg-canvas-soft p-4 dark:border-charcoal-800 dark:bg-charcoal-950">
          {phase === 'idle' ? (
            <EmptyState
              icon={<Wand2 size={26} />}
              title="Structured output appears here"
              hint="The translator reads quantity multipliers, grade language, packaging, delivery cadence and the procurement window."
            />
          ) : phase === 'working' ? (
            <div className="space-y-2.5 py-2">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className={`flex items-center gap-2.5 text-xs transition-all duration-300 ${
                    i < step ? 'text-charcoal-700 dark:text-charcoal-200' : 'text-charcoal-300 dark:text-charcoal-600'
                  }`}
                >
                  {i < step ? (
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-white">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="h-4 w-4 rounded-full border-2 border-dashed border-current" />
                  )}
                  <span className="font-medium">{s}</span>
                  {i === step - 1 ? (
                    <span className="ms-auto h-1 w-16 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900">
                      <span className="block h-full w-full origin-left animate-[grow_240ms_ease-out] bg-brand-500" />
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          ) : result ? (
            <div className="animate-in">
              <div className="mb-3 flex items-center justify-between">
                <span className="sr-eyebrow">Structured demand</span>
                <Badge tone={result.confidence >= 85 ? 'emerald' : result.confidence >= 65 ? 'amber' : 'rose'}>
                  {result.confidence}% confidence
                </Badge>
              </div>
              <Progress
                value={result.confidence}
                tone={result.confidence >= 85 ? 'healthy' : result.confidence >= 65 ? 'attention' : 'risk'}
                height="h-1"
                className="mb-3"
              />

              <dl className="space-y-1.5">
                {result.fields.map((f) => (
                  <div
                    key={f.key}
                    className="flex items-start justify-between gap-3 rounded-lg bg-white px-3 py-2 dark:bg-charcoal-900"
                  >
                    <div className="min-w-0">
                      <dt className="text-2xs uppercase tracking-wider text-charcoal-400">{f.label}</dt>
                      <dd className="text-sm font-bold text-charcoal-900 dark:text-white">{f.value}</dd>
                    </div>
                    {f.from ? (
                      <span className="max-w-[45%] shrink-0 truncate rounded-md bg-brand-50 px-2 py-1 text-2xs italic text-brand-700 dark:bg-brand-900 dark:text-brand-100">
                        “{f.from}”
                      </span>
                    ) : null}
                  </div>
                ))}
              </dl>

              {result.notes.length ? (
                <ul className="mt-3 space-y-1 border-t border-charcoal-100 pt-3 dark:border-charcoal-800">
                  {result.notes.map((n, i) => (
                    <li key={i} className="flex gap-2 text-2xs text-charcoal-500 dark:text-charcoal-400">
                      <Sparkles size={11} className="mt-0.5 shrink-0 text-brand-500" />
                      {n}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-4 flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => onApply(result)}>
                  Send to builder
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  icon={<Check size={14} />}
                  disabled={!result.productId || !result.qty}
                  onClick={() => onApprove(result)}
                >
                  Approve Demand
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
