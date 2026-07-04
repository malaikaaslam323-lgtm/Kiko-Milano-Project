import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

// 1. Create the Context
const CartContext = createContext();

// 2. Create the Provider Component
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [globalDiscount, setGlobalDiscount] = useState(0);

  const fetchDiscount = () => {
    axios.get(`${API_BASE_URL}/api/v1/settings`)
      .then(res => setGlobalDiscount(res.data.globalDiscount || 0))
      .catch(err => console.error("Error fetching global discount:", err));
  };

  useEffect(() => {
    fetchDiscount();
  }, []);

  // Function to add a product to the cart
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      // Check if product is already in the bag
      const existingItem = prevItems.find(item => item._id === product._id);
      
      if (existingItem) {
        // If it exists, increase its quantity by 1
        return prevItems.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      
      // If it's a new item, add it to the bag with a quantity of 1
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // Function to remove a product from the cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter(item => item._id !== productId));
  };

  // Function to update a product's quantity
  const updateCartQuantity = (productId, qty) => {
    setCartItems((prevItems) =>
      prevItems.map(item =>
        item._id === productId ? { ...item, quantity: Math.max(1, qty) } : item
      )
    );
  };

  // Function to clear the cart after checkout
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate total number of items in the cart
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateCartQuantity, cartCount, clearCart, globalDiscount, fetchDiscount }}>
      {children}
    </CartContext.Provider>
  );
}

// 3. Create a custom Hook to easily use this context in components
export const useCart = () => useContext(CartContext);