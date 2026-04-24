import React from 'react';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padded?: boolean;
}

export function Card({ hover, padded = true, className = '', children, ...rest }: Props) {
  return (
    <div
      className={`sr-card ${hover ? 'sr-card-hover' : ''} ${padded ? 'p-5 md:p-6' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-lg font-semibold text-charcoal-900 dark:text-white ${className}`}>
      {children}
    </h3>
  );
}

export function CardSub({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-sm text-charcoal-500 dark:text-charcoal-300 mt-1 ${className}`}>{children}</p>
  );
}
