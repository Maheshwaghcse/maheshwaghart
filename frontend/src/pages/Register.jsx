// Register.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ArrowRight, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  const { setUserInfo, userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    // Password strength checker
    if (password.length === 0) {
      setPasswordStrength('');
    } else if (password.length < 6) {
      setPasswordStrength('weak');
    } else if (password.length < 10) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  }, [password]);

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
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('userInfo', JSON.stringify(data));
      setUserInfo(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'strong': return '#22c55e';
      default: return 'var(--border-color)';
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      default: return '';
    }
  };

  return (
    <div className="register-page">
      <div className="container">
        <div className="register-container">
          <div className="register-left">
            <div className="register-brand">
              <span className="brand-icon">✨</span>
              <h2>maheshwagh_art</h2>
              <p>One account. One artist. A lifetime of originals no one else will ever own.</p>
            </div>
            <div className="register-benefits">
              <div className="benefit">
                <span>✓</span>
                <span>See new pieces before anyone else does</span>
              </div>
              <div className="benefit">
                <span>✓</span>
                <span>Save the ones that stopped you mid-scroll</span>
              </div>
              <div className="benefit">
                <span>✓</span>
                <span>Commission directly no middleman</span>
              </div>
              <div className="benefit">
                <span>✓</span>
                <span>Every piece you own, tracked and remembered</span>
              </div>
            </div>
          </div>

          <div className="register-right">
            <div className="register-form-wrapper">
              <h1>Create <span className="text-gradient">Account</span></h1>
              <p className="register-subtitle">Get started</p>

              {error && <div className="error-message">{error}</div>}

              <form onSubmit={submitHandler}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="EMAIL_ADDRESS"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {password && (
                    <div className="password-strength">
                      <div className="strength-bar" style={{ width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%', background: getStrengthColor() }}></div>
                      <span style={{ color: getStrengthColor() }}>{getStrengthText()}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <div className="password-input">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary register-btn" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} />
                </button>
              </form>

              <div className="register-footer">
                <p>Already have an account? <Link to="/login">Sign in</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .register-page {
          min-height: 85vh;
          display: flex;
          align-items: center;
          padding: 8rem 0 4rem;
          background: radial-gradient(circle at center, rgba(189, 0, 255, 0.04) 0%, rgba(13, 7, 16, 1) 80%);
        }
        .register-container {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 0;
          background: rgba(38, 28, 40, 0.55);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 2rem;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(189, 0, 255, 0.08);
        }
        .register-left {
          background: linear-gradient(135deg, rgba(189, 0, 255, 0.08) 0%, rgba(255, 54, 200, 0.02) 100%);
          padding: 4rem 3.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }
        .register-brand {
          margin-bottom: 2.5rem;
        }
        .brand-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 1.5rem;
        }
        .register-brand h2 {
          font-family: 'Epilogue', sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
          color: #fff;
        }
        .register-brand p {
          color: var(--text-muted);
          line-height: 1.6;
        }
        .register-benefits {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .benefit {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #d4c0d7;
          font-size: 0.95rem;
        }
        .benefit span:first-child {
          width: 26px;
          height: 26px;
          min-width: 26px;
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
        }
        .register-right {
          padding: 4rem 3.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .register-form-wrapper {
          width: 100%;
          max-width: 380px;
        }
        .register-form-wrapper h1 {
          font-family: 'Epilogue', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          letter-spacing: -0.03em;
        }
        .register-subtitle {
          color: var(--text-muted);
          margin-bottom: 2.5rem;
          font-size: 0.95rem;
        }
 
        .password-input {
          position: relative;
        }
        .password-input input {
          width: 100%;
          padding-right: 3rem;
        }
        .password-input button {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          transition: color 0.2s;
          display: flex;
          align-items: center;
        }
        .password-input button:hover {
          color: #fff;
        }
        .password-strength {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .strength-bar {
          height: 3px;
          border-radius: 3px;
          transition: 0.3s;
        }
        .register-btn {
          color: #fff;
          width: 100%;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .register-footer {
          margin-top: 2.5rem;
          text-align: center;
        }
        .register-footer p {
          color: var(--text-muted);
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }
        .register-footer a {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }
        .register-footer a:hover {
          color: #ff36c8;
        }
        .terms {
          font-size: 0.75rem;
        }
        @media (max-width: 968px) {
          .register-container {
            grid-template-columns: 1fr;
            max-width: 480px;
            margin: 0 auto;
          }
          .register-left {
            display: none;
          }
          .register-right {
            padding: 3rem 2rem;
          }
          .register-form-wrapper {
            text-align: center;
          }
          .register-form-wrapper h1 {
            font-size: 1.8rem;
          }
          .register-subtitle {
            margin-bottom: 2rem;
          }
          .register-form-wrapper form {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;