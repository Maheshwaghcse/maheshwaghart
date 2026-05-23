// ProductDetail.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, ShieldCheck, Truck, Clock, Sparkles, Star, ZoomIn, Check } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sketch, setSketch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [includeFrame, setIncludeFrame] = useState(false);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchSketch = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/sketches/${id}`);
        const data = await res.json();
        setSketch(data);
      } catch (error) {
        console.error('Failed to fetch sketch:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSketch();
  }, [id]);

  const derivedFrameType = sketch?.size || 'A4';
  const derivedFramePrice = derivedFrameType.includes('A3') ? 400 : derivedFrameType.includes('A4') ? 300 : 500;

  const handleAddToCart = () => {
    addToCart({
      sketch: sketch._id,
      title: sketch.title,
      image: sketch.images[0],
      price: sketch.price,
      size: sketch.size,
      includeFrame,
      frameType: includeFrame ? derivedFrameType : null,
      framePrice: includeFrame ? derivedFramePrice : 0
    }, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const handleBuyNow = () => {
    addToCart({
      sketch: sketch._id,
      title: sketch.title,
      image: sketch.images[0],
      price: sketch.price,
      size: sketch.size,
      includeFrame,
      frameType: includeFrame ? derivedFrameType : null,
      framePrice: includeFrame ? derivedFramePrice : 0
    }, 1);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="product-loading">
        <div className="spinner"></div>
        <p>Loading masterpiece details...</p>
      </div>
    );
  }

  if (!sketch) {
    return (
      <div className="product-notfound">
        <h2>Artwork not found</h2>
        <Link to="/gallery" className="btn btn-primary">Back to Gallery</Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <Link to="/gallery" className="back-link">
          <ArrowLeft size={18} /> Back to Gallery
        </Link>

        <div className="product-grid">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className={`main-image-container ${includeFrame ? 'has-frame' : ''}`}>
              <div
                className={`main-image ${isZoomed ? 'zoomed' : ''}`}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <img
                  src={sketch.images[activeImage]}
                  alt={sketch.title}
                  key={activeImage}
                  className="fade-in"
                  style={{
                    transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                    transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
                    transition: 'transform 0.4s cubic-bezier(0.2, 0, 0.2, 1), transform-origin 0.15s ease-out',
                    willChange: 'transform, transform-origin'
                  }}
                />
                <div className="zoom-hint">
                  <ZoomIn size={16} /> Hover to zoom
                </div>
              </div>
            </div>
            {sketch.images && sketch.images.length > 1 && (
              <div className="thumbnail-list">
                {sketch.images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`thumbnail ${activeImage === idx ? 'active' : ''}`}
                    onClick={() => setActiveImage(idx)}
                  >
                    <img src={img} alt={`${sketch.title} ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-badge">
              <span className="category">{sketch.tagline || sketch.category}</span>
              <span className="artist">by MaheshWagh_Art</span>
            </div>

            <h1 className="product-title">{sketch.title}</h1>



            <div className="product-price">
              <span className="price">₹{sketch.price + (includeFrame ? derivedFramePrice : 0)}</span>
              <span className="tax-info">Inclusive of all taxes</span>
            </div>

            <div className="product-frame-options">
              <label className="frame-toggle">
                <input
                  type="checkbox"
                  checked={includeFrame}
                  onChange={(e) => setIncludeFrame(e.target.checked)}
                />
                <span className="toggle-text">Include Premium Frame</span>
              </label>
              {includeFrame && (
                <div className="frame-size-select" style={{ cursor: 'default' }}>
                  Premium Frame — {derivedFrameType} (+₹{derivedFramePrice})
                </div>
              )}
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{sketch.description}</p>
            </div>

            <div className="product-specs">
              {sketch.size && (
                <div className="spec">
                  <span className="spec-label">Size:</span>
                  <span className="spec-value">{sketch.size}</span>
                </div>
              )}
              {sketch.medium && (
                <div className="spec">
                  <span className="spec-label">Medium:</span>
                  <span className="spec-value">{sketch.medium}</span>
                </div>
              )}
            </div>

            <div className="product-actions">

              <button onClick={handleAddToCart} className="btn btn-outline add-to-cart">
                <ShoppingCart size={18} />
                {addedToCart ? 'Added!' : 'Add to Cart'}
              </button>

              <button onClick={handleBuyNow} className="btn btn-primary buy-now">
                Buy Now
              </button>
            </div>

            <div className="product-features">
              <div className="feature-item">
                <Truck size={18} />
                <span>Free Express Shipping Allover India</span>
              </div>
              <div className="feature-item">
                <ShieldCheck size={18} />
                <span>@maheshwagh_art</span>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style>{`
        .product-detail-page {
          padding: 6rem 0;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.3s;
        }
        .back-link:hover {
          color: var(--primary-color);
        }
        .product-loading, .product-notfound {
          text-align: center;
          padding: 8rem 0;
        }

        .product-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
        }
        .product-gallery {
          position: sticky;
          top: 100px;
        }
        .main-image-container {
          width: 100%;
          background: var(--bg-card);
          border-radius: 1.5rem;
          overflow: hidden;
          border: 1px solid var(--border-color);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s;
        }
        .main-image-container:hover {
          transform: scale(1.02);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }
        .main-image-container.has-frame:hover {
          transform: scale(0.97);
        }
        .main-image-container.has-frame {
          padding: 15px;
          background: #fdfbf7;
          border: 20px solid #2a1b15;
          box-shadow: 
            inset 0 0 15px rgba(0,0,0,0.5),
            0 15px 30px rgba(0,0,0,0.6),
            0 0 40px rgba(255, 255, 255, 0.4),
            0 0 80px rgba(255, 140, 0, 0.3);
          border-radius: 4px;
          transform: scale(0.95);
        }
        .main-image-container.has-frame::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border: 1px solid rgba(255,255,255,0.15);
          pointer-events: none;
          z-index: 2;
        }
        .main-image-container.has-frame .main-image img {
          border-radius: 0;
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
        }
        .main-image {
          position: relative;
          width: 100%;
          height: 100%;
          cursor: crosshair;
          overflow: hidden;
        }
        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .fade-in {
          animation: fadeIn 0.4s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .zoom-hint {
          position: absolute;
          bottom: 1.5rem;
          right: 1.5rem;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(5px);
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          pointer-events: none;
          z-index: 5;
        }
        .thumbnail-list {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        .thumbnail {
          width: 80px;
          height: 80px;
          border-radius: 0.5rem;
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          background: none;
          padding: 0;
        }
        .thumbnail.active {
          border-color: var(--primary-color);
        }
        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .product-badge {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .category {
          background: rgba(255,92,0,0.1);
          color: var(--primary-color);
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .artist {
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        .product-title {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          margin-bottom: 1rem;
        }
        .product-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .stars {
          display: flex;
          gap: 0.25rem;
        }
        .product-price {
          margin-bottom: 1.5rem;
        }
        .price {
          font-size: 2rem;
          font-weight: 800;
          color: var(--primary-color);
        }
        .tax-info {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }
        .product-frame-options {
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          padding: 1.25rem;
          background: rgba(255,92,0,0.05);
          border: 1px solid rgba(255,92,0,0.2);
          border-radius: 0.75rem;
        }
        .frame-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          color: var(--primary-color);
          font-size: 1rem;
        }
        .frame-toggle input[type="checkbox"] {
          accent-color: var(--primary-color);
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
        .frame-size-select {
          padding: 0.5rem 1rem;
          background: var(--bg-card);
          border: 1px solid var(--primary-color);
          border-radius: 0.5rem;
          color: var(--primary-color);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          outline: none;
        }
        .product-description {
          margin-bottom: 1.5rem;
        }
        .product-description h3 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }
        .product-description p {
          color: var(--text-muted);
          line-height: 1.7;
        }
        .product-specs {
          background: var(--bg-card);
          border-radius: 1rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          border: 1px solid var(--border-color);
        }
        .spec {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border-color);
        }
        .spec:last-child {
          border-bottom: none;
        }
        .spec-label {
          color: var(--text-muted);
          font-weight: 600;
        }
        .product-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .product-features {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        @media (max-width: 968px) {
          .product-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .product-gallery {
            position: static;
          }
        }
        @media (max-width: 768px) {
          .product-detail-page {
            padding: 5rem 0 3rem;
          }
          .product-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .product-gallery {
            position: static;
          }
          .main-image-container {
            border-radius: 1rem;
          }
          .product-title {
            font-size: clamp(1.4rem, 5vw, 2rem);
          }
          .price {
            font-size: 1.6rem;
          }
          .product-actions {
            flex-direction: column;
          }
          .add-to-cart,
          .buy-now {
            width: 100%;
            justify-content: center;
          }
          .product-features {
            flex-direction: column;
            gap: 0.75rem;
          }
          .product-frame-options {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 1rem;
          }
          .thumbnail-list {
            gap: 0.5rem;
            flex-wrap: wrap;
          }
          .thumbnail {
            width: 60px;
            height: 60px;
          }
          .zoom-hint {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;