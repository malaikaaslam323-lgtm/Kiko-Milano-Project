import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../assets/images/Logo.webp';
import storeIcon from '../assets/images/Icon_5.png';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext'; 
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { favoritesCount } = useFavorites();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Hide the global storefront header on back office /admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      {/* 1. Top Bar */}
      <div className="top-bar">
        <div className="top-left">
          <div className="loc">
            <img src={storeIcon} alt="Location" />
            <span>STORES</span>
          </div>
        </div>
        <div className="top-center">
          <p>Dial our UAN 042-111-70-80-90 for inquiries.</p>
        </div>
        <div className="top-right">
          <span>PAK | EN &#127477;&#127472;</span>
        </div>
      </div>

      {/* 2. Main Site Header */}
      <header className="site-header">
        <div className="header-middle">
          
          {/* Left: Search Bar */}
          <div className="header-left">
            <form onSubmit={handleSearchSubmit} className="search-container">
              <span className="search-icon">&#128269;&#xFE0E;</span>
              <input 
                type="text" 
                placeholder="Search" 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
          
          {/* Center: Brand Logo */}
          <div className="logo">
            <Link to="/">
              <img src={logoImg} alt="KIKO Milano Logo" />
            </Link>
          </div>
          
          {/* Right: User, Wishlist, and Cart Actions */}
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            
            {/* Conditional User Profile rendering */}
            {user ? (
              <>
                {user.role.toLowerCase() === 'admin' ? (
                  <Link to="/admin" style={{ textDecoration: 'none', color: '#ff1493', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>ADMIN PANEL</Link>
                ) : (
                  <Link to="/dashboard" style={{ textDecoration: 'none', color: 'black', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>DASHBOARD</Link>
                )}
                <Link to="/my-account" style={{ textDecoration: 'none', color: 'black', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginLeft: '12px' }}>MY ACCOUNT</Link>
                <button 
                  onClick={logout} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'black', 
                    fontSize: '11px', 
                    fontWeight: '700', 
                    letterSpacing: '1px', 
                    textTransform: 'uppercase', 
                    marginLeft: '12px',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <Link to="/login" style={{ textDecoration: 'none', color: 'black', display: 'flex', alignItems: 'center' }}>
                <span className="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
              </Link>
            )}
            
            {/* Wishlist/Favorites Icon */}
          <Link to="/favorites" className="cart-icon-container" style={{ textDecoration: 'none', color: 'inherit', position: 'relative', display: 'flex', alignItems: 'center' }}>
         <span className="icon">
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
         <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        </span>
        <span className="cart-badge fav-badge" style={{ backgroundColor: '#ff1493' }}>{favoritesCount}</span> {/* <-- CHANGE 0 TO {favoritesCount} */}
         </Link>
            
            {/* Shopping Cart Icon */}
            <Link to="/cart" className="cart-icon-container" style={{ textDecoration: 'none', color: 'inherit', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span className="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </span> 
              <span className="cart-badge">{cartCount}</span>
            </Link>
          </div>
        </div>

        {/* 3. Navigation Bar (Categories) */}
        <nav className="navbar">
          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
          <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
            <Link to="/products">ALL MAKE UP</Link>
            <Link to="/products?category=FACE">FACE</Link>
            <Link to="/products?category=LIPS">LIPS</Link>
            <Link to="/products?category=EYES">EYES</Link>
            <Link to="/products?category=SKIN CARE">SKIN CARE</Link>
            <Link to="/products?category=ACCESSORIES">ACCESSORIES</Link>
            <Link to="/products?category=FRAGRANCE">FRAGRANCE</Link>
          </div>
        </nav>
      </header>
    </>
  );
}