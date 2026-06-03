// Cart.jsx
import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, CreditCard, Shield } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateCartItem, getCartTotal } = useContext(CartContext);
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const totalPrice = getCartTotal ? getCartTotal().toFixed(2) : cartItems.reduce((acc, item) => acc + item.price, 0).toFixed(2);

  const checkoutHandler = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="animate-fade-in" style={{ padding: '8rem 0', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="empty-cart-icon" style={{ marginBottom: '2rem' }}>
            <ShoppingBag size={64} style={{ color: 'var(--primary-color)', opacity: 0.8 }} />
          </div>
          <span className="gallery-badge">EMPTY CANVAS</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', margin: '1rem 0' }}>
            Your Cart is <span className="text-gradient">Empty</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2.5rem' }}>
            The one that stopped you is still available.
          </p>
          <Link to="/gallery" className="btn btn-primary">Explore Gallery</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '6rem 0' }}>
      <div className="container">
        <div style={{ marginBottom: '3rem' }} className="cart-header">
          <span className="gallery-badge">ART COLLECTION</span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', margin: '0.5rem 0' }}>
            Review Your <span className="text-gradient">Cart</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>{cartItems.length} pieces of timeless artistry</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          {/* Cart Items */}
          <div style={{ gridColumn: 'span 2' }}>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.sketch} className="cart-item">
                  <div className={`cart-item-image-container ${item.includeFrame ? 'has-frame' : ''}`}>
                    <img src={item.image} alt={item.title} className="cart-item-image" />
                  </div>
                  <div className="cart-item-details">
                    <Link to={`/product/${item.sketch}`} className="cart-item-title">{item.title}</Link>
                    <p className="cart-item-price">₹{item.price}</p>
                    <div className="cart-item-actions">
                      <button onClick={() => removeFromCart(item.sketch)} className="remove-btn">
                        <Trash2 size={18} /> Remove
                      </button>
                    </div>
                    <div className="cart-item-frame-options">
                      <label className="frame-toggle">
                        <input
                          type="checkbox"
                          checked={item.includeFrame || false}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const derivedType = item.size || 'A4';
                            const derivedPrice = derivedType.includes('A3') ? 400 : derivedType.includes('A4') ? 300 : 500;
                            updateCartItem && updateCartItem(item.sketch, {
                              includeFrame: checked,
                              frameType: checked ? derivedType : null,
                              framePrice: checked ? derivedPrice : 0
                            });
                          }}
                        />
                        <span className="toggle-text">Premium Framing</span>
                      </label>
                      {item.includeFrame && (
                        <div className="frame-size-select" style={{ cursor: 'default' }}>
                          {item.frameType} Frame (+₹{item.framePrice})
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="cart-item-total">
                    ₹{(item.price + (item.includeFrame ? (item.framePrice || 0) : 0)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="free-shipping">FREE</span>
            </div>
            <div className="summary-row">
              <span>Tax (GST)</span>
              <span>Included</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-total">
              <span>Total</span>
              <span className="total-price">₹{totalPrice}</span>
            </div>
            <button onClick={checkoutHandler} className="btn btn-primary checkout-btn">
              Claim Your Piece <ArrowRight size={18} />
            </button>
            <div className="secure-badge">
              <Shield size={16} />
              <span>100% Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .empty-cart {
          text-align: center;
          padding: 4rem;
          background: var(--bg-card);
          border-radius: 1.5rem;
          border: 1px solid var(--border-color);
        }
        .empty-cart-icon {
          margin-bottom: 1.5rem;
          color: var(--text-muted);
        }
        .gallery-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(112, 0, 255, 0.1);
          color: var(--primary-color);
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 2px;
          margin-bottom: 1rem;
        }
        .empty-cart h2 {
          margin-bottom: 1rem;
        }
        .empty-cart p {
          color: var(--text-muted);
          margin-bottom: 2rem;
        }
        .cart-count {
          font-size: 1rem;
          color: var(--text-muted);
          margin-left: 1rem;
        }
        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .cart-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          background: rgba(38, 28, 40, 0.5);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 1.5rem;
          border: 1px solid var(--border-color);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cart-item:hover {
          border-color: var(--primary-color);
          box-shadow: 0 10px 30px rgba(189, 0, 255, 0.1);
          transform: translateY(-2px);
        }
        .cart-item-image-container {
          position: relative;
          border-radius: 0.75rem;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100px;
          height: 100px;
          flex-shrink: 0;
        }
        .cart-item-image-container.has-frame {
          padding: 6px;
          background: #fdfbf7;
          border: 10px solid #2a1b15;
          box-shadow: 
            inset 0 0 10px rgba(0,0,0,0.5),
            0 10px 20px rgba(0,0,0,0.5),
            0 0 30px rgba(255, 255, 255, 0.4),
            0 0 50px rgba(255, 140, 0, 0.2);
          border-radius: 4px;
          transform: scale(1.08);
          width: 110px;
          height: 110px;
          margin-right: 10px;
        }
        .cart-item-image-container.has-frame::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border: 1px solid rgba(255,255,255,0.15);
          pointer-events: none;
        }
        .cart-item-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 0.75rem;
          transition: all 0.3s ease;
        }
        .has-frame .cart-item-image {
          border-radius: 0;
          box-shadow: 0 0 8px rgba(0,0,0,0.3);
        }
        .cart-item-details {
          flex: 1;
        }
        .cart-item-title {
          font-size: 1.1rem;
          font-weight: 700;
          text-decoration: none;
          color: inherit;
          transition: color 0.3s;
        }
        .cart-item-title:hover {
          color: var(--primary-color);
        }
        .cart-item-price {
          color: var(--primary-color);
          font-weight: 800;
          margin: 0.5rem 0;
        }
        .cart-item-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .remove-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(239,68,68,0.1);
          color: #ef4444;
          border-radius: 0.5rem;
          font-size: 0.85rem;
          cursor: pointer;
          transition: 0.3s;
        }
        .remove-btn:hover {
          background: rgba(239,68,68,0.2);
        }
        .cart-item-frame-options {
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-color);
        }
        .frame-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--primary-color);
        }
        .frame-toggle input[type="checkbox"] {
          accent-color: var(--primary-color);
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
        .frame-size-select {
          padding: 0.4rem 0.75rem;
          background: rgba(255, 92, 0, 0.1);
          border: 1px solid var(--primary-color);
          border-radius: 0.5rem;
          color: var(--primary-color);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          outline: none;
        }
        .cart-item-total {
          font-weight: 800;
          font-size: 1.2rem;
        }
        .order-summary {
          background: var(--bg-card);
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid var(--border-color);
          position: sticky;
          top: 100px;
          height: fit-content;
        }
        .order-summary h3 {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          color: var(--text-muted);
        }
        .free-shipping {
          color: #22c55e;
          font-weight: 600;
        }
        .summary-divider {
          height: 1px;
          background: var(--border-color);
          margin: 1rem 0;
        }
        .summary-total {
          display: flex;
          justify-content: space-between;
          font-size: 1.3rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
        }
        .total-price {
          color: var(--primary-color);
        }
        .checkout-btn {
          width: 100%;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .secure-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        @media (max-width: 768px) {
          .cart-header {
            text-align: center;
          }
          .cart-header .gallery-badge {
            display: block;
            text-align: center;
          }
          .cart-item {
            flex-wrap: wrap;
          }
          .cart-item-total {
            width: 100%;
            text-align: right;
          }
          .order-summary {
            margin: 2rem auto 0;
            max-width: 500px;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Cart;