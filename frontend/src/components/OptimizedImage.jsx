import React, { useState, useEffect } from 'react';

/**
 * Custom React hook to get the current device breakpoint based on window width.
 * Returns 'mobile' (<= 480px), 'tablet' (<= 1024px), or 'desktop'.
 */
export const useImageSize = () => {
  const getBreakpoint = (width) => {
    if (width <= 480) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  };

  const [breakpoint, setBreakpoint] = useState(() =>
    typeof window !== 'undefined' ? getBreakpoint(window.innerWidth) : 'desktop'
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId = null;
    const handleResize = () => {
      // Throttle resize handler to avoid frequent recalculations
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setBreakpoint(getBreakpoint(window.innerWidth));
      }, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return breakpoint;
};

/**
 * OptimizedImage Component
 * Serves optimized responsive images with WebP & JPG support using <picture>,
 * generating clean srcsets and serving different sizes for mobile, tablet, and desktop.
 */
const OptimizedImage = ({
  src,
  alt = 'Maheshwagh Art Piece',
  isHero = false,
  className = '',
  style = {},
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src) {
    return null;
  }

  return (
    <div
      className={`optimized-image-container ${loaded ? 'loaded' : 'loading'} ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(189, 0, 255, 0.03)',
        display: 'block',
        width: '100%',
        height: '100%',
        ...style
      }}
    >
      {!loaded && !error && (
        <div
          className="image-shimmer"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(189,0,255,0.08) 50%, rgba(255,255,255,0.02) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer-pulse 1.5s infinite linear',
            zIndex: 1,
          }}
        />
      )}

      {error ? (
        <div
          className="image-error-placeholder"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            padding: '1rem',
            color: 'var(--text-muted, #888)',
            fontSize: '0.85rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.1)',
            textAlign: 'center'
          }}
        >
          <span>Failed to load image</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={isHero ? 'eager' : 'lazy'}
          fetchPriority={isHero ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setError(true);
            setLoaded(true);
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            display: 'block',
          }}
          {...props}
        />
      )}

      <style>{`
        @keyframes shimmer-pulse {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default OptimizedImage;
