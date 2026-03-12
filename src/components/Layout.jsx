import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  const location = useLocation();
  const mainRef  = useRef(null);

  /* Re-trigger page-enter animation on route change */
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    el.classList.remove('page-enter');
    void el.offsetWidth; // reflow
    el.classList.add('page-enter');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className="layout-root">
      {/* Ambient top glow – purely decorative */}
      <div className="layout-glow" aria-hidden="true" />

      <Header />

      <main ref={mainRef} className="layout-main page-enter">
        <Outlet />
      </main>

      <Footer />

      <style>{`
        /* ── Layout shell ──────────────────────────────── */
        .layout-root {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          position: relative;
          isolation: isolate;
          background: var(--color-bg);
        }

        /* Subtle radial ambient light at top-center */
        .layout-glow {
          pointer-events: none;
          position: fixed;
          top: -160px;
          left: 50%;
          translate: -50% 0;
          width: min(900px, 120vw);
          height: 420px;
          background: radial-gradient(
            ellipse at 50% 0%,
            rgba(180, 175, 165, 0.18) 0%,
            transparent 72%
          );
          z-index: 0;
        }

        /* ── Main content area ─────────────────────────── */
        .layout-main {
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
          width: 100%;
          /* Push content below sticky header gracefully */
          padding-top: 1px;
          position: relative;
          z-index: 1;
        }

        /* ── Responsive content container ─────────────── */
        /* Use this class inside pages: <div className="container"> */
        :global(.container) {
          width: 100%;
          max-width: 1200px;
          margin-inline: auto;
          padding-inline: clamp(1rem, 5vw, 3rem);
        }

        :global(.container-sm) {
          width: 100%;
          max-width: 760px;
          margin-inline: auto;
          padding-inline: clamp(1rem, 5vw, 2rem);
        }

        /* ── Section spacing helpers ───────────────────── */
        :global(.section) {
          padding-block: clamp(3rem, 8vw, 7rem);
        }

        :global(.section-sm) {
          padding-block: clamp(2rem, 5vw, 4rem);
        }

        /* ── Divider ───────────────────────────────────── */
        :global(.divider) {
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--color-border) 20%,
            var(--color-border) 80%,
            transparent
          );
          border: none;
          margin-block: 0;
        }
      `}</style>
    </div>
  );
};

export default Layout;