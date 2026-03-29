import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

const StarRating = ({ rating }) => {
  const r = parseFloat(rating) || 0;
  return (
    <span className="star-rating">
      {r.toFixed(1)} <span className="star">★</span>
    </span>
  );
};

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/auth'); return; }
    const success = await addToCart(product);
    if (success) toast.success('Added to cart!');
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/auth'); return; }
    await toggleWishlist(product.id);
  };

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-link">
        {/* Wishlist button */}
        <button className="wishlist-btn" onClick={handleWishlist} title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
          <span style={{ color: inWishlist ? '#ff6161' : '#ccc', fontSize: 18 }}>
            {inWishlist ? '❤️' : '🤍'}
          </span>
        </button>

        {/* Product Image */}
        <div className="product-image-wrap">
          <img
            src={product.image_url || 'https://via.placeholder.com/200'}
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
          {discount > 0 && <span className="discount-badge">{discount}% off</span>}
          {product.stock === 0 && <div className="out-of-stock-overlay">Out of Stock</div>}
        </div>

        {/* Product Info */}
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>

          {product.rating && (
            <div className="product-rating">
              <StarRating rating={product.rating} />
              <span className="rating-count">({(product.rating_count || 0).toLocaleString()})</span>
            </div>
          )}

          <div className="product-pricing">
            <span className="product-price">₹{product.price?.toLocaleString()}</span>
            {product.original_price && (
              <span className="product-original">₹{product.original_price?.toLocaleString()}</span>
            )}
            {discount > 0 && (
              <span className="product-discount">{discount}% off</span>
            )}
          </div>

          {product.free_delivery && (
            <div className="product-delivery">
              <span className="delivery-tag">Free delivery</span>
            </div>
          )}
        </div>
      </Link>

      <button
        className="add-to-cart-btn"
        onClick={handleAddToCart}
        disabled={product.stock === 0}
      >
        {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
      </button>
    </div>
  );
};

export default ProductCard;
