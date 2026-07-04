import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/register`, { name, email, password });
      setLoading(false);
      setSuccess(response.data.message);
      
      // Auto redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "An error occurred during registration.");
    }
  };

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', padding: '60px 20px', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Back button */}
      <Link to="/" className="back-btn" style={{ marginBottom: '20px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        BACK TO HOME
      </Link>

      <div className="auth-card">
        <div className="auth-title">CREATE ACCOUNT</div>

        {error && <div className="flash-msg flash-error">{error}</div>}
        {success && <div className="flash-msg flash-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group-spaced">
            <label className="kiko-label">First & Last name *</label>
            <input 
              type="text" 
              className="kiko-input" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group-spaced">
            <label className="kiko-label">Email address *</label>
            <input 
              type="email" 
              className="kiko-input" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group-spaced">
            <label className="kiko-label">Password *</label>
            <input 
              type="password" 
              className="kiko-input" 
              required 
              minlength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="kiko-btn" disabled={loading}>
            {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
          </button>
        </form>

        <div className="auth-links">
          Already have an account? <br />
          <Link to="/login">Log in here</Link>
        </div>
      </div>
    </div>
  );
}