import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../utils/supabaseClient';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard/ProductCard';
import './ProductDetailPage.css';

const StarRating = ({ rating, count }) => (
  <div className="detail-rating">
    <span className="detail-rating-badge">
      {parseFloat(rating).toFixed(1)} ★
    </span>
    {count && <span className="detail-rating-count">{parseInt(count).toLocaleString()} Ratings & Reviews</span>}
  </div>
);

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      if (data) {
        setProduct(data);
        setSelectedImg(0);
        // Fetch related
        const { data: rel } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .neq('id', id)
          .limit(6);
        setRelated(rel || []);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const images = product
    ? [product.image_url, ...(product.extra_images || [])].filter(Boolean)
    : [];

  const discount = product?.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (!user) { navigate('/auth'); return; }
    setAddingToCart(true);
    const success = await addToCart(product, quantity);
    if (success) toast.success('Added to cart!');
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    if (!user) { navigate('/auth'); return; }
    await addToCart(product, quantity);
    navigate('/cart');
  };

  const checkDelivery = async () => {
    if (!pincode || pincode.length !== 6) { toast.error('Enter valid 6-digit pincode'); return; }
    setDeliveryInfo({
      available: true,
      date: 'Tomorrow',
      freeDelivery: product.price > 499
    });
  };

  const specs = product?.specifications
    ? (typeof product.specifications === 'string'
        ? JSON.parse(product.specifications)
        : product.specifications)
    : {};

  if (loading) return (
    <div className="detail-loading">
      <div className="detail-skeleton-left" />
      <div className="detail-skeleton-right" />
    </div>
  );

  if (!product) return (
    <div className="detail-not-found">
      <h2>Product not found</h2>
      <button onClick={() => navigate('/')}>Go Home</button>
    </div>
  );

  return (
    <div className="detail-page">
      <div className="detail-container">
        {/* Left: Images */}
        <div className="detail-images">
          <div className="detail-thumbnails">
            {images.map((img, i) => (
              <button
                key={i}
                className={`thumbnail-btn ${selectedImg === i ? 'active' : ''}`}
                onClick={() => setSelectedImg(i)}
              >
                <img src={img} alt={`View ${i + 1}`} />
              </button>
            ))}
          </div>
          <div className="detail-main-image">
            <img
              src={images[selectedImg] || product.image_url}
              alt={product.name}
            />
            <button
              className="detail-wishlist-btn"
              onClick={() => toggleWishlist(product.id)}
            >
              {isInWishlist(product.id) ? '❤️ Wishlisted' : '🤍 Wishlist'}
            </button>
          </div>
          {/* Action Buttons */}
          <div className="detail-actions-mobile">
            <button
              className="btn-add-cart"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
            >
              🛒 {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              className="btn-buy-now"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              ⚡ Buy Now
            </button>
          </div>
        </div>

        {/* Right: Info */}
        <div className="detail-info">
          <div className="detail-category-tag">{product.category}</div>
          <h1 className="detail-name">{product.name}</h1>

          {product.rating && (
            <StarRating rating={product.rating} count={product.rating_count} />
          )}

          <div className="detail-pricing">
            <span className="detail-price">₹{product.price?.toLocaleString()}</span>
            {product.original_price && (
              <>
                <span className="detail-original">₹{product.original_price?.toLocaleString()}</span>
                <span className="detail-discount">{discount}% off</span>
              </>
            )}
          </div>

          {product.free_delivery && (
            <div className="detail-badge-row">
              <span className="detail-badge green">✓ Free Delivery</span>
              {product.stock > 0 && product.stock < 10 && (
                <span className="detail-badge red">Only {product.stock} left!</span>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="detail-quantity">
            <span className="detail-label">Quantity:</span>
            <div className="quantity-selector">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock || 10, q + 1))}>+</button>
            </div>
          </div>

          {/* Action Buttons Desktop */}
          <div className="detail-actions-desktop">
            <button
              className="btn-add-cart"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
            >
              🛒 {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              className="btn-buy-now"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              ⚡ Buy Now
            </button>
          </div>

          {/* Stock */}
          {product.stock === 0 && (
            <div className="out-of-stock-notice">⚠ Currently out of stock</div>
          )}

          {/* Delivery Check */}
          <div className="delivery-check">
            <div className="detail-label">Delivery</div>
            <div className="delivery-input-row">
              <input
                type="text"
                placeholder="Enter Delivery Pincode"
                value={pincode}
                onChange={e => setPincode(e.target.value.replace(/\D/g,'').slice(0,6))}
                className="pincode-input"
                maxLength={6}
              />
              <button onClick={checkDelivery} className="check-btn">Check</button>
            </div>
            {deliveryInfo && (
              <div className="delivery-result">
                {deliveryInfo.available ? (
                  <span className="delivery-available">
                    ✓ Delivery by <strong>{deliveryInfo.date}</strong>
                    {deliveryInfo.freeDelivery ? ' | Free' : ''}
                  </span>
                ) : (
                  <span className="delivery-unavailable">✗ Not available</span>
                )}
              </div>
            )}
          </div>

          {/* Highlights */}
          {product.highlights && (
            <div className="detail-highlights">
              <div className="detail-label">Highlights</div>
              <ul className="highlights-list">
                {(Array.isArray(product.highlights)
                  ? product.highlights
                  : product.highlights.split('\n')
                ).map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>
          )}

          {/* Seller */}
          <div className="seller-info">
            <span className="detail-label">Seller:</span>
            <span className="seller-name">RetailNet</span>
            <span className="seller-tag">4.6 ★ Flipkart Assured</span>
          </div>
        </div>
      </div>

      {/* Tabs: Description / Specs / Reviews */}
      <div className="detail-tabs-container">
        <div className="detail-tabs">
          {['description', 'specifications', 'reviews'].map(tab => (
            <button
              key={tab}
              className={`detail-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="detail-tab-content">
          {activeTab === 'description' && (
            <div className="tab-description">
              <p>{product.description || 'No description available for this product.'}</p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="tab-specs">
              {Object.keys(specs).length > 0 ? (
                <table className="specs-table">
                  <tbody>
                    {Object.entries(specs).map(([key, val]) => (
                      <tr key={key}>
                        <td className="spec-key">{key}</td>
                        <td className="spec-val">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{color:'#878787'}}>No specifications available.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="tab-reviews">
              {product.rating ? (
                <div className="reviews-summary">
                  <div className="reviews-score">
                    <span className="big-score">{parseFloat(product.rating).toFixed(1)}</span>
                    <span className="big-star">★</span>
                    <p>{parseInt(product.rating_count || 0).toLocaleString()} ratings</p>
                  </div>
                  <div className="rating-bars">
                    {[5,4,3,2,1].map(n => (
                      <div key={n} className="rating-bar-row">
                        <span>{n}★</span>
                        <div className="rating-bar-bg">
                          <div
                            className="rating-bar-fill"
                            style={{ width: `${Math.max(5, (6-n)*15 + Math.random()*20)}%`, background: n >= 4 ? '#388e3c' : n === 3 ? '#ff9800' : '#f44336' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{color:'#878787'}}>No reviews yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="related-section">
          <h2 className="related-title">Similar Products</h2>
          <div className="related-grid">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
