import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if a user token is already saved in localStorage on startup
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Configure Axios to always send the token in the Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user profile from backend
      axios.get(`${API_BASE_URL}/api/v1/user/profile`)
        .then((response) => {
          setUser(response.data.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Token verification failed:", err);
          logout();
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, { email, password });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch profile data
      const profileResponse = await axios.get(`${API_BASE_URL}/api/v1/user/profile`);
      const loggedInUser = profileResponse.data.data;
      setUser(loggedInUser);
      return { success: true, role: loggedInUser.role };
    } catch (err) {
      console.error("Login failure:", err);
      return { 
        success: false, 
        message: err.response?.data?.message || "Invalid credentials." 
      };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);