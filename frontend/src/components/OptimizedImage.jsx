import React, { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────
// useImageSize Hook
// Returns 'mobile' | 'tablet' | 'desktop'
// based on current window width (debounced)
// ─────────────────────────────────────────────
export const useImageSize = () => {
  const getBreakpoint = (width) => {
    if (width <= 480) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  };

  const [breakpoint, setBreakpoint] = useState(() =>
    typeof window !== 'undefined'
      ? getBreakpoint(window.innerWidth)
      : 'desktop'
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId = null;

    const handleResize = () => {
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

// ─────────────────────────────────────────────
// OptimizedImage Component
//
// Props:
//   src          - main image URL (required)
//   alt          - alt text
//   isHero       - true = eager load + high fetchPriority
//   blurSrc      - tiny low-quality placeholder image URL (optional)
//                  e.g. a 20px wide base64 or thumbnail
//   srcSet       - responsive srcset string (optional)
//   sizes        - sizes attribute for srcset (optional)
//   width        - intrinsic width (helps browser avoid layout shift)
//   height       - intrinsic height
//   className    - extra class on wrapper
//   style        - extra style on wrapper
//   onClick      - click handler (useful for artwork tap tracking)
//   aspectRatio  - e.g. "4/3" or "1/1" — controls wrapper height
//                  if you don't pass width/height
// ─────────────────────────────────────────────
const OptimizedImage = ({
  src,
  alt = 'Maheshwagh Art Piece',
  isHero = false,
  blurSrc = null,
  srcSet = null,
  sizes = null,
  width,
  height,
  className = '',
  style = {},
  onClick,
  aspectRatio = null,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);   // true when full image loaded
  const [error, setError]   = useState(false);   // true if image fails to load
  const imgRef              = useRef(null);

  // If image is already cached by browser, onLoad may not fire.
  // Check .complete on mount to handle cached images instantly.
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }
  }, []);

  if (!src) return null;

  // ── Wrapper styles ──────────────────────────
  const wrapperStyle = {
    position:    'relative',
    overflow:    'hidden',
    display:     'block',
    width:       '100%',
    height:      '100%',
    background:  '#111',           // solid dark bg — prevents flash of transparent
    cursor:      onClick ? 'pointer' : 'default',
    ...(aspectRatio && {
      height:    'auto',
      aspectRatio,
    }),
    ...style,
  };

  return (
    <div
      className={`opt-img-wrap ${loaded ? 'opt-img--loaded' : 'opt-img--loading'} ${className}`}
      style={wrapperStyle}
      onClick={onClick}
    >

      {/* ── BLUR PLACEHOLDER ──────────────────────
          Shows a tiny blurry version of the image
          while the full-res version is loading.
          If no blurSrc is provided, shows a shimmer.
      ─────────────────────────────────────────── */}
      {!loaded && !error && (
        blurSrc ? (
          // Blur-up placeholder (like Medium.com)
          <img
            src={blurSrc}
            aria-hidden="true"
            alt=""
            style={{
              position:   'absolute',
              inset:      0,
              width:      '100%',
              height:     '100%',
              objectFit:  'cover',
              filter:     'blur(12px)',
              transform:  'scale(1.05)',   // hides blur edges
              zIndex:     1,
              transition: 'opacity 0.3s ease',
            }}
          />
        ) : (
          // Shimmer skeleton (fallback when no blurSrc)
          <div
            aria-hidden="true"
            style={{
              position:   'absolute',
              inset:      0,
              background: 'linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)',
              backgroundSize: '200% 100%',
              animation:  'opt-shimmer 1.4s ease-in-out infinite',
              zIndex:     1,
            }}
          />
        )
      )}

      {/* ── ERROR STATE ───────────────────────── */}
      {error && (
        <div
          role="img"
          aria-label={alt}
          style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            width:          '100%',
            height:         '100%',
            minHeight:      '120px',
            color:          '#666',
            fontSize:       '0.8rem',
            border:         '1px dashed #333',
            gap:            '6px',
          }}
        >
          {/* Simple broken-image icon using unicode */}
          <span style={{ fontSize: '1.5rem' }}>🖼️</span>
          <span>Failed to load image</span>
        </div>
      )}

      {/* ── MAIN IMAGE ────────────────────────── */}
      {!error && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}

          // Provide srcSet for responsive sizes if available
          {...(srcSet && { srcSet })}
          {...(sizes  && { sizes  })}

          // Intrinsic dimensions help browser reserve space
          // and avoid layout shift (CLS)
          {...(width  && { width  })}
          {...(height && { height })}

          // eager for hero (above the fold), lazy for rest
          loading={isHero ? 'eager' : 'lazy'}

          // async decoding — browser renders page without
          // waiting for image decode to finish
          decoding="async"

          // High fetch priority for hero images
          fetchPriority={isHero ? 'high' : 'auto'}

          onLoad={() => setLoaded(true)}
          onError={() => {
            setError(true);
            setLoaded(true);
          }}

          style={{
            position:   'relative',
            zIndex:     2,            // sits above blur placeholder
            width:      '100%',
            height:     '100%',
            objectFit:  'cover',
            display:    'block',

            // Fade in when loaded — 0.3s is fast but smooth
            opacity:    loaded ? 1 : 0,
            transition: 'opacity 0.3s ease',

            // GPU-accelerated compositing for smooth fade
            transform:  'translateZ(0)',
            willChange: loaded ? 'auto' : 'opacity',
          }}
          {...props}
        />
      )}

      {/* ── KEYFRAMES (injected once) ─────────── */}
      <style>{`
        @keyframes opt-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </div>
  );
};

export default OptimizedImage;


// ─────────────────────────────────────────────
// USAGE EXAMPLES
// ─────────────────────────────────────────────

/*
  1. BASIC USAGE
  ──────────────
  <OptimizedImage
    src="/art/ganesh.jpg"
    alt="Ganesh Ji sketch"
  />


  2. HERO IMAGE (loads eagerly, high priority)
  ────────────────────────────────────────────
  <OptimizedImage
    src="/art/hero-banner.jpg"
    alt="Hero banner"
    isHero={true}
  />


  3. BLUR-UP PLACEHOLDER (best quality feel)
  ──────────────────────────────────────────
  Pass a tiny low-res version of the same image as blurSrc.
  It shows blurred while the full image loads, then fades out.

  <OptimizedImage
    src="/art/shivaji-full.jpg"
    blurSrc="/art/shivaji-thumb.jpg"
    alt="Shivaji Maharaj"
  />

  You can also use a base64 inline tiny image as blurSrc:
  blurSrc="data:image/jpeg;base64,/9j/4AAQ..."


  4. RESPONSIVE SRCSET (serve smaller file on mobile)
  ───────────────────────────────────────────────────
  <OptimizedImage
    src="/art/sketch-large.jpg"
    srcSet="/art/sketch-sm.jpg 480w, /art/sketch-md.jpg 1024w, /art/sketch-large.jpg 1920w"
    sizes="(max-width: 480px) 480px, (max-width: 1024px) 1024px, 1920px"
    alt="Maratha Warrior"
  />


  5. WITH CLICK TRACKING (for your art portfolio)
  ─────────────────────────────────────────────────
  import { useTrackClick } from '../hooks/useTrackClick';

  function Gallery() {
    const trackClick = useTrackClick();

    return (
      <OptimizedImage
        src="/art/ganesh.jpg"
        alt="Ganesh Ji"
        aspectRatio="4/3"
        onClick={() => trackClick('Artwork Tap - Ganesh Ji')}
      />
    );
  }


  6. FIXED ASPECT RATIO (no layout shift)
  ────────────────────────────────────────
  <OptimizedImage
    src="/art/warrior.jpg"
    alt="Maratha Warrior"
    aspectRatio="3/4"
  />


  7. WEBP WITH JPG FALLBACK (best browser support)
  ──────────────────────────────────────────────────
  Wrap OptimizedImage in a <picture> tag:

  <picture>
    <source srcSet="/art/ganesh.webp" type="image/webp" />
    <OptimizedImage
      src="/art/ganesh.jpg"
      alt="Ganesh Ji"
    />
  </picture>


  8. USING useImageSize HOOK
  ──────────────────────────
  import OptimizedImage, { useImageSize } from './OptimizedImage';

  function ArtCard({ art }) {
    const breakpoint = useImageSize();

    const srcMap = {
      mobile:  art.smallSrc,
      tablet:  art.mediumSrc,
      desktop: art.largeSrc,
    };

    return (
      <OptimizedImage
        src={srcMap[breakpoint]}
        alt={art.title}
      />
    );
  }
*/
