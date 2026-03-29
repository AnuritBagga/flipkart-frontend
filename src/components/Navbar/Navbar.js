import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../utils/supabaseClient';
import './Navbar.css';

const CATEGORIES = [
  { label: 'Electronics', path: '/products/Electronics', icon: '📱' },
  { label: 'TVs & Appliances', path: '/products/TVs', icon: '📺' },
  { label: 'Men', path: '/products/Men', icon: '👔' },
  { label: 'Women', path: '/products/Women', icon: '👗' },
  { label: 'Baby & Kids', path: '/products/Baby', icon: '🧸' },
  { label: 'Home & Furniture', path: '/products/Home', icon: '🛋️' },
  { label: 'Sports', path: '/products/Sports', icon: '⚽' },
  { label: 'Books', path: '/products/Books', icon: '📚' },
  { label: 'Grocery', path: '/products/Grocery', icon: '🛒' },
  { label: 'Beauty', path: '/products/Beauty', icon: '💄' },
];

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const { data } = await supabase
      .from('products')
      .select('id, name, price, image_url, category')
      .ilike('name', `%${q}%`)
      .limit(8);
    setSearchResults(data || []);
    setShowSearch(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setShowUserMenu(false);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="navbar">
      <div className="navbar-top">
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="logo-text">
              <span className="logo-flipkart">Flipkart</span>
              <span className="logo-explore">Explore <span className="logo-plus">Plus</span> <span className="logo-star">✦</span></span>
            </div>
          </Link>

          {/* Search */}
          <div className="navbar-search" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                className="search-input"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setShowSearch(true)}
              />
              <button type="submit" className="search-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2874f0" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
            </form>

            {showSearch && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map(product => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="search-result-item"
                    onClick={() => setShowSearch(false)}
                  >
                    <img src={product.image_url} alt={product.name} className="search-result-img" />
                    <div>
                      <div className="search-result-name">{product.name}</div>
                      <div className="search-result-price">₹{product.price?.toLocaleString()}</div>
                    </div>
                  </Link>
                ))}
                <Link to={`/search?q=${searchQuery}`} className="search-view-all" onClick={() => setShowSearch(false)}>
                  View all results for "{searchQuery}"
                </Link>
              </div>
            )}
          </div>

          {/* Nav Actions */}
          <div className="navbar-actions">
            {/* Login / User */}
            <div className="nav-user" ref={userMenuRef}>
              <button
                className="nav-btn"
                onClick={() => user ? setShowUserMenu(!showUserMenu) : navigate('/auth')}
              >
                <span className="nav-btn-text">
                  {user ? displayName.split(' ')[0] : 'Login'}
                </span>
                {user && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>}
              </button>

              {showUserMenu && user && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <span>👤 {displayName}</span>
                  </div>
                  <Link to="/profile" className="user-dropdown-item" onClick={() => setShowUserMenu(false)}>My Profile</Link>
                  <Link to="/orders" className="user-dropdown-item" onClick={() => setShowUserMenu(false)}>My Orders</Link>
                  <Link to="/wishlist" className="user-dropdown-item" onClick={() => setShowUserMenu(false)}>My Wishlist</Link>
                  <Link to="/ai-assistant" className="user-dropdown-item" onClick={() => setShowUserMenu(false)}>🤖 AI Assistant</Link>
                  <button className="user-dropdown-item logout-btn" onClick={handleSignOut}>Logout</button>
                </div>
              )}
            </div>

            <Link to="/ai-assistant" className="nav-btn nav-ai">
              <span className="nav-btn-icon">🤖</span>
              <span className="nav-btn-text">AI</span>
            </Link>

            <Link to="/cart" className="nav-btn nav-cart">
              <div className="cart-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </div>
              <span className="nav-btn-text">Cart</span>
            </Link>

            <Link to="/auth" className="nav-btn nav-seller">
              <span className="nav-btn-text">Become a Seller</span>
            </Link>

            <button className="nav-btn">
              <span className="nav-btn-text">More ▾</span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="navbar-categories">
        <div className="categories-container">
          {CATEGORIES.map(cat => (
            <Link key={cat.label} to={cat.path} className="category-link">
              <span className="category-icon">{cat.icon}</span>
              <span className="category-label">{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
