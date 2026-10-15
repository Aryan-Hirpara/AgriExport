import React, { useState } from 'react';

/**
 * Universal Avatar component that seamlessly renders:
 * - base64 Data URLs (e.g. data:image/jpeg;base64,...)
 * - HTTP/HTTPS and relative image URLs
 * - Blob URLs
 * - Fallback emojis (🏢, 🧑‍🌾) or initials with graceful error recovery
 */
export default function Avatar({
  src,
  alt = 'Avatar',
  size = 48,
  borderRadius = 12,
  fallback = '🏢',
  fontSize,
  style = {},
  className = '',
}) {
  const [imageError, setImageError] = useState(false);

  const isImage =
    !imageError &&
    typeof src === 'string' &&
    (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/') || src.startsWith('blob:'));

  const calculatedFontSize = fontSize || (typeof size === 'number' ? `${Math.round(size * 0.48)}px` : '1.5rem');

  return (
    <div
      className={`avatar-container ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--green-light, #ecfdf5)',
        flexShrink: 0,
        fontSize: calculatedFontSize,
        lineHeight: 1,
        userSelect: 'none',
        ...style,
      }}
    >
      {isImage ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <span>{src && typeof src === 'string' && !src.startsWith('data:') ? src : fallback}</span>
      )}
    </div>
  );
}
