import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import {
  DollarSign, Package, ShoppingBag, Users,
  Plus, Edit, Trash2, X, TrendingUp, Clock,
} from 'lucide-react';

const formatPrice = (price) => {
  const num = parseFloat(price);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    bg: '#fef9ec', color: '#92680a' },
  processing: { label: 'Processing', bg: '#eff6ff', color: '#1e4fa8' },
  shipped:    { label: 'Shipped',    bg: '#f5f0ff', color: '#5b21b6' },
  delivered:  { label: 'Delivered',  bg: '#f0fdf4', color: '#166534' },
  cancelled:  { label: 'Cancelled',  bg: '#fff1f1', color: '#991b1b' },
};

const STATS_CONFIG = [
  { key: 'total_revenue',  label: 'Revenue',  Icon: DollarSign,  prefix: '$' },
  { key: 'total_orders',   label: 'Orders',   Icon: ShoppingBag, prefix: ''  },
  { key: 'total_products', label: 'Products', Icon: Package,     prefix: ''  },
  { key: 'total_users',    label: 'Users',    Icon: Users,       prefix: ''  },
];

const EMPTY_FORM = {
  name: '', description: '', price: '', category: '',
  stock: '', imageUrl: '', featured: false,
};

const AdminDashboard = () => {
  const [stats, setStats]               = useState(null);
  const [products, setProducts]         = useState([]);
  const [orders, setOrders]             = useState([]);
  const [activeTab, setActiveTab]       = useState('overview');
  const [showModal, setShowModal]       = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [sR, pR, oR] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/products'),
        api.get('/api/admin/orders'),
      ]);
      setStats(sR.data);
      setProducts(pR.data);
      setOrders(oR.data);
    } catch (e) { console.error(e); }
  };

  const openCreate = () => { setEditingProduct(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit   = (p) => {
    setEditingProduct(p);
    setForm({ name: p.name, description: p.description, price: p.price,
              category: p.category, stock: p.stock, imageUrl: p.image_url, featured: p.featured });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingProduct(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
      if (editingProduct) await api.put(`/api/products/${editingProduct.id}`, payload);
      else                await api.post('/api/products', payload);
      closeModal();
      fetchData();
    } catch (err) { alert('Error: ' + err.response?.data?.error); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await api.delete(`/api/products/${id}`); fetchData(); }
    catch (err) { alert('Error: ' + err.response?.data?.error); }
  };

  const handleStatus = async (id, status) => {
    try { await api.patch(`/api/orders/${id}/status`, { status }); fetchData(); }
    catch (err) { alert('Error: ' + err.response?.data?.error); }
  };

  const tabs = ['overview', 'products', 'orders'];

  return (
    <div className="admin-page">
      {/* Page header */}
      <div className="admin-header">
        <h1 className="admin-title">Dashboard</h1>
        <p className="admin-sub">Manage your store</p>
      </div>

      {/* ── Stats grid ────────────────────────────── */}
      {stats && (
        <div className="stats-grid">
          {STATS_CONFIG.map(({ key, label, Icon, prefix }) => (
            <div key={key} className="stat-card">
              <div className="stat-icon"><Icon className="w-4 h-4" /></div>
              <p className="stat-label">{label}</p>
              <p className="stat-value">
                {prefix}{key === 'total_revenue'
                  ? formatPrice(stats[key] || 0)
                  : (stats[key] ?? '—')}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs ──────────────────────────────────── */}
      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`tab ${activeTab === t ? 'tab--active' : ''}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Overview ──────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="overview-grid">
          <div className="overview-card">
            <div className="overview-card-head">
              <h2 className="overview-card-title">Recent orders</h2>
              <button className="tab-ghost" onClick={() => setActiveTab('orders')}>View all</button>
            </div>
            <div className="overview-list">
              {orders.slice(0, 5).map((o) => {
                const cfg = STATUS_CONFIG[o.status] || {};
                return (
                  <div key={o.id} className="overview-row">
                    <div>
                      <p className="overview-row-title">#{String(o.id).padStart(5,'0')} · {o.customer_name}</p>
                      <p className="overview-row-sub">{new Date(o.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="overview-row-right">
                      <span className="overview-badge" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label || o.status}
                      </span>
                      <span className="overview-row-amount">${formatPrice(o.total_amount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-card-head">
              <h2 className="overview-card-title">Products</h2>
              <button className="tab-ghost" onClick={() => setActiveTab('products')}>Manage</button>
            </div>
            <div className="overview-list">
              {products.slice(0, 5).map((p) => (
                <div key={p.id} className="overview-row">
                  <div className="overview-product-row">
                    <div className="overview-product-img-wrap">
                      <img src={p.image_url} alt={p.name} className="overview-product-img" />
                    </div>
                    <div>
                      <p className="overview-row-title">{p.name}</p>
                      <p className="overview-row-sub">{p.category}</p>
                    </div>
                  </div>
                  <div className="overview-row-right">
                    <span className="overview-row-amount">${formatPrice(p.price)}</span>
                    <span className={`overview-stock ${p.stock < 5 ? 'overview-stock--low' : ''}`}>
                      {p.stock} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Products tab ──────────────────────────── */}
      {activeTab === 'products' && (
        <div className="tab-content">
          <div className="tab-content-head">
            <div>
              <h2 className="tab-content-title">Products</h2>
              <p className="tab-content-sub">{products.length} total</p>
            </div>
            <button onClick={openCreate} className="btn-create">
              <Plus className="w-4 h-4" />
              Add product
            </button>
          </div>

          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Featured</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="table-product-cell">
                        <div className="table-product-img-wrap">
                          <img src={p.image_url} alt={p.name} className="table-product-img" />
                        </div>
                        <span className="table-product-name">{p.name}</span>
                      </div>
                    </td>
                    <td><span className="table-category">{p.category}</span></td>
                    <td className="table-price">${formatPrice(p.price)}</td>
                    <td>
                      <span className={`table-stock ${p.stock < 5 ? 'table-stock--low' : ''}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`table-featured ${p.featured ? 'table-featured--yes' : ''}`}>
                        {p.featured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button onClick={() => openEdit(p)}        className="table-action-btn" title="Edit"><Edit   className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(p.id)} className="table-action-btn table-action-btn--danger" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Orders tab ────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className="tab-content">
          <div className="tab-content-head">
            <div>
              <h2 className="tab-content-title">Orders</h2>
              <p className="tab-content-sub">{orders.length} total</p>
            </div>
          </div>

          <div className="orders-list">
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] || {};
              return (
                <div key={order.id} className="admin-order-card">
                  <div className="admin-order-head">
                    <div className="admin-order-meta">
                      <span className="admin-order-id">#{String(order.id).padStart(5,'0')}</span>
                      <span className="admin-order-date">
                        <Clock className="w-3 h-3" />
                        {new Date(order.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="admin-order-head-right">
                      <span className="admin-order-amount">${formatPrice(order.total_amount)}</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatus(order.id, e.target.value)}
                        className="status-select"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {Object.entries(STATUS_CONFIG).map(([val, { label }]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="admin-order-customer">
                    <p className="admin-order-name">{order.customer_name}</p>
                    <p className="admin-order-email">{order.customer_email}</p>
                  </div>

                  <div className="admin-order-items">
                    {order.items?.map((item, i) => (
                      <div key={i} className="admin-order-item">
                        <span>{item.name} <span className="admin-order-qty">×{item.quantity}</span></span>
                        <span>${formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="admin-order-addr">
                    <span className="admin-order-addr-label">Ship to</span>
                    {order.shipping_address}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Product modal ─────────────────────────── */}
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingProduct ? 'Edit product' : 'New product'}</h2>
              <button onClick={closeModal} className="modal-close"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="field">
                <label className="field-label">Name</label>
                <input className="field-input" type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>

              <div className="field">
                <label className="field-label">Description</label>
                <textarea className="field-input field-textarea" rows="3" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="field-row">
                <div className="field">
                  <label className="field-label">Price ($)</label>
                  <input className="field-input" type="number" step="0.01" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="field">
                  <label className="field-label">Stock</label>
                  <input className="field-input" type="number" value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
                </div>
              </div>

              <div className="field">
                <label className="field-label">Category</label>
                <input className="field-input" type="text" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })} required />
              </div>

              <div className="field">
                <label className="field-label">Image URL</label>
                <input className="field-input" type="url" value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              </div>

              <label className="field-checkbox">
                <input type="checkbox" checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                <span>Featured product</span>
              </label>

              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-submit">
                  {editingProduct ? 'Save changes' : 'Create product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        /* ── Page ───────────────────────────────── */
        .admin-page {
          max-width: 1280px;
          margin-inline: auto;
          padding: clamp(2rem, 5vw, 3.5rem) clamp(1rem, 5vw, 2.5rem);
          min-height: 60vh;
        }
        .admin-header { margin-bottom: 2rem; }
        .admin-title {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--color-fg);
        }
        .admin-sub { font-size: 0.875rem; color: var(--color-muted); margin-top: 0.2rem; }

        /* ── Stats ──────────────────────────────── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        @media (max-width: 820px)  { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px)  { .stats-grid { grid-template-columns: 1fr 1fr; } }

        .stat-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          transition: box-shadow var(--transition);
        }
        .stat-card:hover { box-shadow: var(--shadow-sm); }
        .stat-icon {
          width: 32px; height: 32px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-muted);
          margin-bottom: 0.875rem;
        }
        .stat-label {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-muted);
          margin-bottom: 0.3rem;
        }
        .stat-value {
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--color-fg);
        }

        /* ── Tabs ───────────────────────────────── */
        .tabs {
          display: flex;
          gap: 0.25rem;
          border-bottom: 1px solid var(--color-border);
          margin-bottom: 1.75rem;
        }
        .tab {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-muted);
          background: none;
          border: none;
          padding: 0.65rem 1rem;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: color var(--transition), border-color var(--transition);
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
        }
        .tab:hover { color: var(--color-fg); }
        .tab--active { color: var(--color-fg); border-bottom-color: var(--color-fg); font-weight: 600; }
        .tab-ghost {
          font-family: var(--font-sans);
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--color-muted);
          background: none;
          border: none;
          cursor: pointer;
          transition: color var(--transition);
        }
        .tab-ghost:hover { color: var(--color-fg); }

        /* ── Overview grid ──────────────────────── */
        .overview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        @media (max-width: 700px) { .overview-grid { grid-template-columns: 1fr; } }
        .overview-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .overview-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--color-border);
          background: var(--color-bg);
        }
        .overview-card-title { font-size: 0.875rem; font-weight: 700; color: var(--color-fg); }
        .overview-list { display: flex; flex-direction: column; }
        .overview-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid var(--color-border);
          transition: background var(--transition);
        }
        .overview-row:last-child { border-bottom: none; }
        .overview-row:hover { background: var(--color-bg); }
        .overview-row-title { font-size: 0.85rem; font-weight: 600; color: var(--color-fg); }
        .overview-row-sub { font-size: 0.775rem; color: var(--color-muted); margin-top: 0.1rem; }
        .overview-row-right { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
        .overview-badge {
          font-size: 0.72rem; font-weight: 600;
          padding: 0.2rem 0.55rem; border-radius: 99px;
        }
        .overview-row-amount { font-size: 0.875rem; font-weight: 700; color: var(--color-fg); }
        .overview-product-row { display: flex; align-items: center; gap: 0.75rem; }
        .overview-product-img-wrap {
          width: 36px; height: 36px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          flex-shrink: 0;
        }
        .overview-product-img { width: 100%; height: 100%; object-fit: cover; }
        .overview-stock { font-size: 0.75rem; color: var(--color-muted); }
        .overview-stock--low { color: #dc2626; font-weight: 600; }

        /* ── Tab content ─────────────────────────── */
        .tab-content {}
        .tab-content-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .tab-content-title { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.02em; color: var(--color-fg); }
        .tab-content-sub { font-size: 0.8rem; color: var(--color-muted); margin-top: 0.15rem; }
        .btn-create {
          font-family: var(--font-sans);
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.85rem; font-weight: 600;
          background: var(--color-fg); color: #fafaf9;
          border: none; border-radius: var(--radius-sm);
          padding: 0.6rem 1.1rem;
          cursor: pointer;
          transition: background var(--transition), transform 80ms;
        }
        .btn-create:hover { background: var(--color-accent-hover); }
        .btn-create:active { transform: scale(.97); }

        /* ── Table ───────────────────────────────── */
        .table-wrap {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          overflow: hidden;
          overflow-x: auto;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        .admin-table thead tr {
          background: var(--color-bg);
          border-bottom: 1px solid var(--color-border);
        }
        .admin-table th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--color-muted);
          white-space: nowrap;
        }
        .admin-table tbody tr {
          border-bottom: 1px solid var(--color-border);
          background: var(--color-surface);
          transition: background var(--transition);
        }
        .admin-table tbody tr:last-child { border-bottom: none; }
        .admin-table tbody tr:hover { background: var(--color-bg); }
        .admin-table td { padding: 0.75rem 1rem; vertical-align: middle; }

        .table-product-cell { display: flex; align-items: center; gap: 0.75rem; }
        .table-product-img-wrap {
          width: 36px; height: 36px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          flex-shrink: 0;
        }
        .table-product-img { width: 100%; height: 100%; object-fit: cover; }
        .table-product-name { font-weight: 600; color: var(--color-fg); white-space: nowrap; }
        .table-category {
          font-size: 0.75rem; font-weight: 500;
          color: var(--color-muted);
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 99px;
          padding: 0.15rem 0.55rem;
        }
        .table-price { font-weight: 700; color: var(--color-fg); white-space: nowrap; }
        .table-stock { font-weight: 600; color: var(--color-fg); }
        .table-stock--low { color: #dc2626; }
        .table-featured {
          font-size: 0.75rem; font-weight: 600;
          color: var(--color-muted);
          padding: 0.15rem 0.55rem;
          border-radius: 99px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
        }
        .table-featured--yes {
          background: #f0fdf4;
          color: #166534;
          border-color: #bbf7d0;
        }
        .table-actions { display: flex; gap: 0.35rem; }
        .table-action-btn {
          width: 30px; height: 30px;
          display: flex; align-items: center; justify-content: center;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-muted);
          cursor: pointer;
          transition: color var(--transition), background var(--transition), border-color var(--transition);
        }
        .table-action-btn:hover { color: var(--color-fg); border-color: #b0afa9; background: var(--color-bg); }
        .table-action-btn--danger:hover { color: #dc2626; border-color: #fca5a5; background: #fff1f1; }

        /* ── Admin orders ────────────────────────── */
        .orders-list { display: flex; flex-direction: column; gap: 1rem; }
        .admin-order-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: box-shadow var(--transition);
        }
        .admin-order-card:hover { box-shadow: var(--shadow-sm); }
        .admin-order-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.875rem 1.25rem;
          background: var(--color-bg);
          border-bottom: 1px solid var(--color-border);
          gap: 1rem;
          flex-wrap: wrap;
        }
        .admin-order-meta { display: flex; align-items: center; gap: 0.75rem; }
        .admin-order-id { font-size: 0.875rem; font-weight: 700; color: var(--color-fg); }
        .admin-order-date {
          display: flex; align-items: center; gap: 0.3rem;
          font-size: 0.775rem; color: var(--color-muted);
        }
        .admin-order-head-right { display: flex; align-items: center; gap: 0.75rem; }
        .admin-order-amount { font-size: 1rem; font-weight: 700; color: var(--color-fg); }
        .status-select {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 99px;
          border: none;
          padding: 0.3rem 0.75rem;
          cursor: pointer;
          outline: none;
        }
        .admin-order-customer {
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid var(--color-border);
        }
        .admin-order-name { font-size: 0.875rem; font-weight: 600; color: var(--color-fg); }
        .admin-order-email { font-size: 0.8rem; color: var(--color-muted); }
        .admin-order-items {
          padding: 0.75rem 1.25rem;
          display: flex; flex-direction: column; gap: 0.4rem;
          border-bottom: 1px solid var(--color-border);
        }
        .admin-order-item {
          display: flex; justify-content: space-between;
          font-size: 0.825rem; color: #444440;
        }
        .admin-order-item span:last-child { font-weight: 600; color: var(--color-fg); }
        .admin-order-qty {
          font-size: 0.75rem; color: var(--color-muted);
          background: var(--color-bg);
          padding: 0.05rem 0.3rem;
          border-radius: 3px;
          border: 1px solid var(--color-border);
          margin-left: 0.3rem;
        }
        .admin-order-addr {
          padding: 0.75rem 1.25rem;
          font-size: 0.8rem;
          color: #444440;
          display: flex; gap: 0.5rem; align-items: baseline;
        }
        .admin-order-addr-label {
          font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.07em; text-transform: uppercase;
          color: var(--color-muted);
          flex-shrink: 0;
        }

        /* ── Modal ───────────────────────────────── */
        .modal-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,.45);
          backdrop-filter: blur(3px);
          z-index: 200;
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem;
        }
        .modal {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          width: 100%; max-width: 560px;
          max-height: 90dvh;
          overflow-y: auto;
          box-shadow: var(--shadow-md);
        }
        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--color-border);
          position: sticky; top: 0;
          background: var(--color-surface);
          z-index: 1;
        }
        .modal-title { font-size: 1.05rem; font-weight: 700; letter-spacing: -0.015em; color: var(--color-fg); }
        .modal-close {
          width: 30px; height: 30px;
          display: flex; align-items: center; justify-content: center;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
          background: none;
          color: var(--color-muted);
          cursor: pointer;
          transition: color var(--transition), background var(--transition);
        }
        .modal-close:hover { color: var(--color-fg); background: var(--color-bg); }
        .modal-form {
          padding: 1.5rem;
          display: flex; flex-direction: column; gap: 1rem;
        }
        .field { display: flex; flex-direction: column; gap: 0.4rem; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .field-label { font-size: 0.8rem; font-weight: 600; letter-spacing: 0.02em; color: var(--color-fg); }
        .field-input {
          font-family: var(--font-sans); font-size: 0.9rem;
          color: var(--color-fg); background: var(--color-bg);
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 0.65rem 0.875rem;
          outline: none; width: 100%; resize: vertical;
          transition: border-color var(--transition), box-shadow var(--transition);
        }
        .field-input:focus {
          border-color: var(--color-fg);
          box-shadow: 0 0 0 3px rgba(17,17,16,.08);
        }
        .field-textarea { min-height: 80px; }
        .field-checkbox {
          display: flex; align-items: center; gap: 0.6rem;
          font-size: 0.875rem; font-weight: 500; color: var(--color-fg);
          cursor: pointer;
        }
        .field-checkbox input { width: 15px; height: 15px; cursor: pointer; accent-color: var(--color-fg); }
        .modal-footer {
          display: flex; gap: 0.75rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--color-border);
          margin-top: 0.25rem;
        }
        .btn-cancel {
          font-family: var(--font-sans); font-size: 0.875rem; font-weight: 600;
          flex: 1; padding: 0.75rem;
          border: 1.5px solid var(--color-border); border-radius: var(--radius-sm);
          background: none; color: var(--color-fg); cursor: pointer;
          transition: background var(--transition);
        }
        .btn-cancel:hover { background: var(--color-bg); }
        .btn-submit {
          font-family: var(--font-sans); font-size: 0.875rem; font-weight: 600;
          flex: 2; padding: 0.75rem;
          background: var(--color-fg); color: #fafaf9;
          border: none; border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background var(--transition), transform 80ms;
        }
        .btn-submit:hover { background: var(--color-accent-hover); }
        .btn-submit:active { transform: scale(.985); }
      `}</style>
    </div>
  );
};

export default AdminDashboard;