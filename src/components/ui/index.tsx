import React from 'react';
import { X } from 'lucide-react';

/* ============================================================
   SooqRoot UI primitives
   ============================================================ */

/* ---------------- Card ---------------- */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padded?: boolean;
  as?: 'div' | 'section' | 'article';
}

export function Card({ hover, padded = true, className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`sr-card ${hover ? 'sr-card-hover' : ''} ${padded ? 'p-5' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
  className = '',
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="flex items-start gap-3 min-w-0">
        {icon ? (
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900 dark:text-brand-200">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h3 className="sr-h3 leading-snug">{title}</h3>
          {subtitle ? <p className="sr-sub mt-0.5">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ---------------- Button ---------------- */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  loading?: boolean;
}

const VARIANT: Record<Variant, string> = {
  primary: 'sr-btn-primary',
  secondary: 'sr-btn-secondary',
  ghost: 'sr-btn-ghost',
  danger: 'sr-btn-danger',
};

const SIZE = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: '',
  lg: 'px-5 py-3 text-[0.95rem]',
} as const;

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  trailing,
  loading,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${VARIANT[variant]} ${SIZE[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon
      )}
      {children}
      {trailing}
    </button>
  );
}

/* ---------------- Badge ---------------- */

export type Tone =
  | 'brand'
  | 'sand'
  | 'neutral'
  | 'amber'
  | 'rose'
  | 'sky'
  | 'emerald'
  | 'violet';

const TONE: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-100',
  sand: 'bg-sand-100 text-sand-600 dark:bg-sand-600 dark:text-sand-50',
  neutral: 'bg-charcoal-100 text-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-200',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-100',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-900 dark:text-rose-100',
  sky: 'bg-sky-50 text-sky-700 dark:bg-sky-900 dark:text-sky-100',
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100',
  violet: 'bg-violet-50 text-violet-700 dark:bg-violet-900 dark:text-violet-100',
};

export function Badge({
  tone = 'brand',
  children,
  className = '',
  icon,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <span className={`sr-badge ${TONE[tone]} ${className}`}>
      {icon}
      {children}
    </span>
  );
}

export const HEALTH_TONE: Record<'healthy' | 'attention' | 'risk', Tone> = {
  healthy: 'emerald',
  attention: 'amber',
  risk: 'rose',
};

export const HEALTH_HEX: Record<'healthy' | 'attention' | 'risk', string> = {
  healthy: '#3c8c61',
  attention: '#c99c57',
  risk: '#c4452f',
};

export function HealthDot({ status }: { status: 'healthy' | 'attention' | 'risk' }) {
  return (
    <span className="relative inline-flex h-2 w-2 shrink-0">
      <span
        className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-pulseRing"
        style={{ background: HEALTH_HEX[status] }}
      />
      <span
        className="relative inline-flex h-2 w-2 rounded-full"
        style={{ background: HEALTH_HEX[status] }}
      />
    </span>
  );
}

/* ---------------- Inputs ---------------- */

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
  /** Applied to the field wrapper — use for grid spans. */
  containerClassName?: string;
}

export function Field({ label, hint, error, children, htmlFor, containerClassName = '' }: FieldProps) {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label ? (
        <label htmlFor={htmlFor} className="sr-label">
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="mt-1.5 text-2xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-2xs text-charcoal-400">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    hint?: string;
    error?: string;
    containerClassName?: string;
  }
>(function Input({ label, hint, error, className = '', containerClassName, id, ...rest }, ref) {
  const autoId = React.useId();
  const fieldId = id || autoId;
  return (
    <Field label={label} hint={hint} error={error} htmlFor={fieldId} containerClassName={containerClassName}>
      <input
        ref={ref}
        id={fieldId}
        className={`sr-input ${error ? 'border-rose-400 focus:ring-rose-300' : 'focus:ring-brand-300'} ${className}`}
        {...rest}
      />
    </Field>
  );
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    hint?: string;
    containerClassName?: string;
  }
>(function Textarea({ label, hint, className = '', containerClassName, id, ...rest }, ref) {
  const autoId = React.useId();
  const fieldId = id || autoId;
  return (
    <Field label={label} hint={hint} htmlFor={fieldId} containerClassName={containerClassName}>
      <textarea ref={ref} id={fieldId} className={`sr-textarea focus:ring-brand-300 ${className}`} {...rest} />
    </Field>
  );
});

export function Select({
  label,
  hint,
  className = '',
  containerClassName,
  id,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  containerClassName?: string;
}) {
  const autoId = React.useId();
  const fieldId = id || autoId;
  return (
    <Field label={label} hint={hint} htmlFor={fieldId} containerClassName={containerClassName}>
      <select id={fieldId} className={`sr-input pe-9 focus:ring-brand-300 ${className}`} {...rest}>
        {children}
      </select>
    </Field>
  );
}

/* ---------------- Progress ---------------- */

export function Progress({
  value,
  tone = 'healthy',
  className = '',
  height = 'h-2',
}: {
  value: number;
  tone?: 'healthy' | 'attention' | 'risk' | 'brand';
  className?: string;
  height?: string;
}) {
  const color = tone === 'brand' ? '#2a714c' : HEALTH_HEX[tone];
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-charcoal-100 dark:bg-charcoal-800 ${height} ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-spring"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
      />
    </div>
  );
}

/* ---------------- Modal ---------------- */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  React.useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const width = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' }[size];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-charcoal-950/50 p-4 backdrop-blur-sm animate-fade sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${width} sr-card my-auto overflow-hidden p-0 shadow-lift animate-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <div className="flex items-start justify-between gap-4 border-b border-charcoal-100 px-5 py-4 dark:border-charcoal-800">
            <div>
              <h3 className="sr-h3">{title}</h3>
              {subtitle ? <p className="sr-sub mt-0.5">{subtitle}</p> : null}
            </div>
            <button
              className="rounded-lg p-1.5 text-charcoal-400 transition hover:bg-charcoal-100 hover:text-charcoal-700 dark:hover:bg-charcoal-800"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        ) : null}
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-charcoal-100 px-5 py-4 dark:border-charcoal-800">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------- Empty state ---------------- */

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
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      {icon ? <div className="text-charcoal-300 dark:text-charcoal-600">{icon}</div> : null}
      <div className="font-semibold text-charcoal-700 dark:text-charcoal-200">{title}</div>
      {hint ? <div className="sr-sub max-w-sm">{hint}</div> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/* ---------------- Segmented control ---------------- */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className = '',
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-xl border border-charcoal-200 bg-charcoal-50 p-0.5 dark:border-charcoal-700 dark:bg-charcoal-900 ${className}`}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`inline-flex items-center gap-1.5 rounded-[0.6rem] px-3 py-1.5 text-xs font-semibold transition-all ${
            value === o.value
              ? 'bg-white text-charcoal-900 shadow-sm dark:bg-charcoal-700 dark:text-white'
              : 'text-charcoal-500 hover:text-charcoal-800 dark:text-charcoal-400 dark:hover:text-charcoal-100'
          }`}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Page header ---------------- */

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow ? <div className="sr-eyebrow mb-1.5">{eyebrow}</div> : null}
        <h1 className="sr-h1">{title}</h1>
        {subtitle ? <p className="sr-sub mt-1.5 max-w-2xl">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/* ---------------- Data row ---------------- */

export function DataRow({
  label,
  value,
  mono,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-charcoal-50 py-2 last:border-0 dark:border-charcoal-800">
      <span className="text-xs text-charcoal-500 dark:text-charcoal-400">{label}</span>
      <span
        className={`text-right text-sm font-semibold text-charcoal-800 dark:text-charcoal-100 ${
          mono ? 'font-mono text-xs' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ---------------- Tooltip-ish hint ---------------- */

export function Hint({ children }: { children: React.ReactNode }) {
  return (
    <span className="ms-1 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-charcoal-100 text-[9px] font-bold text-charcoal-500 dark:bg-charcoal-800 dark:text-charcoal-400">
      <span className="sr-only">{children}</span>
      <span aria-hidden>?</span>
    </span>
  );
}
