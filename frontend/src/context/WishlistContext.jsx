import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/wishlist');
      setWishlistItems(response.data.wishlist || []);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  };

  const addToWishlist = async (productId) => {
    if (!user) {
        toast.warn('Please login to add items to your wishlist.');
        return;
    }
    try {
      await api.post('/wishlist', { productId });
      fetchWishlist();
      toast.success('Added to Wishlist!');
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      toast.error('Failed to add to wishlist.');
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      await api.delete(`/wishlist/${itemId}`);
      fetchWishlist();
      toast.info('Removed from Wishlist.');
    } catch (error) {
      console.error('Failed to remove item from wishlist:', error);
      toast.error('Failed to remove from wishlist.');
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
