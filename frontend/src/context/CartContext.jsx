import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
const backend_url = import.meta.env.VITE_BACKEND_URL;

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, setUser } = useContext(AuthContext);
  const [cart, setCart] = useState({ items: [], subtotal: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  // Helper for auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchCart = async () => {
    if (!user) {
      setCart({ items: [], subtotal: 0, total: 0 });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${backend_url}/api/cart`, {
        headers: getAuthHeaders()
      });
      setCart(response.data);
    } catch (error) {
      
      if (error.response?.status === 401) {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1, size = 'Default') => {
    if (!user) {
      return false;
    }
    try {
      const response = await axios.post(`${backend_url}/api/cart`, {
        productId,
        quantity,
        size
      }, {
        headers: getAuthHeaders()
      });
      if (response.data.cart) {
        setCart(response.data.cart);
      } else {
        await fetchCart();
      }
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 401) {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      return false;
    }
  };

  const updateQuantity = async (productId, quantity, size = 'Default') => {
    if (!user) return;
    try {
      const response = await axios.put(`${backend_url}/api/cart/update`, {
        productId,
        quantity,
        size
      }, {
        headers: getAuthHeaders()
      });
      if (response.data.cart) {
        setCart(response.data.cart);
      } else {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeFromCart = async (productId, size = 'Default') => {
    if (!user) return;
    try {
      const response = await axios.delete(`${backend_url}/api/cart/${productId}?size=${encodeURIComponent(size)}`, {
        headers: getAuthHeaders()
      });
      if (response.data.cart) {
        setCart(response.data.cart);
      } else {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const cartCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, loading, addToCart, updateQuantity, removeFromCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
