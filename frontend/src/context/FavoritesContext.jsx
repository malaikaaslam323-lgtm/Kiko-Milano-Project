import { createContext, useState, useContext } from 'react';

// 1. Create the Context
const FavoritesContext = createContext();

// 2. Create the Provider Component
export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  // Add to Wishlist
  const addToFavorites = (product) => {
    setFavorites((prev) => {
      if (prev.find(item => item._id === product._id)) return prev; // Already liked
      return [...prev, product];
    });
  };

  // Remove from Wishlist
  const removeFromFavorites = (productId) => {
    setFavorites((prev) => prev.filter(item => item._id !== productId));
  };

  // Check if a specific product is liked
  const isFavorite = (productId) => {
    return favorites.some(item => item._id === productId);
  };

  const favoritesCount = favorites.length;

  return (
    <FavoritesContext.Provider value={{ favorites, addToFavorites, removeFromFavorites, isFavorite, favoritesCount }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// 3. Custom hook to consume the Context
export const useFavorites = () => useContext(FavoritesContext);