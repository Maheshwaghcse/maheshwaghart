// Login.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, userInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect === '/' ? '/' : `/${redirect}`);
    }
  }, [userInfo, navigate, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }

      login(data); // clears cart automatically if different user logs in
      navigate(redirect === '/' ? '/' : `/${redirect}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-container">
          <div className="login-left">
            <div className="login-brand">
              <span className="brand-icon">🎨</span>
              <h2>maheshwagh_art</h2>
              <p>Your commissions, your saved pieces, your journey... all right here.</p>
            </div>
            <div className="login-features">
              <div className="feature">
                <span>✓</span>
                <span>Every piece you've commissioned through me</span>
              </div>
              <div className="feature">
                <span>✓</span>
                <span>The ones you're still thinking about owning</span>
              </div>
              <div className="feature">
                <span>✓</span>
                <span>Your next commission, one WhatsApp message away</span>
              </div>
              <div className="feature">
                <span>✓</span>
                <span>Your collection growing, one original at a time</span>
              </div>
            </div>
          </div>

          <div className="login-right">
            <div className="login-form-wrapper">
              <h1>Welcome <span className="text-gradient">Back</span></h1>
              <p className="login-subtitle">Enter your credentials to continue</p>

              {error && <div className="error-message">{error}</div>}

              <form onSubmit={submitHandler}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email"
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
                      placeholder="password"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                  Login <ArrowRight size={18} />
                </button>

              </form>

              <div className="login-footer">
                <p>New here? <Link to="/register">Create an account</Link></p>
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 80vh;
          display: flex;
          align-items: center;
          padding: 8rem 0 4rem;
        }
        .login-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          background: var(--bg-card);
          border-radius: 2rem;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }
        .login-left {
          background: linear-gradient(135deg, rgba(255,92,0,0.1) 0%, rgba(0,0,0,0) 100%);
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .login-brand {
          margin-bottom: 2rem;
        }
        .brand-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
        }
        .login-brand h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .login-brand p {
          color: var(--text-muted);
        }
        .login-features {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .feature {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-muted);
        }
        .feature span:first-child {
          width: 24px;
          height: 24px;
          background: rgba(34,197,94,0.1);
          color: #22c55e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
        }
        .login-right {
          padding: 3rem;
          display: flex;
          align-items: center;
        }
        .login-form-wrapper {
          width: 100%;
        }
        .login-form-wrapper h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .login-subtitle {
          color: var(--text-muted);
          margin-bottom: 2rem;
        }

        .password-input {
          position: relative;
        }
        .password-input input {
          width: 100%;
          padding-right: 2.5rem;
        }
        .password-input button {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
        }
        .login-btn { color: #fff;
          width: 100%;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .login-footer {
          margin-top: 2rem;
          text-align: center;
        }
        .login-footer p {
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        .login-footer a {
          color: var(--primary-color);
          text-decoration: none;
        }
        .forgot-link {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        @media (max-width: 968px) {
          .login-container {
            grid-template-columns: 1fr;
          }
          .login-left {
            display: none;
          }
          .login-right {
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
