import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../Components/ProductCard';
import API_BASE_URL from '../config';

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch catalog products from Express API dynamically
  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (search) params.search = search;
    
    // Request a large limit to render all items on one page
    params.limit = 50;

    axios.get(`${API_BASE_URL}/api/v1/products`, { params })
      .then((response) => {
        setProducts(response.data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching catalog:", err);
        setError("Could not load catalog products.");
        setLoading(false);
      });
  }, [category, search]);

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

  const pageTitle = category ? `${category} Collection` : "Full Makeup Catalog";

  return (
    <section className="bestsellers" style={{ backgroundColor: 'transparent', paddingTop: '50px', paddingBottom: '60px', fontFamily: 'Montserrat, sans-serif' }}>
      
      {/* Show search results title only if search is active */}
      {search && (
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Search Results for "{search}"
          </h2>
        </div>
      )}

      <div style={{ padding: '0 50px' }}>
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