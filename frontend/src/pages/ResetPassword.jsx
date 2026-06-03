import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { token } = useParams();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/resetpassword/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid or expired token');
      }

      alert('Password has been successfully reset! You can now log in.');
      navigate('/login');
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
          
          <div className="login-form-wrapper">
            <div style={{ textAlign: 'center' }}>
              <span className="brand-icon" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'inline-block' }}>🔑</span>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Set New <span className="text-primary">Password</span></h1>
              <p className="login-subtitle" style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Please enter your new password below.
              </p>
            </div>

            {error && <div className="error-message" style={{ marginBottom: '1.5rem' }}>{error}</div>}

            <form onSubmit={submitHandler}>
              <div className="form-group">
                <label>New Password</label>
                <div className="password-input" style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Confirm New Password</label>
                <div className="password-input" style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    required
                    style={{ width: '100%', padding: '0.75rem', paddingRight: '2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'} <ArrowRight size={18} />
              </button>
            </form>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                ← Back to Login
              </Link>
            </div>
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

export default ResetPassword;
