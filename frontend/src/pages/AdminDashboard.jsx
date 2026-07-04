import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API_BASE_URL from '../config';
import '../admin.css'; // 🎨 Import premium EJS admin panel CSS rules

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { globalDiscount, fetchDiscount } = useCart();
  const navigate = useNavigate();

  // Tab State: 'products' | 'orders' | 'customers' | 'reviews'
  const [activeTab, setActiveTab] = useState('products');
  const [saleVal, setSaleVal] = useState(0);

  useEffect(() => {
    setSaleVal(globalDiscount);
  }, [globalDiscount]);

  // Live Database States
  const [dashboardData, setDashboardData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [subscribers, setSubscribers] = useState([]); // ✨ Live subscribers list
  const [campaigns, setCampaigns] = useState([]); // ✨ Campaign log history
  const [salesData, setSalesData] = useState(null); // ✨ Sales metrics
  const [campaignSubject, setCampaignSubject] = useState(''); // Composer subject
  const [campaignBody, setCampaignBody] = useState(''); // Composer content
  
  // Form State for Adding / Editing Products
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null when adding new
  const [formVal, setFormVal] = useState({
    name: '',
    price: '',
    category: 'LIPS',
    stock: '10',
    description: '',
    shades: '',
    ingredients: ''
  });
  const [imageFile, setImageFile] = useState(null);

  // Loading & Alert States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && (!user || user.role.toLowerCase() !== 'admin')) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Fetch Dashboard Stats & Product Catalog
  const fetchDashboardStats = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/v1/admin/dashboard`)
      .then((response) => {
        setDashboardData(response.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading admin stats:", err);
        setError("Failed to fetch system dashboard metrics.");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (user && user.role.toLowerCase() === 'admin') {
      fetchDashboardStats();
    }
  }, [user]);

  // Load Tab-specific Data
  useEffect(() => {
    if (!user || user.role.toLowerCase() !== 'admin') return;

    let intervalId;

    if (activeTab === 'orders') {
      axios.get(`${API_BASE_URL}/api/v1/admin/orders`)
        .then(res => setOrders(res.data.data))
        .catch(err => console.error("Error loading admin orders:", err));
    } else if (activeTab === 'customers') {
      axios.get(`${API_BASE_URL}/api/v1/admin/users`)
        .then(res => setCustomers(res.data.data))
        .catch(err => console.error("Error loading admin users:", err));
    } else if (activeTab === 'reviews') {
      axios.get(`${API_BASE_URL}/api/v1/admin/reviews`)
        .then(res => setReviews(res.data.data))
        .catch(err => console.error("Error loading admin reviews:", err));
    } else if (activeTab === 'newsletter') {
      axios.get(`${API_BASE_URL}/api/v1/admin/newsletter`)
        .then(res => {
          setSubscribers(res.data.subscribers || []);
          setCampaigns(res.data.campaigns || []);
        })
        .catch(err => console.error("Error loading subscribers:", err));
    } else if (activeTab === 'sales') {
      const fetchSales = () => {
        axios.get(`${API_BASE_URL}/api/v1/sales-data`)
          .then(res => setSalesData(res.data.data))
          .catch(err => console.error("Error loading sales metrics:", err));
      };
      fetchSales();
      intervalId = setInterval(fetchSales, 10000); // ⏱ Poll live database sales statistics every 10 seconds!
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTab, user]);

  // Action: Open Form to Add Product
  const openAddForm = () => {
    setEditingProduct(null);
    setFormVal({
      name: '',
      price: '',
      category: 'LIPS',
      stock: '10',
      description: '',
      shades: '',
      ingredients: ''
    });
    setImageFile(null);
    setIsFormOpen(true);
  };

  // Action: Open Form to Edit Product
  const openEditForm = (product) => {
    setEditingProduct(product);
    setFormVal({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      description: product.description || '',
      shades: product.shades ? product.shades.join(', ') : '',
      ingredients: product.ingredients || ''
    });
    setImageFile(null);
    setIsFormOpen(true);
  };

  // Action: Handle Form Submission (Add/Edit Product via Multipart Form Data)
  const handleSubmitProduct = (e) => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    };

    const formData = new FormData();
    formData.append('name', formVal.name);
    formData.append('price', formVal.price);
    formData.append('category', formVal.category);
    formData.append('stock', formVal.stock);
    formData.append('description', formVal.description);
    formData.append('shades', formVal.shades);
    formData.append('ingredients', formVal.ingredients);
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const url = editingProduct 
      ? `${API_BASE_URL}/api/v1/admin/product/edit/${editingProduct._id}`
      : `${API_BASE_URL}/api/v1/admin/product/add`;

    axios.post(url, formData, config)
      .then((res) => {
        setSuccess(res.data.message);
        setIsFormOpen(false);
        fetchDashboardStats();
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch((err) => {
        console.error("Product submission failure:", err);
        setError(err.response?.data?.message || "Failed to submit product details.");
      });
  };

  // Action: Update Order Status
  const handleUpdateStatus = (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    axios.post(`${API_BASE_URL}/api/v1/admin/orders/status/${orderId}`, { status: newStatus }, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => {
        setSuccess(res.data.message);
        setOrders(prev => prev.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch(err => {
        console.error("Status update error:", err);
        setError("Failed to update order tracking status.");
        setTimeout(() => setError(''), 3000);
      });
  };

  // Action: Moderate / Delete Review
  const handleDeleteReview = (reviewId) => {
    if (!window.confirm("Are you sure you want to delete and moderate this customer review?")) return;

    const token = localStorage.getItem('token');
    axios.post(`${API_BASE_URL}/api/v1/admin/reviews/delete/${reviewId}`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => {
        setSuccess(res.data.message);
        setReviews(prev => prev.filter(r => r._id !== reviewId));
        fetchDashboardStats();
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch(err => {
        console.error("Review deletion failure:", err);
        setError("Failed to moderate customer review.");
        setTimeout(() => setError(''), 3000);
      });
  };

  // Action: Delete Product from Catalog
  const handleDeleteProduct = (prodId) => {
    if (!window.confirm("WARNING: Are you sure you want to permanently delete this product?")) return;

    const token = localStorage.getItem('token');
    axios.post(`${API_BASE_URL}/api/v1/admin/product/delete/${prodId}`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => {
        setSuccess(res.data.message || "Product successfully deleted from database.");
        fetchDashboardStats();
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch(err => {
        console.error("Delete product failure:", err);
        setError("Failed to delete product.");
        setTimeout(() => setError(''), 3000);
      });
  };

  // Action: Update Global Sale Settings
  const handleUpdateDiscount = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    axios.post(`${API_BASE_URL}/api/v1/admin/settings`, {
      globalDiscount: Number(saleVal)
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then((res) => {
      setSuccess(res.data.message || "Global sale settings successfully updated.");
      fetchDiscount(); // Sync with global Cart context
      setTimeout(() => setSuccess(''), 3000);
    })
    .catch((err) => {
      console.error(err);
      setError(err.response?.data?.message || 'Error updating global sale percentage.');
      setTimeout(() => setError(''), 3000);
    });
  };

  // Action: Send Promotional Campaign
  const handleSendCampaign = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    axios.post(`${API_BASE_URL}/api/v1/admin/newsletter/send-campaign`, {
      subject: campaignSubject,
      body: campaignBody
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then((res) => {
      setSuccess(res.data.message);
      setCampaignSubject('');
      setCampaignBody('');
      // Reload newsletter log list
      axios.get(`${API_BASE_URL}/api/v1/admin/newsletter`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(resNewsletter => {
        setSubscribers(resNewsletter.data.subscribers || []);
        setCampaigns(resNewsletter.data.campaigns || []);
      });
      setTimeout(() => setSuccess(''), 3000);
    })
    .catch(err => {
      console.error(err);
      setError(err.response?.data?.message || 'Error dispatching newsletter campaign.');
      setTimeout(() => setError(''), 3000);
    });
  };

  if (authLoading || !user || !dashboardData) {
    return <div style={{ textAlign: 'center', padding: '100px' }}><h3>Loading back office...</h3></div>;
  }

  const { totalProducts, totalOrders, totalCustomers, totalSales, lowStockCount, topSelling, products } = dashboardData;

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', backgroundColor: '#fafafa', minHeight: '100vh' }}>
      
      {/* Admin Top Banner */}
      <div className="admin-top-bar">
        <span>KIKO MILANO BACK OFFICE &bull; CENTRAL CONTROL PANEL</span>
      </div>

      {/* Admin Header */}
      <header className="admin-site-header">
        <div className="header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto', padding: '0 50px' }}>
          <div className="header-side-left">
            <span className="admin-badge-indicator">SYSTEM ADMIN</span>
          </div>
          
          <div className="admin-logo">
            <img src="/Logo.webp" alt="KIKO Milano" style={{ height: '40px' }} />
          </div>

          <div className="header-side-right">
            <a href="/" className="return-store-btn" target="_blank" rel="noopener noreferrer">
              RETURN TO STORE 
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '5px' }}><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            </a>
          </div>
        </div>
      </header>

      {/* Action Bar */}
      <div className="dashboard-action-bar" style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 50px 10px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="title-block">
          {activeTab === 'newsletter' ? (
            <>
              <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>NEWSLETTER SYSTEM</h1>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px', letterSpacing: '1px' }}>MANAGE SUBSCRIBERS & PROMOTIONAL CAMPAIGNS</p>
            </>
          ) : activeTab === 'sales' ? (
            <>
              <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                SALES METRICS 
                <span className="live-indicator-wrapper" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', backgroundColor: '#ffeef0', color: '#ff1493', padding: '3px 8px', borderRadius: '12px', fontWeight: '700' }}>
                  <span className="pulse-dot" style={{ width: '6px', height: '6px', backgroundColor: '#ff1493', borderRadius: '50%', display: 'inline-block' }}></span> LIVE
                </span>
              </h1>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px', letterSpacing: '1px' }}>REAL-TIME PERFORMANCE TRACKING</p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>ADMIN CONTROL CENTER</h1>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px', letterSpacing: '1px' }}>SYSTEM OVERVIEW & STATISTICS</p>
            </>
          )}
        </div>
        
        {activeTab === 'products' && !isFormOpen && (
          <button onClick={openAddForm} className="btn-add-product" style={{ background: '#ff1493', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '11px', letterSpacing: '1px' }}>
            + ADD NEW PRODUCT
          </button>
        )}
      </div>

      {/* Sub Navigation Tabs */}
      <div style={{ maxWidth: '1400px', margin: '10px auto 30px auto', padding: '0 50px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #eaeaea', paddingBottom: '15px', minWidth: 'max-content' }}>
          <button onClick={() => { setActiveTab('products'); setIsFormOpen(false); }} className={`admin-nav-btn ${activeTab === 'products' ? 'active' : ''}`} style={{ background: activeTab === 'products' ? '#000' : 'transparent', color: activeTab === 'products' ? '#fff' : '#111', border: '1px solid #ddd', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '11px', letterSpacing: '1px' }}>
            PRODUCTS INVENTORY
          </button>
          <button onClick={() => { setActiveTab('orders'); setIsFormOpen(false); }} className={`admin-nav-btn ${activeTab === 'orders' ? 'active' : ''}`} style={{ background: activeTab === 'orders' ? '#000' : 'transparent', color: activeTab === 'orders' ? '#fff' : '#111', border: '1px solid #ddd', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '11px', letterSpacing: '1px' }}>
            ORDER MANAGEMENT
          </button>
          <button onClick={() => { setActiveTab('customers'); setIsFormOpen(false); }} className={`admin-nav-btn ${activeTab === 'customers' ? 'active' : ''}`} style={{ background: activeTab === 'customers' ? '#000' : 'transparent', color: activeTab === 'customers' ? '#fff' : '#111', border: '1px solid #ddd', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '11px', letterSpacing: '1px' }}>
            REGISTERED CUSTOMERS
          </button>
          <button onClick={() => { setActiveTab('newsletter'); setIsFormOpen(false); }} className={`admin-nav-btn ${activeTab === 'newsletter' ? 'active' : ''}`} style={{ background: activeTab === 'newsletter' ? '#000' : 'transparent', color: activeTab === 'newsletter' ? '#fff' : '#111', border: '1px solid #ddd', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '11px', letterSpacing: '1px' }}>
            NEWSLETTER & CAMPAIGNS
          </button>
          <button onClick={() => { setActiveTab('reviews'); setIsFormOpen(false); }} className={`admin-nav-btn ${activeTab === 'reviews' ? 'active' : ''}`} style={{ background: activeTab === 'reviews' ? '#000' : 'transparent', color: activeTab === 'reviews' ? '#fff' : '#111', border: '1px solid #ddd', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '11px', letterSpacing: '1px' }}>
            PRODUCT REVIEWS
          </button>
          <button onClick={() => { setActiveTab('sales'); setIsFormOpen(false); }} className={`admin-nav-btn ${activeTab === 'sales' ? 'active' : ''}`} style={{ background: activeTab === 'sales' ? '#000' : 'transparent', color: activeTab === 'sales' ? '#fff' : '#111', border: '1px solid #ddd', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '11px', letterSpacing: '1px' }}>
            LIVE SALES METRICS
          </button>
        </div>
      </div>

      {/* Notifications Alert messages */}
      <div style={{ maxWidth: '1400px', margin: '0 auto 20px auto', padding: '0 50px' }}>
        {success && <div className="alert alert-success" style={{ margin: 0, backgroundColor: '#e6ffe6', color: '#1a7f37', padding: '15px', borderRadius: '4px', fontWeight: '600' }}>{success}</div>}
        {error && <div className="alert alert-error" style={{ margin: 0, backgroundColor: '#ffe6e6', color: '#cc0000', padding: '15px', borderRadius: '4px', fontWeight: '600' }}>{error}</div>}
      </div>

      {/* Live System Analytics Metrics Cards */}
      <div className="stats-grid" style={{ maxWidth: '1400px', margin: '0 auto 40px auto', padding: '0 50px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Total Products</span>
            <span className="stat-value">{totalProducts}</span>
          </div>
          <div className="stat-icon-wrapper">🛍️</div>
        </div>
        <div className="stat-card highlighted-card">
          <div className="stat-info">
            <span className="stat-title">Total Sales</span>
            <span className="stat-value">PKR {totalSales.toLocaleString()}</span>
          </div>
          <div className="stat-icon-wrapper">💰</div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Total Orders</span>
            <span className="stat-value">{totalOrders}</span>
          </div>
          <div className="stat-icon-wrapper">📦</div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Total Customers</span>
            <span className="stat-value">{totalCustomers}</span>
          </div>
          <div className="stat-icon-wrapper">👥</div>
        </div>
      </div>

      {/* Primary Tab Content Panel */}
      <div className="table-container" style={{ margin: '0 auto 60px auto' }}>
        
        {/* TAB 1: PRODUCTS INVENTORY */}
        {activeTab === 'products' && (
          <>
            {isFormOpen ? (
              /* Add/Edit Product Form UI */
              <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', border: '1px solid #eaeaea', maxWidth: '800px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '25px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {editingProduct ? 'EDIT PRODUCT DETAILS' : 'REGISTER NEW PRODUCT'}
                </h2>
                
                <form onSubmit={handleSubmitProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#333' }}>Product Name *</label>
                    <input type="text" required value={formVal.name} onChange={(e) => setFormVal({...formVal, name: e.target.value})} placeholder="e.g. 3D Hydra Lipgloss" style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#333' }}>Price (PKR) *</label>
                      <input type="number" required value={formVal.price} onChange={(e) => setFormVal({...formVal, price: e.target.value})} placeholder="e.g. 6210" style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#333' }}>Stock Quantity *</label>
                      <input type="number" required value={formVal.stock} onChange={(e) => setFormVal({...formVal, stock: e.target.value})} style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#333' }}>Category *</label>
                    <select value={formVal.category} onChange={(e) => setFormVal({...formVal, category: e.target.value})} style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit', fontWeight: '600' }}>
                      <option value="LIPS">LIPS</option>
                      <option value="EYES">EYES</option>
                      <option value="FACE">FACE</option>
                      <option value="SKIN CARE">SKIN CARE</option>
                      <option value="ACCESSORIES">ACCESSORIES</option>
                      <option value="HAIR">HAIR</option>
                      <option value="FRAGRANCE">FRAGRANCE</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#333' }}>Product Description</label>
                    <textarea rows="4" value={formVal.description} onChange={(e) => setFormVal({...formVal, description: e.target.value})} placeholder="Describe product details..." style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit', resize: 'vertical' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#333' }}>Product Shades (Comma-separated list)</label>
                    <input type="text" value={formVal.shades} onChange={(e) => setFormVal({...formVal, shades: e.target.value})} placeholder="e.g. 01 Ray, 02 Glow" style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#333' }}>Ingredients Specs</label>
                    <textarea rows="4" value={formVal.ingredients} onChange={(e) => setFormVal({...formVal, ingredients: e.target.value})} placeholder="AQUA, DIMETHICONE, TOCOPHEROL..." style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit', resize: 'vertical' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#333' }}>Product Image {editingProduct ? '(Leave blank to keep current)' : '*'}</label>
                    <input type="file" required={!editingProduct} accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} style={{ padding: '10px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                    <button type="submit" style={{ flex: 1, padding: '14px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', letterSpacing: '1px' }}>
                      {editingProduct ? 'UPDATE PRODUCT' : 'SAVE PRODUCT'}
                    </button>
                    <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: '14px 25px', background: 'transparent', color: '#666', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Standard Table View */
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
                {/* Products Table */}
                <div style={{ flex: '2 1 650px', minWidth: '0' }}>
                  <h3 style={{ marginBottom: '20px', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Products Catalog</h3>
                  <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Product Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product._id}>
                            <td>
                              <div className="table-thumb-container">
                                <img src={`/${product.image}`} className="thumb" alt={product.name} onError={(e) => { e.target.src = '/Logo.webp'; }} />
                              </div>
                            </td>
                            <td className="product-name-cell">{product.name}</td>
                            <td><span className="category-pill">{product.category}</span></td>
                            <td className="price-cell">PKR {product.price.toLocaleString()}</td>
                            <td>
                              <span className={`stock-count ${product.stock < 5 ? 'low-stock-alert' : ''}`}>
                                {product.stock}
                              </span>
                            </td>
                            <td>
                              <div className="action-btns" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <button onClick={() => openEditForm(product)} className="btn-action-edit" style={{ padding: '6px 12px', fontSize: '10px', fontWeight: '700', borderRadius: '4px', cursor: 'pointer', border: '1px solid #000', background: 'none' }}>
                                  EDIT
                                </button>
                                <button onClick={() => handleDeleteProduct(product._id)} className="btn-action-delete" style={{ padding: '6px 12px', fontSize: '10px', fontWeight: '700', borderRadius: '4px', cursor: 'pointer' }}>
                                  DELETE
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sidebar widgets */}
                <div style={{ flex: '1 1 300px' }}>
                  <h3 style={{ marginBottom: '20px', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Store Campaign Sale</h3>
                  <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #eaeaea', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <form onSubmit={handleUpdateDiscount} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '500', color: '#666', lineHeight: '1.5' }}>
                        Apply a global percentage discount to all products across the entire storefront instantly.
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '800', color: '#111', letterSpacing: '0.5px' }}>DISCOUNT PERCENTAGE (%)</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <input 
                            type="number" 
                            min="0" 
                            max="100" 
                            required
                            value={saleVal} 
                            onChange={(e) => setSaleVal(e.target.value)} 
                            style={{ width: '80px', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit', fontWeight: '700', fontSize: '14px', textAlign: 'center' }} 
                          />
                          <span style={{ fontWeight: '800', fontSize: '16px' }}>% OFF</span>
                        </div>
                      </div>

                      {globalDiscount > 0 ? (
                        <div style={{ backgroundColor: '#fff0f6', border: '1px solid #ff1493', color: '#ff1493', padding: '8px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', textAlign: 'center' }}>
                          ★ ACTIVE CAMPAIGN: {globalDiscount}% OFF ALL
                        </div>
                      ) : (
                        <div style={{ backgroundColor: '#f9f9f9', border: '1px solid #ddd', color: '#666', padding: '8px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', textAlign: 'center' }}>
                          NO ACTIVE STORE SALE
                        </div>
                      )}

                      <button type="submit" style={{ padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', letterSpacing: '1px', fontSize: '11px', textTransform: 'uppercase' }}>
                        APPLY SALE DISCOUNT
                      </button>
                    </form>
                  </div>

                  <h3 style={{ marginBottom: '20px', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Top Selling Products</h3>
                  <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #eaeaea', marginBottom: '30px' }}>
                    {topSelling.length === 0 ? (
                      <p style={{ color: '#666', fontSize: '13px' }}>No sales data available yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {topSelling.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f9f9f9', paddingBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={`/${item._id?.image}`} style={{ width: '30px', height: '30px', objectFit: 'contain' }} alt="Product" onError={(e) => { e.target.src = '/Logo.webp'; }} />
                              <span style={{ fontWeight: '600', fontSize: '13px' }}>{item._id?.name || 'Kiko Product'}</span>
                            </div>
                            <span style={{ fontWeight: '700', fontSize: '12px', color: '#ff1493' }}>{item.totalQuantity} sold</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <h3 style={{ marginBottom: '20px', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>System Health</h3>
                  <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #eaeaea' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '600', color: '#666' }}>Low Stock Items:</span>
                        <span style={{ fontWeight: '700', color: lowStockCount > 0 ? '#cc0000' : '#111' }}>{lowStockCount} items</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '600', color: '#666' }}>Database Status:</span>
                        <span style={{ fontWeight: '700', color: '#1a7f37' }}>Connected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: ORDER MANAGEMENT */}
        {activeTab === 'orders' && (
          <div>
            <h3 style={{ marginBottom: '20px', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Customer Orders</h3>
            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Address</th>
                    <th>Total Paid</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '700' }}>#{order._id.substring(0, 8).toUpperCase()}</td>
                      <td>
                        <div style={{ fontSize: '13px', fontWeight: '600' }}>{order.recipientName}</div>
                        <div style={{ fontSize: '11px', color: '#888' }}>{order.customer?.email}</div>
                      </td>
                      <td style={{ fontSize: '12px', maxWidth: '250px' }}>{order.shippingAddress}</td>
                      <td style={{ fontWeight: '700' }}>PKR {order.totalAmount.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${order.status === 'Delivered' ? 'status-delivered' : 'status-processing'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <select 
                          value={order.status} 
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ddd', fontFamily: 'inherit', fontWeight: '600' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: REGISTERED CUSTOMERS */}
        {activeTab === 'customers' && (
          <div>
            <h3 style={{ marginBottom: '20px', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Registered Customers Directory</h3>
            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Date Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((cust) => (
                    <tr key={cust._id}>
                      <td style={{ fontWeight: '700' }}>{cust.name}</td>
                      <td>{cust.email}</td>
                      <td><span className="category-pill" style={{ backgroundColor: '#e8f0fe', color: '#1a73e8' }}>{cust.role}</span></td>
                      <td style={{ color: '#666' }}>{new Date(cust.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PRODUCT REVIEWS */}
        {activeTab === 'reviews' && (
          <div>
            <h3 style={{ marginBottom: '20px', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Customer Product Reviews Moderation</h3>
            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Reviewer</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((rev) => (
                    <tr key={rev._id}>
                      <td style={{ fontWeight: '700' }}>{rev.product?.name || 'Kiko Product'}</td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{rev.customer?.name}</div>
                        <div style={{ fontSize: '10px', color: '#888' }}>{rev.customer?.email}</div>
                      </td>
                      <td style={{ color: '#ff1493', fontWeight: '700' }}>
                        {rev.rating}/5 {'★'.repeat(rev.rating || 0)}
                      </td>
                      <td style={{ fontSize: '13px', fontStyle: 'italic', maxWidth: '300px' }}>"{rev.comment}"</td>
                      <td style={{ textAlign: 'center' }}>
                        <button onClick={() => handleDeleteReview(rev._id)} className="btn-action-delete" style={{ padding: '6px 12px', fontSize: '10px', fontWeight: '700', borderRadius: '4px', cursor: 'pointer' }}>
                          DELETE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: NEWSLETTER & CAMPAIGNS */}
        {activeTab === 'newsletter' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
            
            {/* Left Column: Subscribers List */}
            <div style={{ flex: '1 1 450px', minWidth: '0' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Subscriber Registry</h3>
              <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea', padding: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {subscribers.length === 0 ? (
                    <p style={{ color: '#888', fontSize: '13px', textAlign: 'center' }}>No email subscribers recorded yet.</p>
                  ) : (
                    <table className="admin-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', paddingBottom: '10px' }}>Email Address</th>
                          <th style={{ textAlign: 'right', paddingBottom: '10px' }}>Joined Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscribers.map((sub, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ fontWeight: '600', padding: '12px 0' }}>{sub.email}</td>
                            <td style={{ color: '#666', fontSize: '12px', textAlign: 'right', padding: '12px 0' }}>
                              {new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Campaign Composer & Logs */}
            <div style={{ flex: '1 1 450px', minWidth: '0' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Campaign Composer</h3>
              <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea', padding: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', marginBottom: '25px' }}>
                <form onSubmit={handleSendCampaign} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="form-group-spaced" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label className="kiko-label">Campaign Subject *</label>
                    <input 
                      type="text" 
                      className="kiko-input" 
                      required 
                      value={campaignSubject}
                      onChange={(e) => setCampaignSubject(e.target.value)}
                      placeholder="e.g. Summer Lipstick Mega Sale 💄"
                      style={{ width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div className="form-group-spaced" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label className="kiko-label">Email Body *</label>
                    <textarea 
                      className="kiko-input" 
                      rows="6" 
                      required 
                      value={campaignBody}
                      onChange={(e) => setCampaignBody(e.target.value)}
                      placeholder="Write promotional message details here..."
                      style={{ width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                  </div>
                  <button type="submit" className="kiko-btn" style={{ background: '#000', color: '#fff', padding: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', letterSpacing: '1px', fontSize: '11px', textTransform: 'uppercase' }}>
                    DISPATCH PROMOTIONAL CAMPAIGN
                  </button>
                </form>
              </div>

              <h3 style={{ marginBottom: '20px', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Campaign Send Logs</h3>
              <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea', padding: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', maxHeight: '300px', overflowY: 'auto' }}>
                {campaigns.length === 0 ? (
                  <p style={{ color: '#888', fontSize: '13px', textAlign: 'center' }}>No campaigns sent yet.</p>
                ) : (
                  <table className="admin-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', paddingBottom: '10px' }}>Subject</th>
                        <th style={{ textAlign: 'left', paddingBottom: '10px' }}>Recipients</th>
                        <th style={{ textAlign: 'right', paddingBottom: '10px' }}>Date Sent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((camp, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ fontWeight: '600', padding: '12px 0' }}>{camp.title}</td>
                          <td style={{ padding: '12px 0' }}>
                            <span className="category-pill" style={{ backgroundColor: '#e2f0d9', color: '#385723', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '700' }}>
                              {camp.sentCount} Emails
                            </span>
                          </td>
                          <td style={{ color: '#666', fontSize: '12px', textAlign: 'right', padding: '12px 0' }}>
                            {new Date(camp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 6: LIVE SALES METRICS */}
        {activeTab === 'sales' && (
          <div>
            {/* Stats Overview */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div className="stat-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '25px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Total Completed Orders</span>
                  <h2 style={{ fontSize: '32px', fontWeight: '800', marginTop: '10px', color: '#111' }}>{salesData?.totalOrders || 0}</h2>
                </div>
                <div style={{ fontSize: '32px' }}>📦</div>
              </div>
              <div className="stat-card highlighted-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '25px', background: '#000', color: '#fff', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Accumulated Gross Revenue</span>
                  <h2 style={{ fontSize: '32px', fontWeight: '800', marginTop: '10px', color: '#fff' }}>PKR {salesData?.totalRevenue?.toLocaleString() || 0}</h2>
                </div>
                <div style={{ fontSize: '32px' }}>💎</div>
              </div>
            </div>

            {/* Recent Live Transactions */}
            <h3 style={{ marginBottom: '20px', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Recent Live Transactions</h3>
            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Subtotal Amount</th>
                    <th>Fulfillment Status</th>
                    <th>Transaction Date</th>
                  </tr>
                </thead>
                <tbody>
                  {!salesData?.recentOrders || salesData.recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                        No transactions recorded in database yet.
                      </td>
                    </tr>
                  ) : (
                    salesData.recentOrders.map((ord) => {
                      const shortId = ord._id.substring(0, 8).toUpperCase();
                      const statusClass = ord.status === 'Delivered' ? 'status-delivered' : 'status-processing';
                      return (
                        <tr key={ord._id}>
                          <td style={{ fontWeight: '700', fontFamily: 'monospace', fontSize: '14px' }}>#{shortId}</td>
                          <td style={{ fontWeight: '600' }}>{ord.customer?.name || 'Guest User'}</td>
                          <td style={{ fontWeight: '700' }}>PKR {ord.totalAmount.toLocaleString()}</td>
                          <td>
                            <span className={`status-badge ${statusClass}`} style={{
                              padding: '6px 12px', fontSize: '10px', borderRadius: '20px', fontWeight: '700',
                              backgroundColor: ord.status === 'Delivered' ? '#e2f0d9' : '#fff2cc',
                              color: ord.status === 'Delivered' ? '#385723' : '#b25900'
                            }}>
                              {ord.status}
                            </span>
                          </td>
                          <td style={{ color: '#666', fontSize: '12px' }}>
                            {new Date(ord.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}