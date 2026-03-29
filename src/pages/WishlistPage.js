import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard/ProductCard';
import './WishlistPage.css';

const WishlistPage = () => {
  const { wishlistItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return (
    <div className="wishlist-empty">
      <div style={{fontSize:72}}>🤍</div>
      <h2>Please login to see your wishlist</h2>
      <button onClick={() => navigate('/auth')} className="wishlist-login-btn">Login</button>
    </div>
  );

  if (wishlistItems.length === 0) return (
    <div className="wishlist-empty">
      <div style={{fontSize:72}}>🤍</div>
      <h2>Your wishlist is empty</h2>
      <p>Save items you want to buy later</p>
      <Link to="/" className="wishlist-login-btn">Shop Now</Link>
    </div>
  );

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <h1 className="wishlist-title">My Wishlist ({wishlistItems.length})</h1>
        <div className="wishlist-grid">
          {wishlistItems.map(item => (
            item.products && <ProductCard key={item.id} product={item.products} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
