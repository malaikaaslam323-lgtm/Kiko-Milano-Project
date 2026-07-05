import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext'; 
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const { addToCart, globalDiscount } = useCart();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const liked = isFavorite(product._id);
  const [added, setAdded] = useState(false); // ✨ Add state hook for visual feedback

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    if (liked) {
      removeFromFavorites(product._id);
    } else {
      addToFavorites(product);
    }
  };

  return (
    <div className="kiko-product-card" style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* Product Image Container */}
      <div className="kiko-image-container">
        {product.rating >= 4.8 && <span className="kiko-badge">TOP RATED</span>}
        
        {/* Sale badge */}
        {globalDiscount > 0 && (
          <span className="kiko-badge" style={{ backgroundColor: '#ff1493', right: 0, left: 'auto', position: 'absolute', margin: '15px' }}>
            {globalDiscount}% OFF
          </span>
        )}

        <Link to={`/products/${product._id}`}>
          <img 
            src={`/${product.image}`} 
            alt={product.name} 
            onError={(e) => { e.target.src = '/Logo.webp'; }} 
          />
        </Link>
      </div>

      {/* Product Info Section */}
      <div className="kiko-product-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        
        <h4 className="kiko-title">
          <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {product.name}
          </Link>
        </h4>

        {globalDiscount > 0 ? (
          <p className="kiko-price" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '12px', fontWeight: 'normal' }}>
              PKR {product.price.toLocaleString()}
            </span>
            <span style={{ color: '#ff1493', fontWeight: '800' }}>
              PKR {Math.round(product.price * (1 - globalDiscount / 100)).toLocaleString()}
            </span>
          </p>
        ) : (
          <p className="kiko-price">PKR {product.price.toLocaleString()}</p>
        )}
        
        <div className="kiko-rating" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', fontSize: '11px' }}>
          <div>
            {product.reviewsCount && product.reviewsCount > 0 ? (
              <>
                <span style={{ color: '#ff1493', fontWeight: '700', marginRight: '5px' }}>
                  {product.rating.toFixed(1)}/5
                </span>
                <span style={{ color: '#ff1493', marginRight: '5px' }}>
                  {Array.from({ length: 5 }, (_, i) => 
                    i < Math.round(product.rating) ? '★' : '☆'
                  ).join('')}
                </span>
                <span style={{ color: '#666' }}>({product.reviewsCount})</span>
              </>
            ) : (
              <span style={{ color: '#888' }}>No Reviews Yet</span>
            )}
          </div>
          <span style={{ color: '#888' }}>({product.stock} left)</span>
        </div>
        
        {/* Actions */}
        <div className="card-action" style={{ justifyContent: 'center', marginTop: 'auto', gap: '15px', alignItems: 'center' }}>
          <button 
            type="button" 
            className="btn-secondary" 
            style={{ 
              margin: 0, 
              width: 'auto', 
              float: 'none', 
              backgroundColor: added ? '#00b050' : '',
              color: added ? '#fff' : '',
              borderColor: added ? '#00b050' : '',
              transition: 'all 0.3s ease'
            }}
            onClick={() => {
              addToCart(product);
              setAdded(true);
              setTimeout(() => setAdded(false), 2000);
            }}
            disabled={product.stock <= 0}
          >
            {product.stock <= 0 ? 'OUT OF STOCK' : added ? '✓ ADDED' : 'ADD TO BAG'}
          </button>
          
          <span 
            className={`like-icon ${liked ? 'liked' : ''}`} 
            onClick={handleFavoriteClick}
            style={{ userSelect: 'none' }}
          >
            {liked ? '♥' : '♡'}
          </span>
        </div>
      </div>
    </div>
  );
}