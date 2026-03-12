// src/pages/ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const formatPrice = (price) => {
  const num = parseFloat(price);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const ProductDetail = () => {
  const { id }           = useParams();
  const navigate         = useNavigate();
  const { addToCart }    = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading]   = useState(true);
  const [added, setAdded]       = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/api/products/${id}`);
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

  if (loading) return <div className="pd-loader"><div className="spinner" /></div>;
  if (!product) return (
    <div className="pd-not-found">
      <p>Product not found.</p>
      <button onClick={() => navigate('/products')} className="pd-back-btn">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
    </div>
  );

  const inStock = product.stock > 0;

  return (
    <div className="pd-page">
      <div className="pd-inner">
        <button onClick={() => navigate('/products')} className="pd-back">
          <ArrowLeft className="w-4 h-4" /> Products
        </button>
        <div className="pd-grid">
          <div className="pd-image-wrap">
            <img src={product.image_url} alt={product.name} className="pd-image" />
            {!inStock && <div className="pd-sold-out-overlay"><span>Sold out</span></div>}
          </div>
          <div className="pd-info">
            <div className="pd-meta">
              {product.category && <span className="pd-category">{product.category}</span>}
              <span className={`pd-stock-badge ${inStock ? 'pd-stock-badge--in' : 'pd-stock-badge--out'}`}>
                {inStock ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>
            <h1 className="pd-name">{product.name}</h1>
            <p className="pd-price">${formatPrice(product.price)}</p>
            <p className="pd-description">{product.description}</p>
            <div className="pd-divider" />
            <div className="pd-qty-section">
              <label className="pd-qty-label">Quantity</label>
              <div className="pd-qty-row">
                <div className="qty-control">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="qty-btn" disabled={!inStock}><Minus className="w-4 h-4" /></button>
                  <span className="qty-value">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="qty-btn" disabled={!inStock}><Plus className="w-4 h-4" /></button>
                </div>
                <span className="pd-line-total">${formatPrice(parseFloat(product.price) * quantity)}</span>
              </div>
            </div>
            <button onClick={handleAddToCart} disabled={!inStock || added} className={`pd-cta ${added ? 'pd-cta--added' : ''}`}>
              <ShoppingCart className="w-5 h-5" />
              {added ? 'Added — redirecting…' : inStock ? 'Add to cart' : 'Out of stock'}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .pd-page{background:var(--color-bg);padding-block:clamp(2rem,5vw,3.5rem);min-height:60vh}
        .pd-inner{max-width:1100px;margin-inline:auto;padding-inline:clamp(1rem,5vw,2.5rem)}
        .pd-loader{min-height:50vh;display:flex;align-items:center;justify-content:center}
        .pd-not-found{min-height:40vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:3rem}
        .pd-back-btn{display:inline-flex;align-items:center;gap:.4rem;font-family:var(--font-sans);font-size:.875rem;font-weight:600;color:var(--color-fg);background:none;border:1.5px solid var(--color-border);border-radius:99px;padding:.4rem 1rem;cursor:pointer}
        .spinner{width:36px;height:36px;border:2.5px solid var(--color-border);border-top-color:var(--color-fg);border-radius:50%;animation:spin 600ms linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .pd-back{display:inline-flex;align-items:center;gap:.4rem;font-family:var(--font-sans);font-size:.825rem;font-weight:500;color:var(--color-muted);background:none;border:none;padding:0;cursor:pointer;margin-bottom:1.75rem;transition:color var(--transition)}
        .pd-back:hover{color:var(--color-fg)}
        .pd-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(2rem,5vw,4rem);align-items:start}
        @media(max-width:700px){.pd-grid{grid-template-columns:1fr}}
        .pd-image-wrap{position:relative;aspect-ratio:1;border-radius:var(--radius-md);overflow:hidden;background:var(--color-surface);border:1px solid var(--color-border)}
        .pd-image{width:100%;height:100%;object-fit:cover;display:block}
        .pd-sold-out-overlay{position:absolute;inset:0;background:rgba(250,250,249,.75);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px)}
        .pd-sold-out-overlay span{font-size:.85rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--color-fg);background:var(--color-surface);border:1.5px solid var(--color-border);border-radius:99px;padding:.4rem 1.1rem}
        .pd-info{display:flex;flex-direction:column}
        .pd-meta{display:flex;align-items:center;gap:.625rem;margin-bottom:.875rem}
        .pd-category{font-size:.72rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--color-muted)}
        .pd-stock-badge{font-size:.72rem;font-weight:600;border-radius:99px;padding:.2rem .6rem}
        .pd-stock-badge--in{background:#f0fdf4;color:#166534}
        .pd-stock-badge--out{background:#fff1f1;color:#991b1b}
        .pd-name{font-size:clamp(1.5rem,3.5vw,2.5rem);font-weight:700;letter-spacing:-.03em;line-height:1.1;color:var(--color-fg);margin-bottom:.75rem}
        .pd-price{font-size:clamp(1.4rem,2.5vw,1.9rem);font-weight:700;letter-spacing:-.025em;color:var(--color-fg);margin-bottom:1.25rem}
        .pd-description{font-size:.9rem;line-height:1.7;color:#555550}
        .pd-divider{height:1px;background:var(--color-border);margin-block:1.5rem}
        .pd-qty-section{margin-bottom:1.5rem}
        .pd-qty-label{display:block;font-size:.8rem;font-weight:600;letter-spacing:.02em;color:var(--color-fg);margin-bottom:.6rem}
        .pd-qty-row{display:flex;align-items:center;gap:1.25rem}
        .qty-control{display:flex;align-items:center;gap:.625rem;background:var(--color-bg);border:1.5px solid var(--color-border);border-radius:var(--radius-sm);padding:.375rem .75rem}
        .qty-btn{background:none;border:none;cursor:pointer;color:var(--color-muted);display:flex;padding:.125rem;border-radius:3px;transition:color var(--transition),background var(--transition)}
        .qty-btn:hover:not(:disabled){color:var(--color-fg);background:var(--color-border)}
        .qty-btn:disabled{opacity:.35;cursor:not-allowed}
        .qty-value{font-size:1rem;font-weight:700;color:var(--color-fg);min-width:24px;text-align:center}
        .pd-line-total{font-size:1rem;font-weight:700;color:var(--color-fg)}
        .pd-cta{font-family:var(--font-sans);font-size:.95rem;font-weight:600;display:flex;align-items:center;justify-content:center;gap:.625rem;width:100%;background:var(--color-fg);color:#fafaf9;border:none;border-radius:var(--radius-sm);padding:.95rem;cursor:pointer;transition:background var(--transition),transform 80ms}
        .pd-cta:hover:not(:disabled){background:var(--color-accent-hover)}
        .pd-cta:disabled{background:var(--color-border);color:var(--color-muted);cursor:not-allowed}
        .pd-cta--added{background:#166534!important}
      `}</style>
    </div>
  );
};

export default ProductDetail;