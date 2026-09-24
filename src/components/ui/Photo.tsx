import React, { useState } from 'react';

/* ============================================================
   Photo primitives.

   Every image fades in once decoded and degrades to a tinted
   tile when it cannot load, so a slow or offline network at a
   venue never shows a broken-image icon mid-presentation.
   ============================================================ */

interface PhotoProps {
  src?: string;
  alt: string;
  className?: string;
  /** Hex tint used for the fallback tile and the loading wash. */
  tint?: string;
  /** Shown centred in the fallback tile (emoji, initials, icon). */
  fallback?: React.ReactNode;
  /** Load eagerly for above-the-fold imagery. */
  priority?: boolean;
  imgClassName?: string;
  style?: React.CSSProperties;
}

export function Photo({
  src,
  alt,
  className = '',
  tint = '#2a714c',
  fallback,
  priority,
  imgClassName = '',
  style,
}: PhotoProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${tint}26 0%, ${tint}0f 100%)`, ...style }}
      role={showImage ? undefined : 'img'}
      aria-label={showImage ? undefined : alt}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-2xl">{fallback}</div>
      )}
    </div>
  );
}

/** Circular photo with a ring - farms, buyers and products in lists. */
export function Avatar({
  src,
  alt,
  size = 32,
  tint,
  fallback,
  className = '',
}: {
  src?: string;
  alt: string;
  size?: number;
  tint?: string;
  fallback?: React.ReactNode;
  className?: string;
}) {
  return (
    <Photo
      src={src}
      alt={alt}
      tint={tint}
      fallback={<span style={{ fontSize: Math.round(size * 0.46) }}>{fallback}</span>}
      className={`shrink-0 rounded-full ring-2 ring-white dark:ring-charcoal-900 ${className}`}
      imgClassName="rounded-full"
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Full-bleed image panel with a legibility gradient. Used for page heroes,
 * the login brand panel and feature cards.
 */
export function ImagePanel({
  src,
  alt,
  className = '',
  children,
  overlay = 'left',
  priority,
}: {
  src?: string;
  alt: string;
  className?: string;
  children?: React.ReactNode;
  /** Where the dark wash sits so overlaid text stays readable. */
  overlay?: 'left' | 'bottom' | 'full';
  priority?: boolean;
}) {
  const wash =
    overlay === 'left'
      ? 'bg-gradient-to-r from-brand-950/95 via-brand-900/75 to-brand-900/10'
      : overlay === 'bottom'
        ? 'bg-gradient-to-t from-brand-950/90 via-brand-950/40 to-transparent'
        : 'bg-brand-950/70';
  return (
    <div className={`relative overflow-hidden bg-brand-gradient ${className}`}>
      {/* Positioned wrapper: Photo's own root is position:relative, so the
          absolute placement has to live on a separate element. */}
      <div className="absolute inset-0">
        <Photo src={src} alt={alt} priority={priority} className="h-full w-full" tint="#1d4733" />
      </div>
      <div className={`absolute inset-0 ${wash}`} />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
