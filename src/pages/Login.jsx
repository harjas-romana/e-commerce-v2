import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Left panel */}
        <div className="auth-panel">
          <div className="auth-panel-inner">
            <p className="auth-panel-eyebrow">Welcome back</p>
            <h2 className="auth-panel-headline">Good to see<br />you again.</h2>
            <p className="auth-panel-body">
              Sign in to access your orders, saved items, and personalised experience.
            </p>
          </div>
          <div className="auth-panel-deco" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        {/* Form panel */}
        <div className="auth-form-panel">
          <h1 className="auth-form-title">Sign in</h1>

          {error && (
            <div className="auth-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label className="field-label">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="you@example.com"
                className="field-input"
              />
            </div>

            <div className="field">
              <label className="field-label">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="••••••••"
                className="field-input"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <span className="btn-spinner" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            No account?{' '}
            <Link to="/register" className="auth-switch-link">Create one</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: calc(100dvh - 64px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(1.5rem, 5vw, 3rem);
          background: var(--color-bg);
        }

        .auth-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          max-width: 880px;
          min-height: 540px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--color-border);
        }

        /* ── Left decorative panel ── */
        .auth-panel {
          background: var(--color-fg);
          color: #fafaf9;
          padding: clamp(2rem, 5%, 3.5rem);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .auth-panel-inner { position: relative; z-index: 1; }

        .auth-panel-eyebrow {
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,.45);
          margin-bottom: 1.25rem;
        }

        .auth-panel-headline {
          font-size: clamp(1.75rem, 3.5vw, 2.75rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: #fff;
          margin-bottom: 1.25rem;
        }

        .auth-panel-body {
          font-size: 0.9rem;
          line-height: 1.65;
          color: rgba(255,255,255,.5);
        }

        /* Decorative circles */
        .auth-panel-deco {
          position: absolute;
          bottom: -60px;
          right: -60px;
          z-index: 0;
        }
        .auth-panel-deco span {
          display: block;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.08);
          position: absolute;
          bottom: 0; right: 0;
        }
        .auth-panel-deco span:nth-child(1) { width: 200px; height: 200px; }
        .auth-panel-deco span:nth-child(2) { width: 320px; height: 320px; }
        .auth-panel-deco span:nth-child(3) { width: 440px; height: 440px; }

        /* ── Form panel ── */
        .auth-form-panel {
          background: var(--color-surface);
          padding: clamp(2rem, 5%, 3.5rem);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .auth-form-title {
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.025em;
          margin-bottom: 1.75rem;
          color: var(--color-fg);
        }

        .auth-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: #c0392b;
          background: #fdf0ef;
          border: 1px solid #f5c6c2;
          border-radius: var(--radius-sm);
          padding: 0.75rem 1rem;
          margin-bottom: 1.25rem;
        }

        .auth-form { display: flex; flex-direction: column; gap: 1.1rem; }

        .field { display: flex; flex-direction: column; gap: 0.4rem; }

        .field-label {
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--color-fg);
        }

        .field-input {
          font-family: var(--font-sans);
          font-size: 0.925rem;
          color: var(--color-fg);
          background: var(--color-bg);
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 0.7rem 0.9rem;
          outline: none;
          transition: border-color var(--transition), box-shadow var(--transition);
          width: 100%;
        }
        .field-input::placeholder { color: var(--color-muted); }
        .field-input:focus {
          border-color: var(--color-fg);
          box-shadow: 0 0 0 3px rgba(17,17,16,.08);
        }

        .btn-primary {
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: var(--color-fg);
          color: #fafaf9;
          border: none;
          border-radius: var(--radius-sm);
          padding: 0.875rem 1.5rem;
          cursor: pointer;
          transition: background var(--transition), transform 80ms;
          margin-top: 0.5rem;
          width: 100%;
        }
        .btn-primary:hover { background: var(--color-accent-hover); }
        .btn-primary:active { transform: scale(.985); }
        .btn-primary:disabled {
          background: var(--color-border);
          color: var(--color-muted);
          cursor: not-allowed;
        }

        .btn-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 600ms linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-switch {
          font-size: 0.85rem;
          color: var(--color-muted);
          text-align: center;
          margin-top: 1.5rem;
        }
        .auth-switch-link {
          color: var(--color-fg);
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        /* Mobile */
        @media (max-width: 640px) {
          .auth-card { grid-template-columns: 1fr; }
          .auth-panel { display: none; }
          .auth-form-panel { border-radius: var(--radius-lg); }
        }
      `}</style>
    </div>
  );
};

export default Login;