import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from '../Components/ProductCard';

export default function Favorites() {
  const { favorites } = useFavorites();

  return (
    <div className="favorites-wrapper" style={{ padding: '60px 50px', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
          My Wishlist
        </h1>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '10px' }}>
          Your handpicked selection of KIKO Milano favorites.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <h3 style={{ fontWeight: '500', color: '#555' }}>Your wishlist is currently empty.</h3>
          <p style={{ color: '#888', fontSize: '13px', marginTop: '5px' }}>
            Browse our makeup catalog and tap the heart icon on products you love!
          </p>
          <Link 
            to="/products" 
            className="btn-secondary" 
            style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none' }}
          >
            DISCOVER PRODUCTS
          </Link>
        </div>
      ) : (
        <div className="product-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {favorites.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}