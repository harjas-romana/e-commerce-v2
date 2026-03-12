import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const formatPrice = (price) => {
  const num = parseFloat(price);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart({ ...product, price: parseFloat(product.price) }, quantity);
    setAdded(true);
    setTimeout(() => navigate('/cart'), 800);
  };

  if (loading) {
    return (
      <div className="pd-loader">
        <div className="spinner" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pd-not-found">
        <p className="pd-not-found-text">Product not found.</p>
        <button onClick={() => navigate('/products')} className="pd-back-btn">
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </button>
      </div>
    );
  }

  const inStock = product.stock > 0;

  return (
    <div className="pd-page">
      <div className="pd-inner">
        {/* Breadcrumb */}
        <button onClick={() => navigate('/products')} className="pd-back">
          <ArrowLeft className="w-4 h-4" />
          Products
        </button>

        <div className="pd-grid">
          {/* Image */}
          <div className="pd-image-wrap">
            <img
              src={product.image_url}
              alt={product.name}
              className="pd-image"
            />
            {!inStock && (
              <div className="pd-sold-out-overlay">
                <span>Sold out</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            <div className="pd-meta">
              {product.category && (
                <span className="pd-category">{product.category}</span>
              )}
              <span className={`pd-stock-badge ${inStock ? 'pd-stock-badge--in' : 'pd-stock-badge--out'}`}>
                {inStock ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <h1 className="pd-name">{product.name}</h1>
            <p className="pd-price">${formatPrice(product.price)}</p>

            <p className="pd-description">{product.description}</p>

            <div className="pd-divider" />

            {/* Quantity */}
            <div className="pd-qty-section">
              <label className="pd-qty-label">Quantity</label>
              <div className="pd-qty-row">
                <div className="qty-control">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="qty-btn"
                    disabled={!inStock}
                    aria-label="Decrease"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="qty-btn"
                    disabled={!inStock}
                    aria-label="Increase"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="pd-line-total">
                  ${formatPrice(parseFloat(product.price) * quantity)}
                </span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleAddToCart}
              disabled={!inStock || added}
              className={`pd-cta ${added ? 'pd-cta--added' : ''}`}
            >
              <ShoppingCart className="w-5 h-5" />
              {added ? 'Added — redirecting…' : inStock ? 'Add to cart' : 'Out of stock'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .pd-page {
          background: var(--color-bg);
          padding-block: clamp(2rem, 5vw, 3.5rem);
          min-height: 60vh;
        }
        .pd-inner {
          max-width: 1100px;
          margin-inline: auto;
          padding-inline: clamp(1rem, 5vw, 2.5rem);
        }

        /* Loader */
        .pd-loader {
          min-height: 50vh;
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

        /* Not found */
        .pd-not-found {
          min-height: 40vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 3rem;
        }
        .pd-not-found-text { font-size: 1rem; color: var(--color-muted); }
        .pd-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-fg);
          background: none;
          border: 1.5px solid var(--color-border);
          border-radius: 99px;
          padding: 0.4rem 1rem;
          cursor: pointer;
          transition: border-color var(--transition);
        }
        .pd-back-btn:hover { border-color: var(--color-fg); }

        /* Back breadcrumb */
        .pd-back {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-sans);
          font-size: 0.825rem;
          font-weight: 500;
          color: var(--color-muted);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          margin-bottom: 1.75rem;
          transition: color var(--transition);
        }
        .pd-back:hover { color: var(--color-fg); }

        /* Two-col grid */
        .pd-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(2rem, 5vw, 4rem);
          align-items: start;
        }
        @media (max-width: 700px) {
          .pd-grid { grid-template-columns: 1fr; }
        }

        /* Image */
        .pd-image-wrap {
          position: relative;
          aspect-ratio: 1;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
        }
        .pd-image { width: 100%; height: 100%; object-fit: cover; display: block; }
        .pd-sold-out-overlay {
          position: absolute;
          inset: 0;
          background: rgba(250,250,249,.75);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(2px);
        }
        .pd-sold-out-overlay span {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-fg);
          background: var(--color-surface);
          border: 1.5px solid var(--color-border);
          border-radius: 99px;
          padding: 0.4rem 1.1rem;
        }

        /* Info panel */
        .pd-info { display: flex; flex-direction: column; }

        .pd-meta {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin-bottom: 0.875rem;
        }
        .pd-category {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--color-muted);
        }
        .pd-stock-badge {
          font-size: 0.72rem;
          font-weight: 600;
          border-radius: 99px;
          padding: 0.2rem 0.6rem;
        }
        .pd-stock-badge--in  { background: #f0fdf4; color: #166534; }
        .pd-stock-badge--out { background: #fff1f1; color: #991b1b; }

        .pd-name {
          font-size: clamp(1.5rem, 3.5vw, 2.5rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: var(--color-fg);
          margin-bottom: 0.75rem;
        }

        .pd-price {
          font-size: clamp(1.4rem, 2.5vw, 1.9rem);
          font-weight: 700;
          letter-spacing: -0.025em;
          color: var(--color-fg);
          margin-bottom: 1.25rem;
        }

        .pd-description {
          font-size: 0.9rem;
          line-height: 1.7;
          color: #555550;
        }

        .pd-divider {
          height: 1px;
          background: var(--color-border);
          margin-block: 1.5rem;
        }

        /* Qty */
        .pd-qty-section { margin-bottom: 1.5rem; }
        .pd-qty-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--color-fg);
          margin-bottom: 0.6rem;
        }
        .pd-qty-row {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .qty-control {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          background: var(--color-bg);
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 0.375rem 0.75rem;
        }
        .qty-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-muted);
          display: flex;
          padding: 0.125rem;
          border-radius: 3px;
          transition: color var(--transition), background var(--transition);
        }
        .qty-btn:hover:not(:disabled) { color: var(--color-fg); background: var(--color-border); }
        .qty-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .qty-value {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-fg);
          min-width: 24px;
          text-align: center;
        }
        .pd-line-total {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-fg);
        }

        /* CTA */
        .pd-cta {
          font-family: var(--font-sans);
          font-size: 0.95rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          width: 100%;
          background: var(--color-fg);
          color: #fafaf9;
          border: none;
          border-radius: var(--radius-sm);
          padding: 0.95rem;
          cursor: pointer;
          transition: background var(--transition), transform 80ms;
        }
        .pd-cta:hover:not(:disabled) { background: var(--color-accent-hover); }
        .pd-cta:active { transform: scale(.985); }
        .pd-cta:disabled { background: var(--color-border); color: var(--color-muted); cursor: not-allowed; }
        .pd-cta--added { background: #166534 !important; }
      `}</style>
    </div>
  );
};

export default ProductDetail;