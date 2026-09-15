import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CornerDownLeft, Search } from 'lucide-react';
import { ALL_NAV_ITEMS } from './nav';
import { useStore } from '../../state/AppStore';
import { getProduct } from '../../data/products';
import { buyerName } from '../../data/buyers';

interface Entry {
  id: string;
  label: string;
  sub: string;
  group: string;
  to: string;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { orders, farms, buyers } = useStore();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const entries: Entry[] = useMemo(
    () => [
      ...ALL_NAV_ITEMS.map((n) => ({
        id: `nav-${n.to}`,
        label: n.label,
        sub: 'Navigate',
        group: 'Pages',
        to: n.to,
      })),
      ...orders.map((o) => ({
        id: o.id,
        label: `${o.ref} — ${getProduct(o.productId).name}`,
        sub: `${buyerName(o.buyerId)} · ${o.qty.toLocaleString()} ${o.unit} · ${o.status}`,
        group: 'Orders',
        to: `/orders/${o.id}`,
      })),
      ...farms.map((f) => ({
        id: f.id,
        label: f.name,
        sub: `${f.area} · ${f.distanceKm} km · ${f.growingMethod}`,
        group: 'Farms',
        to: `/farms/${f.id}`,
      })),
      ...buyers.map((b) => ({
        id: b.id,
        label: b.name,
        sub: `${b.segment} · ${b.emirate}`,
        group: 'Buyers',
        to: `/demand?buyer=${b.id}`,
      })),
    ],
    [orders, farms, buyers]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries.filter((e) => e.group === 'Pages').slice(0, 8);
    return entries
      .filter((e) => `${e.label} ${e.sub}`.toLowerCase().includes(q))
      .slice(0, 12);
  }, [entries, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  if (!open) return null;

  const go = (entry?: Entry) => {
    if (!entry) return;
    navigate(entry.to);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-charcoal-950/50 p-4 pt-[12vh] backdrop-blur-sm animate-fade"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-charcoal-100 bg-white shadow-lift dark:border-charcoal-800 dark:bg-charcoal-900 animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-charcoal-100 px-4 dark:border-charcoal-800">
          <Search size={16} className="text-charcoal-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setCursor((c) => Math.min(results.length - 1, c + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setCursor((c) => Math.max(0, c - 1));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                go(results[cursor]);
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
            placeholder="Search pages, orders, farms and buyers…"
            className="w-full bg-transparent py-4 text-sm text-charcoal-800 outline-none placeholder:text-charcoal-400 dark:text-charcoal-100"
          />
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-charcoal-400">No matches</div>
          ) : (
            results.map((r, i) => (
              <button
                key={r.id}
                onMouseEnter={() => setCursor(i)}
                onClick={() => go(r)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition ${
                  i === cursor ? 'bg-brand-50 dark:bg-brand-900' : 'hover:bg-charcoal-50 dark:hover:bg-charcoal-800'
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-charcoal-800 dark:text-charcoal-100">
                    {r.label}
                  </span>
                  <span className="block truncate text-2xs text-charcoal-400">{r.sub}</span>
                </span>
                <span className="shrink-0 rounded-md bg-charcoal-100 px-1.5 py-0.5 text-[10px] font-semibold text-charcoal-500 dark:bg-charcoal-800">
                  {r.group}
                </span>
                {i === cursor ? <CornerDownLeft size={13} className="text-charcoal-400" /> : null}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
