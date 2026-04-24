import React from 'react';

type Tone = 'brand' | 'sand' | 'charcoal' | 'amber' | 'rose' | 'sky' | 'emerald';

interface Props {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const TONE_CLS: Record<Tone, string> = {
  brand:
    'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200',
  sand: 'bg-sand-100 text-sand-500 dark:bg-sand-500/20 dark:text-sand-200',
  charcoal:
    'bg-charcoal-100 text-charcoal-700 dark:bg-charcoal-700 dark:text-charcoal-100',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
  sky: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
  emerald:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
};

export function Badge({ tone = 'brand', children, className = '', icon }: Props) {
  return (
    <span className={`sr-badge ${TONE_CLS[tone]} ${className}`}>
      {icon}
      {children}
    </span>
  );
}
