import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext'; 
import { Link } from 'react-router-dom';

export default function HomeProductCard({ product }) {
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
    <div className="product-card" style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* Top rated badge */}
      {product.rating >= 4.8 && (
        <span className="kiko-badge" style={{ position: 'absolute', margin: '15px', zIndex: 1, backgroundColor: '#000', color: '#fff', fontSize: '9px', fontWeight: '700', letterSpacing: '1px', padding: '4px 8px' }}>
          TOP RATED
        </span>
      )}

      {/* Sale discount badge */}
      {globalDiscount > 0 && (
        <span className="kiko-badge" style={{ position: 'absolute', right: 0, margin: '15px', zIndex: 1, backgroundColor: '#ff1493', color: '#fff', fontSize: '9px', fontWeight: '700', letterSpacing: '1px', padding: '4px 8px', borderRadius: '3px' }}>
          SALE {globalDiscount}% OFF
        </span>
      )}

      <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <img 
          src={`/${product.image}`} 
          alt={product.name} 
          onError={(e) => { e.target.src = '/Logo.webp'; }} 
        />
        <h4 className="centered-text">{product.name}</h4>
        
        {globalDiscount > 0 ? (
          <p className="price centered-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '11px' }}>
              PKR {product.price.toLocaleString()}
            </span>
            <span style={{ color: '#ff1493', fontWeight: '700' }}>
              PKR {Math.round(product.price * (1 - globalDiscount / 100)).toLocaleString()}
            </span>
          </p>
        ) : (
          <p className="price centered-text">PKR {product.price.toLocaleString()}</p>
        )}
        
        <div className="kiko-rating" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginBottom: '12px', fontSize: '11px' }}>
          {product.reviewsCount && product.reviewsCount > 0 ? (
            <>
              <span style={{ color: '#ff1493', fontWeight: '700' }}>{product.rating.toFixed(1)}/5</span>
              <span style={{ color: '#ff1493' }}>
                {Array.from({ length: 5 }, (_, i) => 
                  i < Math.round(product.rating) ? '★' : '☆'
                ).join('')}
              </span>
              <span>({product.reviewsCount})</span>
            </>
          ) : (
            <span style={{ color: '#888' }}>No Reviews Yet</span>
          )}
        </div>
      </Link>

      <div className="card-action" style={{ marginTop: 'auto', justifyContent: 'center', gap: '15px' }}>
        <button 
          onClick={() => {
            addToCart(product);
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
          }}
          className="btn-secondary" 
          disabled={product.stock <= 0}
          style={{ 
            borderRadius: '7px', 
            padding: '12px 25px', 
            fontWeight: 'bold', 
            cursor: 'pointer', 
            float: 'none', 
            width: 'auto', 
            margin: '0',
            backgroundColor: added ? '#00b050' : '',
            color: added ? '#fff' : '',
            borderColor: added ? '#00b050' : '',
            transition: 'all 0.3s ease'
          }}
        >
          {product.stock <= 0 ? 'OUT OF STOCK' : added ? '✓ ADDED' : 'ADD TO BAG'}
        </button>
        <div className="like" onClick={handleFavoriteClick}>
          <span className={`like-icon ${liked ? 'liked' : ''}`} style={{ cursor: 'pointer', userSelect: 'none' }}>
            {liked ? '♥' : '♡'}
          </span>
        </div>
      </div>
    </div>
  );
}
