import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from '../Components/ProductCard';
import API_BASE_URL from '../config';

export default function ProductDetail() {
  const { id } = useParams();
  
  // State Variables
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Interactive UI State
  const [selectedShade, setSelectedShade] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // 'description' or 'ingredients'
  const [added, setAdded] = useState(false); // ✨ Visual feedback state for add to bag

  const { addToCart } = useCart();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();

  // Fetch product specifications, reviews, and related items on mount/ID change
  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`${API_BASE_URL}/api/v1/products/${id}`)
      .then((response) => {
        const prodData = response.data.data;
        setProduct(prodData);
        setReviews(response.data.reviews || []);
        setRelatedProducts(response.data.relatedProducts || []);
        
        // Setup initial shade selection
        const shadesList = prodData.shades && prodData.shades.length > 0
          ? prodData.shades
          : ["01 Unicorn Pearl", "02 Satin Rose", "03 Peach Velvet", "04 Mocha Crush"];
        setSelectedShade(shadesList[0]);
        setQuantity(1);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading product detail data:", err);
        setError("Could not load product details.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><h3>Loading details...</h3></div>;
  if (error || !product) return <div style={{ textAlign: 'center', padding: '100px', color: 'red' }}><h3>Error: {error || "Product not found!"}</h3></div>;

  const liked = isFavorite(product._id);

  // Fallbacks
  const shades = product.shades && product.shades.length > 0
    ? product.shades
    : ["01 Unicorn Pearl", "02 Satin Rose", "03 Peach Velvet", "04 Mocha Crush"];

  const ingredients = product.ingredients && product.ingredients.trim() !== ''
    ? product.ingredients
    : "AQUA (WATER/EAU), DIMETHICONE, SYNTHETIC WAX, TRIMETHYLSILOXYSILICATE, LAURYL PEG-9 POLYDIMETHYLSILOXYETHYL DIMETHICONE, GLYCERIN, POLYSILICONE-11, PHENOXYETHANOL, SODIUM CHLORIDE, TOCOPHEROL, POTASSIUM SORBATE, CITRIC ACID.";

  // Quantity control helpers
  const handleQtyMinus = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleQtyPlus = () => {
    setQuantity(prev => Math.min(product.stock, prev + 1));
  };

  return (
    <div className="pdp-wrapper" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      
      {/* 1. PRODUCT METADATA SPEC GRID */}
      <div className="pdp-container">
        
        {/* Left: Main Photo */}
        <div className="pdp-image-section">
          <img 
            src={`/${product.image}`} 
            alt={product.name} 
            className="pdp-main-image"
            onError={(e) => { e.target.src = '/Logo.webp'; }} 
          />
        </div>

        {/* Right: Specs & Purchasing controls */}
        <div className="pdp-details-section">
          <span className="pdp-category">{product.category}</span>
          <h1 className="pdp-title">{product.name}</h1>

          {/* Rating, Stars & Stock line */}
          <div className="pdp-rating-stock">
            {product.reviewsCount > 0 ? (
              <span style={{ color: '#ff1493', fontWeight: '700' }}>
                {product.rating.toFixed(1)}/5 ★{' '}
                {Array.from({ length: 5 }, (_, i) => 
                  i < Math.round(product.rating) ? '★' : '☆'
                ).join('')}
                {' '}({product.reviewsCount} {product.reviewsCount === 1 ? 'Review' : 'Reviews'})
              </span>
            ) : (
              <span style={{ color: '#888', fontWeight: '500' }}>No Reviews Yet</span>
            )}
            <span style={{ color: '#666', fontWeight: '500' }}>|</span>
            {product.stock > 0 ? (
              <span style={{ color: '#1a7f37', fontWeight: '700' }}>{product.stock} items available</span>
            ) : (
              <span style={{ color: '#cf222e', fontWeight: '700' }}>OUT OF STOCK</span>
            )}
          </div>

          {globalDiscount > 0 ? (
            <div className="pdp-price" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
              <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '18px', fontWeight: '500' }}>
                PKR {product.price.toLocaleString()}
              </span>
              <span style={{ color: '#ff1493', fontWeight: '800', fontSize: '26px' }}>
                PKR {Math.round(product.price * (1 - globalDiscount / 100)).toLocaleString()}
              </span>
              <span style={{ backgroundColor: '#ff1493', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '3px' }}>
                {globalDiscount}% OFF SALE
              </span>
            </div>
          ) : (
            <div className="pdp-price" style={{ marginBottom: '30px' }}>PKR {product.price.toLocaleString()}</div>
          )}

          {/* Shades Selector */}
          {shades.length > 0 && (
            <div className="pdp-shades-section">
              <div className="pdp-shades-title">
                Select Shade: <span style={{ fontWeight: '800', color: '#ff1493' }}>{selectedShade}</span>
              </div>
              <div className="shades-grid">
                {shades.map((shade) => (
                  <div 
                    key={shade} 
                    className={`shade-pill ${selectedShade === shade ? 'active' : ''}`}
                    onClick={() => setSelectedShade(shade)}
                  >
                    {shade}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Bag Addition Actions */}
          <div className="pdp-actions" style={{ marginTop: '30px' }}>
            <div className="qty-selector">
              <button type="button" className="qty-btn" onClick={handleQtyMinus}>-</button>
              <input 
                type="number" 
                value={quantity} 
                readOnly 
                className="qty-input"
              />
              <button type="button" className="qty-btn" onClick={handleQtyPlus}>+</button>
            </div>

            <button 
              type="button" 
              className="pdp-add-btn" 
              onClick={() => {
                addToCart({ ...product, quantity, selectedShade });
                setAdded(true);
                setTimeout(() => setAdded(false), 2000);
              }}
              disabled={product.stock <= 0}
              style={{
                backgroundColor: added ? '#00b050' : '#000',
                transition: 'background-color 0.3s ease'
              }}
            >
              {product.stock <= 0 ? 'OUT OF STOCK' : added ? '✓ ADDED TO BAG!' : 'ADD TO BAG'}
            </button>

            {/* Wishlist Heart Toggle */}
            <span 
              className={`like-icon pdp-fav-btn ${liked ? 'liked' : ''}`}
              onClick={() => liked ? removeFromFavorites(product._id) : addToFavorites(product)}
              style={{ userSelect: 'none' }}
            >
              {liked ? '♥' : '♡'}
            </span>
          </div>

          {/* Accordion Specification Tabs */}
          <div className="pdp-tab-container" style={{ marginTop: '40px' }}>
            
            {/* Description Tab Header */}
            <div 
              className={`pdp-tab-header ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
              style={{ cursor: 'pointer', borderBottom: activeTab === 'description' ? '2px solid #ff1493' : 'none' }}
            >
              Description
            </div>
            {activeTab === 'description' && (
              <div className="pdp-tab-content" style={{ marginTop: '15px', display: 'block' }}>
                {product.description || 'No description available for this luxury product.'}
              </div>
            )}

            {/* Ingredients Tab Header */}
            <div 
              className={`pdp-tab-header ${activeTab === 'ingredients' ? 'active' : ''}`}
              onClick={() => setActiveTab('ingredients')}
              style={{ cursor: 'pointer', marginTop: '15px', borderBottom: activeTab === 'ingredients' ? '2px solid #ff1493' : 'none' }}
            >
              Ingredients
            </div>
            {activeTab === 'ingredients' && (
              <div className="pdp-tab-content" style={{ marginTop: '15px', fontFamily: 'monospace', fontSize: '11px', display: 'block' }}>
                {ingredients}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* 2. REVIEWS LIST SECTION */}
      <section className="pdp-reviews-section" style={{ marginTop: '60px', borderTop: '1px solid #eee', paddingTop: '40px' }}>
        <div className="pdp-reviews-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 className="pdp-reviews-title" style={{ fontSize: '22px', fontWeight: '800' }}>Customer Reviews</h2>
        </div>

        {/* Rating Summary Block */}
        <div className="pdp-reviews-summary" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
          {reviews.length > 0 ? (
            <>
              <div className="summary-rating-num" style={{ fontSize: '36px', fontWeight: '800', color: '#ff1493' }}>
                {product.rating.toFixed(1)}/5
              </div>
              <div className="summary-rating-stars">
                <div className="star-rating-display" style={{ fontSize: '18px', color: '#ff1493' }}>
                  {Array.from({ length: 5 }, (_, i) => 
                    i < Math.round(product.rating) ? '★' : '☆'
                  ).join('')}
                </div>
                <div className="summary-rating-count" style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="summary-rating-num" style={{ fontSize: '36px', fontWeight: '800', color: '#888' }}>
                0.0/5
              </div>
              <div className="summary-rating-stars">
                <div className="star-rating-display" style={{ fontSize: '18px', color: '#ccc' }}>
                  ☆☆☆☆☆
                </div>
                <div className="summary-rating-count" style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                  No Reviews Yet
                </div>
              </div>
            </>
          )}
        </div>

        {/* Customer Reviews Feedback Grid */}
        <div className="reviews-list">
          {reviews.length === 0 ? (
            <div style={{ textAlignment: 'center', padding: '40px 20px', border: '1px dashed #ddd', borderRadius: '8px', color: '#777', textAlign: 'center' }}>
              <p style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 10px 0' }}>No reviews yet</p>
              <p style={{ fontSize: '13px', margin: 0 }}>Be the first to review this product and share your thoughts with other customers!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="review-card" style={{ background: '#fff', border: '1px solid #eee', padding: '20px', borderRadius: '6px', marginBottom: '20px' }}>
                <div className="review-card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div className="reviewer-info">
                    <div className="reviewer-name" style={{ fontWeight: '700', fontSize: '14px' }}>
                      {review.customer ? review.customer.name : 'Verified Customer'}
                    </div>
                    <div className="review-date" style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                      {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="star-rating-display" style={{ fontSize: '14px', color: '#ff1493' }}>
                    {Array.from({ length: 5 }, (_, i) => 
                      i < review.rating ? '★' : '☆'
                    ).join('')}
                  </div>
                </div>
                <div className="review-comment" style={{ fontSize: '14px', color: '#333', lineHeight: '1.5' }}>
                  {review.comment}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 3. RELATED PRODUCTS LIST GRID */}
      {relatedProducts.length > 0 && (
        <div style={{ borderTop: '1px solid #eee', paddingTop: '60px', marginTop: '60px' }}>
          <h2 className="cart-title" style={{ fontSize: '22px', marginBottom: '40px', textAlign: 'left', fontWeight: '800' }}>
            You May Also Like
          </h2>
          <div className="product-grid">
            {relatedProducts.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}