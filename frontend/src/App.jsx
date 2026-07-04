import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from './config';
import Header from './Components/Header';
import ProductCard from './Components/ProductCard';
import HomeProductCard from './Components/HomeProductCard'; // ✨ Import homepage card
import Cart from './pages/Cart';
import Favorites from './pages/Favorites';
import ProductDetail from './pages/ProductDetail';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import Register from './pages/Register'; 
import Dashboard from './pages/Dashboard'; 
import MyAccount from './pages/MyAccount'; 
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import Footer from './Components/Footer'; // ✨ Import premium luxury footer
import ContactUs from './pages/ContactUs'; // ✨ Import Contact page
import './first.css'; // 🎨 Import landing page layout styles

// Interactive Home Page Component fetching live data
function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from the backend API when the page loads
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/v1/products`)
      .then((response) => {
        // Your backend returns products inside the 'data' field
        setProducts(response.data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API fetching error:", err);
        setError("Could not load products. Make sure your backend server is running on port 3000!");
        setLoading(false);
      });
  }, []);

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
    <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
      
      {/* Hero Banner Section (styled via first.css background-image) */}
      <section className="hero"></section>

      {/* Bestsellers Section */}
      <section className="bestsellers">
        <h2 className="section-title">KIKO <span>MOST LOVED</span></h2>
        
        {/* Grid displaying the top 4 Product Cards from database */}
        <div className="product-grid" style={{ maxWidth: '1200px', margin: '0 auto 30px auto' }}>
          {products.slice(0, 4).map((product) => (
            <HomeProductCard key={product._id} product={product} />
          ))}
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <a href="/products" className="view-all-btn" style={{ textDecoration: 'none' }}>
            VIEW ALL
          </a>
        </div>
      </section>

      {/* Top Categories Section */}
      <section className="top-categories">
        <h2>TOP CATEGORIES</h2>
        <div className="category-grid">
          <div className="category-item">
            <a href="/products?category=LIPS" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="category-img-wrapper">
                <img src="/ll1.webp" alt="Lips" />
              </div>
              <p>LIPS</p>
            </a>
          </div>
          
          <div className="category-item">
            <a href="/products?category=EYES" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="category-img-wrapper">
                <img src="/glitteye1.webp" alt="Eyes" />
              </div>
              <p>EYES</p>
            </a>
          </div>

          <div className="category-item">
            <a href="/products?category=FACE" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="category-img-wrapper">
                <img src="/blush1.webp" alt="Face" />
              </div>
              <p>FACE</p>
            </a>
          </div>

          <div className="category-item">
            <a href="/products?category=SKIN CARE" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="category-img-wrapper">
                <img src="/skc1.webp" alt="Skin Care" />
              </div>
              <p>SKIN CARE</p>
            </a>
          </div>

          <div className="category-item">
            <a href="/products?category=ACCESSORIES" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="category-img-wrapper">
                <img src="/sponge1.webp" alt="Accessories" />
              </div>
              <p>ACCESSORIES</p>
            </a>
          </div>
        </div>
      </section>

      {/* Brand Narrative Section */}
      <section className="brand-section">
        <div className="brand-container">
          <div className="brand-img">
            <img src="/HP_Carousel_1_OurBrand.webp" alt="KIKO MILANO ART BEAUTY JOY" />
          </div>
          <div className="brand-content">
            <span className="brand-badge">OUR BRAND</span>
            <h2>Art &bull; Beauty &bull; Joy</h2>
            <p>
              KIKO MILANO is a brand built for self-expression. We capture global trends and infuse them with our own distinctive style drawn from our Italian perspective before sharing them with our audience across the world.
            </p>
          </div>
        </div>
      </section>

      {/* Delivery Highlights Section */}
      <section className="deliver">
        <div className="deliver-container">
          <div className="deliver-item">
            <img src="/truck.png" alt="Free Shipping" />
            <p>FREE SHIPPING OVER ORDERS OF 50,000 PKR</p>
          </div>
          <div className="deliver-item">
            <img src="/lipsLogo.png" alt="Secure Payment" />
            <p>SECURE PAYMENT PURCHASES ARE SECURE AND GUARANTEED</p>
          </div>
          <div className="deliver-item">
            <img src="/orderLogo.png" alt="Easy Exchange" />
            <p>EASY EXCHANGE UPTO 7 DAYS AFTER DELIVERY</p>
          </div>
        </div>
      </section>

    </div>
  );
}



export default function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Render our global Header */}
        <Header />

        {/* Dynamic Main Body Content */}
        <main style={{ flex: 1, background: '#fafafa' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Catalog />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/login" element={<Login />} /> 
            <Route path="/register" element={<Register />} /> 
            <Route path="/dashboard" element={<Dashboard />} /> 
            <Route path="/my-account" element={<MyAccount />} /> 
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/contact-us" element={<ContactUs />} /> {/* ✨ Registered Contact page route */}
          </Routes>
        </main>

        {/* Global Luxury Footer */}
        <Footer />
      </div>
    </Router>
  );
}