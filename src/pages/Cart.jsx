import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const formatPrice = (price) => {
  const num = parseFloat(price);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="cart-empty-page">
        <div className="cart-empty-icon">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="cart-empty-title">Your cart is empty</h2>
        <p className="cart-empty-body">Add something great to get started.</p>
        <Link to="/products" className="btn-primary">
          Browse products
          <ArrowRight className="w-4 h-4" />
        </Link>

        <style>{`
          .cart-empty-page {
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 3rem 1.5rem;
          }
          .cart-empty-icon {
            width: 64px; height: 64px;
            border-radius: 50%;
            background: var(--color-border);
            color: var(--color-muted);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 0.5rem;
          }
          .cart-empty-title {
            font-size: 1.35rem;
            font-weight: 700;
            letter-spacing: -0.02em;
            color: var(--color-fg);
          }
          .cart-empty-body {
            font-size: 0.9rem;
            color: var(--color-muted);
            margin-bottom: 1rem;
          }
          .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--color-fg);
            color: #fafaf9;
            font-family: var(--font-sans);
            font-size: 0.875rem;
            font-weight: 600;
            padding: 0.75rem 1.5rem;
            border-radius: var(--radius-sm);
            border: none;
            cursor: pointer;
            transition: background var(--transition), transform 80ms;
          }
          .btn-primary:hover { background: var(--color-accent-hover); color: #fafaf9; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-inner">
        <h1 className="cart-title">Cart
          <span className="cart-count">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
        </h1>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img-wrap">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="cart-item-img"
                  />
                </div>

                <div className="cart-item-info">
                  <div>
                    <p className="cart-item-category">{item.category}</p>
                    <h3 className="cart-item-name">{item.name}</h3>
                  </div>
                  <p className="cart-item-price">${formatPrice(item.price)}</p>
                </div>

                <div className="cart-item-actions">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="cart-remove"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="qty-control">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="qty-btn"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="qty-btn"
                      aria-label="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="cart-item-line-total">
                    ${formatPrice(parseFloat(item.price) * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <div className="summary-card">
              <h2 className="summary-title">Order summary</h2>

              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${formatPrice(getTotal())}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="summary-free">Free</span>
                </div>
              </div>

              <div className="summary-divider" />

              <div className="summary-total">
                <span>Total</span>
                <span>${formatPrice(getTotal())}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn-checkout"
              >
                Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link to="/products" className="btn-continue">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cart-page {
          background: var(--color-bg);
          padding-block: clamp(2rem, 5vw, 3.5rem);
          min-height: 60vh;
        }
        .cart-inner {
          max-width: 1100px;
          margin-inline: auto;
          padding-inline: clamp(1rem, 5vw, 2.5rem);
        }

        /* Title */
        .cart-title {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--color-fg);
          display: flex;
          align-items: baseline;
          gap: 0.875rem;
          margin-bottom: 2rem;
        }
        .cart-count {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-muted);
          letter-spacing: 0;
        }

        /* Layout */
        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 2rem;
          align-items: start;
        }
        @media (max-width: 768px) {
          .cart-layout { grid-template-columns: 1fr; }
        }

        /* Items list */
        .cart-items { display: flex; flex-direction: column; gap: 1px; }

        /* Single item */
        .cart-item {
          display: grid;
          grid-template-columns: 80px 1fr auto;
          gap: 1.25rem;
          align-items: center;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1rem 1.25rem;
          margin-bottom: 0.75rem;
          transition: border-color var(--transition), box-shadow var(--transition);
        }
        .cart-item:hover {
          border-color: #c8c7c0;
          box-shadow: var(--shadow-xs);
        }

        .cart-item-img-wrap {
          width: 80px; height: 80px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          flex-shrink: 0;
        }
        .cart-item-img {
          width: 100%; height: 100%;
          object-fit: cover;
        }

        .cart-item-info {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 0.5rem;
          min-width: 0;
        }
        .cart-item-category {
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-muted);
          margin-bottom: 0.15rem;
        }
        .cart-item-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-fg);
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cart-item-price {
          font-size: 0.85rem;
          color: var(--color-muted);
        }

        .cart-item-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.75rem;
        }

        .cart-remove {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-muted);
          padding: 0.25rem;
          border-radius: var(--radius-sm);
          transition: color var(--transition), background var(--transition);
          display: flex;
        }
        .cart-remove:hover { color: #c0392b; background: #fdf0ef; }

        /* Qty */
        .qty-control {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--color-bg);
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 0.25rem 0.5rem;
        }
        .qty-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-muted);
          display: flex;
          padding: 0.1rem;
          border-radius: 3px;
          transition: color var(--transition), background var(--transition);
        }
        .qty-btn:hover { color: var(--color-fg); background: var(--color-border); }
        .qty-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-fg);
          min-width: 20px;
          text-align: center;
        }

        .cart-item-line-total {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--color-fg);
          white-space: nowrap;
        }

        /* Summary card */
        .cart-summary { position: sticky; top: 80px; }
        .summary-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1.5rem;
        }
        .summary-title {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.015em;
          color: var(--color-fg);
          margin-bottom: 1.25rem;
        }
        .summary-rows { display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1rem; }
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: var(--color-muted);
        }
        .summary-row span:last-child { font-weight: 500; color: var(--color-fg); }
        .summary-free { color: #166534 !important; font-weight: 600 !important; }
        .summary-divider {
          height: 1px;
          background: var(--color-border);
          margin-block: 1rem;
        }
        .summary-total {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 1.5rem;
        }
        .summary-total span:first-child {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-fg);
        }
        .summary-total span:last-child {
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--color-fg);
        }
        .btn-checkout {
          font-family: var(--font-sans);
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: var(--color-fg);
          color: #fafaf9;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 0.875rem;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background var(--transition), transform 80ms;
          margin-bottom: 0.75rem;
        }
        .btn-checkout:hover { background: var(--color-accent-hover); }
        .btn-checkout:active { transform: scale(.98); }
        .btn-continue {
          display: block;
          text-align: center;
          font-size: 0.825rem;
          font-weight: 500;
          color: var(--color-muted);
          transition: color var(--transition);
        }
        .btn-continue:hover { color: var(--color-fg); }
      `}</style>
    </div>
  );
};

export default Cart;