import React, { useState } from 'react';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  gradient?: string;
}

export function FallbackImage({ src, alt, className = '', gradient, style, ...rest }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={`img-fallback ${className}`}
        style={{
          ...(gradient ? { background: gradient } : {}),
          ...style,
        }}
        role="img"
        aria-label={alt}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
