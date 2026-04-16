import React, { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';
import './Wishlist.scss';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  const handleAddToCart = (productId, wishlistId) => {
    addToCart(productId, 1);
    removeFromWishlist(wishlistId);
    toast.success("Moved to cart!");
  };

  return (
    <div className="wishlist">
      <h2 className="wishlist__title">Your Wishlist</h2>
      {wishlistItems.length === 0 ? (
        <p>Your wishlist is currently empty.</p>
      ) : (
        <div className="wishlist__grid">
          {wishlistItems.map((item) => (
             <div className="wishItem" key={item.id}>
                <img src={item.product.images?.[0]?.url || 'https://via.placeholder.com/200x200.png?text=Item'} alt={item.product.title} />
                <div className="wishItem__info">
                  <p>{item.product.title}</p>
                  <strong>₹{item.product.price.toLocaleString('en-IN')}</strong>
                  <div className="wishItem__actions">
                    <button className="btn-primary" onClick={() => handleAddToCart(item.productId, item.id)}>Move to Cart</button>
                    <button className="btn-secondary" onClick={() => removeFromWishlist(item.id)}>Remove</button>
                  </div>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
