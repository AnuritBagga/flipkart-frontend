import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import ProductCard from '../components/ProductCard/ProductCard';
import './ProductsPage.css';

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
  { label: 'Newest First', value: 'newest' },
];

const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 - ₹2,000', min: 500, max: 2000 },
  { label: '₹2,000 - ₹5,000', min: 2000, max: 5000 },
  { label: '₹5,000 - ₹15,000', min: 5000, max: 15000 },
  { label: 'Above ₹15,000', min: 15000, max: 999999 },
];

const RATINGS = [4, 3, 2, 1];

const ProductsPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('relevance');
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PER_PAGE = 20;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('products').select('*', { count: 'exact' });

      if (category) query = query.eq('category', category);
      if (selectedPriceRange) {
        query = query.gte('price', selectedPriceRange.min).lte('price', selectedPriceRange.max);
      }
      if (selectedRating) query = query.gte('rating', selectedRating);

      switch (sort) {
        case 'price_asc': query = query.order('price', { ascending: true }); break;
        case 'price_desc': query = query.order('price', { ascending: false }); break;
        case 'rating': query = query.order('rating', { ascending: false }); break;
        case 'newest': query = query.order('created_at', { ascending: false }); break;
        default: break;
      }

      query = query.range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

      const { data, count } = await query;
      setProducts(data || []);
      setTotalCount(count || 0);
    } finally { setLoading(false); }
  }, [category, sort, selectedPriceRange, selectedRating, page]);

  useEffect(() => {
    setPage(1);
    fetchProducts();
  }, [category, sort, selectedPriceRange, selectedRating]);

  useEffect(() => { fetchProducts(); }, [page]);

  const totalPages = Math.ceil(totalCount / PER_PAGE);

  return (
    <div className="products-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button onClick={() => navigate('/')} className="breadcrumb-link">Home</button>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{category || 'All Products'}</span>
      </div>

      <div className="products-layout">
        {/* Sidebar Filters */}
        <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
          <div className="filters-header">
            <h3>Filters</h3>
            <button onClick={() => { setSelectedPriceRange(null); setSelectedRating(null); }}>
              CLEAR ALL
            </button>
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <h4 className="filter-group-title">PRICE RANGE</h4>
            {PRICE_RANGES.map(range => (
              <label key={range.label} className="filter-option">
                <input
                  type="radio"
                  name="price"
                  checked={selectedPriceRange?.label === range.label}
                  onChange={() => setSelectedPriceRange(selectedPriceRange?.label === range.label ? null : range)}
                />
                <span>{range.label}</span>
              </label>
            ))}
          </div>

          {/* Rating */}
          <div className="filter-group">
            <h4 className="filter-group-title">CUSTOMER RATING</h4>
            {RATINGS.map(r => (
              <label key={r} className="filter-option">
                <input
                  type="radio"
                  name="rating"
                  checked={selectedRating === r}
                  onChange={() => setSelectedRating(selectedRating === r ? null : r)}
                />
                <span>{r}★ & above</span>
              </label>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="products-main">
          {/* Sort + Count Bar */}
          <div className="products-topbar">
            <div className="products-count">
              {loading ? 'Loading...' : `Showing ${totalCount.toLocaleString()} results`}
              {category && <span className="category-label-badge"> for "{category}"</span>}
            </div>
            <div className="sort-bar">
              <span className="sort-label">Sort by:</span>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`sort-btn ${sort === opt.value ? 'active' : ''}`}
                  onClick={() => setSort(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
              ⚙ Filters
            </button>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="products-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="product-skeleton" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or browsing other categories</p>
              <button onClick={() => navigate('/')} className="go-home-btn">Go to Home</button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ‹ Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    className={`page-btn ${pageNum === page ? 'active' : ''}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                className="page-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next ›
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;
