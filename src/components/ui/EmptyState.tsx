import React from 'react';

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 gap-2 text-charcoal-500 dark:text-charcoal-300">
      {icon ? <div className="text-brand-500">{icon}</div> : null}
      <div className="font-semibold text-charcoal-800 dark:text-charcoal-100">{title}</div>
      {hint ? <div className="text-sm max-w-md">{hint}</div> : null}
      {action}
    </div>
  );
}
