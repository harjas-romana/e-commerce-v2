import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, Package, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const { user, logout }            = useAuth();
  const { getItemCount }            = useCart();
  const navigate                    = useNavigate();
  const location                    = useLocation();

  /* Subtle border on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
        <div className="header-inner">
          {/* Logo */}
          <Link to="/" className="header-logo">
            <span className="header-logo-mark" aria-hidden="true" />
            Premium
          </Link>

          {/* Desktop nav */}
          <nav className="header-nav" aria-label="Main">
            <Link to="/"         className={`nav-link ${isActive('/')         ? 'nav-link--active' : ''}`}>Home</Link>
            <Link to="/products" className={`nav-link ${isActive('/products') ? 'nav-link--active' : ''}`}>Products</Link>
          </nav>

          {/* Desktop actions */}
          <div className="header-actions">
            {user ? (
              <>
                {user.isAdmin && (
                  <Link to="/admin" className="action-btn action-btn--text" title="Admin">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <Link to="/orders" className="action-icon" title="Orders" aria-label="Orders">
                  <Package className="w-5 h-5" />
                </Link>
                <button onClick={handleLogout} className="action-icon" title="Sign out" aria-label="Sign out">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="action-btn action-btn--text">
                <User className="w-4 h-4" />
                <span>Sign in</span>
              </Link>
            )}

            <Link to="/cart" className="action-cart" aria-label={`Cart — ${getItemCount()} items`}>
              <ShoppingCart className="w-5 h-5" />
              {getItemCount() > 0 && (
                <span className="cart-badge">{getItemCount()}</span>
              )}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="header-hamburger"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`mobile-drawer ${mobileOpen ? 'mobile-drawer--open' : ''}`} aria-hidden={!mobileOpen}>
        <nav className="mobile-nav">
          <Link to="/"         className="mobile-link">Home</Link>
          <Link to="/products" className="mobile-link">Products</Link>
          <Link to="/cart"     className="mobile-link">
            Cart
            {getItemCount() > 0 && <span className="mobile-badge">{getItemCount()}</span>}
          </Link>
          {user ? (
            <>
              <Link to="/orders" className="mobile-link">Orders</Link>
              {user.isAdmin && <Link to="/admin" className="mobile-link">Admin</Link>}
              <button onClick={handleLogout} className="mobile-link mobile-link--btn">Sign out</button>
            </>
          ) : (
            <Link to="/login" className="mobile-link">Sign in</Link>
          )}
        </nav>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div className="mobile-backdrop" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      <style>{`
        /* ── Header shell ───────────────────────────── */
        .site-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--color-fg);
          height: 60px;
          border-bottom: 1px solid transparent;
          transition: border-color 200ms, box-shadow 200ms;
        }
        .site-header--scrolled {
          border-bottom-color: rgba(255,255,255,.08);
          box-shadow: 0 1px 20px rgba(0,0,0,.35);
        }

        .header-inner {
          max-width: 1280px;
          margin-inline: auto;
          padding-inline: clamp(1rem, 4vw, 2.5rem);
          height: 100%;
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        /* Logo */
        .header-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #fff;
          text-decoration: none;
          flex-shrink: 0;
        }
        .header-logo-mark {
          width: 20px; height: 20px;
          border-radius: 5px;
          background: rgba(255,255,255,.15);
          border: 1.5px solid rgba(255,255,255,.25);
          display: inline-block;
        }
        .header-logo:hover { color: rgba(255,255,255,.85); }

        /* Nav */
        .header-nav {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          flex: 1;
        }
        @media (max-width: 680px) { .header-nav { display: none; } }

        .nav-link {
          font-size: 0.85rem;
          font-weight: 500;
          color: rgba(255,255,255,.55);
          padding: 0.35rem 0.7rem;
          border-radius: var(--radius-sm);
          transition: color var(--transition), background var(--transition);
          text-decoration: none;
        }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,.07); }
        .nav-link--active { color: #fff; background: rgba(255,255,255,.1); }

        /* Actions */
        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-left: auto;
        }
        @media (max-width: 680px) { .header-actions { display: none; } }

        .action-icon {
          width: 36px; height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,.6);
          border-radius: var(--radius-sm);
          border: none;
          background: none;
          cursor: pointer;
          transition: color var(--transition), background var(--transition);
          text-decoration: none;
        }
        .action-icon:hover { color: #fff; background: rgba(255,255,255,.08); }

        .action-btn--text {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.825rem;
          font-weight: 500;
          color: rgba(255,255,255,.6);
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-sm);
          border: none;
          background: none;
          cursor: pointer;
          text-decoration: none;
          transition: color var(--transition), background var(--transition);
        }
        .action-btn--text:hover { color: #fff; background: rgba(255,255,255,.08); }

        .action-cart {
          position: relative;
          width: 36px; height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,.6);
          border-radius: var(--radius-sm);
          text-decoration: none;
          transition: color var(--transition), background var(--transition);
          margin-left: 0.25rem;
        }
        .action-cart:hover { color: #fff; background: rgba(255,255,255,.08); }

        .cart-badge {
          position: absolute;
          top: 3px; right: 3px;
          min-width: 16px; height: 16px;
          background: #fafaf9;
          color: var(--color-fg);
          font-size: 0.65rem;
          font-weight: 700;
          border-radius: 99px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-inline: 3px;
          line-height: 1;
        }

        /* Hamburger */
        .header-hamburger {
          display: none;
          width: 36px; height: 36px;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,.75);
          background: none;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          margin-left: auto;
          transition: color var(--transition);
        }
        .header-hamburger:hover { color: #fff; }
        @media (max-width: 680px) { .header-hamburger { display: flex; } }

        /* ── Mobile drawer ──────────────────────────── */
        .mobile-drawer {
          position: fixed;
          top: 60px;
          left: 0;
          right: 0;
          background: var(--color-fg);
          border-bottom: 1px solid rgba(255,255,255,.08);
          z-index: 99;
          transform: translateY(-8px);
          opacity: 0;
          pointer-events: none;
          transition: transform 220ms var(--ease-out), opacity 220ms;
        }
        .mobile-drawer--open {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }
        .mobile-nav {
          max-width: 1280px;
          margin-inline: auto;
          padding: 1rem clamp(1rem, 4vw, 2.5rem) 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .mobile-link {
          font-size: 0.95rem;
          font-weight: 500;
          color: rgba(255,255,255,.65);
          padding: 0.6rem 0.75rem;
          border-radius: var(--radius-sm);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: color var(--transition), background var(--transition);
        }
        .mobile-link:hover { color: #fff; background: rgba(255,255,255,.06); }
        .mobile-link--btn {
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: var(--font-sans);
          width: 100%;
        }
        .mobile-badge {
          margin-left: auto;
          min-width: 18px; height: 18px;
          background: rgba(255,255,255,.15);
          color: #fff;
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: 99px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding-inline: 4px;
        }
        .mobile-backdrop {
          position: fixed;
          inset: 0;
          top: 60px;
          z-index: 98;
          background: rgba(0,0,0,.3);
          backdrop-filter: blur(2px);
        }
      `}</style>
    </>
  );
};

export default Header;