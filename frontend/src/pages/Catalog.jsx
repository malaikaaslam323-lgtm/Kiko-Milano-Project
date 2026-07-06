import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../Components/ProductCard';
import API_BASE_URL from '../config';

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toggle States for the Drawers
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Filter and Sorting States
  const [category, setCategory] = useState(categoryParam || 'All');
  const [ratingFilter, setRatingFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState('default');

  // Sync category dropdown filter when URL search parameters change
  useEffect(() => {
    setCategory(categoryParam || 'All');
  }, [categoryParam]);

  // Main product fetch handler combining categories, search, price ranges, and sorting
  const fetchFilteredProducts = () => {
    setLoading(true);
    const params = { limit: 100 };
    if (category && category !== 'All') params.category = category;
    if (searchParam) params.search = searchParam;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (ratingFilter) params.rating = ratingFilter;

    axios.get(`${API_BASE_URL}/api/v1/products`, { params })
      .then((response) => {
        let data = response.data.data || [];

        // Apply frontend sorting criteria
        if (sortOption === 'price-asc') {
          data.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'price-desc') {
          data.sort((a, b) => b.price - a.price);
        } else if (sortOption === 'rating-desc') {
          data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortOption === 'newest') {
          data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }

        setProducts(data);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching catalog:", err);
        setError("Could not load catalog products.");
        setLoading(false);
      });
  };

  // Re-fetch products when URL parameters, filter selections, or sorting modes change
  useEffect(() => {
    fetchFilteredProducts();
  }, [categoryParam, searchParam, category, ratingFilter, sortOption]);

  const handleRatingSelect = (rating) => {
    if (ratingFilter === rating) {
      setRatingFilter('');
    } else {
      setRatingFilter(rating);
    }
  };

  const handleSortOptionSelect = (option) => {
    setSortOption(option);
    setSortOpen(false); // Auto-close sort dropdown on select
  };

  const handlePriceGo = (e) => {
    e.preventDefault();
    fetchFilteredProducts();
  };

  const clearPriceFilter = () => {
    setMinPrice('');
    setMaxPrice('');
    // Trigger fetch after clearing input state
    setTimeout(() => {
      fetchFilteredProducts();
    }, 0);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', fontFamily: 'Montserrat, sans-serif' }}>
        <h3>Loading KIKO Milano catalog...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', fontFamily: 'Montserrat, sans-serif', color: 'red' }}>
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <section className="bestsellers" style={{ backgroundColor: 'transparent', paddingTop: '30px', paddingBottom: '60px', fontFamily: 'Montserrat, sans-serif' }}>
      
      {/* Show search results title only if search is active */}
      {searchParam && (
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Search Results for "{searchParam}"
          </h2>
        </div>
      )}

      {/* LUXURY FILTER & SORT BUTTON PILL BAR */}
      <div className="custom-filter-pill-bar">
        <button 
          type="button" 
          className={`pill-btn ${filtersOpen ? 'active' : ''}`}
          onClick={() => { setFiltersOpen(!filtersOpen); setSortOpen(false); }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '-1px' }}>
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
          FILTERS
        </button>
        <div className="pill-divider"></div>
        <button 
          type="button" 
          className={`pill-btn ${sortOpen ? 'active' : ''}`}
          onClick={() => { setSortOpen(!sortOpen); setFiltersOpen(false); }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '-1px' }}>
            <polyline points="15 18 12 21 9 18"></polyline>
            <line x1="12" y1="21" x2="12" y2="3"></line>
            <polyline points="9 6 12 3 15 6"></polyline>
          </svg>
          SORT BY
        </button>
      </div>

      {/* COLLAPSIBLE FILTERS PANEL */}
      {filtersOpen && (
        <div className="custom-filter-panel">
          {/* Column 1: Average Rating */}
          <div className="filter-column">
            <div className="column-header">
              <span>Average Rating</span>
              <button type="button" className="clear-link" onClick={() => setRatingFilter('')}>Clear</button>
            </div>
            <div className="rating-options">
              {[4, 3, 2, 1].map((r) => (
                <label key={r} className="rating-option-label">
                  <input 
                    type="checkbox" 
                    checked={ratingFilter === r}
                    onChange={() => handleRatingSelect(r)}
                  />
                  <span className="stars-wrapper">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`star-item ${i < r ? 'filled' : ''}`}>★</span>
                    ))}
                  </span>
                  <span className="rating-text">{r}/5 & up</span>
                </label>
              ))}
            </div>
          </div>

          {/* Column 2: Price Filters */}
          <div className="filter-column">
            <div className="column-header">
              <span>Price</span>
              <button type="button" className="clear-link" onClick={clearPriceFilter}>Clear</button>
            </div>
            <form className="price-range-form" onSubmit={handlePriceGo}>
              <input 
                type="number" 
                placeholder="Min" 
                value={minPrice} 
                onChange={(e) => setMinPrice(e.target.value)}
                className="price-filter-input"
                min="0"
              />
              <span className="price-to-text">to</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(e.target.value)}
                className="price-filter-input"
                min="0"
              />
              <button type="submit" className="price-go-btn">
                GO
              </button>
            </form>

            {/* Hidden category selection helper inside drawer */}
            <div style={{ marginTop: '10px' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#666', textTransform: 'uppercase', display: 'block', marginBottom: '5px' }}>Category Scope</span>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '11px', fontFamily: 'inherit' }}
              >
                <option value="All">All Categories</option>
                <option value="FACE">Face</option>
                <option value="LIPS">Lips</option>
                <option value="EYES">Eyes</option>
                <option value="SKIN CARE">Skin Care</option>
                <option value="ACCESSORIES">Accessories</option>
                <option value="FRAGRANCE">Fragrance</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* COLLAPSIBLE SORT BY PANEL */}
      {sortOpen && (
        <div className="custom-sort-panel">
          {[
            { value: 'default', label: 'Featured' },
            { value: 'price-asc', label: 'Price: Low to High' },
            { value: 'price-desc', label: 'Price: High to Low' },
            { value: 'rating-desc', label: 'Rating: High to Low' },
            { value: 'newest', label: 'Newest Arrivals' }
          ].map((opt) => (
            <button 
              key={opt.value} 
              type="button" 
              className={`sort-option-btn ${sortOption === opt.value ? 'active' : ''}`}
              onClick={() => handleSortOptionSelect(opt.value)}
            >
              <span>{opt.label}</span>
              {sortOption === opt.value && <span className="check-mark">✓</span>}
            </button>
          ))}
        </div>
      )}

      <div className="catalog-grid-wrapper" style={{ padding: '0 50px' }}>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <h3 style={{ fontWeight: '400', color: '#555' }}>
              No products found matching your criteria.
            </h3>
          </div>
        ) : (
          <div className="product-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}