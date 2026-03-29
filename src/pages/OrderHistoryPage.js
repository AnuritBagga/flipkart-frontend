import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import './OrderHistoryPage.css';

const STATUS_COLORS = {
  confirmed: '#2874f0',
  processing: '#ff9800',
  shipped: '#9c27b0',
  delivered: '#388e3c',
  cancelled: '#c62828',
};

const STATUS_STEPS = ['confirmed', 'processing', 'shipped', 'delivered'];

const OrderHistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetch();
  }, [user, navigate]);

  if (loading) return <div className="orders-loading">Loading orders...</div>;

  if (orders.length === 0) return (
    <div className="orders-empty">
      <div style={{ fontSize: 72 }}>📦</div>
      <h2>No orders yet</h2>
      <p>You have not placed any orders yet.</p>
      <Link to="/" className="shop-btn">Shop Now</Link>
    </div>
  );

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h1 className="orders-title">My Orders</h1>
        {orders.map(order => {
          const stepIndex = STATUS_STEPS.indexOf(order.status);
          return (
            <div key={order.id} className="order-card">
              <div className="order-header" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div className="order-meta">
                  <div className="order-id">Order #{order.id.slice(0, 8).toUpperCase()}</div>
                  <div className="order-date">{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div className="order-status-wrap">
                  <span className="order-status" style={{ color: STATUS_COLORS[order.status] || '#212121' }}>
                    ● {order.status?.toUpperCase()}
                  </span>
                  <span className="order-total">₹{order.total?.toLocaleString()}</span>
                </div>
                <span className="order-toggle">{expanded === order.id ? '▲' : '▼'}</span>
              </div>

              {/* Thumbnails */}
              <div className="order-items-preview">
                {(order.items || []).slice(0, 4).map((item, i) => (
                  <img key={i} src={item.image} alt={item.name} className="order-item-thumb" />
                ))}
                {(order.items || []).length > 4 && (
                  <span className="order-more">+{order.items.length - 4}</span>
                )}
              </div>

              {/* Expanded Details */}
              {expanded === order.id && (
                <div className="order-expanded">
                  {/* Status Timeline */}
                  {order.status !== 'cancelled' && (
                    <div className="order-timeline">
                      {STATUS_STEPS.map((s, i) => (
                        <div key={s} className={`timeline-step ${i <= stepIndex ? 'done' : ''}`}>
                          <div className="timeline-dot" />
                          <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                          {i < STATUS_STEPS.length - 1 && <div className="timeline-line" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Items */}
                  <div className="order-items-list">
                    {(order.items || []).map((item, i) => (
                      <div key={i} className="order-item-row">
                        <img src={item.image} alt={item.name} className="order-item-img" />
                        <div className="order-item-info">
                          <div className="order-item-name">{item.name}</div>
                          <div className="order-item-qty">Qty: {item.quantity}</div>
                        </div>
                        <div className="order-item-price">₹{(item.price * item.quantity)?.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>

                  {/* Address */}
                  {order.address && (
                    <div className="order-address">
                      <strong>Delivered to:</strong><br />
                      {order.address.name} · {order.address.phone}<br />
                      {order.address.house}, {order.address.area}, {order.address.city} - {order.address.pincode}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
