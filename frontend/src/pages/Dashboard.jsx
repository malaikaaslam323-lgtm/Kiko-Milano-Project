import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tracking state
  const [trackingOrder, setTrackingOrder] = useState(null);

  // Check if we just redirected from checkout with a new order
  const newOrderId = location.state?.newOrderId;
  const successOrder = newOrderId ? orders.find(o => o._id === newOrderId) : null;

  // Redirect guest users to login
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch orders from API
  useEffect(() => {
    if (user) {
      axios.get(`${API_BASE_URL}/api/v1/user/orders`)
        .then((response) => {
          setOrders(response.data.data || []);
          setOrdersLoading(false);
        })
        .catch((err) => {
          console.error("Error loading order list:", err);
          setError("Failed to fetch order history.");
          setOrdersLoading(false);
        });
    }
  }, [user]);

  if (authLoading || !user) {
    return <div style={{ textAlign: 'center', padding: '100px' }}><h3>Loading profile...</h3></div>;
  }

  // Get status progress percentage
  const getStatusPercentage = (status) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Processing': return 33;
      case 'Shipped': return 66;
      case 'Delivered': return 100;
      default: return 0;
    }
  };

  return (
    <div className="dashboard-wrapper" style={{ fontFamily: 'Montserrat, sans-serif', padding: '50px 30px' }}>
      
      {/* Post-Checkout Success Card */}
      {successOrder && (
        <div className="order-success-card" style={{ maxWidth: '1200px', margin: '0 auto 40px auto', padding: '40px', background: '#fff', border: '1px solid #ff1493', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 15px rgba(255, 20, 147, 0.1)' }}>
          <div className="success-icon-check" style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ff1493', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 20px auto' }}>
            ✓
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '1px', marginBottom: '10px' }}>ORDER SUCCESSFULLY PLACED</h2>
          <p className="success-message" style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>
            Thank you for your purchase! Your order is being processed. A confirmation detail summary is listed below.
          </p>
          
          <div className="success-grid" style={{ display: 'flex', justifyContent: 'space-around', gap: '20px', flexWrap: 'wrap', marginBottom: '30px', background: '#fafafa', padding: '20px', borderRadius: '6px' }}>
            <div className="success-detail-box" style={{ flex: '1 1 200px' }}>
              <span className="detail-label" style={{ display: 'block', fontSize: '11px', color: '#888', fontWeight: '700', letterSpacing: '1px', marginBottom: '5px' }}>ORDER NUMBER</span>
              <span className="detail-val" style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '15px' }}>
                #{successOrder._id.substring(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="success-detail-box" style={{ flex: '1 1 200px' }}>
              <span className="detail-label" style={{ display: 'block', fontSize: '11px', color: '#888', fontWeight: '700', letterSpacing: '1px', marginBottom: '5px' }}>ESTIMATED DELIVERY</span>
              <span className="detail-val" style={{ fontWeight: '700', fontSize: '15px' }}>3 - 5 Business Days</span>
            </div>
            <div className="success-detail-box" style={{ flex: '1 1 200px' }}>
              <span className="detail-label" style={{ display: 'block', fontSize: '11px', color: '#888', fontWeight: '700', letterSpacing: '1px', marginBottom: '5px' }}>TOTAL PAID</span>
              <span className="detail-val" style={{ fontWeight: '700', fontSize: '15px', color: '#ff1493' }}>
                PKR {successOrder.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="success-summary-list" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '15px' }}>Items Summary</h4>
            {successOrder.items.map((item, index) => (
              <div key={index} className="success-item-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f9f9f9', fontSize: '13px' }}>
                <span className="item-name">
                  {item.product ? item.product.name : 'Premium Product'}{' '}
                  <strong style={{ color: '#ff1493' }}>x{item.quantity}</strong>
                </span>
                <span className="item-total" style={{ fontWeight: '600' }}>
                  PKR {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="dashboard-layout" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Left Side: Avatar Panel */}
        <div className="dashboard-sidebar">
          <div style={{ textAlign: 'center' }}>
            <div className="dashboard-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="dashboard-username">{user.name}</h3>
            <p className="dashboard-email">{user.email}</p>
            
            <div style={{ borderTop: '1px solid #eee', marginTop: '25px', paddingTop: '25px' }}>
              <Link to="/my-account" className="dashboard-action-link">
                MANAGE PROFILE & SECURITY
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Content Area (Tracking + History) */}
        <div className="dashboard-content-area" style={{ flexGrow: 1 }}>
          
          {/* Dynamic Order Tracking Box */}
          {trackingOrder && (
            <div className="dashboard-card" style={{ display: 'block', marginBottom: '40px', padding: '30px', background: '#fff', border: '1px solid #eee', borderRadius: '8px' }}>
              <div className="order-detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="checkout-section-title" style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>ORDER TRACKING</h2>
                <span className="order-detail-id" style={{ fontWeight: '700', color: '#ff1493' }}>
                  #{trackingOrder._id.substring(0, 8).toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '25px' }}>
                <span>Placed: <strong>{new Date(trackingOrder.createdAt).toLocaleDateString()}</strong></span>
                <span>Total: <strong style={{ color: '#ff1493' }}>PKR {trackingOrder.totalAmount.toLocaleString()}</strong></span>
              </div>

              {/* Progress visual bar */}
              <div className="order-tracking-bar" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', height: '4px', background: '#e0e0e0', margin: '30px 10px', borderRadius: '2px' }}>
                <div 
                  className="tracking-progress-fill" 
                  style={{ 
                    position: 'absolute', 
                    height: '100%', 
                    backgroundColor: '#ff1493', 
                    transition: 'width 0.4s ease',
                    width: `${getStatusPercentage(trackingOrder.status)}%` 
                  }}
                />
                
                {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => {
                  const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
                  const curIdx = steps.indexOf(trackingOrder.status);
                  const isDone = idx <= curIdx;
                  
                  return (
                    <div key={step} className="tracking-step" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', top: '-10px' }}>
                      <div className="step-node" style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: isDone ? '#ff1493' : '#fff',
                        color: isDone ? '#fff' : '#666',
                        border: '2px solid #ff1493',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '11px'
                      }}>
                        {idx + 1}
                      </div>
                      <div className="step-label" style={{
                        fontSize: '10px',
                        fontWeight: isDone ? '700' : '500',
                        marginTop: '8px',
                        color: isDone ? '#111' : '#888'
                      }}>
                        {step}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Items specification details */}
              <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '40px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '15px', color: '#222' }}>
                  Order Items
                </h4>
                <div>
                  {trackingOrder.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '10px 0', borderBottom: '1px solid #fafafa' }}>
                      <span>{item.product ? item.product.name : 'Premium Kiko Product'} <strong style={{ color: '#ff1493' }}>x{item.quantity}</strong></span>
                      <span style={{ fontWeight: '600' }}>PKR {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Order History Grid */}
          <div>
            <h2 className="checkout-section-title" style={{ marginBottom: '25px', fontSize: '20px', fontWeight: '800' }}>
              ORDER HISTORY
            </h2>

            {ordersLoading ? (
              <p>Loading your order history...</p>
            ) : error ? (
              <p style={{ color: 'red' }}>{error}</p>
            ) : orders.length === 0 ? (
              <div className="dashboard-card" style={{ textAlign: 'center', padding: '50px 20px', color: '#666', fontSize: '14px', fontWeight: '500' }}>
                No orders placed yet.
              </div>
            ) : (
              <div className="orders-grid">
                {orders.map((order) => (
                  <div key={order._id} className="order-item-card">
                    
                    <div className="order-card-header">
                      <span className="order-card-id">#{order._id.substring(0, 8).toUpperCase()}</span>
                      <span className="order-card-date">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    
                    <div className="order-card-body">
                      <div className="order-card-metric">
                        <span className="metric-label">RECIPIENT</span>
                        <span className="metric-val">{order.recipientName || user.name}</span>
                      </div>
                      <div className="order-card-metric">
                        <span className="metric-label">TOTAL AMOUNT</span>
                        <span className="metric-val" style={{ fontWeight: '800', color: '#111' }}>
                          PKR {order.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="order-card-footer">
                      <span className={`status-badge ${order.status === 'Delivered' ? 'status-delivered' : 'status-processing'}`}>
                        {order.status}
                      </span>
                      <button 
                        className="order-track-btn" 
                        onClick={() => setTrackingOrder(order)}
                      >
                        Track Order
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}