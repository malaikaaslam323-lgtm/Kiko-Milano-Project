import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    axios.post(`${API_BASE_URL}/api/v1/newsletter/subscribe`, { email })
      .then((res) => {
        setSuccess('Thank you for subscribing to our newsletter! ✨');
        setEmail('');
        setTimeout(() => setSuccess(''), 4000);
      })
      .catch((err) => {
        console.error("Subscription error:", err);
        setError(err.response?.data?.message || 'Error subscribing to newsletter.');
        setTimeout(() => setError(''), 4000);
      });
  };

  return (
    <footer style={{ marginTop: 'auto' }}>
      <div className="footer-columns">
        <div className="footer-col">
          <h4>HELP & SUPPORT</h4>
          <ul>
            <li><Link to="/dashboard">Track Order</Link></li>
            <li><Link to="/dashboard">Returns & Refunds</Link></li>
            <li><a href="#store-locator">Store Locator</a></li>
            <li><Link to="/my-account">Your Account</Link></li>
            <li><a href="#delivery-options">Delivery Options</a></li>
            <li><a href="#return-policy">Return Policy</a></li>
            <li><a href="#privacy-policy">Privacy Policy</a></li>
            <li><a href="#payment-accepted">Payment Accepted</a></li>
            <li><a href="#terms">Terms & Conditions</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>ABOUT KIKO</h4>
          <ul>
            <li><Link to="/contact-us">Contact Us</Link></li>
            <li><a href="#our-brand">Our Brand</a></li>
            <li><a href="#press">Press Releases</a></li>
            <li><a href="#locations">Store Locations</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>JOIN OUR NEWSLETTER</h4>
          <p>Sign up to get the latest beauty news and offers.</p>
          
          <form onSubmit={handleSubscribe} className="newsletter-form" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '300px' }}>
            <div style={{ display: 'flex', gap: '5px', width: '100%' }}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="email-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ flex: 1, padding: '10px', fontSize: '13px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <button type="submit" className="btn-primary subscribe-btn" style={{ padding: '10px 15px', cursor: 'pointer', border: 'none', background: '#000', color: '#fff', fontSize: '12px', fontWeight: '700' }}>
                Subscribe
              </button>
            </div>
            {success && <span style={{ color: '#1a7f37', fontSize: '11px', fontWeight: '700' }}>{success}</span>}
            {error && <span style={{ color: '#cc0000', fontSize: '11px', fontWeight: '700' }}>{error}</span>}
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <p>FOLLOW US ON</p>
        <img src="/Icon_1.png" alt="Instagram" />
        <img src="/Icon_3.png" alt="Facebook" />
      </div>
    </footer>
  );
}
