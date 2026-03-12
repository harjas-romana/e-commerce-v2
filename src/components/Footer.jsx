import React from 'react';
import { Link } from 'react-router-dom';

const NAV = [
  {
    heading: 'Shop',
    links: [
      { label: 'All products',  to: '/products' },
      { label: 'Electronics',   to: '/products?category=Electronics' },
      { label: 'Accessories',   to: '/products?category=Accessories' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Contact us',    href: '#' },
      { label: 'Shipping info', href: '#' },
      { label: 'Returns',       href: '#' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy policy',   href: '#' },
      { label: 'Terms of service', href: '#' },
    ],
  },
];

const Footer = () => (
  <footer className="site-footer">
    <div className="footer-inner">
      {/* Brand column */}
      <div className="footer-brand">
        <div className="footer-logo">
          <span className="footer-logo-mark" aria-hidden="true" />
          Premium
        </div>
        <p className="footer-tagline">
          Curated products for those who demand excellence.
        </p>
      </div>

      {/* Nav columns */}
      {NAV.map(({ heading, links }) => (
        <div key={heading} className="footer-col">
          <p className="footer-col-heading">{heading}</p>
          <ul className="footer-col-list">
            {links.map(({ label, to, href }) => (
              <li key={label}>
                {to ? (
                  <Link to={to} className="footer-link">{label}</Link>
                ) : (
                  <a href={href} className="footer-link">{label}</a>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    {/* Bottom bar */}
    <div className="footer-bar">
      <p className="footer-copy">
        © {new Date().getFullYear()} Premium Store. All rights reserved.
      </p>
      <div className="footer-bar-links">
        <a href="#" className="footer-bar-link">Privacy</a>
        <a href="#" className="footer-bar-link">Terms</a>
      </div>
    </div>

    <style>{`
      .site-footer {
        background: var(--color-fg);
        color: rgba(255,255,255,.55);
        margin-top: auto;
      }

      /* Main grid */
      .footer-inner {
        max-width: 1280px;
        margin-inline: auto;
        padding: clamp(3rem, 6vw, 4.5rem) clamp(1.5rem, 5vw, 3rem) 2.5rem;
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: clamp(2rem, 4vw, 3.5rem);
      }
      @media (max-width: 820px) {
        .footer-inner { grid-template-columns: 1fr 1fr; }
        .footer-brand { grid-column: 1 / -1; }
      }
      @media (max-width: 480px) {
        .footer-inner { grid-template-columns: 1fr; }
      }

      /* Brand */
      .footer-logo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: #fff;
        margin-bottom: 0.875rem;
      }
      .footer-logo-mark {
        width: 18px; height: 18px;
        border-radius: 4px;
        background: rgba(255,255,255,.12);
        border: 1.5px solid rgba(255,255,255,.2);
        display: inline-block;
      }
      .footer-tagline {
        font-size: 0.825rem;
        line-height: 1.65;
        color: rgba(255,255,255,.38);
        max-width: 240px;
      }

      /* Columns */
      .footer-col-heading {
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: rgba(255,255,255,.35);
        margin-bottom: 1rem;
      }
      .footer-col-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }
      .footer-link {
        font-size: 0.845rem;
        color: rgba(255,255,255,.5);
        text-decoration: none;
        transition: color 180ms;
      }
      .footer-link:hover { color: #fff; }

      /* Bottom bar */
      .footer-bar {
        max-width: 1280px;
        margin-inline: auto;
        padding: 1.25rem clamp(1.5rem, 5vw, 3rem);
        border-top: 1px solid rgba(255,255,255,.07);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .footer-copy {
        font-size: 0.775rem;
        color: rgba(255,255,255,.28);
      }
      .footer-bar-links {
        display: flex;
        gap: 1.25rem;
      }
      .footer-bar-link {
        font-size: 0.775rem;
        color: rgba(255,255,255,.28);
        text-decoration: none;
        transition: color 180ms;
      }
      .footer-bar-link:hover { color: rgba(255,255,255,.6); }
    `}</style>
  </footer>
);

export default Footer;