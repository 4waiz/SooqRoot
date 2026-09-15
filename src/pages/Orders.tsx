import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Filter, PackageCheck, Search } from 'lucide-react';
import { useStore } from '../state/AppStore';
import {
  Badge,
  Card,
  EmptyState,
  HealthDot,
  PageHeader,
  Progress,
  Segmented,
} from '../components/ui';
import { getProduct } from '../data/products';
import { buyerName } from '../data/buyers';
import { formatAed, formatDate } from '../lib/metrics';
import { Order } from '../types';

type Filter = 'all' | 'open' | 'risk' | 'delivered';
type SortKey = 'requiredBy' | 'value' | 'coverage';

const STATUS_TONE: Record<Order['status'], Parameters<typeof Badge>[0]['tone']> = {
  'Demand received': 'neutral',
  Committed: 'brand',
  'Harvest scheduled': 'sky',
  'In fulfilment': 'violet',
  Delivered: 'emerald',
  'At risk': 'rose',
};

export function Orders() {
  const { orders, metrics } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('requiredBy');

  const rows = useMemo(() => {
    let list = [...orders];
    if (filter === 'open') list = list.filter((o) => o.status !== 'Delivered');
    if (filter === 'risk') list = list.filter((o) => o.health === 'risk' || o.status === 'At risk');
    if (filter === 'delivered') list = list.filter((o) => o.status === 'Delivered');

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((o) =>
        `${o.ref} ${getProduct(o.productId).name} ${buyerName(o.buyerId)} ${o.deliveryLocation} ${o.status}`
          .toLowerCase()
          .includes(q)
      );
    }

    list.sort((a, b) => {
      if (sort === 'value') return b.valueAed - a.valueAed;
      if (sort === 'coverage') return a.committedQty / a.qty - b.committedQty / b.qty;
      return a.requiredBy.localeCompare(b.requiredBy);
    });
    return list;
  }, [orders, filter, query, sort]);

  const totals = useMemo(
    () => ({
      value: rows.reduce((s, o) => s + o.valueAed, 0),
      volume: rows.reduce((s, o) => s + o.qty, 0),
      committed: rows.reduce((s, o) => s + o.committedQty, 0),
    }),
    [rows]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Procurement"
        title="Orders"
        subtitle="Every buyer order in the network, from demand received through to delivered and proven."
        actions={
          <>
            <Badge tone="brand" icon={<PackageCheck size={12} />}>
              {orders.filter((o) => o.status !== 'Delivered').length} open
            </Badge>
            {metrics.atRiskOrders > 0 ? (
              <Badge tone="rose">{metrics.atRiskOrders} at risk</Badge>
            ) : null}
          </>
        }
      />

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-charcoal-100 p-4 dark:border-charcoal-800 lg:flex-row lg:items-center lg:justify-between">
          <Segmented
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: `All ${orders.length}` },
              { value: 'open', label: 'Open' },
              { value: 'risk', label: 'At risk' },
              { value: 'delivered', label: 'Delivered' },
            ]}
          />
          <div className="flex flex-1 items-center gap-2 lg:max-w-md lg:justify-end">
            <div className="relative flex-1 lg:max-w-xs">
              <Search
                size={14}
                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-charcoal-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search orders…"
                className="sr-input ps-9 py-2 text-xs focus:ring-brand-300"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="sr-input w-auto py-2 pe-8 text-xs focus:ring-brand-300"
              aria-label="Sort orders"
            >
              <option value="requiredBy">Delivery date</option>
              <option value="value">Order value</option>
              <option value="coverage">Lowest coverage</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {rows.length === 0 ? (
            <EmptyState
              icon={<Filter size={26} />}
              title="No orders match"
              hint="Try a different filter or clear the search."
            />
          ) : (
            <table className="sr-table min-w-[940px]">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Buyer</th>
                  <th>Product</th>
                  <th className="text-end">Volume</th>
                  <th>Commitment coverage</th>
                  <th className="text-end">Value</th>
                  <th>Delivery</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => {
                  const product = getProduct(o.productId);
                  const coverage = Math.round((o.committedQty / o.qty) * 100);
                  return (
                    <tr key={o.id} className="group">
                      <td>
                        <Link
                          to={`/orders/${o.id}`}
                          className="flex items-center gap-2 font-mono text-xs font-bold hover:text-brand-700"
                        >
                          <HealthDot status={o.health} />
                          {o.ref}
                        </Link>
                      </td>
                      <td className="max-w-[170px] truncate text-xs">{buyerName(o.buyerId)}</td>
                      <td className="text-xs font-medium">
                        <span className="me-1.5">{product.emoji}</span>
                        {product.name}
                        <span className="ms-1.5 text-2xs text-charcoal-400">Grade {o.grade}</span>
                      </td>
                      <td className="text-end text-xs font-semibold tabular-nums">
                        {o.qty.toLocaleString()} {o.unit}
                      </td>
                      <td className="min-w-[160px]">
                        <div className="flex items-center gap-2">
                          <Progress value={coverage} tone={o.health} height="h-1.5" className="w-20" />
                          <span className="text-2xs font-bold tabular-nums text-charcoal-600 dark:text-charcoal-300">
                            {coverage}%
                          </span>
                          <span className="whitespace-nowrap text-2xs text-charcoal-400">
                            {o.status === 'Delivered'
                              ? 'closed'
                              : `${o.allocations.length} farm${o.allocations.length === 1 ? '' : 's'}`}
                          </span>
                        </div>
                      </td>
                      <td className="text-end text-xs font-semibold tabular-nums">
                        {formatAed(o.valueAed, { compact: true })}
                      </td>
                      <td className="text-xs tabular-nums">{formatDate(o.requiredBy)}</td>
                      <td>
                        <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge>
                      </td>
                      <td className="text-end">
                        <Link
                          to={`/orders/${o.id}`}
                          className="inline-flex rounded-lg p-1.5 text-charcoal-300 transition group-hover:bg-charcoal-100 group-hover:text-charcoal-700 dark:group-hover:bg-charcoal-800"
                          aria-label={`Open ${o.ref}`}
                        >
                          <ChevronRight size={15} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-canvas-soft dark:bg-charcoal-950">
                  <td colSpan={3} className="px-4 py-3 text-2xs font-bold uppercase tracking-wider text-charcoal-400">
                    {rows.length} orders
                  </td>
                  <td className="px-4 py-3 text-end text-xs font-bold tabular-nums">
                    {totals.volume.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-2xs font-semibold tabular-nums text-charcoal-500">
                    {totals.committed.toLocaleString()} committed
                  </td>
                  <td className="px-4 py-3 text-end text-xs font-bold tabular-nums">
                    {formatAed(totals.value, { compact: true })}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
