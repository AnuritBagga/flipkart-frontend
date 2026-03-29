// OrderConfirmationPage.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import './OrderConfirmationPage.css';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
      setOrder(data);
    };
    fetch();
  }, [orderId]);

  return (
    <div className="confirm-page">
      <div className="confirm-card">
        <div className="confirm-icon">🎉</div>
        <h1 className="confirm-title">Order Placed Successfully!</h1>
        <p className="confirm-subtitle">Your order has been placed and will be delivered soon.</p>

        {order && (
          <div className="confirm-details">
            <div className="confirm-row">
              <span>Order ID:</span>
              <strong>{order.id}</strong>
            </div>
            <div className="confirm-row">
              <span>Amount Paid:</span>
              <strong>₹{order.total?.toLocaleString()}</strong>
            </div>
            <div className="confirm-row">
              <span>Payment:</span>
              <strong style={{textTransform:'uppercase'}}>{order.payment_method}</strong>
            </div>
            <div className="confirm-row">
              <span>Estimated Delivery:</span>
              <strong>3–5 Business Days</strong>
            </div>
          </div>
        )}

        <div className="confirm-actions">
          <Link to="/orders" className="confirm-btn-primary">View My Orders</Link>
          <Link to="/" className="confirm-btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
