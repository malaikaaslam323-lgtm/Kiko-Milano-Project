import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';

export default function Checkout() {
  const { cartItems, clearCart, globalDiscount } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if logged out or if cart is empty on initial load
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (cartItems.length === 0) {
        navigate('/cart');
      }
    }
    // Only run on mount and when authentication finishes loading
  }, [user, authLoading, navigate]);

  // Delivery Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'card'
  
  // Card details state (Simulation)
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Coupon Promo Code States
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState(null); // { code: 'KIKO20', discountPercent: 20 }
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Pricing Calculations
  const getItemPrice = (item) => globalDiscount > 0 ? Math.round(item.price * (1 - globalDiscount / 100)) : item.price;
  const subtotal = cartItems.reduce((total, item) => total + (getItemPrice(item) * item.quantity), 0);
  
  // Calculate discount from applied coupon code
  const couponDiscount = activeCoupon ? Math.round(subtotal * (activeCoupon.discountPercent / 100)) : 0;
  
  const shipping = subtotal > 50000 ? 0 : 250;
  const finalTotalAmount = subtotal + shipping - couponDiscount;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    const upperCode = couponCode.toUpperCase().trim();
    let discountPct = 0;

    // Simulated active coupons
    if (upperCode === 'KIKO20') discountPct = 20;
    else if (upperCode === 'WELCOME10') discountPct = 10;
    else if (upperCode === 'GLAM50') discountPct = 50;

    if (discountPct > 0) {
      setActiveCoupon({ code: upperCode, discountPercent: discountPct });
      setCouponSuccess(`Coupon code "${upperCode}" applied! ${discountPct}% OFF.`);
      setCouponError('');
    } else {
      setActiveCoupon(null);
      setCouponError('Invalid code. Try KIKO20, WELCOME10, or GLAM50.');
      setCouponSuccess('');
    }
  };

  if (authLoading || !user) {
    return <div style={{ textAlign: 'center', padding: '100px' }}><h3>Verifying account...</h3></div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic billing validation
    if (!name || !address || !city || !postalCode || !phone) {
      setError('Please fill in all delivery details.');
      setLoading(false);
      return;
    }

    if (paymentMethod === 'card' && (!cardNumber || !expiry || !cvc)) {
      setError('Please enter your simulated credit card details.');
      setLoading(false);
      return;
    }

    try {
      const orderPayload = {
        name,
        address,
        city,
        postalCode,
        phone,
        paymentMethod,
        couponCode: activeCoupon ? activeCoupon.code : '', // Send promo code to database
        items: cartItems.map(item => ({
          _id: item._id,
          quantity: item.quantity,
          price: getItemPrice(item)
        }))
      };

      const response = await axios.post(`${API_BASE_URL}/api/v1/orders`, orderPayload);
      
      // Clear shopping bag
      clearCart();
      setLoading(false);

      // Redirect to dashboard, passing the new order's ID in navigation state
      navigate('/dashboard', { state: { newOrderId: response.data.orderId } });

    } catch (err) {
      console.error("Order submission failure:", err);
      setError(err.response?.data?.message || "Failed to process your order. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="checkout-wrapper" style={{ fontFamily: 'Montserrat, sans-serif', padding: '50px 30px' }}>
      <h1 className="cart-title" style={{ marginBottom: '40px', fontWeight: '800' }}>SECURE CHECKOUT</h1>

      {error && (
        <div style={{ maxWidth: '1200px', margin: '0 auto 20px auto' }}>
          <div className="flash-msg flash-error">{error}</div>
        </div>
      )}

      <div className="checkout-layout" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '50px', flexWrap: 'wrap' }}>
        
        {/* Left Side: Delivery Details & Payments */}
        <div className="checkout-form-section" style={{ flex: '2 1 600px' }}>
          <form onSubmit={handleSubmit}>
            
            <div className="checkout-section-title" style={{ fontSize: '14px', fontWeight: '800', borderBottom: '1px solid #111', paddingBottom: '10px', marginBottom: '25px', letterSpacing: '1px' }}>
              DELIVERY INFORMATION
            </div>
            
            <div className="form-group-spaced">
              <label className="kiko-label">Full Recipient Name *</label>
              <input 
                type="text" 
                className="kiko-input" 
                required 
                placeholder="e.g. Malaika Aslam"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group-spaced" style={{ marginTop: '20px' }}>
              <label className="kiko-label">Street Address *</label>
              <input 
                type="text" 
                className="kiko-input" 
                required 
                placeholder="e.g. House 42, Sector F-6"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
              <div className="form-group-spaced" style={{ flex: 1.5 }}>
                <label className="kiko-label">City *</label>
                <input 
                  type="text" 
                  className="kiko-input" 
                  required 
                  placeholder="e.g. Islamabad"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="form-group-spaced" style={{ flex: 1 }}>
                <label className="kiko-label">Postal Code *</label>
                <input 
                  type="text" 
                  className="kiko-input" 
                  required 
                  placeholder="e.g. 44000"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group-spaced" style={{ marginTop: '20px' }}>
              <label className="kiko-label">Phone Number *</label>
              <input 
                type="tel" 
                className="kiko-input" 
                required 
                placeholder="e.g. +92 300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="checkout-section-title" style={{ fontSize: '14px', fontWeight: '800', borderBottom: '1px solid #111', paddingBottom: '10px', marginTop: '40px', marginBottom: '25px', letterSpacing: '1px' }}>
              PAYMENT METHOD
            </div>
            
            <div className="payment-options" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              <label className={`payment-option-label ${paymentMethod === 'cod' ? 'active' : ''}`} style={{ flex: 1, border: '1px solid #ddd', padding: '15px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="cod" 
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  style={{ accentColor: '#ff1493' }}
                />
                <span style={{ fontSize: '12px', fontWeight: '700' }}>CASH ON DELIVERY (COD)</span>
              </label>

              <label className={`payment-option-label ${paymentMethod === 'card' ? 'active' : ''}`} style={{ flex: 1, border: '1px solid #ddd', padding: '15px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="card" 
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  style={{ accentColor: '#ff1493' }}
                />
                <span style={{ fontSize: '12px', fontWeight: '700' }}>CREDIT / DEBIT CARD</span>
              </label>
            </div>

            {/* Simulated Card Details Form (displayed only when 'card' payment active) */}
            {paymentMethod === 'card' && (
              <div style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '20px', backgroundColor: '#fafafa', marginBottom: '25px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#ff1493', letterSpacing: '1px', marginBottom: '15px' }}>
                  STRIPE SIMULATION ACTIVE
                </div>
                
                <div className="form-group-spaced">
                  <label className="kiko-label">Card Number *</label>
                  <input 
                    type="text" 
                    placeholder="4242 4242 4242 4242" 
                    className="kiko-input" 
                    style={{ letterSpacing: '2px' }}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                  <div className="form-group-spaced" style={{ flex: 1.5 }}>
                    <label className="kiko-label">Expiry Date *</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY" 
                      className="kiko-input"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                    />
                  </div>
                  <div className="form-group-spaced" style={{ flex: 1 }}>
                    <label className="kiko-label">CVC *</label>
                    <input 
                      type="text" 
                      placeholder="123" 
                      className="kiko-input"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="kiko-btn" style={{ marginTop: '20px' }} disabled={loading}>
              {loading ? 'PROCESSING ORDER...' : 'PLACE ORDER'}
            </button>
          </form>
        </div>

        {/* Right Side: Order Summary Card */}
        <div className="cart-summary-section" style={{ flex: '1 1 350px', borderColor: '#eee' }}>
          <h2 className="summary-title" style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Order Summary</h2>
          
          <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
            {cartItems.map((item) => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '75%' }}>
                  <img 
                    src={`/${item.image}`} 
                    alt={item.name}
                    style={{ width: '45px', height: '45px', objectFit: 'contain', background: '#fafafa', borderRadius: '4px', border: '1px solid #eee' }}
                    onError={(e) => { e.target.src = '/Logo.webp'; }} 
                  />
                  <div>
                    <div style={{ fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                      {item.name}
                    </div>
                    <div style={{ color: '#666', fontSize: '11px', marginTop: '2px' }}>Qty: {item.quantity}</div>
                  </div>
                </div>
                <span style={{ fontWeight: '600' }}>PKR {(getItemPrice(item) * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Coupon Input Area */}
          <div style={{ borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', color: '#111' }}>
              Have a Promo Code?
            </div>
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Enter Code (e.g. KIKO20)" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  textTransform: 'uppercase',
                  outline: 'none',
                  backgroundColor: '#fafafa'
                }}
              />
              <button 
                type="submit"
                style={{
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 15px',
                  fontSize: '11px',
                  fontWeight: '750',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  letterSpacing: '1px'
                }}
              >
                APPLY
              </button>
            </form>
            {couponError && <div style={{ color: '#cc0000', fontSize: '11px', fontWeight: '600', marginTop: '8px' }}>{couponError}</div>}
            {couponSuccess && <div style={{ color: '#006600', fontSize: '11px', fontWeight: '600', marginTop: '8px' }}>{couponSuccess}</div>}
          </div>

          <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
            <span>Subtotal</span>
            <span>PKR {subtotal.toLocaleString()}</span>
          </div>

          {activeCoupon && (
            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#ff1493', fontWeight: '700' }}>
              <span>Discount ({activeCoupon.code})</span>
              <span>- PKR {couponDiscount.toLocaleString()}</span>
            </div>
          )}

          <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE' : `PKR ${shipping.toLocaleString()}`}</span>
          </div>

          <div className="summary-row total-row" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #111', paddingTop: '15px', marginTop: '15px', fontSize: '18px', fontWeight: '800' }}>
            <span>Total</span>
            <span style={{ color: '#ff1493' }}>PKR {finalTotalAmount.toLocaleString()}</span>
          </div>
        </div>

      </div>
    </div>
  );
}