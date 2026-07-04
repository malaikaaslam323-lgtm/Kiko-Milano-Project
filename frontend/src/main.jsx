import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    <FavoritesProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </FavoritesProvider>
    </AuthProvider>
  </StrictMode>,
);