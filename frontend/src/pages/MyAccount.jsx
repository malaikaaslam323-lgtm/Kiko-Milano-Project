import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';

export default function MyAccount() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect guest users to login
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user) {
      setName(user.name);
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return <div style={{ textAlign: 'center', padding: '100px' }}><h3>Loading profile...</h3></div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/user/update-profile`, { name, password });
      setSuccess(response.data.message);
      setPassword(''); // Clear the password input
      setLoading(false);

      // Force-refresh the page after 1.5 seconds to reload the new username globally in the header
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.response?.data?.message || "Failed to update profile.");
      setLoading(false);
    }
  };

  return (
    <div className="my-account-wrapper" style={{ fontFamily: 'Montserrat, sans-serif', padding: '60px 20px', minHeight: '80vh' }}>
      <div className="my-account-container" style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', border: '1px solid #eee', padding: '40px', borderRadius: '8px' }}>
        
        <h1 className="my-account-title" style={{ fontSize: '24px', fontWeight: '800', marginBottom: '10px' }}>MY ACCOUNT</h1>
        <p className="my-account-subtitle" style={{ color: '#666', fontSize: '13px', marginBottom: '30px' }}>
          Manage your profile details and security settings below.
        </p>

        {/* Success/Error Alerts */}
        {success && <div className="flash-msg flash-success" style={{ marginBottom: '30px' }}>{success}</div>}
        {error && <div className="flash-msg flash-error" style={{ marginBottom: '30px' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="my-account-form">
          
          <div className="form-group-spaced">
            <label className="kiko-label">Full Name *</label>
            <input 
              type="text" 
              className="kiko-input" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group-spaced" style={{ opacity: 0.7, marginTop: '20px' }}>
            <label className="kiko-label">Email Address (Read Only)</label>
            <input 
              type="email" 
              value={user.email} 
              className="kiko-input" 
              readOnly 
              disabled 
              style={{ cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group-spaced" style={{ marginTop: '30px', borderTop: '1px solid #f5f5f5', paddingTop: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#222', marginBottom: '15px' }}>
              CHANGE PASSWORD
            </div>
            
            <div className="form-group-spaced">
              <label className="kiko-label">New Password</label>
              <input 
                type="password" 
                className="kiko-input" 
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="kiko-btn" style={{ marginTop: '30px' }} disabled={loading}>
            {loading ? 'SAVING CHANGES...' : 'UPDATE PROFILE'}
          </button>
        </form>

      </div>
    </div>
  );
}