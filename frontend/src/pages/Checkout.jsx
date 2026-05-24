// Checkout.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, ArrowLeft, Truck, Clock, CheckCircle, MessageCircle, Copy, Trash2 } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Checkout = () => {
  const { cartItems, clearCart, getCartTotal, removeFromCart } = useContext(CartContext);
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('whatsapp');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (formData.email) return;

    const isGuest = !userInfo;
    const addressKey = isGuest 
      ? 'sketch_shipping_address_guest' 
      : `sketch_shipping_address_${userInfo.email}`;
    const savedAddress = localStorage.getItem(addressKey);

    if (savedAddress) {
      try {
        const parsed = JSON.parse(savedAddress);
        setFormData({
          email: parsed.email || (isGuest ? '' : userInfo.email) || '',
          fullName: parsed.fullName || (isGuest ? '' : userInfo.name) || '',
          phone: parsed.phone || '',
          address: parsed.address || '',
          city: parsed.city || '',
          state: parsed.state || '',
          postalCode: parsed.postalCode || '',
          country: parsed.country || '',
        });
      } catch (e) {
        console.error('Error parsing saved address:', e);
        if (!isGuest) {
          setFormData(prev => ({ ...prev, email: userInfo.email, fullName: userInfo.name || '' }));
        }
      }
    } else if (!isGuest) {
      setFormData(prev => ({ ...prev, email: userInfo.email, fullName: userInfo.name || '' }));
    }
  }, [userInfo, navigate, formData.email]);

  useEffect(() => {
    if (cartItems.length === 0 && !orderPlaced) {
      navigate('/cart');
    }
  }, [cartItems, navigate, orderPlaced]);

  const totalPrice = getCartTotal ? getCartTotal() : cartItems.reduce((acc, item) => acc + item.price, 0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const placeOrderHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.postalCode) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      if (userInfo && userInfo.token) {
        headers['Authorization'] = `Bearer ${userInfo.token}`;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          orderItems: cartItems.map(item => ({
            sketch: item.sketch,
            name: item.title + (item.includeFrame ? ` (with ${item.frameType} Frame)` : ''),
            image: item.image,
            price: item.price + (item.includeFrame ? item.framePrice : 0),
            qty: 1
          })),
          shippingAddress: formData,
          paymentMethod: 'WhatsApp Payment',
          itemsPrice: totalPrice,
          shippingPrice: 0,
          taxPrice: 0,
          totalPrice: totalPrice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setOrderId(data.order?._id || 'ORD-' + Date.now());
      setOrderPlaced(true);
      clearCart();

      // Save shipping details to localStorage for future auto-fill
      const addressKey = userInfo && userInfo.email 
        ? `sketch_shipping_address_${userInfo.email}` 
        : 'sketch_shipping_address_guest';
      const addressData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      };
      localStorage.setItem(addressKey, JSON.stringify(addressData));

      // WhatsApp message formatting
      let msg = `*Hello, I want to order from your Sketch Store 🎨*\n\n*Order Details:*\n`;
      cartItems.forEach((item, index) => {
        msg += `${index + 1}. ${item.title} — ₹${(item.price).toFixed(2)}\n`;
        if (item.includeFrame) {
          msg += `   + ${item.frameType} Frame — ₹${(item.framePrice).toFixed(2)}\n`;
        }
        msg += `\n`;
      });
      msg += `*Total Amount:* ₹${totalPrice.toFixed(2)}\n\n`;
      msg += `*Customer Info:*\n`;
      msg += `Name: ${formData.fullName}\n`;
      msg += `Phone: ${formData.phone}\n`;
      msg += `Address: ${formData.address}, ${formData.city}, ${formData.state || ''} ${formData.postalCode}\n\n`;
      msg += `*Payment Method:* ${paymentMethod === 'whatsapp' ? 'WhatsApp Payment' : 'Cash on Delivery'}\n\n`;
      msg += `Please confirm my order.`;

      const encodedMsg = encodeURIComponent(msg);
      const whatsappNumber = '7387062073'; // Replace with actual business number
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;

      window.open(whatsappUrl, '_blank');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="animate-fade-in order-success" style={{ minHeight: '80vh', paddingTop: '6rem', paddingBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="success-container" style={{ textAlign: 'center', background: 'var(--bg-card)', padding: '4rem 2rem', borderRadius: '1.5rem', border: '1px solid var(--border-color)', maxWidth: '600px', width: '100%' }}>
          <div style={{ marginBottom: '2rem' }}>
            <CheckCircle size={64} style={{ color: 'var(--primary-color)' }} />
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', margin: '1rem 0' }}>
            Your Piece Is On Its <span className="text-gradient">Way</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1rem' }}>
            Your request is received and I'm already thinking about it
            Expect my WhatsApp message soon.</p>
          <div className="success-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => navigate('/gallery')} className="btn btn-outline">Continue Shopping</button>
            <button onClick={() => navigate('/')} className="btn btn-primary">Go Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '6rem 0' }}>
      <div className="container">
        <button onClick={() => navigate('/cart')} className="back-btn">
          <ArrowLeft size={18} /> Back to Cart
        </button>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="gallery-badge">It's Yours.</span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginTop: '1rem' }}>
            Claim Your <span className="text-gradient">Piece.</span>
          </h1>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '1.5rem', color: '#c8c8cc' }}>Every original leaves only once. One message is all it takes to make sure it leaves with you.</p>
          <div style={{ width: '80px', height: '3px', background: "var(--primary-gradient)", margin: '1.5rem auto' }}></div>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <div className="checkout-grid">
          <form onSubmit={placeOrderHandler} className="checkout-form">
            <div className="form-section">
              <h2>Contact Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit mobile number" required />
              </div>
            </div>

            <div className="form-section">
              <h2>Shipping Address</h2>
              <div className="form-group">
                <label>Street Address *</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="House number, building, street" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Postal Code *</label>
                  <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Payment Method</h2>
              <div className="payment-options">
                <label className="payment-option whatsapp active">
                  <input type="radio" name="payment" value="whatsapp" checked={true} readOnly />
                  <div className="payment-info">
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MessageCircle size={16} /> WhatsApp Payment
                    </strong>
                    <span>UPI / QR Code • Send screenshot on WhatsApp</span>
                  </div>
                </label>
              </div>


            </div>

            <button type="submit" className="btn btn-whatsapp place-order-btn" disabled={loading}>
              {loading ? 'Processing...' : (
                <>
                  <MessageCircle size={18} /> Place Order via WhatsApp
                </>
              )}
            </button>
          </form>

          <div className="order-summary-sidebar">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.sketch} className="summary-item">
                  <Link to={`/product/${item.sketch}`} className="summary-item-link" style={{ display: 'flex', gap: '1rem', flex: 1, textDecoration: 'none', color: 'inherit' }}>
                    <img src={item.image} alt={item.title} />
                    <div style={{ flex: 1 }}>
                      <p className="summary-item-title" style={{ transition: 'color 0.2s' }}>{item.title}</p>
                      {item.includeFrame && (
                        <p className="summary-item-frame">
                          + {item.frameType} Frame (₹{item.framePrice})
                        </p>
                      )}
                    </div>
                  </Link>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span className="summary-item-price">
                      ₹{(item.price + (item.includeFrame ? item.framePrice : 0)).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.sketch)}
                      className="checkout-remove-btn"
                      title="Remove item"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="free">FREE</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-total">
                <span>Total</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <div className="shipping-info">
              <Truck size={16} />
              <span>Free express shipping on all orders</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
          color: var(--text-muted);
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: color 0.3s;
        }
        .back-btn:hover {
          color: var(--primary-color);
        }
        .page-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          margin-bottom: 2rem;
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 3rem;
        }
        .checkout-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .form-section {
          background: var(--bg-card);
          padding: 1.5rem;
          border-radius: 1rem;
          border: 1px solid var(--border-color);
        }
        .form-section h2 {
          font-size: 1.3rem;
          margin-bottom: 1.5rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .payment-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          cursor: pointer;
          transition: 0.3s;
        }
        .payment-option.active {
          border-color: var(--primary-color);
          background: rgba(255,92,0,0.05);
        }
        .payment-option input {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
        .payment-info {
          display: flex;
          flex-direction: column;
        }
        .payment-info strong {
          font-size: 0.9rem;
        }
        .payment-info span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .payment-option.whatsapp {
          transition: all 0.3s ease;
        }
        .payment-option.whatsapp.active {
          border-color: #25D366;
          background: rgba(37, 211, 102, 0.05);
          box-shadow: 0 0 15px rgba(37, 211, 102, 0.2);
        }
        .payment-option.whatsapp.active strong {
          color: #25D366;
        }
        .whatsapp-payment-details {
          margin-top: 1.5rem;
          padding: 1.5rem;
          background: var(--bg-dark);
          border: 1px dashed #25D366;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .qr-container {
          background: white;
          padding: 0.5rem;
          border-radius: 0.5rem;
        }
        .qr-container img {
          width: 100px;
          height: 100px;
          display: block;
        }
        .upi-details p {
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .upi-id-box {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-card);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border-color);
          font-family: monospace;
          font-size: 1rem;
          color: #25D366;
          margin-bottom: 0.5rem;
        }
        .upi-id-box button {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.3s;
          display: flex;
        }
        .upi-id-box button:hover {
          color: #25D366;
        }
        .upi-instruction {
          font-size: 0.75rem !important;
          color: #25D366 !important;
        }
        .upi-note {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.75rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(37, 211, 102, 0.2);
        }
        .upi-note strong {
          color: #25D366;
        }
        .btn-whatsapp {
          background-color: #25D366;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .btn-whatsapp:hover {
          background-color: #128C7E;
          box-shadow: 0 5px 15px rgba(37, 211, 102, 0.4);
        }
        .place-order-btn {
          width: 100%;
          padding: 1rem;
          font-size: 1.1rem;
        }
        .order-summary-sidebar {
          background: var(--bg-card);
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid var(--border-color);
          position: sticky;
          top: 100px;
          height: fit-content;
        }
        .order-summary-sidebar h3 {
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        .summary-items {
          max-height: 300px;
          overflow-y: auto;
          margin-bottom: 1rem;
        }
        .summary-item {
          display: flex;
          gap: 1rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border-color);
        }
        .summary-item img {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 0.5rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .summary-item-title {
          font-size: 0.85rem;
          font-weight: 600;
        }
        .summary-item-link {
          transition: transform 0.2s ease;
        }
        .summary-item-link:hover .summary-item-title {
          color: var(--primary-color);
        }
        .summary-item-link:hover img {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(189, 0, 255, 0.2);
        }
        .summary-item-qty {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .summary-item-frame {
          font-size: 0.7rem;
          color: var(--primary-color);
          margin-top: 0.2rem;
        }
        .summary-item-price {
          margin-left: auto;
          font-weight: 600;
        }
        .summary-totals {
          margin-top: 1rem;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          color: var(--text-muted);
        }
        .free {
          color: #22c55e;
        }
        .summary-divider {
          height: 1px;
          background: var(--border-color);
          margin: 1rem 0;
        }
        .summary-total {
          display: flex;
          justify-content: space-between;
          font-size: 1.2rem;
          font-weight: 800;
        }
        .shipping-info, .secure-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .checkout-remove-btn {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: 0.3s;
          opacity: 0.8;
        }
        .checkout-remove-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          opacity: 1;
        }
        .order-success {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .success-container {
          text-align: center;
          background: var(--bg-card);
          padding: 3rem;
          border-radius: 1.5rem;
          border: 1px solid var(--border-color);
          max-width: 500px;
        }
        .success-icon {
          color: #22c55e;
          margin-bottom: 1.5rem;
        }
        .order-id {
          color: var(--primary-color);
          font-weight: 600;
          margin: 1rem 0;
        }
        .success-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
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
        @media (max-width: 968px) {
          .checkout-grid {
            grid-template-columns: 1fr;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
