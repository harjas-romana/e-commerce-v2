import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const formatPrice = (price) => {
  const num = parseFloat(price);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const ProductCard = ({ product }) => {
  const { addToCart }   = useCart();
  const [added, setAdded] = useState(false);
  const inStock = product.stock > 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!inStock || added) return;
    addToCart({ ...product, price: parseFloat(product.price) });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      {/* Image */}
      <div className="product-card-img-wrap">
        <img
          src={product.image_url}
          alt={product.name}
          className="product-card-img"
          loading="lazy"
        />
        {!inStock && (
          <div className="product-card-sold-out">Sold out</div>
        )}
        {product.featured && inStock && (
          <div className="product-card-featured-tag">Featured</div>
        )}
      </div>

      {/* Info */}
      <div className="product-card-body">
        <div className="product-card-top">
          {product.category && (
            <span className="product-card-category">{product.category}</span>
          )}
          <h3 className="product-card-name">{product.name}</h3>
          <p className="product-card-desc">{product.description}</p>
        </div>

        <div className="product-card-footer">
          <span className="product-card-price">${formatPrice(product.price)}</span>

          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`product-card-cta ${added ? 'product-card-cta--added' : ''}`}
            aria-label={added ? 'Added to cart' : 'Add to cart'}
            title={added ? 'Added!' : 'Add to cart'}
          >
            {added
              ? <Check className="w-4 h-4" />
              : <ShoppingCart className="w-4 h-4" />
            }
          </button>
        </div>

        <div className="product-card-stock">
          {inStock
            ? <span className="product-card-stock--in">{product.stock} in stock</span>
            : <span className="product-card-stock--out">Out of stock</span>
          }
        </div>
      </div>

      <style>{`
        .product-card {
          display: flex;
          flex-direction: column;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: border-color var(--transition), box-shadow var(--transition), transform 200ms var(--ease-out);
        }
        .product-card:hover {
          border-color: #b0afa9;
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        /* Image */
        .product-card-img-wrap {
          aspect-ratio: 1;
          overflow: hidden;
          background: var(--color-bg);
          position: relative;
        }
        .product-card-img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 400ms var(--ease-out);
        }
        .product-card:hover .product-card-img {
          transform: scale(1.04);
        }
        .product-card-sold-out {
          position: absolute;
          inset: 0;
          background: rgba(250,250,249,.7);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-fg);
          backdrop-filter: blur(2px);
        }
        .product-card-featured-tag {
          position: absolute;
          top: 10px; left: 10px;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: var(--color-fg);
          color: #fafaf9;
          padding: 0.25rem 0.55rem;
          border-radius: 99px;
        }

        /* Body */
        .product-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          padding: 1rem 1rem 0.875rem;
          flex: 1;
        }
        .product-card-top { flex: 1; }
        .product-card-category {
          display: block;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-muted);
          margin-bottom: 0.3rem;
        }
        .product-card-name {
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--color-fg);
          margin-bottom: 0.35rem;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .product-card-desc {
          font-size: 0.8rem;
          color: var(--color-muted);
          line-height: 1.55;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Footer row */
        .product-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .product-card-price {
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--color-fg);
        }

        /* CTA button */
        .product-card-cta {
          width: 34px; height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-fg);
          color: #fafaf9;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          flex-shrink: 0;
          transition: background var(--transition), transform 80ms;
        }
        .product-card-cta:hover:not(:disabled) { background: #2a2a28; }
        .product-card-cta:active { transform: scale(.9); }
        .product-card-cta:disabled {
          background: var(--color-border);
          color: var(--color-muted);
          cursor: not-allowed;
        }
        .product-card-cta--added {
          background: #16a34a !important;
        }

        /* Stock */
        .product-card-stock { font-size: 0.72rem; }
        .product-card-stock--in  { color: var(--color-muted); }
        .product-card-stock--out { color: #dc2626; font-weight: 500; }
      `}</style>
    </Link>
  );
};

export default ProductCard;