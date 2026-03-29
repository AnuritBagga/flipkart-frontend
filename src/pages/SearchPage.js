import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import ProductCard from '../components/ProductCard/ProductCard';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const search = async () => {
      if (!query) { setResults([]); setLoading(false); return; }
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(40);
      setResults(data || []);
      setLoading(false);
    };
    search();
  }, [query]);

  return (
    <div className="search-page">
      <div className="search-container">
        <div className="search-header">
          {loading ? 'Searching...' : (
            <>
              <span className="search-count">{results.length} results</span> for "<strong>{query}</strong>"
            </>
          )}
        </div>
        {results.length === 0 && !loading ? (
          <div className="search-no-results">
            <div style={{fontSize:60}}>🔍</div>
            <h2>No results found for "{query}"</h2>
            <p>Check the spelling or try different keywords</p>
          </div>
        ) : (
          <div className="search-grid">
            {results.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
