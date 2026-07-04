import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.role && result.role.toLowerCase() === 'admin') {
        navigate('/admin'); // Redirect admins directly to the control panel!
      } else {
        navigate('/'); // Redirect standard customers to storefront
      }
    } else {
      setError(result.message);
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
        <div className="auth-title">LOGIN</div>

        {/* Display validation errors exactly like EJS flash messages */}
        {error && <div className="flash-msg flash-error">{error}</div>}

        <form onSubmit={handleSubmit}>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="kiko-btn" disabled={loading}>
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>

        <div className="auth-links">
          For more information regarding the processing of your personal data please read our privacy policy.<br /><br />
          Don't have an account? <br />
          <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
}