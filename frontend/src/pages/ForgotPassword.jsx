import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/forgotpassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage('An email with password reset instructions has been sent to your email address.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="login-container" style={{ gridTemplateColumns: '1fr', padding: '3rem' }}>

          <div className="login-form-wrapper" style={{ textAlign: 'center' }}>
            <span className="brand-icon" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'inline-block' }}>🔒</span>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Forgot <span className="text-primary">Password</span></h1>
            <p className="login-subtitle" style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {error && <div className="error-message" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>{error}</div>}

            {message ? (
              <div style={{ background: 'rgba(34,197,94,0.1)', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <CheckCircle size={48} color="#22c55e" />
                <p style={{ color: '#e2e8f0', lineHeight: 1.6 }}>{message}</p>
                <Link to="/login" className="btn btn-outline" style={{ marginTop: '1rem' }}>Back to Login</Link>
              </div>
            ) : (
              <form onSubmit={submitHandler} style={{ textAlign: 'left' }}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="enter your email"
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'} <ArrowRight size={18} />
                </button>
              </form>
            )}

            {!message && (
              <div style={{ marginTop: '2rem' }}>
                <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  ← Back to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 85vh;
          display: flex;
          align-items: center;
          padding: 8rem 0 4rem;
          background: radial-gradient(circle at center, rgba(189, 0, 255, 0.04) 0%, rgba(13, 7, 16, 1) 80%);
        }
        .login-container {
          background: rgba(38, 28, 40, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(189, 0, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
