import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiBookmark } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Cart.scss';

const DELIVERY_CHARGE = 49;
const FREE_DELIVERY_THRESHOLD = 999;

const Cart = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useContext(CartContext);
  const { toggleWishlist } = useContext(WishlistContext);
  const navigate = useNavigate();

  const deliveryCharge = cartTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;

  const handleSaveForLater = (item) => {
    toggleWishlist(item.productId);
    removeFromCart(item.id);
    toast.info('Moved to wishlist / Saved for later');
  };

  return (
    <div className="cart">
      <div className="cart__left">
        <h2 className="cart__title">Shopping Cart</h2>
        <p className="cart__priceLabel">Price</p>
        {cartItems.length === 0 ? (
          <div className="cart__empty">
            <p>Your Amazon Cart is empty.</p>
            <Link to="/" className="btn-primary">Shop today's deals</Link>
          </div>
        ) : (
          cartItems.map(item => (
            <div className="cartItem" key={item.id}>
              <Link to={`/product/${item.productId}`}>
                <img className="cartItem__image" src={item.product.images?.[0]?.url || 'https://picsum.photos/seed/cart/180/180'} alt={item.product.title} />
              </Link>
              <div className="cartItem__info">
                <Link to={`/product/${item.productId}`} className="cartItem__titleLink">
                  <p className="cartItem__title">{item.product.title}</p>
                </Link>
                {item.product.brand && <p className="cartItem__brand">by {item.product.brand}</p>}
                <p className={`cartItem__stock ${item.product.stock > 0 ? 'inStock' : 'outOfStock'}`}>
                  {item.product.stock > 0 ? `✓ ${item.product.stock} in stock` : 'Out of Stock'}
                </p>
                {item.product.stock > 0 && item.product.stock <= 2 && (
                  <p className="cartItem__lowStock">Only {item.product.stock} left - order soon!</p>
                )}
                <div className="cartItem__actions">
                  <label className="cartItem__qty">
                    Qty:
                    <select value={item.quantity} onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}>
                      {[...Array(Math.min(10, item.product.stock)).keys()].map(x => <option key={x + 1} value={x + 1}>{x + 1}</option>)}
                    </select>
                  </label>
                  <span className="cartItem__divider">|</span>
                  <button className="cartItem__actionBtn" onClick={() => removeFromCart(item.id)}><FiTrash2 size={13} /> Delete</button>
                  <span className="cartItem__divider">|</span>
                  <button className="cartItem__actionBtn" onClick={() => handleSaveForLater(item)}><FiBookmark size={13} /> Save for later</button>
                </div>
              </div>
              <p className="cartItem__price">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
            </div>
          ))
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="cart__right">
          <div className="subtotal">
            <div className="subtotal__row"><span>Subtotal ({cartItems.reduce((a, i) => a + i.quantity, 0)} items)</span><span className="subtotal__amount">₹{cartTotal.toLocaleString('en-IN')}</span></div>
            <div className="subtotal__row"><span>Delivery</span><span className={deliveryCharge === 0 ? 'subtotal__free' : ''}>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span></div>
            {deliveryCharge > 0 && <p className="subtotal__hint">Add ₹{(FREE_DELIVERY_THRESHOLD - cartTotal).toFixed(0)} more for FREE delivery</p>}
            <div className="subtotal__total">Estimated Total: <strong>₹{(cartTotal + deliveryCharge).toLocaleString('en-IN')}</strong></div>
            <small className="subtotal__tax">(+ 18% GST calculated at checkout)</small>
            <button className="subtotal__btn" onClick={() => navigate('/checkout')}>Proceed to Buy</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
