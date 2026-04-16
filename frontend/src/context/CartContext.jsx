import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
      setCartTotal(0);
    }
  }, [user]);

  useEffect(() => {
    let total = 0;
    cartItems.forEach(item => {
      total += item.product.price * item.quantity;
    });
    setCartTotal(total);
  }, [cartItems]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setCartItems(response.data.cartItems || []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
        alert('Please login to add items to your cart.');
        return;
    }
    try {
      await api.post('/cart', { productId, quantity });
      fetchCart();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      const errorMsg = error.response?.data?.error || 'Failed to add to cart.';
      toast.error(errorMsg);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      fetchCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove from cart.');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) return removeFromCart(itemId);
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      fetchCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      const errorMsg = error.response?.data?.error || 'Failed to update quantity.';
      toast.error(errorMsg);
      fetchCart(); // Refresh to show actual quantity
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      setCartItems([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  }

  return (
    <CartContext.Provider value={{ cartItems, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
