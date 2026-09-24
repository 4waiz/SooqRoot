import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ChevronRight, Sprout } from 'lucide-react';
import { useStore } from '../state/AppStore';
import { Badge, Card, CardHeader, EmptyState, PageHeader, Segmented } from '../components/ui';
import { getProduct } from '../data/products';
import { productPhoto } from '../data/media';
import { Avatar } from '../components/ui/Photo';
import { useReadableColor } from '../lib/theme';
import { farmName } from '../data/farms';
import { HARVEST_EVENTS } from '../data/operations';
import { formatDate } from '../lib/metrics';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function HarvestCalendar() {
  const { orders } = useStore();
  const readable = useReadableColor();
  const [month, setMonth] = useState(9); // 0-indexed: October 2026
  // A 7-column month grid is unreadable on a phone, so start in list view there.
  const [view, setView] = useState<'calendar' | 'list'>(() => {
    try {
      return window.matchMedia('(max-width: 640px)').matches ? 'list' : 'calendar';
    } catch {
      return 'calendar';
    }
  });
  const year = 2026;

  const events = useMemo(
    () =>
      HARVEST_EVENTS.filter((h) => {
        const d = new Date(h.date);
        return d.getMonth() === month && d.getFullYear() === year;
      }),
    [month]
  );

  const byDay = useMemo(() => {
    const map: Record<number, typeof HARVEST_EVENTS> = {};
    for (const e of events) {
      const day = new Date(e.date).getDate();
      (map[day] ??= []).push(e);
    }
    return map;
  }, [events]);

  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first offset
  const offset = (first.getDay() + 6) % 7;

  const totalVolume = events.reduce((s, e) => s + e.qty, 0);
  const monthLabel = first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Supply Network"
        title="Harvest Calendar"
        subtitle="Every scheduled field operation behind the network's live commitments."
        actions={
          <>
            <Badge tone="brand" icon={<Sprout size={12} />}>
              {events.length} harvests · {totalVolume.toLocaleString()} units
            </Badge>
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { value: 'calendar', label: 'Calendar' },
                { value: 'list', label: 'List' },
              ]}
            />
          </>
        }
      />

      <Card padded={false}>
        <div className="flex items-center justify-between border-b border-charcoal-100 p-4 dark:border-charcoal-800">
          <button
            onClick={() => setMonth((m) => Math.max(8, m - 1))}
            disabled={month <= 8}
            className="sr-btn-ghost !px-2.5 !py-1.5 text-xs disabled:opacity-30"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <div className="text-center">
            <div className="sr-h3">{monthLabel}</div>
            <div className="text-2xs text-charcoal-400">
              {events.length} scheduled harvests across the network
            </div>
          </div>
          <button
            onClick={() => setMonth((m) => Math.min(10, m + 1))}
            disabled={month >= 10}
            className="sr-btn-ghost !px-2.5 !py-1.5 text-xs disabled:opacity-30"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>

        {view === 'calendar' ? (
          <div className="p-4">
            <div className="mb-2 grid grid-cols-7 gap-1.5">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-1 text-center text-2xs font-bold uppercase tracking-wider text-charcoal-400">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: offset }).map((_, i) => (
                <div key={`pad-${i}`} className="min-h-[92px] rounded-lg bg-canvas-soft/40 dark:bg-charcoal-950/40" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = byDay[day] ?? [];
                const volume = dayEvents.reduce((s, e) => s + e.qty, 0);
                return (
                  <div
                    key={day}
                    className={`min-h-[92px] rounded-lg border p-1.5 transition ${
                      dayEvents.length
                        ? 'border-brand-100 bg-brand-50/40 dark:border-brand-900 dark:bg-brand-900/15'
                        : 'border-charcoal-100 dark:border-charcoal-800'
                    }`}
                  >
                    <div className="flex items-center justify-between px-0.5">
                      <span
                        className={`text-2xs font-bold ${
                          dayEvents.length ? 'text-brand-700 dark:text-brand-200' : 'text-charcoal-400'
                        }`}
                      >
                        {day}
                      </span>
                      {volume > 0 ? (
                        <span className="text-[9px] font-bold tabular-nums text-charcoal-400">
                          {volume >= 1000 ? `${(volume / 1000).toFixed(1)}t` : volume}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 3).map((e) => {
                        const p = getProduct(e.productId);
                        return (
                          <Link
                            key={e.id}
                            to={e.orderId ? `/orders/${e.orderId}` : '/harvest'}
                            className="block truncate rounded px-1 py-0.5 text-[10px] font-medium transition hover:brightness-95"
                            style={{ background: `${p.color}26`, color: readable(p.color) }}
                            title={`${p.name} · ${e.qty.toLocaleString()} ${e.unit} · ${farmName(e.farmId)}`}
                          >
                            {p.emoji} {e.qty.toLocaleString()}
                          </Link>
                        );
                      })}
                      {dayEvents.length > 3 ? (
                        <span className="block px-1 text-[9px] font-semibold text-charcoal-400">
                          +{dayEvents.length - 3} more
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="min-w-0 overflow-x-auto">
            {events.length === 0 ? (
              <EmptyState icon={<CalendarDays size={26} />} title="No harvests scheduled this month" />
            ) : (
              <table className="sr-table min-w-[720px]">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Farm</th>
                    <th>Crop</th>
                    <th className="text-end">Volume</th>
                    <th>Order</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...events]
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((e) => {
                      const p = getProduct(e.productId);
                      const order = orders.find((o) => o.id === e.orderId);
                      return (
                        <tr key={e.id}>
                          <td className="text-xs font-semibold tabular-nums">{formatDate(e.date, 'day')}</td>
                          <td className="text-xs">{farmName(e.farmId)}</td>
                          <td className="text-xs">
                            <span className="inline-flex items-center gap-2">
                              <Avatar src={productPhoto(e.productId, 48, 48)} alt={p.name} size={22} tint={p.color} fallback={p.emoji} />
                              {p.name}
                            </span>
                          </td>
                          <td className="text-end text-xs font-semibold tabular-nums">
                            {e.qty.toLocaleString()} {e.unit}
                          </td>
                          <td>
                            {order ? (
                              <Link
                                to={`/orders/${order.id}`}
                                className="font-mono text-2xs font-bold hover:text-brand-700"
                              >
                                {order.ref}
                              </Link>
                            ) : (
                              <span className="text-2xs text-charcoal-300">, </span>
                            )}
                          </td>
                          <td>
                            <Badge tone={e.status === 'complete' ? 'emerald' : e.status === 'in-progress' ? 'sky' : 'neutral'}>
                              {e.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Card>

      {/* ---------------- Crop legend ---------------- */}
      <Card>
        <CardHeader title="Crops in this window" icon={<Sprout size={16} />} />
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from(new Set(events.map((e) => e.productId))).map((pid) => {
            const p = getProduct(pid);
            const volume = events.filter((e) => e.productId === pid).reduce((s, e) => s + e.qty, 0);
            return (
              <span
                key={pid}
                className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                style={{ background: `${p.color}24`, color: readable(p.color) }}
              >
                <Avatar src={productPhoto(pid, 48, 48)} alt={p.name} size={20} tint={p.color} fallback={p.emoji} />
                {p.name}
                <span className="font-mono text-2xs opacity-70">{volume.toLocaleString()}</span>
              </span>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
