import React, { useState } from 'react';
import '../first.css';
import '../style2.css';

export default function ContactUs() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    orderNumber: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', orderNumber: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
      
      {/* Contact header indicator */}
      <div className="admin-top-bar" style={{ background: '#000', color: '#fff', textAlign: 'center', padding: '10px 0', fontSize: '11px', letterSpacing: '2px' }}>
        <span>KIKO MILANO &bull; CUSTOMER CARE CENTER</span>
      </div>

      <main className="contact-premium-wrapper" style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 20px', background: '#fafafa' }}>
        <div className="contact-luxury-card">
          
          {/* Left panel: Info */}
          <div className="contact-info-panel">
            <h1 style={{ fontSize: '38px', fontWeight: '800', letterSpacing: '2px', lineHeight: '1.2', marginBottom: '20px' }}>
              GET IN<br />TOUCH
            </h1>
            <p className="contact-subtitle" style={{ color: '#888', fontSize: '13px', lineHeight: '1.6', marginBottom: '40px' }}>
              We would love to hear from you. Reach out to our customer care team.
            </p>
            
            <div className="info-block" style={{ marginBottom: '25px' }}>
              <h4 style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1px', color: '#111', marginBottom: '5px' }}>
                PHONE SUPPORT
              </h4>
              <p style={{ fontSize: '14px', color: '#666' }}>UAN: 042 111-70-80-90</p>
            </div>

            <div className="info-block" style={{ marginBottom: '25px' }}>
              <h4 style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1px', color: '#111', marginBottom: '5px' }}>
                WHATSAPP
              </h4>
              <p style={{ fontSize: '14px', color: '#666' }}>+92 328 0805456</p>
            </div>

            <div className="info-block">
              <h4 style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1px', color: '#111', marginBottom: '5px' }}>
                HOURS OF OPERATION
              </h4>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                Monday to Saturday<br />
                10:00 AM &mdash; 06:30 PM (PKT)
              </p>
            </div>
          </div>

          {/* Right panel: Form */}
          <div className="contact-form-panel">
            <h2 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '1px', marginBottom: '30px' }}>
              SEND A MESSAGE
            </h2>
            
            {submitted && (
              <div className="flash-msg flash-success" style={{ marginBottom: '20px', backgroundColor: '#e6ffe6', color: '#1a7f37', padding: '12px', borderRadius: '4px', textAlign: 'center', fontWeight: '600', fontSize: '12px' }}>
                Your inquiry has been submitted successfully! We will get back to you shortly.
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group-spaced">
                <label className="kiko-label">Full Name *</label>
                <input 
                  type="text" 
                  className="kiko-input" 
                  required 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                />
              </div>

              <div className="form-group-spaced">
                <label className="kiko-label">Email Address *</label>
                <input 
                  type="email" 
                  className="kiko-input" 
                  required 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                />
              </div>

              <div className="form-group-spaced">
                <label className="kiko-label">Order Number (Optional)</label>
                <input 
                  type="text" 
                  className="kiko-input" 
                  value={form.orderNumber} 
                  onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} 
                />
              </div>
              
              <div className="form-group-spaced">
                <label className="kiko-label">Message *</label>
                <textarea 
                  className="kiko-input" 
                  rows="4" 
                  required 
                  value={form.message} 
                  onChange={(e) => setForm({ ...form, message: e.target.value })} 
                />
              </div>
              
              <button type="submit" className="kiko-btn" style={{ padding: '14px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', letterSpacing: '1px' }}>
                SUBMIT INQUIRY
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}
