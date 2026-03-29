import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import ProductCard from '../components/ProductCard/ProductCard';
import './HomePage.css';

const BANNERS = [
    {
        id: 1,
        link: '/products/Electronics',
        gradient: 'linear-gradient(135deg, #0d1b6e 0%, #1a3a8f 50%, #1565c0 100%)',
        emojis: ['📱', '💻', '🎧'],
        tag: 'Up to 80% Off',
        title: 'Electronics Mega Sale',
        subtitle: 'Smartphones · Laptops · Audio · Tablets',
    },
    {
        id: 2,
        link: '/products/Men',
        gradient: 'linear-gradient(135deg, #6a0572 0%, #a0167e 50%, #d63384 100%)',
        emojis: ['👔', '👗', '👟'],
        tag: 'Min 50% Off',
        title: 'Fashion Bonanza',
        subtitle: "Men's & Women's Clothing · Footwear",
    },
    {
        id: 3,
        link: '/products/Grocery',
        gradient: 'linear-gradient(135deg, #0a3d0a 0%, #1b5e20 50%, #388e3c 100%)',
        emojis: ['🥦', '🍎', '🛒'],
        tag: 'Starting ₹49',
        title: 'Grocery Super Saver',
        subtitle: 'Fresh Produce · Packaged Food · Essentials',
    },
    {
        id: 4,
        link: '/products/Home',
        gradient: 'linear-gradient(135deg, #7b2800 0%, #bf360c 50%, #e64a19 100%)',
        emojis: ['🛋️', '🍳', '🏠'],
        tag: 'Up to 70% Off',
        title: 'Home & Furniture',
        subtitle: 'Decor · Kitchen · Living Room',
    },
];

const CATEGORY_TILES = [
    { label: 'Phones',           path: '/products/Electronics', emoji: '📱', color: '#e3f2fd' },
    { label: 'Electronics',      path: '/products/Electronics', emoji: '💻', color: '#fce4ec' },
    { label: "Men's Fashion",    path: '/products/Men',         emoji: '👔', color: '#e8f5e9' },
    { label: "Women's Fashion",  path: '/products/Women',       emoji: '👗', color: '#fff3e0' },
    { label: 'Home & Furniture', path: '/products/Home',        emoji: '🛋️', color: '#ede7f6' },
    { label: 'Appliances',       path: '/products/TVs',         emoji: '📺', color: '#e0f2f1' },
    { label: 'Books',            path: '/products/Books',       emoji: '📚', color: '#fff8e1' },
    { label: 'Sports',           path: '/products/Sports',      emoji: '⚽', color: '#e3f2fd' },
    { label: 'Grocery',          path: '/products/Grocery',     emoji: '🛒', color: '#f1f8e9' },
    { label: 'Beauty',           path: '/products/Beauty',      emoji: '💄', color: '#fce4ec' },
];

const ProductSection = ({ title, subtitle, products, viewAllLink }) => (
    <div className="product-section">
        <div className="section-header">
            <div>
                <h2 className="section-title">{title}</h2>
                {subtitle && <p className="section-subtitle">{subtitle}</p>}
            </div>
            <Link to={viewAllLink} className="view-all-btn">VIEW ALL</Link>
        </div>
        <div className="products-grid-horizontal">
            {products.map(product => (
                <div key={product.id} className="product-grid-item">
                    <ProductCard product={product} />
                </div>
            ))}
        </div>
    </div>
);

const HomePage = () => {
    const [currentBanner, setCurrentBanner] = useState(0);
    const [products, setProducts] = useState({
        electronics: [], fashion: [], topDeals: [], recommended: [], grocery: [], books: []
    });
    const [loading, setLoading] = useState(true);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const [electronics, fashion, topDeals, recommended, grocery, books] = await Promise.all([
                supabase.from('products').select('*').eq('category', 'Electronics').limit(8),
                supabase.from('products').select('*').in('category', ['Men', 'Women']).limit(8),
                supabase.from('products').select('*').order('rating', { ascending: false }).limit(8),
                supabase.from('products').select('*').order('created_at', { ascending: false }).limit(8),
                supabase.from('products').select('*').eq('category', 'Grocery').limit(8),
                supabase.from('products').select('*').eq('category', 'Books').limit(8),
            ]);
            setProducts({
                electronics: electronics.data || [],
                fashion: fashion.data || [],
                topDeals: topDeals.data || [],
                recommended: recommended.data || [],
                grocery: grocery.data || [],
                books: books.data || [],
            });
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % BANNERS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="home-page">
            {/* Hero Banner Carousel */}
            <div className="banner-carousel">
                <div className="banner-slides" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
                    {BANNERS.map(banner => (
                        <Link
                            key={banner.id}
                            to={banner.link}
                            className="banner-slide banner-css"
                            style={{ background: banner.gradient }}
                        >
                            {/* Decorative circles */}
                            <div className="b-circle b-c1" />
                            <div className="b-circle b-c2" />
                            <div className="b-circle b-c3" />

                            {/* Left: Text */}
                            <div className="banner-text-side">
                                <span className="banner-tag-pill">{banner.tag}</span>
                                <h2 className="banner-h2">{banner.title}</h2>
                                <p className="banner-p">{banner.subtitle}</p>
                                <span className="banner-shop-btn">Shop Now →</span>
                            </div>

                            {/* Right: Emojis */}
                            <div className="banner-emoji-side">
                                {banner.emojis.map((em, i) => (
                                    <span key={i} className={`b-emoji b-emoji-${i}`}>{em}</span>
                                ))}
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="banner-dots">
                    {BANNERS.map((_, i) => (
                        <button
                            key={i}
                            className={`banner-dot ${i === currentBanner ? 'active' : ''}`}
                            onClick={() => setCurrentBanner(i)}
                        />
                    ))}
                </div>
                <button className="banner-arrow banner-prev" onClick={() => setCurrentBanner(p => (p - 1 + BANNERS.length) % BANNERS.length)}>‹</button>
                <button className="banner-arrow banner-next" onClick={() => setCurrentBanner(p => (p + 1) % BANNERS.length)}>›</button>
            </div>

            <div className="home-content">
                {/* Category Tiles */}
                <div className="category-tiles-section">
                    <div className="category-tiles">
                        {CATEGORY_TILES.map(cat => (
                            <Link key={cat.label} to={cat.path} className="category-tile">
                                <div className="category-tile-img-wrap" style={{ background: cat.color }}>
                                    <span className="category-tile-emoji">{cat.emoji}</span>
                                </div>
                                <span className="category-tile-label">{cat.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Promo Banners */}
                <div className="promo-banners">
                    <Link to="/products/Electronics" className="promo-banner" style={{ background: 'linear-gradient(135deg, #2196f3, #673ab7)' }}>
                        <div className="promo-text">
                            <div className="promo-tag">Up to 80% off</div>
                            <div className="promo-title">Electronics Sale</div>
                            <div className="promo-subtitle">Smartphones, Laptops & More</div>
                        </div>
                        <div className="promo-icon">📱</div>
                    </Link>
                    <Link to="/products/Home" className="promo-banner" style={{ background: 'linear-gradient(135deg, #ff9800, #e91e63)' }}>
                        <div className="promo-text">
                            <div className="promo-tag">Starting ₹99</div>
                            <div className="promo-title">Home Decor</div>
                            <div className="promo-subtitle">Transform your space</div>
                        </div>
                        <div className="promo-icon">🏠</div>
                    </Link>
                    <Link to="/products/Women" className="promo-banner" style={{ background: 'linear-gradient(135deg, #e91e63, #ff5722)' }}>
                        <div className="promo-text">
                            <div className="promo-tag">New Arrivals</div>
                            <div className="promo-title">Women's Fashion</div>
                            <div className="promo-subtitle">Trendy styles just landed</div>
                        </div>
                        <div className="promo-icon">👗</div>
                    </Link>
                </div>

                {/* Product Sections */}
                {loading ? (
                    <div className="loading-sections">
                        {[1, 2, 3].map(i => <div key={i} className="section-skeleton" />)}
                    </div>
                ) : (
                    <>
                        {products.topDeals.length > 0 && <ProductSection title="🔥 Top Deals" subtitle="Handpicked deals just for you" products={products.topDeals} viewAllLink="/products" />}
                        {products.electronics.length > 0 && <ProductSection title="📱 Electronics" subtitle="Phones, Laptops, Accessories" products={products.electronics} viewAllLink="/products/Electronics" />}
                        {products.fashion.length > 0 && <ProductSection title="👗 Fashion" subtitle="Men & Women's Clothing" products={products.fashion} viewAllLink="/products/Men" />}
                        {products.grocery.length > 0 && <ProductSection title="🥬 Grocery" subtitle="Fresh & Packaged Food" products={products.grocery} viewAllLink="/products/Grocery" />}
                        {products.books.length > 0 && <ProductSection title="📚 Books" subtitle="Bestsellers & New Releases" products={products.books} viewAllLink="/products/Books" />}
                        {products.recommended.length > 0 && <ProductSection title="⭐ Recommended For You" subtitle="Based on trending products" products={products.recommended} viewAllLink="/products" />}
                    </>
                )}
            </div>
        </div>
    );
};

export default HomePage;