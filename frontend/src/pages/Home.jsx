// Home.jsx (with moving blurred background)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [sketches, setSketches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [gridLimit] = useState(9);

  const dragStart = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const deckContainerRef = useRef(null);
  const dragRafIdRef = useRef(null);

  const getEventCoordinates = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handleDragStart = (e) => {
    if (isSwiping || loading || sketches.length === 0) return;
    if (e.target.closest('.slider-btn') || e.target.closest('.indicator-dot')) return;

    isDragging.current = true;
    const coords = getEventCoordinates(e);
    dragStart.current = { x: coords.x, y: coords.y };
    dragOffsetRef.current = { x: 0, y: 0 };

    if (deckContainerRef.current) {
      deckContainerRef.current.style.transition = 'none';
      deckContainerRef.current.classList.add('grabbing');
    }
  };

  const handleDragMove = (e) => {
    if (!isDragging.current || isSwiping || sketches.length === 0) return;

    const coords = getEventCoordinates(e);
    const offsetX = coords.x - dragStart.current.x;
    const offsetY = coords.y - dragStart.current.y;
    dragOffsetRef.current = { x: offsetX, y: offsetY };

    if (e.cancelable) {
      e.preventDefault();
    }

    // Throttle style mutations with requestAnimationFrame for sub-200ms INP
    if (dragRafIdRef.current) return;
    dragRafIdRef.current = requestAnimationFrame(() => {
      dragRafIdRef.current = null;
      if (isDragging.current && deckContainerRef.current) {
        deckContainerRef.current.style.transform = `translate3d(${dragOffsetRef.current.x}px, 0px, 0px)`;
      }
    });
  };

  const handleDragEnd = () => {
    if (!isDragging.current || sketches.length === 0) return;
    isDragging.current = false;

    if (dragRafIdRef.current) {
      cancelAnimationFrame(dragRafIdRef.current);
      dragRafIdRef.current = null;
    }

    if (deckContainerRef.current) {
      deckContainerRef.current.classList.remove('grabbing');
    }

    const { x: offsetX } = dragOffsetRef.current;
    const threshold = 80;

    if (Math.abs(offsetX) > threshold) {
      setIsSwiping(true);
      const nextIndex = offsetX < 0
        ? (activeIndex + 1) % sketches.length
        : (activeIndex - 1 + sketches.length) % sketches.length;

      if (deckContainerRef.current) {
        deckContainerRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        deckContainerRef.current.style.transform = 'translate3d(0px, 0px, 0px)';
      }

      setTimeout(() => {
        setActiveIndex(nextIndex);
        setIsSwiping(false);
        if (deckContainerRef.current) {
          deckContainerRef.current.style.transition = '';
        }
      }, 300); // Snappy 300ms transition
    } else {
      // Snap back
      if (deckContainerRef.current) {
        deckContainerRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        deckContainerRef.current.style.transform = 'translate3d(0px, 0px, 0px)';
      }
      setTimeout(() => {
        if (deckContainerRef.current) {
          deckContainerRef.current.style.transition = '';
        }
      }, 300); // Snappy 300ms transition
    }

    setTimeout(() => {
      dragOffsetRef.current = { x: 0, y: 0 };
    }, 50);
  };

  const handleDragStartRef = useRef(handleDragStart);
  const handleDragMoveRef = useRef(handleDragMove);
  const handleDragEndRef = useRef(handleDragEnd);

  useEffect(() => {
    handleDragStartRef.current = handleDragStart;
    handleDragMoveRef.current = handleDragMove;
    handleDragEndRef.current = handleDragEnd;
  });

  useEffect(() => {
    const deck = deckContainerRef.current;
    if (!deck) return;

    const onTouchStart = (e) => {
      handleDragStartRef.current(e);
    };

    const onTouchMove = (e) => {
      if (isDragging.current) {
        const coords = getEventCoordinates(e);
        const diffX = Math.abs(coords.x - dragStart.current.x);
        const diffY = Math.abs(coords.y - dragStart.current.y);

        // Prevent default browser touch scrolling only if swipe is horizontal
        if (diffX > diffY && e.cancelable) {
          e.preventDefault();
        }
      }
      handleDragMoveRef.current(e);
    };

    const onTouchEnd = (e) => {
      handleDragEndRef.current(e);
    };

    deck.addEventListener('touchstart', onTouchStart, { passive: true });
    deck.addEventListener('touchmove', onTouchMove, { passive: false });
    deck.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      deck.removeEventListener('touchstart', onTouchStart);
      deck.removeEventListener('touchmove', onTouchMove);
      deck.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const handlePrev = () => {
    if (isSwiping || sketches.length === 0) return;
    setIsSwiping(true);

    if (deckContainerRef.current) {
      deckContainerRef.current.style.transition = 'none';
      deckContainerRef.current.style.transform = 'translate3d(-100px, 0px, 0px)';

      // Schedule the slide transition in the next paint cycle completely layout-thrash-free
      requestAnimationFrame(() => {
        if (deckContainerRef.current) {
          deckContainerRef.current.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
          deckContainerRef.current.style.transform = 'translate3d(0px, 0px, 0px)';
        }
      });
    }

    setActiveIndex((prev) => (prev - 1 + sketches.length) % sketches.length);
    setTimeout(() => {
      setIsSwiping(false);
      if (deckContainerRef.current) {
        deckContainerRef.current.style.transition = '';
      }
    }, 450);
  };

  const handleNext = () => {
    if (isSwiping || sketches.length === 0) return;
    setIsSwiping(true);

    if (deckContainerRef.current) {
      deckContainerRef.current.style.transition = 'none';
      deckContainerRef.current.style.transform = 'translate3d(100px, 0px, 0px)';

      // Schedule the slide transition in the next paint cycle completely layout-thrash-free
      requestAnimationFrame(() => {
        if (deckContainerRef.current) {
          deckContainerRef.current.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
          deckContainerRef.current.style.transform = 'translate3d(0px, 0px, 0px)';
        }
      });
    }

    setActiveIndex((prev) => (prev + 1) % sketches.length);
    setTimeout(() => {
      setIsSwiping(false);
      if (deckContainerRef.current) {
        deckContainerRef.current.style.transition = '';
      }
    }, 450);
  };

  const handleDotClick = (idx) => {
    if (isSwiping || idx === activeIndex || sketches.length === 0) return;
    setIsSwiping(true);

    if (deckContainerRef.current) {
      deckContainerRef.current.style.transition = 'transform 0.3s ease';
      deckContainerRef.current.style.transform = 'scale(0.95)';
    }

    setTimeout(() => {
      setActiveIndex(idx);
      setIsSwiping(false);
      if (deckContainerRef.current) {
        deckContainerRef.current.style.transition = '';
        deckContainerRef.current.style.transform = '';
      }
    }, 300);
  };

  const handleCardClick = (index, e) => {
    const totalDragDist = Math.hypot(dragOffsetRef.current.x, dragOffsetRef.current.y);

    if (index !== activeIndex) {
      e.preventDefault();
      if (isSwiping) return;
      handleDotClick(index);
      return;
    }

    if (totalDragDist > 8) {
      e.preventDefault();
    }
  };

  const getCardStyle = (idx) => {
    if (sketches.length === 0) return {};

    let diff = idx - activeIndex;
    const half = Math.floor(sketches.length / 2);

    if (diff > half) {
      diff -= sketches.length;
    } else if (diff < -half) {
      diff += sketches.length;
    }

    const absDiff = Math.abs(diff);
    const isVisible = absDiff <= 3;

    const zIndex = 10 - absDiff;
    const scale = diff === 0 ? 1.15 : 0.9;
    const opacity = diff === 0 ? 1.0 : (isVisible ? 0.6 : 0);

    return {
      transform: `translateX(calc(var(--spacing-step) * ${diff})) scale(${scale})`,
      zIndex,
      opacity,
      pointerEvents: isVisible ? 'auto' : 'none',
    };
  };


  // Real Instagram Data - You can update this with your actual post links and images
  const realInstaData = [
    {
      img: "/uploads/image-1779619184931.jpg",
      link: "https://www.instagram.com/p/DRjx9ZmjDzv/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      likes: "722k",
      views: "4M"
    },
    {
      img: "/uploads/image-1779620926323.jpg",
      link: "https://www.instagram.com/p/DNQQDoPt9no/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      likes: "299k",
      views: "2.2M"
    },
    {
      img: "/uploads/image-1779620978606.jpg",
      link: "https://www.instagram.com/p/DTsWaYNDKAk/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      likes: "70k",
      views: "1.5M"
    },
    {
      img: "/uploads/image-1779621596365.jpg",
      link: "https://www.instagram.com/p/DQWpx0bDOen/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      likes: "161k",
      views: "6.5M"
    },
    {
      img: "/uploads/image-1779620185186.jpg",
      link: "https://www.instagram.com/p/DM-cYhFTD_x/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      likes: "112k",
      views: "2M"
    },
    {
      img: "/uploads/image-1779621126636.jpg",
      link: "https://www.instagram.com/reel/DKZjmYJTSGI/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      likes: "132k",
      views: "1.3M"
    },
    {
      img: "/uploads/image-1779624354302.jpg",
      link: "https://www.instagram.com/p/DLUtFGyz4cl/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      likes: "519K",
      views: "8.2M"
    },
    {
      img: "/uploads/20250501_170736.jpg",
      link: "https://www.instagram.com/p/DMpsdmzTKtE/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      likes: "776k",
      views: "10.2M"
    },
    {
      img: "/uploads/IMG_20250910_132538552.jpg",
      link: "https://www.instagram.com/p/DQMWuInkwD3/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      likes: "241k",
      views: "10M"
    },
    {
      img: "/uploads/3ba6c9cf-3e01-4c79-95c1-dfd01f5611b5.png",
      link: "https://www.instagram.com/p/DPOdi18jPf4/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      likes: "132k",
      views: "1.3M"
    },
    {
      img: "/uploads/image-1779621466741.jpg",
      link: "https://www.instagram.com/p/DO3UbYHE6eC/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
      likes: "206k",
      views: "1.6M"
    },


  ];
  const heroRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/sketches`);
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setSketches(data);
        } else {
          throw new Error('Fetched data is not an array');
        }
        // Background images removed for performance
      } catch (error) {
        console.error('Failed to fetch sketches:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Magnetic button effect
  const handleMagnetic = useCallback((e) => {
    const btn = e.currentTarget;
    const bound = btn.getBoundingClientRect();
    const x = e.clientX - bound.left - bound.width / 2;
    const y = e.clientY - bound.top - bound.height / 2;
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  }, []);

  const resetMagnetic = useCallback((e) => {
    e.currentTarget.style.transform = 'translate(0px, 0px)';
  }, []);

  const canvasRef = useRef(null);
  const maskRef = useRef(null);

  useEffect(() => {
    // Skip canvas on touch devices — no mouse interactions there
    if (window.matchMedia('(hover: none)').matches) return;
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const updateCanvasSize = () => {
      if (!maskRef.current) return;
      const rect = maskRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize, { passive: true });
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // rAF throttle — prevents toDataURL() running 100+ times/sec on fast mouse moves
  const rafIdRef = useRef(null);

  const handleTitleMove = (e) => {
    if (rafIdRef.current) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      const el = e.currentTarget;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (centerY - y) / 10;
      const rotateY = (x - centerX) / 20;
      el.style.setProperty('--rotate-x', `${rotateX}deg`);
      el.style.setProperty('--rotate-y', `${rotateY}deg`);

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x, y, 50, 0, Math.PI * 2);
        ctx.fill();
        const maskUrl = canvasRef.current.toDataURL();
        el.style.setProperty('--mask-url', `url(${maskUrl})`);
      }
    });
  };

  const handleTitleLeave = (e) => {
    const el = e.currentTarget;
    el.style.setProperty('--rotate-x', '0deg');
    el.style.setProperty('--rotate-y', '0deg');
  };

  return (
    <>

      {/* Hero Section with Interactive Spotlight Sketch Collage */}
      <section
        ref={heroRef}
        className="hero-section"
        onMouseMove={(e) => {
          if (!heroRef.current) return;
          const rect = heroRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          heroRef.current.style.setProperty('--mouse-x', `${x}px`);
          heroRef.current.style.setProperty('--mouse-y', `${y}px`);
        }}
        onMouseLeave={() => {
          if (!heroRef.current) return;
          heroRef.current.style.setProperty('--mouse-x', `-999px`);
          heroRef.current.style.setProperty('--mouse-y', `-999px`);
        }}
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#0d0710'
        }}
      >
        {/* Dynamic Ethereal Collage Background of Sketches (Desktop/Tablet >= 768px) */}
        <div className="hero-spotlight-bg" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}>
          {/* Layer 1: The Blurred Background Collage */}
          <div className="collage-grid blurred-collage" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            width: '100%',
            height: '100%',
            filter: 'blur(25px) brightness(0.2)',
            opacity: 0.7,
            gap: '15px'
          }}>
            {sketches.length > 0 ? (
              sketches.slice(0, 8).map((sketch, idx) => (
                <div key={idx} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                  <img
                    src={sketch.images?.[0]}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))
            ) : (
              // Pre-populated Fallback if empty/loading
              Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)' }}></div>
              ))
            )}
          </div>

          {/* Layer 2: The Sharp Spotlight Collage Layer */}
          {sketches.length > 0 && (
            <div className="collage-grid sharp-collage" style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: 'repeat(2, 1fr)',
              gap: '15px',
              opacity: 0.8,
              maskImage: `radial-gradient(circle 180px at var(--mouse-x, -999px) var(--mouse-y, -999px), black 30%, transparent 100%)`,
              WebkitMaskImage: `radial-gradient(circle 180px at var(--mouse-x, -999px) var(--mouse-y, -999px), black 30%, transparent 100%)`,
              pointerEvents: 'none'
            }}>
              {sketches.slice(0, 8).map((sketch, idx) => (
                <div key={idx} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                  <img
                    src={sketch.images?.[0]}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Layer 3: Extra Luxury Ambient Dark Gradients */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(13, 7, 16, 0.4) 0%, rgba(13, 7, 16, 0.98) 100%), radial-gradient(circle at center, rgba(13, 7, 16, 0.1) 0%, rgba(13, 7, 16, 0.98) 90%)',
            zIndex: 2,
            pointerEvents: 'none'
          }}></div>
        </div>

        {/* Mobile-Only Premium Art Gallery Background (< 768px) */}
        <div className="hero-mobile-blur-bg">
          {/* Layer 1: Heavily blurred background wall using the custom gallery image for realistic texture/lighting */}
          <div className="mobile-blurred-wall-bg" style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('/mobile-gallery-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            filter: 'blur(16px) brightness(0.28)',
            zIndex: 1
          }} />

          {/* Layer 2: Dynamic Hanging Frames with User's Own Sketches */}
          <div className="mobile-exhibition-wall" style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            pointerEvents: 'none'
          }}>
            {[
              {
                style: { top: '5%', left: '4%', width: '105px', height: '145px', transform: 'rotate(-2.5deg)', filter: 'blur(0.8px) brightness(0.65)' },
                frameClass: 'frame-luxury-brass',
                matWidth: '9px'
              },
              {
                style: { top: '10%', right: '3%', width: '135px', height: '90px', transform: 'rotate(2deg)', filter: 'blur(1.5px) brightness(0.55)' },
                frameClass: 'frame-minimal-black',
                matWidth: '11px'
              },
              {
                style: { top: '30%', left: '3%', width: '85px', height: '85px', transform: 'rotate(3deg)', filter: 'blur(0.6px) brightness(0.7)' },
                frameClass: 'frame-rustic-wood',
                matWidth: '8px'
              },
              {
                style: { top: '38%', right: '2%', width: '75px', height: '120px', transform: 'rotate(-1.5deg)', filter: 'blur(1px) brightness(0.6)' },
                frameClass: 'frame-classic-oak',
                matWidth: '10px'
              },
              {
                style: { bottom: '7%', left: '5%', width: '100px', height: '100px', transform: 'rotate(1.8deg)', filter: 'blur(1.4px) brightness(0.58)' },
                frameClass: 'frame-textured-charcoal',
                matWidth: '8px'
              },
              {
                style: { bottom: '11%', right: '4%', width: '95px', height: '135px', transform: 'rotate(-2deg)', filter: 'blur(0.5px) brightness(0.72)' },
                frameClass: 'frame-luxury-gold',
                matWidth: '11px'
              }
            ].map((config, idx) => {
              const sketchImg = sketches.length > 0
                ? (sketches[idx % sketches.length]?.images?.[0] || realInstaData[idx % realInstaData.length].img)
                : realInstaData[idx % realInstaData.length].img;

              return (
                <div
                  key={idx}
                  className={`gallery-hanging-frame ${config.frameClass}`}
                  style={config.style}
                >
                  <div className="mat-board" style={{ padding: config.matWidth }}>
                    <div className="sketch-wrapper">
                      <img
                        src={sketchImg}
                        alt=""
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Frosted Glass Overlay & Symmetrical Readability Center Vignette */}
          <div className="mobile-frosted-vignette" />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-taglines">
            <p className="hero-tagline hero-tagline-1">Crafted by Hands. Felt by  <span className="text-gradient">Hearts.</span></p>
            <p className="hero-tagline hero-tagline-2">Not Prints. Not Copies. Just Soul.</p>
            <p className="hero-tagline hero-tagline-3">Real Art. Real Artist. <span className="text-gradient">Real Stories.</span></p>
          </div>

          <div className="hero-btn-container">
            <a href="/gallery" className="hero-explore-btn">
              <span className="hero-explore-btn__text">Explore the Gallery</span>
              <span className="hero-explore-btn__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
            </a>
            <a href="/custom-request" className="hero-custom-btn">
              <span className="hero-custom-btn__text">Custom Request</span>
              <span className="hero-custom-btn__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </span>
            </a>
          </div>

          {/* SVG Filter for Artistic Edges */}
          <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <filter id="brush-filter">
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" />
            </filter>
          </svg>
        </div>

        {/* Marquee Section inside Hero to appear on first screen on mobile */}
        <div className="marquee-section marquee-hero-mobile">
          <div className="marquee-container">
            <div className="marquee-content">
              {['CHARCOAL', 'GRAPHITE', 'PORTRAITS', 'GOD SKETCHES', 'CUSTOM ART', 'MINIMALIST', 'REALISM'].map((text, i) => (
                <div key={i} className="marquee-item outline-text">
                  <span>{text}</span>
                </div>
              ))}
              {['CHARCOAL', 'GRAPHITE', 'PORTRAITS', 'GOD SKETCHES', 'CUSTOM ART', 'MINIMALIST', 'REALISM'].map((text, i) => (
                <div key={i + 100} className="marquee-item outline-text">
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Section below Hero on laptop/desktop */}
      <div className="marquee-section marquee-hero-desktop">
        <div className="marquee-container">
          <div className="marquee-content">
            {['CHARCOAL', 'GRAPHITE', 'PORTRAITS', 'GOD SKETCHES', 'CUSTOM ART', 'MINIMALIST', 'REALISM'].map((text, i) => (
              <div key={i} className="marquee-item outline-text">
                <span>{text}</span>
              </div>
            ))}
            {['CHARCOAL', 'GRAPHITE', 'PORTRAITS', 'GOD SKETCHES', 'CUSTOM ART', 'MINIMALIST', 'REALISM'].map((text, i) => (
              <div key={i + 100} className="marquee-item outline-text">
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Bento Grid */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">COLLECTION</span>
            <h2>FEATURED <span className="text-gradient">WORKS</span></h2>
            <p>The ones that took the most, gave the most, and left a mark before they left my hands.</p>
          </div>

          <div className="gallery-grid">
            {loading ? (
              Array.from({ length: gridLimit }).map((_, idx) => (
                <div key={idx} className="gallery-item skeleton-card">
                  <div className="gallery-img-wrapper skeleton-img"></div>
                  <div className="gallery-overlay" style={{ background: 'transparent' }}>
                    <div style={{ width: '100%' }}>
                      <div className="skeleton-text" style={{ width: '70%', margin: '0 auto' }}></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              sketches.slice(0, gridLimit).map((sketch) => (
                <Link to={`/product/${sketch._id}`} key={sketch._id} className="gallery-item">
                  <div className="gallery-img-wrapper">
                    <img
                      src={sketch.images[0]}
                      alt={sketch.title}
                      loading="lazy"
                      decoding="async"
                      width="400"
                      height="533"
                    />
                  </div>
                  <div className="gallery-overlay">
                    <h3 className="gallery-title">
                      {sketch.title}
                    </h3>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="explore-more-container">
            <Link to="/gallery" className="btn btn-outline" style={{ borderRadius: '99px', padding: '1rem 3rem', borderColor: 'var(--border-color)', color: 'var(--text-white)' }}>
              EXPLORE FULL GALLERY
            </Link>
          </div>
        </div>
      </section>

      {/* Sketch Showcase Section*/}
      <section className="sketch-showcase-section">
        {/* Cinematic Blurred Background */}
        <div className="slider-blur-bg" />

        <div className="container" style={{ position: 'relative', zIndex: 3 }}>
          <div className="section-header">
            <span className="section-badge">PORTFOLIO</span>
            <h2>ART THAT <span className="text-gradient">INSPIRES</span></h2>
            <p>Drag the fanned artwork deck or tap on any background card to cycle. Tapping the active sketch opens its story.</p>
          </div>

          <div className="sketch-slider-wrapper">
            {loading ? (
              <div className="sketch-deck-container">
                <div className="showcase-card skeleton-card" style={{ transform: 'translateX(-120px) scale(0.9) rotate(-5deg)', zIndex: 8, opacity: 0.6 }}>
                  <div className="showcase-img-wrapper skeleton-img"></div>
                </div>
                <div className="showcase-card skeleton-card" style={{ transform: 'translateX(0) scale(1.1) rotate(0)', zIndex: 10, opacity: 1 }}>
                  <div className="showcase-img-wrapper skeleton-img"></div>
                </div>
                <div className="showcase-card skeleton-card" style={{ transform: 'translateX(120px) scale(0.9) rotate(5deg)', zIndex: 8, opacity: 0.6 }}>
                  <div className="showcase-img-wrapper skeleton-img"></div>
                </div>
              </div>
            ) : sketches.length === 0 ? (
              <div className="loading-state">No sketches found.</div>
            ) : (
              <>
                <div
                  className="sketch-deck-container"
                  ref={deckContainerRef}
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                >
                  {sketches.map((sketch, idx) => {
                    const isCardActive = idx === activeIndex;
                    const cardStyle = getCardStyle(idx);

                    return (
                      <Link
                        to={`/product/${sketch._id}`}
                        key={sketch._id}
                        onClick={(e) => handleCardClick(idx, e)}
                        className={`showcase-card ${isCardActive ? 'is-active' : ''}`}
                        style={cardStyle}
                        aria-label={`View artwork: ${sketch.title}`}
                      >
                        <div className="showcase-img-wrapper">
                          <img
                            src={sketch.images[0]}
                            alt={sketch.title}
                            loading={isCardActive ? "eager" : "lazy"}
                            decoding="async"
                            width="280"
                            height="380"
                          />

                          {/* Artwork tagline display overlay - exclusive to active card via CSS opacity transition */}
                          <div className="showcase-info">
                            <span>{sketch.tagline || sketch.category}</span>
                          </div>

                          {/* Active visual hint */}
                          {isCardActive && (
                            <div className="card-swipe-hint">
                              <span className="hint-arrow">←</span>
                              <span className="hint-text">Drag</span>
                              <span className="hint-arrow">→</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Controls Bar */}
                <div className="sketch-slider-controls glass">
                  <button
                    onClick={handlePrev}
                    className="slider-btn prev-btn"
                    aria-label="Previous artwork"
                    disabled={isSwiping}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                  </button>

                  <button
                    onClick={handleNext}
                    className="slider-btn next-btn"
                    aria-label="Next artwork"
                    disabled={isSwiping}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Instagram Feed Section (Marquee Style) */}
      <section className="instagram-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">LIVE FROM THE STUDIO</span>
            <h2>INSTAGRAM <span className="text-gradient">FEEDS</span></h2>
            <p>Not every sketch makes it here. The ones that do, you'll know why it the moment you see them.</p>
          </div>
        </div>

        <div className="insta-marquee">
          <div className="insta-track">
            {realInstaData.map((post, i) => (
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                key={`insta-${i}`}
                className="insta-card"
              >
                <div className="insta-img-container">
                  <img
                    src={post.img}
                    alt="Instagram post"
                    loading="lazy"
                    decoding="async"
                    width="300"
                    height="300"
                  />
                </div>
                <div className="insta-info">
                  <div className="insta-stat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                    <span>{post.likes}</span>
                  </div>
                  <div className="insta-stat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    <span>{post.views}</span>
                  </div>
                </div>
              </a>
            ))}
            {/* Duplicate for seamless scroll */}
            {realInstaData.map((post, i) => (
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                key={`insta-dup-${i}`}
                className="insta-card"
              >
                <div className="insta-img-container">
                  <img
                    src={post.img}
                    alt="Instagram post"
                    loading="lazy"
                    decoding="async"
                    width="300"
                    height="300"
                  />
                </div>
                <div className="insta-info">
                  <div className="insta-stat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                    <span>{post.likes}</span>
                  </div>
                  <div className="insta-stat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    <span>{post.views}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

      </section>

      <style>{`
        /* ═══════════════════════════════════════
           ETHEREAL OBSIDIAN — Stitch Theme
           Project: Luxury Art Portfolio Redesign
           ═══════════════════════════════════════ */
        /* Fonts loaded via index.html — no @import needed here */

        /* Desktop vs Mobile Hero Background Display */
        @media (min-width: 768px) {
          .hero-spotlight-bg {
            display: block !important;
          }
          .hero-mobile-blur-bg {
            display: none !important;
          }
        }
        
        @media (max-width: 767px) {
          .hero-spotlight-bg {
            display: none !important;
          }
          .hero-mobile-blur-bg {
            display: block !important;
            position: absolute;
            inset: 0;
            z-index: 1;
            overflow: hidden;
            background: #08040a;
          }
          
          /* Luxury hanging frames styling */
          .gallery-hanging-frame {
            position: absolute;
            box-sizing: border-box;
            border-radius: 2px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
            will-change: transform, filter;
          }

          /* Luxury Frame Materials */
          .frame-luxury-gold {
            border: 4px solid #c59b27;
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.65), 
                        0 2px 6px rgba(0, 0, 0, 0.4), 
                        inset 0 0 4px rgba(0, 0, 0, 0.3);
          }

          .frame-luxury-brass {
            border: 3.5px solid #a38c64;
            box-shadow: 0 11px 26px rgba(0, 0, 0, 0.6), 
                        0 2px 5px rgba(0, 0, 0, 0.38), 
                        inset 0 0 3px rgba(0, 0, 0, 0.25);
          }

          .frame-minimal-black {
            border: 3px solid #141414;
            box-shadow: 0 10px 24px rgba(0, 0, 0, 0.55), 
                        0 2px 4px rgba(0, 0, 0, 0.35);
          }

          .frame-classic-oak {
            border: 4px solid #946c48;
            box-shadow: 0 11px 25px rgba(0, 0, 0, 0.58), 
                        0 2px 5px rgba(0, 0, 0, 0.32);
          }

          .frame-rustic-wood {
            border: 4.5px solid #4a3224;
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.62), 
                        0 3px 6px rgba(0, 0, 0, 0.38);
          }

          .frame-textured-charcoal {
            border: 3.5px solid #292929;
            box-shadow: 0 10px 22px rgba(0, 0, 0, 0.52), 
                        0 2px 4px rgba(0, 0, 0, 0.3);
          }

          /* Passpartout/Mat-board */
          .mat-board {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            background: #f7f5f0; /* Warm off-white museum matting */
            box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.15);
          }

          /* Sketch Canvas Wrapper */
          .sketch-wrapper {
            width: 100%;
            height: 100%;
            overflow: hidden;
            box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.25);
            background: #111;
          }

          .sketch-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: contrast(1.08) brightness(0.95);
          }
          
          /* Frosted iOS overlay & center darkness vignette for text readability */
          .mobile-frosted-vignette {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at center, rgba(13, 7, 16, 0.05) 0%, rgba(13, 7, 16, 0.45) 55%, rgba(13, 7, 16, 0.9) 100%),
                        linear-gradient(to bottom, rgba(13, 7, 16, 0.2) 0%, rgba(13, 7, 16, 0.98) 100%);
            backdrop-filter: blur(1.5px);
            -webkit-backdrop-filter: blur(1.5px);
            z-index: 3;
            pointer-events: none;
          }
        }

        /* ─── High Performance GPU-friendly Floating Blob Animations ─── */
        @keyframes floatBlob1 {
          0% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          50% { transform: translate3d(15px, 20px, 0) scale(1.05) rotate(4deg); }
          100% { transform: translate3d(-10px, -15px, 0) scale(0.95) rotate(-3deg); }
        }
        @keyframes floatBlob2 {
          0% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          50% { transform: translate3d(-20px, 15px, 0) scale(0.95) rotate(-6deg); }
          100% { transform: translate3d(15px, -20px, 0) scale(1.05) rotate(5deg); }
        }
        @keyframes floatBlob3 {
          0% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          50% { transform: translate3d(20px, -10px, 0) scale(1.08) rotate(5deg); }
          100% { transform: translate3d(-15px, 25px, 0) scale(0.92) rotate(-4deg); }
        }
        @keyframes floatBlob4 {
          0% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          50% { transform: translate3d(-15px, -25px, 0) scale(0.93) rotate(-5deg); }
          100% { transform: translate3d(20px, 10px, 0) scale(1.06) rotate(6deg); }
        }
        @keyframes floatBlob5 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(10px, -15px, 0) scale(1.1); }
          100% { transform: translate3d(-12px, 12px, 0) scale(0.9); }
        }

        /* Hero Section */
        .hero-section {
          min-height: 90vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          z-index: 2;
          padding: 4rem 0 3rem 0;
        }
        
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2.5rem;
          padding: 0.5rem 1.25rem;
          background: rgba(189, 0, 255, 0.12);
          border: 1px solid rgba(189, 0, 255, 0.3);
          border-radius: 9999px;
          font-family: 'Manrope', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--primary);
        }
        
        .hero-badge .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--secondary-container);
          box-shadow: 0 0 8px var(--secondary-container);
        }
        
        .hero-taglines {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          margin: 2rem 0;
        }

        .hero-tagline {
          font-family: 'Epilogue', sans-serif;
          font-weight: 800;
          text-align: center;
          line-height: 1.2;
          opacity: 0;
          animation: taglineFadeUp 0.7s ease forwards;
        }

        .hero-tagline-1 {
          font-size: clamp(1.8rem, 5vw, 3.5rem);
          color: rgba(220, 210, 225, 0.75);
          letter-spacing: -1px;
          animation-delay: 0.1s;
        }

        .hero-tagline-2 {
          font-size: clamp(1.4rem, 4vw, 2.5rem);
          color: var(--outline, #bcaaa4);
          font-style: italic;
          font-weight: 600;
          animation-delay: 0.3s;
        }

        .hero-tagline-3 {
          font-size: clamp(1.2rem, 3vw, 2rem);
          color: var(--outline, #bcaaa4);
          font-weight: 600;
          animation-delay: 0.5s;
        }

        @keyframes taglineFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-btn-container {
          margin-top: 2.5rem;
          display: flex;
          justify-content: center;
          gap: 1.25rem;
          flex-wrap: wrap;
          opacity: 0;
          animation: taglineFadeUp 0.7s ease 0.7s forwards;
        }

        /* Custom Request Button */
        .hero-custom-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2.25rem;
          border-radius: 9999px;
          font-family: 'Manrope', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          color: #fff;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(189, 0, 255, 0.5);
          position: relative;
          transition: all 0.3s ease;
          box-shadow: 0 0 8px rgba(189, 0, 255, 0.1), 0 3px 10px rgba(0,0,0,0.2);
        }
        .hero-custom-btn:hover {
          background: rgba(189, 0, 255, 0.15);
          border-color: #ff36c8;
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 0 16px rgba(189, 0, 255, 0.25), 0 6px 18px rgba(0,0,0,0.25);
          color: #fff;
        }
        .hero-custom-btn:hover .hero-custom-btn__icon {
          transform: translateX(5px);
        }
        .hero-custom-btn__icon {
          display: flex;
          align-items: center;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        /* Explore Gallery Button */
        .hero-explore-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2.25rem;
          border-radius: 9999px;
          font-family: 'Manrope', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          color: #fff;
          background: linear-gradient(135deg, #bd00ff 0%, #ff36c8 60%, #ff8c00 100%);
          background-size: 200% 200%;
          background-position: 0% 50%;
          border: none;
          position: relative;
          transition: background-position 0.5s ease, transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 0 8px rgba(189, 0, 255, 0.15), 0 3px 10px rgba(0,0,0,0.25);
        }
        .hero-explore-btn::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #bd00ff, #ff36c8, #ff8c00);
          z-index: -1;
          filter: blur(8px);
          opacity: 0.15;
          transition: opacity 0.3s ease;
        }
        .hero-explore-btn:hover {
          background-position: 100% 50%;
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 0 16px rgba(189, 0, 255, 0.25), 0 6px 18px rgba(0,0,0,0.3);
          color: #fff;
        }
        .hero-explore-btn:hover::before {
          opacity: 0.3;
        }
        .hero-explore-btn:hover .hero-explore-btn__icon {
          transform: translateX(5px);
        }
        .hero-explore-btn__icon {
          display: flex;
          align-items: center;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .advanced-title {
          display: inline-block;
          transform: rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg));
          transform-style: preserve-3d;
        }

        .paintable-title {
          -webkit-mask-image: var(--mask-url);
          mask-image: var(--mask-url);
          mask-repeat: no-repeat;
          -webkit-mask-repeat: no-repeat;
        }

        .title-base {
          color: white;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1;
          pointer-events: none;
          opacity: 0.8;
        }

        .painted-layer {
          position: relative;
          z-index: 2;
          color: white;
          background: linear-gradient(90deg, var(--primary-color), var(--accent-color), var(--secondary-color), var(--primary-color));
          background-size: 300% 100%;
          animation: gradientMove 3s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          mask-image: var(--mask-url);
          -webkit-mask-image: var(--mask-url);
          mask-repeat: no-repeat;
          -webkit-mask-repeat: no-repeat;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }

        /* Splatter Effects */
        .splatter {
          position: absolute;
          background: var(--accent-color);
          border-radius: 50%;
          filter: blur(2px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }

        .artistic-title:hover .splatter {
          opacity: 0.6;
        }

        .splatter-1 {
          width: 20px; height: 20px;
          top: var(--mouse-y); left: calc(var(--mouse-x) + 40px);
          transition: all 0.2s ease-out;
        }
        .splatter-2 {
          width: 10px; height: 10px;
          top: calc(var(--mouse-y) - 30px); left: var(--mouse-x);
          transition: all 0.3s ease-out;
        }
        .splatter-3 {
          width: 15px; height: 15px;
          top: calc(var(--mouse-y) + 20px); left: calc(var(--mouse-x) - 50px);
          transition: all 0.25s ease-out;
        }

        /* Add a glow behind the spotlight */
        .advanced-title::after {
          content: '';
          position: absolute;
          top: var(--mouse-y, -100%);
          left: var(--mouse-x, -100%);
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(112, 0, 255, 0.3) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: -1;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #ecb2ff 0%, #bd00ff 50%, #ff36c8 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: #bd00ff;
          display: inline-block;
        }
        
        .magnetic-button {
          display: inline-block;
          margin-bottom: 4rem;
        }
        
        .explore-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: linear-gradient(135deg, #bd00ff 0%, #ff36c8 100%);
          color: #fff;
          font-family: 'Epilogue', sans-serif;
          font-size: 0.9rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-decoration: none;
          text-transform: uppercase;
          transition: all 0.3s ease;
          position: relative;
          box-shadow: 0 0 40px rgba(189, 0, 255, 0.35);
        }
        
        .explore-btn:hover {
          transform: scale(1.06);
          box-shadow: 0 0 60px rgba(189, 0, 255, 0.55);
        }
        
        .btn-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 1.5px solid rgba(189, 0, 255, 0.5);
          animation: pulse 2s ease-out infinite;
        }
        .btn-ring-2 { animation-delay: 0.5s; }
        
        @keyframes pulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        /* ─── Glass Stats Bar ─── */
        .hero-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3rem;
          margin-top: 3rem;
          padding: 1.75rem 3rem;
          background: rgba(38, 28, 40, 0.65);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 192, 215, 0.12);
          border-radius: 9999px;
          flex-wrap: wrap;
        }
        
        .stat { text-align: center; }
        
        .stat-number {
          display: block;
          font-family: 'Epilogue', sans-serif;
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--primary);
          line-height: 1;
          margin-bottom: 0.25rem;
        }
        
        .stat-label {
          font-family: 'Manrope', sans-serif;
          font-size: 0.7rem;
          color: var(--outline);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        
        .stat-divider {
          width: 1px;
          height: 36px;
          background: var(--outline-variant);
        }
        
        /* ─── Marquee ─── */
        .marquee-section {
          border-top: 1px solid var(--outline-variant);
          border-bottom: 1px solid var(--outline-variant);
          background: var(--surface);
          position: relative;
          z-index: 2;
          overflow: hidden;
        }
        
        .marquee-hero-mobile {
          display: none;
        }
        
        .marquee-hero-desktop {
          display: block;
        }
        
        .marquee-container { overflow: hidden; white-space: nowrap; }
        
        .marquee-content {
          display: inline-flex;
          gap: 4rem; /* Symmetrical separation between marquee categories */
          animation: marqueeScroll 22s linear infinite;
          will-change: transform;
        }
        
        .marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 4rem;
          padding: 2.5rem 0;
        }
        
        .marquee-item span {
          font-family: 'Epilogue', sans-serif;
          font-size: 2.5rem;
          font-weight: 900;
          color: var(--on-surface);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        
        .marquee-item.outline-text span {
          -webkit-text-stroke: 1.5px var(--on-surface);
          color: transparent;
        }
        
        .marquee-dot {
          width: 12px; height: 12px;
          border-radius: 50%;
          background: var(--secondary-container);
          box-shadow: 0 0 10px var(--secondary-container);
        }
        
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        /* ─── Featured Section ─── */
        .featured-section {
          padding: 4rem 0;
          position: relative;
          z-index: 2;
          background: var(--surface-container-low);
        }
        
        .section-header { text-align: center; margin-bottom: 4rem; }
        .explore-more-container { text-align: center; margin-top: 3rem; }
        
        .section-badge {
          display: inline-block;
          padding: 0.4rem 1rem;
          background: rgba(189, 0, 255, 0.12);
          color: var(--primary);
          border: 1px solid rgba(189, 0, 255, 0.25);
          border-radius: 9999px;
          font-family: 'Manrope', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }
        
        .section-header h2 {
          font-family: 'Epilogue', sans-serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--on-surface);
          margin-bottom: 1rem;
        }
        
        .section-header p {
          font-family: 'Manrope', sans-serif;
          color: var(--outline);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.7;
        }
        
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-top: 2rem;
        }
        
        .gallery-item {
          position: relative;
          overflow: hidden;
          border-radius: 1.5rem;
          text-decoration: none;
          color: var(--on-surface);
          background: var(--surface-container);
          border: 1px solid var(--outline-variant);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .gallery-img-wrapper { aspect-ratio: 3/4; overflow: hidden; }
        
        .gallery-item img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        
        .gallery-item:hover {
          transform: translateY(-10px);
          border-color: var(--primary-container);
          box-shadow: 0 20px 50px rgba(189, 0, 255, 0.18);
        }
        
        .gallery-item:hover img { transform: scale(1.05); }
        
        .gallery-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 1.5rem;
          background: linear-gradient(transparent, rgba(25,16,28,0.95));
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        
        .gallery-category {
          font-family: 'Manrope', sans-serif;
          font-size: 0.65rem;
          color: var(--primary);
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 0.35rem;
        }
        
        .gallery-title {
          font-family: 'Epilogue', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--on-surface);
          margin: 0;
        }

        /* ─── Skeleton Loaders (Prevents CLS) ─── */
        .skeleton-card {
          pointer-events: none;
        }
        .skeleton-img {
          background: rgba(189, 0, 255, 0.05);
          animation: skeletonShimmer 1.5s infinite linear;
        }
        .skeleton-text {
          height: 1rem;
          background: rgba(189, 0, 255, 0.05);
          border-radius: 4px;
          animation: skeletonShimmer 1.5s infinite linear;
        }
        @keyframes skeletonShimmer {
          0% { background-color: rgba(189, 0, 255, 0.05); }
          50% { background-color: rgba(189, 0, 255, 0.15); }
          100% { background-color: rgba(189, 0, 255, 0.05); }
        }

        
        .gallery-price {
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          font-size: 1rem;
          color: var(--secondary);
        }
        
        .loading-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem;
          color: var(--outline);
        }
        
        @media (max-width: 1024px) { .gallery-grid { grid-template-columns: repeat(3, 1fr); } }
        
        @media (max-width: 768px) {
          .hero-section {
            padding: 5rem 0 5.5rem; /* Breathing symmetrical margins with space for marquee at bottom */
            min-height: 100vh; /* Fill the viewport professionally in the first screen */
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .marquee-hero-mobile {
            display: block;
          }

          .marquee-hero-desktop {
            display: none;
          }

          /* Absolute positioned marquee inside first screen view */
          .marquee-section {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            z-index: 10;
            background: rgba(10, 5, 14, 0.82);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border-top: 1px solid rgba(189, 0, 255, 0.12);
            border-bottom: none;
          }

          .marquee-content {
            gap: 2rem;
            animation-duration: 18s;
          }

          .marquee-item {
            padding: 0.55rem 0;
            gap: 2rem;
          }

          .marquee-item span {
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.2em;
          }

          .marquee-item.outline-text span {
            -webkit-text-stroke: 0.8px rgba(255,255,255,0.45);
            color: transparent;
          }

          .marquee-dot {
            width: 4px;
            height: 4px;
          }
          .hero-taglines {
            gap: 1rem;
            margin: 1.5rem 0;
          }
          .hero-tagline-1 {
            font-size: 2.3rem; /* Prominent main title */
            letter-spacing: -0.5px;
            line-height: 1.25;
            color: #fff; /* Crisp white center stage */
          }
          .hero-tagline-2 {
            font-size: 1.25rem; /* Elegant secondary sub-tagline */
            margin-top: 0.5rem;
          }
          .hero-tagline-3 {
            font-size: 1.15rem; /* Elegant tertiary detail */
            margin-top: 0.25rem;
          }
          .hero-btn-container {
            margin-top: 2rem;
            gap: 1rem;
          }
          .hero-explore-btn, .hero-custom-btn {
            padding: 0.85rem 2rem;
            font-size: 0.9rem;
          }
          .section-header {
            margin-bottom: 1.5rem;
            padding: 0 1rem;
          }
          .section-header h2 {
            font-size: clamp(1.4rem, 6vw, 1.8rem);
            line-height: 1.25;
          }
          .section-header p {
            font-size: clamp(0.8rem, 3.5vw, 0.9rem);
            line-height: 1.4;
            margin-top: 0.5rem;
          }
          .featured-section {
            padding: 3rem 0;
          }
          .explore-more-container {
            margin-top: 1.5rem;
          }
          .gallery-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
          }
          .gallery-item {
            border-radius: 0.75rem;
          }
          /* ── FEATURED WORKS cards: showcase-info style on mobile ── */
          .gallery-item:hover {
            transform: none; /* Disable desktop lift on touch */
          }
          .gallery-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 1.25rem 0.85rem;
            background: linear-gradient(transparent, rgba(13, 7, 16, 0.98) 70%);
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            gap: 0;
            /* Always visible on touch — no hover dependency */
            opacity: 1;
            transform: translateY(0);
          }
          .gallery-category {
            display: none;
          }
          .gallery-title {
            font-family: 'Epilogue', sans-serif;
            font-size: clamp(0.6rem, 2.5vw, 0.8rem);
            color: #fff;
            font-weight: 700;
            text-transform: capitalize;
            letter-spacing: 0.01em;
            text-align: center;
            margin: 0;
            line-height: 1.3;
            text-shadow: 0 2px 4px rgba(0,0,0,0.6);
          }
          .gallery-price {
            display: none;
          }
          .hero-stats { flex-direction: column; gap: 1rem; border-radius: 1.5rem; padding: 1.5rem 2rem; }
          .stat-divider { display: none; }
          .explore-btn { width: 140px; height: 140px; font-size: 0.8rem; }

          /* Instagram Mobile Customizations */
          .instagram-section {
            padding: 4rem 0;
          }
          .insta-marquee {
            margin-top: 2rem;
          }
          .insta-track {
            gap: 0.75rem;
            animation-duration: 15s;
          }
          .insta-card {
            width: 150px;
            border-radius: 0.75rem;
          }
          .insta-info {
            padding: 0.5rem 0.75rem;
            gap: 0.75rem;
          }
          .insta-stat {
            gap: 0.25rem;
            font-size: 0.7rem;
          }
          .insta-stat svg {
            width: 12px;
            height: 12px;
          }
        }

        /* ─── Sketch Showcase (Interactive 3D Fanned Overlapping Carousel) ─── */
        .sketch-showcase-section {
          padding: 6rem 0;
          background: var(--surface-container-lowest);
          position: relative;
          z-index: 2;
          overflow: hidden;
        }

        /* Cinematic Background Blur - Sleek radial gradient replacing CPU-heavy blurred images */
        .slider-blur-bg {
          position: absolute;
          inset: 0;
          z-index: 1;
          overflow: hidden;
          pointer-events: none;
          background: radial-gradient(circle at 50% 50%, rgba(189, 0, 255, 0.08) 0%, rgba(25, 16, 28, 0.04) 60%, rgba(19, 11, 22, 0.95) 100%);
          opacity: 0.9;
        }

        .sketch-slider-wrapper {
          position: relative;
          z-index: 3;
          margin-top: 4rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          overflow: visible;
        }

        /* 3D Overlapping deck Container */
        .sketch-deck-container {
          --spacing-step: 180px;
          position: relative;
          width: 100%;
          max-width: 100%;
          height: 480px;
          margin-bottom: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          touch-action: none;
          cursor: grab;
          perspective: 1500px;
          transform-style: preserve-3d;
          will-change: transform;
        }

        .sketch-deck-container:active {
          cursor: grabbing;
        }

        /* Individual flat artwork card */
        .showcase-card {
          position: absolute;
          width: 280px;
          height: 380px;
          border-radius: 1.75rem;
          overflow: hidden;
          text-decoration: none;
          color: var(--on-surface);
          background: var(--surface-container);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4),
                      0 1px 0 rgba(255, 255, 255, 0.1) inset;
          
          /* Center absolute card inside deck container */
          top: calc(50% - 190px);
          left: calc(50% - 140px);
          
          /* Flat transitions when index changes - Snappy 0.45s to match JS timers */
          transition: transform 0.45s cubic-bezier(0.25, 1, 0.5, 1),
                      opacity 0.45s cubic-bezier(0.25, 1, 0.5, 1),
                      border-color 0.4s ease,
                      box-shadow 0.4s ease;
          
          will-change: transform, opacity;
          transform-origin: center center; /* Flat pivot anchor */
          touch-action: none;
          user-select: none;
        }

        /* Hover glows and elevations on the active card */
        .showcase-card.is-active {
          box-shadow: 0 30px 60px rgba(189, 0, 255, 0.22),
                      0 0 40px rgba(189, 0, 255, 0.1),
                      0 1px 0 rgba(255, 255, 255, 0.15) inset;
          border-color: rgba(189, 0, 255, 0.25);
        }

        .showcase-card.is-active:hover {
          border-color: rgba(189, 0, 255, 0.4);
          box-shadow: 0 35px 70px rgba(189, 0, 255, 0.32),
                      0 0 50px rgba(189, 0, 255, 0.15),
                      0 1px 0 rgba(255, 255, 255, 0.2) inset;
        }

        /* Inactive fanned cards hover styles */
        .showcase-card:not(.is-active) {
          cursor: pointer;
        }

        .showcase-card:not(.is-active):hover {
          opacity: 0.85 !important;
          border-color: rgba(255, 255, 255, 0.15);
        }

        /* Image styling inside card */
        .showcase-img-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .showcase-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Active Tagline overlay at the bottom */
        .showcase-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.75rem;
          background: linear-gradient(transparent, rgba(13, 7, 16, 0.95) 85%);
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.4s ease, transform 0.4s ease;
          pointer-events: none;
        }

        .showcase-card.is-active .showcase-info {
          opacity: 1;
          transform: translateY(0);
        }

        .showcase-info span {
          font-family: 'Manrope', sans-serif;
          font-size: 0.85rem;
          color: var(--primary);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          text-align: center;
        }

        /* Swiping Grabbing State */
        .sketch-deck-container.grabbing {
          cursor: grabbing;
        }

        /* Drag-Hint overlay */
        .card-swipe-hint {
          position: absolute;
          top: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(25, 16, 28, 0.75);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.5rem 1rem;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.4s ease;
        }

        .showcase-card.is-active:hover .card-swipe-hint {
          opacity: 0.85;
        }

        .hint-text {
          font-family: 'Manrope', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--on-surface-variant);
        }

        .hint-arrow {
          color: var(--primary);
          font-weight: 800;
          animation: arrowBlink 1.5s infinite alternate;
        }

        @keyframes arrowBlink {
          0% { opacity: 0.4; }
          100% { opacity: 1; }
        }

        /* Controls bar */
        .sketch-slider-controls {
          display: flex;
          align-items: center;
          gap: 1.75rem;
          padding: 0.75rem 1.5rem;
          border-radius: 999px;
          background: rgba(38, 28, 40, 0.5);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 192, 215, 0.08);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .slider-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--on-surface);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .slider-btn:hover:not(:disabled) {
          background: var(--primary-gradient);
          border-color: transparent;
          color: #fff;
          box-shadow: 0 0 15px rgba(189, 0, 255, 0.4);
          transform: scale(1.05);
        }

        .slider-btn:active {
          transform: scale(0.95);
        }

        .slider-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .slider-indicators {
          display: flex;
          gap: 0.65rem;
          align-items: center;
        }

        .indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .indicator-dot.active {
          background: var(--primary);
          width: 24px;
          border-radius: 4px;
          box-shadow: 0 0 10px var(--primary);
        }

        /* ─── RESPONSIVE FLAT SHIFTS ─── */
        @media (max-width: 1024px) {
          .sketch-deck-container {
            --spacing-step: 140px;
            height: 420px;
            max-width: 100%;
          }
          
          .showcase-card {
            width: 240px;
            height: 320px;
            top: calc(50% - 160px);
            left: calc(50% - 120px);
            border-radius: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .sketch-showcase-section {
            padding: 3rem 0;
          }

          .sketch-deck-container {
            --spacing-step: 100px;
            height: 360px;
            max-width: 100%;
          }

          .showcase-card {
            width: 180px;
            height: 250px;
            top: calc(50% - 125px);
            left: calc(50% - 90px);
            border-radius: 1.25rem;
          }

          .showcase-info {
            padding: 1rem;
          }

          .showcase-info span {
            font-size: 0.72rem;
          }

          .sketch-slider-controls {
            gap: 1.25rem;
            padding: 0.6rem 1.2rem;
          }

          .slider-btn {
            width: 40px;
            height: 40px;
          }
        }

        /* ─── Instagram Section ─── */
        .instagram-section {
          padding: 8rem 0;
          background: var(--surface-container-lowest);
          position: relative;
          z-index: 2;
          overflow: hidden;
        }
        
        .insta-marquee {
          margin-top: 3rem;
          overflow: hidden;
          white-space: nowrap;
          padding: 2rem 0; /* Add vertical padding to prevent hover translation clipping */
        }
        
        .insta-track {
          display: flex;
          gap: 1.5rem;
          animation: instaScroll 25s linear infinite;
          width: fit-content;
          will-change: transform;
        }

        .insta-marquee:hover .insta-track {
          animation-play-state: paused;
        }
        
        @keyframes instaScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .insta-card {
          flex-shrink: 0;
          width: 260px;
          border-radius: 1.25rem;
          overflow: hidden;
          position: relative;
          background: var(--surface-container, #1c1221);
          border: 1px solid var(--outline-variant, rgba(189, 0, 255, 0.15));
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease, border-color 0.4s ease;
        }
        
        .insta-card:hover {
          transform: translateY(-12px); /* Snappy upscale float upside */
          box-shadow: 0 16px 36px rgba(189, 0, 255, 0.22);
          border-color: var(--primary);
        }

        .insta-img-container {
          width: 100%;
          aspect-ratio: 1/1;
          overflow: hidden;
          position: relative;
        }

        .insta-img-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .insta-card:hover .insta-img-container img {
          transform: scale(1.04);
        }

        .insta-info {
          padding: 0.85rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          background: linear-gradient(to bottom, rgba(25, 16, 28, 0.3), rgba(15, 9, 18, 0.95));
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .insta-stat {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 600;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.85);
          font-family: 'Manrope', sans-serif;
        }

        .insta-stat svg {
          transition: transform 0.3s ease;
          color: var(--primary, #bd00ff);
        }

        .insta-card:hover .insta-stat svg {
          transform: scale(1.15);
        }
      `}</style>
    </>
  );
};

export default Home;