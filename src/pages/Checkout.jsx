// src/pages/Checkout.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';

const formatPrice = (price) => {
  const num = parseFloat(price);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const Checkout = () => {
  const { cart, getTotal, clearCart } = useCart();
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [formData, setFormData] = useState({
    customerName:    user?.fullName || '',
    customerEmail:   user?.email   || '',
    shippingAddress: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderData = {
        items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
        shippingAddress: formData.shippingAddress,
        customerEmail:   formData.customerEmail,
        customerName:    formData.customerName,
        userId:          user?.id,
      };
      await api.post('/api/orders', orderData);
      setSuccess(true);
      clearCart();
      setTimeout(() => navigate(user ? '/orders' : '/'), 3000);
    } catch (error) {
      alert('Error placing order: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !success) { navigate('/cart'); return null; }

  if (success) return (
    <div style={{minHeight:'60vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'.75rem',padding:'3rem',textAlign:'center'}}>
      <div style={{width:68,height:68,borderRadius:'50%',background:'#f0fdf4',color:'#16a34a',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'.5rem'}}>
        <CheckCircle size={32} />
      </div>
      <h2 style={{fontSize:'1.5rem',fontWeight:700,letterSpacing:'-.025em',color:'var(--color-fg)'}}>Order confirmed</h2>
      <p style={{fontSize:'.9rem',color:'var(--color-muted)',maxWidth:360}}>Thanks for your purchase. A confirmation email is on its way.</p>
      <p style={{fontSize:'.8rem',color:'var(--color-border)',marginTop:'.5rem'}}>Redirecting…</p>
    </div>
  );

  return (
    <div className="checkout-page">
      <div className="checkout-inner">
        <h1 className="checkout-title">Checkout</h1>
        <div className="checkout-layout">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
              <h2 className="form-section-title">Customer information</h2>
              <div className="field">
                <label className="field-label">Full name</label>
                <input className="field-input" type="text" name="customerName" value={formData.customerName} onChange={handleChange} required placeholder="Jane Smith" />
              </div>
              <div className="field">
                <label className="field-label">Email</label>
                <input className="field-input" type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} required placeholder="you@example.com" />
              </div>
              <div className="field">
                <label className="field-label">Shipping address</label>
                <textarea className="field-input field-textarea" name="shippingAddress" value={formData.shippingAddress} onChange={handleChange} required rows="3" placeholder="Street, City, State, ZIP, Country" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-place-order">
              {loading ? <><span className="btn-spinner" /> Processing…</> : 'Place order'}
            </button>
          </form>
          <div className="checkout-summary">
            <div className="summary-card">
              <h2 className="summary-title">Order summary</h2>
              <div className="summary-items">
                {cart.map((item) => (
                  <div key={item.id} className="summary-item">
                    <span className="summary-item-name">{item.name} <span className="summary-item-qty">×{item.quantity}</span></span>
                    <span className="summary-item-price">${formatPrice(parseFloat(item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="summary-divider" />
              <div className="summary-rows">
                <div className="summary-row"><span>Subtotal</span><span>${formatPrice(getTotal())}</span></div>
                <div className="summary-row"><span>Shipping</span><span className="summary-free">Free</span></div>
              </div>
              <div className="summary-divider" />
              <div className="summary-total"><span>Total</span><span>${formatPrice(getTotal())}</span></div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .checkout-page{background:var(--color-bg);padding-block:clamp(2rem,5vw,3.5rem);min-height:60vh}
        .checkout-inner{max-width:1060px;margin-inline:auto;padding-inline:clamp(1rem,5vw,2.5rem)}
        .checkout-title{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:700;letter-spacing:-.03em;color:var(--color-fg);margin-bottom:2rem}
        .checkout-layout{display:grid;grid-template-columns:1fr 320px;gap:2rem;align-items:start}
        @media(max-width:768px){.checkout-layout{grid-template-columns:1fr}}
        .checkout-form{display:flex;flex-direction:column;gap:1.5rem}
        .form-section{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:1.5rem;display:flex;flex-direction:column;gap:1.1rem}
        .form-section-title{font-size:.95rem;font-weight:700;letter-spacing:-.01em;color:var(--color-fg);margin-bottom:.25rem}
        .field{display:flex;flex-direction:column;gap:.4rem}
        .field-label{font-size:.8rem;font-weight:600;letter-spacing:.02em;color:var(--color-fg)}
        .field-input{font-family:var(--font-sans);font-size:.9rem;color:var(--color-fg);background:var(--color-bg);border:1.5px solid var(--color-border);border-radius:var(--radius-sm);padding:.7rem .9rem;outline:none;width:100%;transition:border-color var(--transition),box-shadow var(--transition);resize:vertical}
        .field-input::placeholder{color:var(--color-muted)}
        .field-input:focus{border-color:var(--color-fg);box-shadow:0 0 0 3px rgba(17,17,16,.08)}
        .field-textarea{min-height:90px}
        .btn-place-order{font-family:var(--font-sans);font-size:.9rem;font-weight:600;display:flex;align-items:center;justify-content:center;gap:.5rem;background:var(--color-fg);color:#fafaf9;border:none;border-radius:var(--radius-sm);padding:.9rem;cursor:pointer;transition:background var(--transition),transform 80ms;width:100%}
        .btn-place-order:hover{background:var(--color-accent-hover)}
        .btn-place-order:disabled{background:var(--color-border);color:var(--color-muted);cursor:not-allowed}
        .btn-spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin 600ms linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .checkout-summary{position:sticky;top:80px}
        .summary-card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:1.5rem}
        .summary-title{font-size:.95rem;font-weight:700;letter-spacing:-.01em;color:var(--color-fg);margin-bottom:1.25rem}
        .summary-items{display:flex;flex-direction:column;gap:.6rem}
        .summary-item{display:flex;justify-content:space-between;align-items:baseline;gap:.75rem}
        .summary-item-name{font-size:.825rem;color:#444440;display:flex;align-items:center;gap:.4rem}
        .summary-item-qty{font-size:.75rem;color:var(--color-muted);background:var(--color-bg);padding:.1rem .35rem;border-radius:3px;border:1px solid var(--color-border)}
        .summary-item-price{font-size:.825rem;font-weight:600;color:var(--color-fg);white-space:nowrap}
        .summary-divider{height:1px;background:var(--color-border);margin-block:1rem}
        .summary-rows{display:flex;flex-direction:column;gap:.5rem}
        .summary-row{display:flex;justify-content:space-between;font-size:.85rem;color:var(--color-muted)}
        .summary-row span:last-child{font-weight:500;color:var(--color-fg)}
        .summary-free{color:#166534!important;font-weight:600!important}
        .summary-total{display:flex;justify-content:space-between;align-items:baseline}
        .summary-total span:first-child{font-size:.875rem;font-weight:600;color:var(--color-fg)}
        .summary-total span:last-child{font-size:1.35rem;font-weight:700;letter-spacing:-.02em;color:var(--color-fg)}
      `}</style>
    </div>
  );
};

export default Checkout;