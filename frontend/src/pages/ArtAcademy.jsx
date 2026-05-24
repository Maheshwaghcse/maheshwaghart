import React, { useState } from 'react';
import { Sparkles, CheckCircle, AlertCircle, BookOpen, PenTool, GraduationCap } from 'lucide-react';

// Reusable Form Component for modularity
const AcademyForm = ({ onSubmit, loading, error, success, formData, setFormData }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="form-group">
        <label className="form-label" style={{ letterSpacing: '1px', fontSize: '0.75rem', fontWeight: 800 }}>FULL NAME *</label>
        <input
          type="text"
          name="name"
          className="form-control"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="enter your full name..."
          style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(189, 0, 255, 0.15)' }}
        />
      </div>

      <div className="form-group">
        <label className="form-label" style={{ letterSpacing: '1px', fontSize: '0.75rem', fontWeight: 800 }}>EMAIL ADDRESS *</label>
        <input
          type="email"
          name="email"
          className="form-control"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="enter your email..."
          style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(189, 0, 255, 0.15)' }}
        />
      </div>

      <div className="form-group">
        <label className="form-label" style={{ letterSpacing: '1px', fontSize: '0.75rem', fontWeight: 800 }}>MOBILE NUMBER *</label>
        <input
          type="tel"
          name="mobile"
          className="form-control"
          value={formData.mobile}
          onChange={handleChange}
          required
          placeholder="10-digit mobile number"
          style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(189, 0, 255, 0.15)' }}
        />
      </div>

      <div className="form-group">
        <label className="form-label" style={{ letterSpacing: '1px', fontSize: '0.75rem', fontWeight: 800 }}>WHY DO YOU WANT TO LEARN SKETCHING? (OPTIONAL)</label>
        <textarea
          name="message"
          className="form-control"
          rows="4"
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us about your drawing goals..."
          style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(189, 0, 255, 0.15)' }}
        ></textarea>
      </div>

      {error && (
        <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.75rem', padding: '1rem', background: 'rgba(235, 87, 87, 0.1)', border: '1px solid rgba(235, 87, 87, 0.2)', color: '#ff6b6b', fontSize: '0.85rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="ai-caption-btn"
        style={{
          marginTop: '0.5rem',
          padding: '1.1rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 0 32px rgba(189, 0, 255, 0.4)',
        }}
      >
        <GraduationCap size={20} />
        {loading ? 'Joining Art Academy...' : 'Join Art Academy'}
      </button>
    </form>
  );
};

const ArtAcademy = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { name, email, mobile, message } = formData;

    // Real-time Front-end Validations
    if (!name || name.trim().length < 3) {
      setError('Full Name must be at least 3 characters long.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobile || !mobileRegex.test(mobile.trim())) {
      setError('Please enter a valid 10-digit mobile number.');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending waitlist submission to backend...');
      const res = await fetch(`${API_BASE}/api/academy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          mobile: mobile.trim(),
          message: message.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Submission failed');
      }

      console.log('Waitlist submission registered inside backend successfully!');
      setSuccess(true);
      setFormData({ name: '', email: '', mobile: '', message: '' });

    } catch (err) {
      console.error('Waitlist submission error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="academy-page animate-fade-in">

      {/* Premium Background Glow Shapes */}
      <div className="glow-shape-1"></div>
      <div className="glow-shape-2"></div>

      <div className="container academy-container">
        <div className="academy-grid">

          {/* Left Column: Premium Pitch */}
          <div className="academy-pitch">
            <div className="academy-badge">
              <Sparkles size={14} />
              <span>LAUNCHING SOON</span>
            </div>

            <h1 className="academy-title">
              Mahesh Wagh Art <br />
              <span className="text-gradient">Academy</span>
            </h1>

            <p className="academy-subtitle">
              Unlock the secrets of hand-drawn mastery. Join our exclusive waitlist to secure early-bird access to comprehensive charcoal, graphite, and realistic sketching tutorials coached by Mahesh Wagh.
            </p>

            {/* Core Academy Pillars */}
            <div className="academy-pillars">
              <div className="pillar-item">
                <div className="pillar-icon">
                  <PenTool size={22} />
                </div>
                <div className="pillar-text">
                  <h3>Fundamentals to Hyperrealism</h3>
                  <p>Master shapes, values, textures, and fanning rules to breathe life into portraits.</p>
                </div>
              </div>

              <div className="pillar-item">
                <div className="pillar-icon">
                  <BookOpen size={22} />
                </div>
                <div className="pillar-text">
                  <h3>Bespoke Learning Resources</h3>
                  <p>Get premium exercise templates, reference libraries, and interactive assignments.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Waitlist Card */}
          <div className="card academy-card">

            {success ? (
              <div className="animate-fade-in academy-success">
                <div className="success-icon-wrap">
                  <CheckCircle size={36} />
                </div>
                <h2>Welcome to the Academy!</h2>
                <p>
                  Your waitlist request has been registered. We've sent a confirmation email to your inbox. Stay tuned for course schedules and launch discounts!
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="btn btn-outline"
                  style={{ borderRadius: '99px', padding: '0.75rem 2rem', fontSize: '0.85rem' }}
                >
                  Join Another Student
                </button>
              </div>
            ) : (
              <div>
                <h2>Secure Your Spot</h2>
                <p className="card-subtitle">Enter your details below to lock in early-bird launch bonuses.</p>

                <AcademyForm
                  onSubmit={handleSubmit}
                  loading={loading}
                  error={error}
                  success={success}
                  formData={formData}
                  setFormData={setFormData}
                />
              </div>
            )}
          </div>

        </div>
      </div>

      <style>{`
        .academy-page {
          padding: 8rem 0 6rem;
          position: relative;
          overflow: hidden;
        }
        .glow-shape-1 {
          position: absolute;
          top: 15%;
          left: 10%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(189,0,255,0.06) 0%, rgba(0,0,0,0) 70%);
          filter: blur(40px);
          z-index: 0;
        }
        .glow-shape-2 {
          position: absolute;
          bottom: 15%;
          right: 10%;
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, rgba(255,54,200,0.05) 0%, rgba(0,0,0,0) 70%);
          filter: blur(50px);
          z-index: 0;
        }
        .academy-container {
          position: relative;
          z-index: 1;
          maxWidth: 1200px;
        }
        .academy-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 4rem;
          align-items: center;
        }
        .academy-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          background: rgba(189, 0, 255, 0.1);
          border: 1px solid rgba(189, 0, 255, 0.25);
          borderRadius: 99px;
          color: #ecb2ff;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        }
        .academy-title {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 900;
          line-height: 1.1;
          margin: 0 0 1.5rem;
          font-family: 'Epilogue', sans-serif;
        }
        .academy-subtitle {
          color: var(--text-muted);
          font-size: 1.1rem;
          line-height: 1.7;
          margin-bottom: 2.5rem;
          max-width: 500px;
        }
        .academy-pillars {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .pillar-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        .pillar-icon {
          padding: 0.75rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 1rem;
          color: var(--primary-color);
        }
        .pillar-text h3 {
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .pillar-text p {
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .academy-card {
          padding: 3rem 2.5rem;
          background: rgba(18, 12, 22, 0.4);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(189, 0, 255, 0.1);
          border-radius: 2rem;
          box-shadow: 0 20px 80px rgba(0, 0, 0, 0.5);
        }
        .academy-card h2 {
          font-size: 1.6rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }
        .academy-card .card-subtitle {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 2rem;
        }
        .academy-success {
          text-align: center;
          padding: 2rem 0;
        }
        .success-icon-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: rgba(189,0,255,0.1);
          border: 2px solid var(--primary-color);
          color: var(--primary-color);
          margin-bottom: 1.5rem;
        }
        .academy-success h2 {
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }
        .academy-success p {
          color: var(--text-muted);
          line-height: 1.6;
          font-size: 0.95rem;
          max-width: 350px;
          margin: 0 auto 2rem;
        }

        @media (max-width: 768px) {
          .academy-page {
            padding: 5rem 0 3rem;
          }
          .academy-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .academy-card {
            order: -1;
          }
          .academy-title {
            font-size: clamp(1.6rem, 5vw, 2.2rem);
          }
          .academy-subtitle {
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 1.75rem;
          }
          .academy-card {
            padding: 2rem 1.25rem;
            border-radius: 1.5rem;
          }
          .academy-card h2 {
            font-size: 1.4rem;
          }
          .academy-success h2 {
            font-size: 1.5rem;
          }
          .academy-success p {
            font-size: 0.88rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ArtAcademy;
