import React from 'react';

interface Props {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: 'brand' | 'sand' | 'amber' | 'emerald' | 'sky' | 'rose' | 'charcoal';
}

const TONE: Record<NonNullable<Props['tone']>, string> = {
  brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200',
  sand: 'bg-sand-100 text-sand-500 dark:bg-sand-500/20 dark:text-sand-200',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
  charcoal: 'bg-charcoal-100 text-charcoal-700 dark:bg-charcoal-700 dark:text-charcoal-100',
};

export function StatCard({ label, value, hint, icon, tone = 'brand' }: Props) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-300">
          {label}
        </span>
        {icon ? (
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${TONE[tone]}`}>
            {icon}
          </span>
        ) : null}
      </div>
      <div className="text-2xl md:text-3xl font-bold text-charcoal-900 dark:text-white tracking-tight">
        {value}
      </div>
      {hint ? <div className="text-xs text-charcoal-500 dark:text-charcoal-300">{hint}</div> : null}
    </div>
  );
}
