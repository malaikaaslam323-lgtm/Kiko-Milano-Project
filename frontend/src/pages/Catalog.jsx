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

  // Filter and Sorting States
  const [category, setCategory] = useState(categoryParam || 'All');
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

  // Re-fetch products when category links in navigation header or search queries change
  useEffect(() => {
    fetchFilteredProducts();
  }, [categoryParam, searchParam]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchFilteredProducts();
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

      {/* PREMIUM FILTER & SORT BAR */}
      <div className="kiko-filter-bar">
        <form className="kiko-filter-form" onSubmit={handleFilterSubmit}>
          {/* Category Selector */}
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="kiko-filter-input"
          >
            <option value="All">All Categories</option>
            <option value="FACE">Face</option>
            <option value="LIPS">Lips</option>
            <option value="EYES">Eyes</option>
            <option value="SKIN CARE">Skin Care</option>
            <option value="ACCESSORIES">Accessories</option>
            <option value="FRAGRANCE">Fragrance</option>
          </select>

          {/* Sort Selector */}
          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
            className="kiko-filter-input"
          >
            <option value="default">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Rating: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>

          {/* Price Filters */}
          <input 
            type="number" 
            placeholder="Min Price" 
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="kiko-filter-input price-input"
            min="0"
          />

          <input 
            type="number" 
            placeholder="Max Price" 
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="kiko-filter-input price-input"
            min="0"
          />

          <button type="submit" className="kiko-filter-btn">
            FILTER
          </button>
        </form>
      </div>

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