import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  CheckCheck,
  Languages,
  MessageSquare,
  Phone,
  Send,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../state/AppStore';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  HealthDot,
  PageHeader,
  Segmented,
} from '../components/ui';
import { getFarm } from '../data/farms';
import { getProduct } from '../data/products';
import {
  COPILOT_MESSAGES,
  COPILOT_TEMPLATES,
  COPILOT_THREADS,
} from '../data/operations';
import { formatDate, formatTime, relativeTime } from '../lib/metrics';
import { CopilotMessage } from '../types';

export function FarmerCopilot() {
  const { orders } = useStore();
  const [threadId, setThreadId] = useState(COPILOT_THREADS[0].id);
  const [messages, setMessages] = useState<CopilotMessage[]>(COPILOT_MESSAGES);
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [templateId, setTemplateId] = useState(COPILOT_TEMPLATES[0].id);
  const [draft, setDraft] = useState('');

  const thread = COPILOT_THREADS.find((t) => t.id === threadId)!;
  const farm = getFarm(thread.farmId);

  const threadMessages = useMemo(
    () => messages.filter((m) => m.threadId === threadId).sort((a, b) => a.at.localeCompare(b.at)),
    [messages, threadId]
  );

  const farmCommitment = useMemo(() => {
    for (const o of orders) {
      const a = o.allocations.find((x) => x.farmId === thread.farmId);
      if (a) return { order: o, allocation: a };
    }
    return null;
  }, [orders, thread.farmId]);

  const template = COPILOT_TEMPLATES.find((t) => t.id === templateId)!;

  const composeFromTemplate = () => {
    if (!farm) return;
    const body = lang === 'ar' ? template.bodyAr : template.body;
    const product = farmCommitment ? getProduct(farmCommitment.order.productId) : null;
    const filled = body
      .replace('{contact}', farm.contactName)
      .replace('{qty}', farmCommitment ? `${farmCommitment.allocation.qty.toLocaleString()} ${farmCommitment.allocation.unit}` : '—')
      .replace('{product}', product ? (lang === 'ar' ? product.nameAr : product.name) : '—')
      .replace('{grade}', farmCommitment?.order.grade ?? 'A')
      .replace('{order}', farmCommitment?.order.ref ?? '—')
      .replace('{date}', farmCommitment ? formatDate(farmCommitment.allocation.harvestDate, 'long') : '—')
      .replace('{packaging}', farmCommitment?.order.packaging ?? '—');
    setDraft(filled);
  };

  const send = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        threadId,
        at: new Date().toISOString(),
        direction: 'outbound',
        channel: 'WhatsApp',
        text: draft.trim(),
        status: 'sent',
      },
    ]);
    setDraft('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Communication"
        title="Farmer Copilot"
        subtitle="Commitments, harvest instructions and quality guidance reach farms on the channel they already use — in the language they prefer."
        actions={
          <>
            <Badge tone="brand" icon={<Smartphone size={12} />}>
              WhatsApp · SMS · In-app
            </Badge>
            <Segmented
              value={lang}
              onChange={setLang}
              options={[
                { value: 'en', label: 'English' },
                { value: 'ar', label: 'العربية' },
              ]}
            />
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,300px)_1fr]">
        {/* ---------------- Threads ---------------- */}
        <Card padded={false} className="overflow-hidden">
          <div className="border-b border-charcoal-100 p-4 dark:border-charcoal-800">
            <CardHeader title="Conversations" subtitle={`${COPILOT_THREADS.length} active threads`} />
          </div>
          <div className="divide-y divide-charcoal-50 dark:divide-charcoal-800">
            {COPILOT_THREADS.map((t) => {
              const f = getFarm(t.farmId);
              const active = t.id === threadId;
              return (
                <button
                  key={t.id}
                  onClick={() => setThreadId(t.id)}
                  className={`w-full p-4 text-start transition ${
                    active
                      ? 'bg-brand-50 dark:bg-brand-900/30'
                      : 'hover:bg-canvas-soft dark:hover:bg-charcoal-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {f ? <HealthDot status={f.status} /> : null}
                    <span className="min-w-0 flex-1 truncate text-xs font-bold text-charcoal-900 dark:text-white">
                      {f?.name}
                    </span>
                    {t.unread > 0 ? (
                      <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                        {t.unread}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 truncate text-2xs text-charcoal-500 dark:text-charcoal-400">
                    {t.subject}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-2xs text-charcoal-400">
                    <Badge tone="neutral">{t.intent}</Badge>
                    <span>{relativeTime(t.updatedAt)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* ---------------- Thread ---------------- */}
        <div className="space-y-4">
          <Card padded={false} className="flex flex-col overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal-100 p-4 dark:border-charcoal-800">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-xs font-bold text-white">
                  {farm?.code.slice(-3)}
                </span>
                <div>
                  <div className="text-sm font-bold text-charcoal-900 dark:text-white">{farm?.name}</div>
                  <div className="flex items-center gap-2 text-2xs text-charcoal-400">
                    <span>{farm?.contactName}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Languages size={10} /> {farm?.preferredLanguage}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="neutral">{thread.intent}</Badge>
                {farm ? (
                  <Link to={`/farms/${farm.id}`} className="sr-btn-ghost !px-2.5 !py-1.5 text-xs">
                    Farm profile
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="max-h-[380px] min-h-[280px] flex-1 space-y-3 overflow-y-auto bg-canvas-soft p-4 dark:bg-charcoal-950">
              {threadMessages.map((m) => {
                const outbound = m.direction === 'outbound';
                const body = lang === 'ar' && m.textAr ? m.textAr : m.text;
                return (
                  <div key={m.id} className={`flex ${outbound ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                        outbound
                          ? 'rounded-br-md bg-brand-600 text-white'
                          : 'rounded-bl-md border border-charcoal-100 bg-white text-charcoal-800 dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-charcoal-100'
                      }`}
                    >
                      <p
                        className={`text-xs leading-relaxed ${
                          lang === 'ar' && m.textAr ? 'ar' : ''
                        }`}
                      >
                        {body}
                      </p>
                      <div
                        className={`mt-1.5 flex items-center gap-1.5 text-[10px] ${
                          outbound ? 'text-white/65' : 'text-charcoal-400'
                        }`}
                      >
                        <span>{m.channel}</span>
                        <span>·</span>
                        <span>
                          {formatDate(m.at)} {formatTime(m.at)}
                        </span>
                        {outbound ? (
                          <span className="ms-0.5">
                            {m.status === 'read' || m.status === 'replied' ? (
                              <CheckCheck size={11} />
                            ) : (
                              <Check size={11} />
                            )}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ---------------- Composer ---------------- */}
            <div className="border-t border-charcoal-100 p-4 dark:border-charcoal-800">
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                {COPILOT_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTemplateId(t.id);
                      window.setTimeout(composeFromTemplate, 0);
                    }}
                    className={`sr-chip transition ${
                      templateId === t.id
                        ? 'border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-100'
                        : 'hover:border-brand-300'
                    }`}
                  >
                    <Sparkles size={10} />
                    {t.label}
                  </button>
                ))}
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={
                  lang === 'ar'
                    ? 'اكتب رسالة إلى المزرعة…'
                    : 'Write a message to the farm, or pick a template above…'
                }
                className={`sr-textarea min-h-[92px] text-xs focus:ring-brand-300 ${lang === 'ar' ? 'ar' : ''}`}
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-2xs text-charcoal-400">
                  Sends over WhatsApp to {farm?.contactName} in {lang === 'ar' ? 'Arabic' : 'English'}
                  {farm && farm.preferredLanguage !== (lang === 'ar' ? 'Arabic' : 'English') ? (
                    <span className="ms-1 text-amber-600">
                      · farm prefers {farm.preferredLanguage}
                    </span>
                  ) : null}
                </span>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" icon={<Phone size={13} />}>
                    Call
                  </Button>
                  <Button size="sm" icon={<Send size={13} />} onClick={send} disabled={!draft.trim()}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {farmCommitment ? (
            <Card>
              <CardHeader
                title="Commitment in this conversation"
                subtitle="What the farm has been asked to deliver"
                icon={<MessageSquare size={16} />}
                action={
                  <Link
                    to={`/orders/${farmCommitment.order.id}`}
                    className="sr-btn-ghost !px-2.5 !py-1.5 text-xs"
                  >
                    Open {farmCommitment.order.ref}
                  </Link>
                }
              />
              <div className="mt-3 grid gap-3 sm:grid-cols-4">
                <Field label="Volume" value={`${farmCommitment.allocation.qty.toLocaleString()} ${farmCommitment.allocation.unit}`} />
                <Field label="Grade" value={`Grade ${farmCommitment.order.grade}`} />
                <Field label="Harvest by" value={formatDate(farmCommitment.allocation.harvestDate, 'long')} />
                <Field label="Packaging" value={farmCommitment.order.packaging} />
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-canvas-soft p-3 dark:bg-charcoal-950">
      <div className="text-2xs uppercase tracking-wider text-charcoal-400">{label}</div>
      <div className="mt-1 text-xs font-bold text-charcoal-800 dark:text-charcoal-100">{value}</div>
    </div>
  );
}
