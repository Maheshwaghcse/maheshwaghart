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
          min-height: 85vh;
          display: flex;
          align-items: center;
          padding: 8rem 0 4rem;
          background: radial-gradient(circle at center, rgba(189, 0, 255, 0.04) 0%, rgba(13, 7, 16, 1) 80%);
        }
        .login-container {
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
        .login-left {
          background: linear-gradient(135deg, rgba(189, 0, 255, 0.08) 0%, rgba(255, 54, 200, 0.02) 100%);
          padding: 4rem 3.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }
        .login-brand {
          margin-bottom: 2.5rem;
        }
        .brand-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 1.5rem;
        }
        .login-brand h2 {
          font-family: 'Epilogue', sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
          color: #fff;
        }
        .login-brand p {
          color: var(--text-muted);
          line-height: 1.6;
        }
        .login-features {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .feature {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #d4c0d7;
          font-size: 0.95rem;
        }
        .feature span:first-child {
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
        .login-right {
          padding: 4rem 3.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-form-wrapper {
          width: 100%;
          max-width: 380px;
        }
        .login-form-wrapper h1 {
          font-family: 'Epilogue', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          letter-spacing: -0.03em;
        }
        .login-subtitle {
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
        .login-btn { 
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
        .login-footer {
          margin-top: 2.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .login-footer p {
          color: var(--text-muted);
          margin: 0;
          font-size: 0.95rem;
        }
        .login-footer a {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }
        .login-footer a:hover {
          color: #ff36c8;
        }
        .forgot-link {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .forgot-link:hover {
          color: #fff;
        }
        @media (max-width: 968px) {
          .login-container {
            grid-template-columns: 1fr;
            max-width: 480px;
            margin: 0 auto;
          }
          .login-left {
            display: none;
          }
          .login-right {
            padding: 3rem 2rem;
          }
          .login-form-wrapper {
            text-align: center;
          }
          .login-form-wrapper h1 {
            font-size: 1.8rem;
          }
          .login-subtitle {
            margin-bottom: 2rem;
          }
          .login-form-wrapper form {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
