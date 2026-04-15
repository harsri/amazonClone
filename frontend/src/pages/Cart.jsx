import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.scss';

const Cart = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useContext(CartContext);
  const navigate = useNavigate();

  return (
    <div className="cart">
      <div className="cart__left">
        <img
          className="cart__ad"
          src="https://images-na.ssl-images-amazon.com/images/G/02/UK_CCMP/TM/OCC_Amazon1._CB423492668_.jpg"
          alt="Ad"
        />

        <div>
          <h2 className="cart__title">Your shopping Basket</h2>
          {cartItems.length === 0 ? (
            <p style={{marginTop: '20px'}}>Your Amazon Cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <div className="cartItem" key={item.id}>
                <img className="cartItem__image" src={item.product.images?.[0]?.url || 'https://via.placeholder.com/180x180.png?text=Item'} alt={item.product.title} />
                <div className="cartItem__info">
                  <p className="cartItem__title">{item.product.title}</p>
                  <p className="cartItem__price">
                    <small>$</small>
                    <strong>{(item.product.price * item.quantity).toFixed(2)}</strong>
                  </p>
                  
                  <div className="cartItem__actions">
                     <span className="cartItem__qtyLabel">Qty:</span>
                     <select 
                       value={item.quantity} 
                       onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                     >
                        {[...Array(10).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                     </select>
                     <button className="cartItem__removeBtn" onClick={() => removeFromCart(item.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="cart__right">
        <div className="subtotal">
          <p>
            Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items): <strong>${cartTotal.toFixed(2)}</strong>
          </p>
          <small className="subtotal__gift">
            <input type="checkbox" /> This order contains a gift
          </small>
          <button 
             className="btn-primary" 
             disabled={cartItems.length === 0}
             onClick={() => navigate('/checkout')}
          >
             Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
