import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  CircleCheck,
  Cpu,
  Lightbulb,
  TriangleAlert,
  Wrench,
} from 'lucide-react';
import { useStore } from '../state/AppStore';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  Segmented,
} from '../components/ui';
import { farmName } from '../data/farms';
import { formatAed, relativeTime } from '../lib/metrics';
import { ExceptionItem } from '../types';

const SEVERITY_TONE = {
  critical: 'rose',
  warning: 'amber',
  info: 'sky',
} as const;

const SEVERITY_ACCENT = {
  critical: '#c4452f',
  warning: '#c99c57',
  info: '#2f6f8a',
} as const;

export function Exceptions() {
  const { exceptions, orders, resolveException, pushActivity } = useStore();
  const [filter, setFilter] = useState<'open' | 'all' | 'resolved'>('open');

  const rows = useMemo(() => {
    const list =
      filter === 'all'
        ? exceptions
        : filter === 'resolved'
          ? exceptions.filter((e) => e.status === 'resolved')
          : exceptions.filter((e) => e.status !== 'resolved');
    const order = { critical: 0, warning: 1, info: 2 };
    return [...list].sort((a, b) => order[a.severity] - order[b.severity]);
  }, [exceptions, filter]);

  const exposure = rows.reduce((s, e) => s + e.impactAed, 0);
  const openCount = exceptions.filter((e) => e.status !== 'resolved').length;

  const act = (e: ExceptionItem, status: ExceptionItem['status']) => {
    resolveException(e.id, status);
    pushActivity({
      kind: 'exception',
      title: `${e.ref} moved to ${status}`,
      detail: e.title,
      actor: 'Awaiz Ahmed',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Exceptions"
        subtitle="Everything standing between a commitment and a delivered order — with the recommended intervention for each."
        actions={
          <>
            <Badge tone={openCount > 0 ? 'rose' : 'emerald'} icon={<TriangleAlert size={12} />}>
              {openCount} open
            </Badge>
            <Badge tone="neutral">{formatAed(exposure, { compact: true })} exposure</Badge>
            <Segmented
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'open', label: 'Open' },
                { value: 'all', label: 'All' },
                { value: 'resolved', label: 'Resolved' },
              ]}
            />
          </>
        }
      />

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CircleCheck size={28} />}
            title="Nothing needs attention"
            hint="Every commitment in the current cycle is tracking to plan."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((e) => {
            const order = orders.find((o) => o.id === e.orderId);
            return (
              <Card key={e.id} padded={false} className="overflow-hidden">
                <div
                  className="h-1 w-full"
                  style={{ background: SEVERITY_ACCENT[e.severity] }}
                />
                <div className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-2xs font-bold text-charcoal-400">{e.ref}</span>
                        <Badge tone={SEVERITY_TONE[e.severity]}>{e.severity}</Badge>
                        <Badge tone="neutral">{e.type}</Badge>
                        <Badge
                          tone={
                            e.status === 'resolved' ? 'emerald' : e.status === 'mitigating' ? 'sky' : 'neutral'
                          }
                        >
                          {e.status}
                        </Badge>
                        <span className="text-2xs text-charcoal-400">{relativeTime(e.raisedAt)}</span>
                      </div>

                      <h3 className="sr-h3 mt-2">{e.title}</h3>
                      <p className="sr-sub mt-1.5 max-w-3xl text-xs">{e.detail}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-2xs text-charcoal-400">
                        <span>
                          Owner <span className="font-semibold text-charcoal-600 dark:text-charcoal-300">{e.owner}</span>
                        </span>
                        {order ? (
                          <Link
                            to={`/orders/${order.id}`}
                            className="inline-flex items-center gap-1 font-semibold text-charcoal-600 transition hover:text-brand-700 dark:text-charcoal-300"
                          >
                            {order.ref} <ArrowRight size={11} />
                          </Link>
                        ) : null}
                        {e.farmId ? (
                          <Link
                            to={`/farms/${e.farmId}`}
                            className="inline-flex items-center gap-1 font-semibold text-charcoal-600 transition hover:text-brand-700 dark:text-charcoal-300"
                          >
                            {farmName(e.farmId)} <ArrowRight size={11} />
                          </Link>
                        ) : null}
                        {e.impactAed > 0 ? (
                          <span>
                            Exposure{' '}
                            <span className="font-semibold text-charcoal-600 dark:text-charcoal-300">
                              {formatAed(e.impactAed)}
                            </span>
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {e.status !== 'resolved' ? (
                      <div className="flex shrink-0 gap-2">
                        {e.status === 'open' ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Wrench size={13} />}
                            onClick={() => act(e, 'mitigating')}
                          >
                            Start mitigation
                          </Button>
                        ) : null}
                        <Button size="sm" icon={<Check size={13} />} onClick={() => act(e, 'resolved')}>
                          Resolve
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 flex gap-3 rounded-xl border border-brand-100 bg-brand-50 p-3.5 dark:border-brand-900 dark:bg-brand-900/25">
                    <Lightbulb size={16} className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-300" />
                    <div className="min-w-0">
                      <div className="text-2xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-200">
                        Recommended action
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-charcoal-700 dark:text-charcoal-200">
                        {e.recommendedAction}
                      </p>
                      {e.type === 'Shortfall' || e.type === 'Capacity' ? (
                        <Link to="/engine" className="sr-btn-secondary mt-2.5 !py-1.5 text-2xs">
                          <Cpu size={12} /> Re-run commitment engine
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
