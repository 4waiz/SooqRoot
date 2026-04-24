import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const VARIANT_CLS: Record<Variant, string> = {
  primary: 'sr-btn-primary',
  secondary: 'sr-btn-secondary',
  ghost: 'sr-btn-ghost',
  danger:
    'sr-btn bg-rose-600 text-white hover:bg-rose-700 shadow-soft',
};

const SIZE_CLS: Record<NonNullable<Props['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: '',
  lg: 'px-5 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button className={`${VARIANT_CLS[variant]} ${SIZE_CLS[size]} ${className}`} {...rest}>
      {icon ? <span className="flex items-center">{icon}</span> : null}
      {children}
    </button>
  );
}
