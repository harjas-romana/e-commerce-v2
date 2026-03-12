import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import { ArrowRight, TrendingUp, Shield, Truck } from 'lucide-react';

const FEATURES = [
  { icon: Truck,      label: 'Free shipping',   sub: 'On orders over $100'           },
  { icon: Shield,     label: 'Secure payment',  sub: '100% secure transactions'      },
  { icon: TrendingUp, label: 'Premium quality', sub: 'Carefully selected products'   },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.get('/api/products?featured=true');
        setFeaturedProducts(response.data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  return (
    <div className="home">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-eyebrow">New season — now live</span>
            <h1 className="hero-headline">
              Premium quality,<br />exceptional style.
            </h1>
            <p className="hero-body">
              A curated collection of premium products designed for those who demand excellence.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn-hero-primary">
                Shop now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/products" className="btn-hero-ghost">
                Explore collection
              </Link>
            </div>
          </div>

          {/* Decorative card */}
          <div className="hero-deco" aria-hidden="true">
            <div className="hero-deco-card">
              <div className="hero-deco-line" />
              <div className="hero-deco-line hero-deco-line--sm" />
              <div className="hero-deco-pill" />
            </div>
            <div className="hero-deco-ring" />
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="features">
        <div className="features-inner">
          {FEATURES.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="feature">
              <div className="feature-icon">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="feature-label">{label}</p>
                <p className="feature-sub">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────── */}
      <section className="featured">
        <div className="featured-inner">
          <div className="section-head">
            <h2 className="section-title">Featured</h2>
            <Link to="/products" className="section-link">
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid-loader">
              <div className="spinner" />
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────── */}
      <section className="cta">
        <div className="cta-inner">
          <div className="cta-text">
            <h2 className="cta-title">Elevate your everyday.</h2>
            <p className="cta-body">
              Join thousands who trust us for quality that lasts.
            </p>
          </div>
          <Link to="/products" className="btn-cta">
            Explore collection
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <style>{`
        /* ── Hero ─────────────────────────────────── */
        .hero {
          position: relative;
          overflow: hidden;
          background: var(--color-fg);
          min-height: clamp(480px, 60vh, 680px);
          display: flex;
          align-items: center;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 70% at 80% 50%, rgba(255,255,255,.04) 0%, transparent 60%),
            radial-gradient(ellipse 40% 50% at 20% 80%, rgba(255,255,255,.03) 0%, transparent 50%);
        }
        .hero-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1280px;
          margin-inline: auto;
          padding: clamp(3rem, 8vw, 5rem) clamp(1.5rem, 5vw, 3rem);
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 3rem;
          align-items: center;
        }
        .hero-content { max-width: 560px; }
        .hero-eyebrow {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,.45);
          margin-bottom: 1.25rem;
        }
        .hero-headline {
          font-size: clamp(2.25rem, 5vw, 4rem);
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1.08;
          color: #fff;
          margin-bottom: 1.25rem;
        }
        .hero-body {
          font-size: clamp(0.95rem, 1.5vw, 1.1rem);
          line-height: 1.7;
          color: rgba(255,255,255,.5);
          margin-bottom: 2rem;
          max-width: 440px;
        }
        .hero-actions {
          display: flex;
          gap: 0.875rem;
          flex-wrap: wrap;
          align-items: center;
        }
        .btn-hero-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #fafaf9;
          color: var(--color-fg);
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 600;
          padding: 0.8rem 1.5rem;
          border-radius: var(--radius-sm);
          transition: background var(--transition), transform 80ms;
        }
        .btn-hero-primary:hover { background: #fff; color: var(--color-fg); }
        .btn-hero-primary:active { transform: scale(.97); }
        .btn-hero-ghost {
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 500;
          color: rgba(255,255,255,.55);
          transition: color var(--transition);
        }
        .btn-hero-ghost:hover { color: rgba(255,255,255,.9); }

        /* Decorative element */
        .hero-deco {
          position: relative;
          width: 200px;
          height: 200px;
          flex-shrink: 0;
        }
        .hero-deco-card {
          width: 160px; height: 160px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          justify-content: flex-end;
        }
        .hero-deco-line {
          height: 8px;
          background: rgba(255,255,255,.12);
          border-radius: 4px;
          width: 80%;
        }
        .hero-deco-line--sm { width: 55%; height: 6px; }
        .hero-deco-pill {
          margin-top: 0.5rem;
          height: 28px;
          background: rgba(255,255,255,.18);
          border-radius: 99px;
          width: 70%;
        }
        .hero-deco-ring {
          position: absolute;
          top: -20px; right: -20px;
          width: 120px; height: 120px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.07);
        }

        @media (max-width: 640px) {
          .hero-deco { display: none; }
          .hero-inner { grid-template-columns: 1fr; }
        }

        /* ── Features ─────────────────────────────── */
        .features {
          border-bottom: 1px solid var(--color-border);
        }
        .features-inner {
          max-width: 1280px;
          margin-inline: auto;
          padding: 1.75rem clamp(1.5rem, 5vw, 3rem);
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .feature {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.875rem 1rem;
          border-radius: var(--radius-sm);
          transition: background var(--transition);
        }
        .feature:hover { background: var(--color-surface); }
        .feature-icon {
          width: 38px; height: 38px;
          border-radius: var(--radius-sm);
          background: var(--color-fg);
          color: #fafaf9;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .feature-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-fg);
          margin-bottom: 0.15rem;
        }
        .feature-sub {
          font-size: 0.775rem;
          color: var(--color-muted);
        }
        @media (max-width: 640px) {
          .features-inner { grid-template-columns: 1fr; }
        }

        /* ── Featured ─────────────────────────────── */
        .featured {
          padding-block: clamp(3rem, 7vw, 5rem);
          background: var(--color-bg);
        }
        .featured-inner {
          max-width: 1280px;
          margin-inline: auto;
          padding-inline: clamp(1.5rem, 5vw, 3rem);
        }
        .section-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 2rem;
        }
        .section-title {
          font-size: clamp(1.5rem, 3vw, 2.25rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--color-fg);
        }
        .section-link {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-muted);
          transition: color var(--transition);
        }
        .section-link:hover { color: var(--color-fg); }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 1.25rem;
        }
        .grid-loader {
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .spinner {
          width: 36px; height: 36px;
          border: 2.5px solid var(--color-border);
          border-top-color: var(--color-fg);
          border-radius: 50%;
          animation: spin 600ms linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── CTA ──────────────────────────────────── */
        .cta {
          background: var(--color-fg);
          padding-block: clamp(3rem, 7vw, 5rem);
        }
        .cta-inner {
          max-width: 1280px;
          margin-inline: auto;
          padding-inline: clamp(1.5rem, 5vw, 3rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .cta-title {
          font-size: clamp(1.5rem, 3.5vw, 2.5rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #fff;
          margin-bottom: 0.4rem;
        }
        .cta-body {
          font-size: 0.95rem;
          color: rgba(255,255,255,.45);
        }
        .btn-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #fafaf9;
          color: var(--color-fg);
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 600;
          padding: 0.8rem 1.5rem;
          border-radius: var(--radius-sm);
          white-space: nowrap;
          transition: background var(--transition), transform 80ms;
          flex-shrink: 0;
        }
        .btn-cta:hover { background: #fff; color: var(--color-fg); }
        .btn-cta:active { transform: scale(.97); }
      `}</style>
    </div>
  );
};

export default Home;