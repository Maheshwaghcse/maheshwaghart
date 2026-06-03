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
  basePath = '/images/',
  className = '',
  style = {},
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Ensure basePath has a trailing slash
  const cleanBasePath = basePath ? (basePath.endsWith('/') ? basePath : `${basePath}/`) : '/images/';

  // Clean src by removing file extension if user accidentally passed one
  const cleanSrc = src ? src.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '') : '';

  if (!cleanSrc) {
    return null;
  }

  // Paths
  const webpSrcSet = `${cleanBasePath}${cleanSrc}-400.webp 400w, ${cleanBasePath}${cleanSrc}-800.webp 800w, ${cleanBasePath}${cleanSrc}-1200.webp 1200w`;
  const jpgSrcSet = `${cleanBasePath}${cleanSrc}-400.jpg 400w, ${cleanBasePath}${cleanSrc}-800.jpg 800w, ${cleanBasePath}${cleanSrc}-1200.jpg 1200w`;
  const fallbackSrc = `${cleanBasePath}${cleanSrc}.jpg`;

  // Breakpoints sizes attribute
  const sizesAttr = '(max-width: 480px) 400px, (max-width: 1024px) 800px, 1200px';

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
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(189,0,255,0.06) 50%, rgba(255,255,255,0) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer-pulse 1.8s infinite linear',
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
        <picture style={{ display: 'block', width: '100%', height: '100%' }}>
          {/* WebP responsive source */}
          <source
            type="image/webp"
            srcSet={webpSrcSet}
            sizes={sizesAttr}
          />
          {/* JPG responsive fallback source */}
          <source
            type="image/jpeg"
            srcSet={jpgSrcSet}
            sizes={sizesAttr}
          />
          {/* Img element */}
          <img
            src={fallbackSrc}
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
              transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'block',
            }}
            {...props}
          />
        </picture>
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
