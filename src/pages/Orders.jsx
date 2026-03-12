import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Clock } from 'lucide-react';

const formatPrice = (price) => {
  const num = parseFloat(price);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    bg: '#fef9ec', color: '#92680a', dot: '#f0b429' },
  processing: { label: 'Processing', bg: '#eff6ff', color: '#1e4fa8', dot: '#3b82f6' },
  shipped:    { label: 'Shipped',    bg: '#f5f0ff', color: '#5b21b6', dot: '#8b5cf6' },
  delivered:  { label: 'Delivered',  bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
  cancelled:  { label: 'Cancelled',  bg: '#fff1f1', color: '#991b1b', dot: '#ef4444' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#f4f4f3', color: '#555', dot: '#aaa' };
  return (
    <span
      className="status-badge"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span className="status-dot" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="orders-loader">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1 className="orders-title">Orders</h1>
        {orders.length > 0 && (
          <span className="orders-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <div className="orders-empty-icon">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="orders-empty-title">No orders yet</h2>
          <p className="orders-empty-body">Your order history will appear here once you make a purchase.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              {/* Card header */}
              <div className="order-card-header">
                <div className="order-meta">
                  <span className="order-id">#{String(order.id).padStart(5, '0')}</span>
                  <span className="order-date">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </span>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Items */}
              <div className="order-items">
                {order.items?.map((item, i) => (
                  <div key={i} className="order-item">
                    <span className="order-item-name">
                      {item.name}
                      <span className="order-item-qty">×{item.quantity}</span>
                    </span>
                    <span className="order-item-price">
                      ${formatPrice(parseFloat(item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="order-card-footer">
                <div className="order-shipping">
                  <span className="order-shipping-label">Ship to</span>
                  <span className="order-shipping-addr">{order.shipping_address}</span>
                </div>
                <div className="order-total">
                  <span className="order-total-label">Total</span>
                  <span className="order-total-amount">${formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .orders-page {
          max-width: 860px;
          margin-inline: auto;
          padding: clamp(2rem, 5vw, 3.5rem) clamp(1rem, 5vw, 2rem);
        }

        .orders-loader {
          min-height: 40vh;
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

        /* Header */
        .orders-header {
          display: flex;
          align-items: baseline;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .orders-title {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--color-fg);
        }
        .orders-count {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-muted);
        }

        /* Empty state */
        .orders-empty {
          text-align: center;
          padding: clamp(3rem, 10vw, 6rem) 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .orders-empty-icon {
          width: 60px; height: 60px;
          border-radius: 50%;
          background: var(--color-border);
          color: var(--color-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }
        .orders-empty-title {
          font-size: 1.25rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--color-fg);
        }
        .orders-empty-body {
          font-size: 0.9rem;
          color: var(--color-muted);
          max-width: 320px;
        }

        /* Order list */
        .orders-list { display: flex; flex-direction: column; gap: 1rem; }

        /* Order card */
        .order-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: box-shadow var(--transition), border-color var(--transition);
        }
        .order-card:hover {
          border-color: #c8c7c0;
          box-shadow: var(--shadow-sm);
        }

        .order-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--color-border);
          background: var(--color-bg);
        }

        .order-meta { display: flex; align-items: center; gap: 1rem; }

        .order-id {
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--color-fg);
        }

        .order-date {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.8rem;
          color: var(--color-muted);
        }

        /* Status badge */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.3rem 0.7rem;
          border-radius: 99px;
        }
        .status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* Items */
        .order-items {
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          border-bottom: 1px solid var(--color-border);
        }
        .order-item {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 1rem;
        }
        .order-item-name {
          font-size: 0.875rem;
          color: #444440;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .order-item-qty {
          font-size: 0.775rem;
          color: var(--color-muted);
          background: var(--color-bg);
          padding: 0.1rem 0.4rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
        }
        .order-item-price {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-fg);
          white-space: nowrap;
        }

        /* Footer */
        .order-card-footer {
          padding: 1rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .order-shipping { display: flex; flex-direction: column; gap: 0.2rem; }
        .order-shipping-label {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-muted);
        }
        .order-shipping-addr {
          font-size: 0.825rem;
          color: #444440;
          max-width: 300px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .order-total {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.15rem;
        }
        .order-total-label {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-muted);
        }
        .order-total-amount {
          font-size: 1.35rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--color-fg);
        }
      `}</style>
    </div>
  );
};

export default Orders;