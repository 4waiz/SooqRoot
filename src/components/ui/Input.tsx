import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, Props>(function Input(
  { label, hint, className = '', id, ...rest },
  ref
) {
  const autoId = React.useId();
  const effectiveId = id || autoId;
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={effectiveId} className="sr-label">
          {label}
        </label>
      ) : null}
      <input ref={ref} id={effectiveId} className={`sr-input ${className}`} {...rest} />
      {hint ? <p className="mt-1 text-xs text-charcoal-400">{hint}</p> : null}
    </div>
  );
});

interface TAProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}
export const Textarea = React.forwardRef<HTMLTextAreaElement, TAProps>(function Textarea(
  { label, hint, className = '', id, ...rest },
  ref
) {
  const autoId = React.useId();
  const effectiveId = id || autoId;
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={effectiveId} className="sr-label">
          {label}
        </label>
      ) : null}
      <textarea ref={ref} id={effectiveId} className={`sr-textarea ${className}`} {...rest} />
      {hint ? <p className="mt-1 text-xs text-charcoal-400">{hint}</p> : null}
    </div>
  );
});

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}
export function Select({ label, className = '', id, children, ...rest }: SelectProps) {
  const autoId = React.useId();
  const effectiveId = id || autoId;
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={effectiveId} className="sr-label">
          {label}
        </label>
      ) : null}
      <select id={effectiveId} className={`sr-input pe-8 ${className}`} {...rest}>
        {children}
      </select>
    </div>
  );
}
