import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartDiscount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="cart-empty-auth">
        <div className="cart-auth-icon">🛒</div>
        <h2>Your cart is empty!</h2>
        <p>Please login to see your cart items</p>
        <button onClick={() => navigate('/auth')} className="cart-login-btn">Login</button>
        <Link to="/" className="cart-shop-link">Continue Shopping</Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-auth">
        <div className="cart-auth-icon">🛒</div>
        <h2>Your cart is empty!</h2>
        <p>Add items to it now.</p>
        <Link to="/" className="cart-login-btn">Shop now</Link>
      </div>
    );
  }

  const deliveryCharges = cartTotal > 499 ? 0 : 40;
  const finalTotal = cartTotal + deliveryCharges;

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Cart Items */}
        <div className="cart-items-section">
          <div className="cart-header">
            <h1>My Cart ({cartItems.length})</h1>
          </div>

          {cartItems.map(item => {
            const product = item.products;
            if (!product) return null;
            const discount = product.original_price
              ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
              : 0;

            return (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <Link to={`/product/${product.id}`}>
                    <img src={product.image_url} alt={product.name} />
                  </Link>
                </div>

                <div className="cart-item-info">
                  <Link to={`/product/${product.id}`} className="cart-item-name">
                    {product.name}
                  </Link>
                  <div className="cart-item-category">{product.category}</div>

                  <div className="cart-item-pricing">
                    <span className="cart-item-price">₹{(product.price * item.quantity).toLocaleString()}</span>
                    {product.original_price && (
                      <span className="cart-item-original">₹{(product.original_price * item.quantity).toLocaleString()}</span>
                    )}
                    {discount > 0 && (
                      <span className="cart-item-discount">{discount}% off</span>
                    )}
                  </div>

                  {product.free_delivery && (
                    <div className="cart-item-delivery">🚚 Free Delivery</div>
                  )}

                  <div className="cart-item-actions">
                    {/* Quantity */}
                    <div className="cart-quantity">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="cart-remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      REMOVE
                    </button>

                    <Link to={`/product/${product.id}`} className="cart-save-btn">
                      SAVE FOR LATER
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Place Order Bottom Bar */}
          <div className="cart-bottom-bar">
            <button className="place-order-btn" onClick={() => navigate('/checkout')}>
              PLACE ORDER
            </button>
          </div>
        </div>

        {/* Price Details */}
        <div className="cart-summary">
          <div className="summary-header">PRICE DETAILS</div>

          <div className="summary-row">
            <span>Price ({cartItems.length} items)</span>
            <span>₹{(cartTotal + cartDiscount).toLocaleString()}</span>
          </div>

          {cartDiscount > 0 && (
            <div className="summary-row discount">
              <span>Discount</span>
              <span>− ₹{cartDiscount.toLocaleString()}</span>
            </div>
          )}

          <div className="summary-row">
            <span>Delivery Charges</span>
            <span className={deliveryCharges === 0 ? 'free' : ''}>
              {deliveryCharges === 0 ? '🎉 Free' : `₹${deliveryCharges}`}
            </span>
          </div>

          <div className="summary-divider" />

          <div className="summary-row total">
            <span>Total Amount</span>
            <span>₹{finalTotal.toLocaleString()}</span>
          </div>

          <div className="summary-divider" />

          {cartDiscount > 0 && (
            <div className="summary-savings">
              You will save <strong>₹{cartDiscount.toLocaleString()}</strong> on this order
            </div>
          )}

          <button className="checkout-btn" onClick={() => navigate('/checkout')}>
            PLACE ORDER
          </button>

          <div className="safe-tag">
            🔒 Safe and Secure Payments. Easy returns. 100% Authentic products.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
