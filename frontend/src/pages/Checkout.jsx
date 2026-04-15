import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Checkout.scss';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const { user, updateAddress } = useContext(AuthContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState(user?.address || '');
  const [useSavedAddress, setUseSavedAddress] = useState(!!user?.address);
  // Restrict exactly to CashOnDelivery
  const [paymentMethod, setPaymentMethod] = useState('CashOnDelivery');
  const [placing, setPlacing] = useState(false);

  // Sync address changes if they uncheck useSavedAddress
  useEffect(() => {
    if (useSavedAddress && user?.address) {
      setAddress(user.address);
    } else if (useSavedAddress && !user?.address) {
       setUseSavedAddress(false);
    }
  }, [useSavedAddress, user]);

  if (cartItems.length === 0) {
    return (
      <div className="checkout__empty">
        <h2>Your cart is empty. Please add items to proceed.</h2>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      if (!useSavedAddress || address !== user?.address) {
        if (updateAddress) await updateAddress(address);
      }
      
      await api.post('/orders', {
        address,
        paymentMethod
      });
      await clearCart();
      
      // Flash Modal Trigger via Toast
      toast.success("Order Placed Successfully! Please prepare cash on arrival.", { 
         position: "top-center", 
         autoClose: 5000 
      });
      
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="checkout">
      <div className="checkout__container">
        <h1>Checkout ({cartItems.length} items)</h1>
        
        <form onSubmit={handlePlaceOrder}>
          <div className="checkout__section">
            <div className="checkout__title">
              <h3>Delivery Address</h3>
            </div>
            <div className="checkout__address">
              <p>{user?.email}</p>
              
              {user?.address && (
                <div style={{marginBottom: '10px'}}>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={useSavedAddress} 
                      onChange={(e) => setUseSavedAddress(e.target.checked)} 
                    /> Use Saved Address: {user.address}
                  </label>
                </div>
              )}

              {!useSavedAddress && (
                 <textarea 
                   required 
                   placeholder="Enter full shipping address, e.g., 123 Amazon Way, Seattle, WA" 
                   value={address}
                   onChange={(e) => setAddress(e.target.value)}
                   rows={4}
                 />
              )}
            </div>
          </div>

          <div className="checkout__section">
            <div className="checkout__title">
              <h3>Review Items Make Order</h3>
            </div>
            <div className="checkout__items">
              {cartItems.map(item => (
                <div className="checkoutProduct" key={item.id}>
                  <img src={item.product.images?.[0]?.url || 'https://via.placeholder.com/100x100.png?text=Item'} alt={item.product.title} />
                  <div className="checkoutProduct__info">
                    <p className="checkoutProduct__title">{item.product.title}</p>
                    <p className="checkoutProduct__price">
                      <small>$</small>
                      <strong>{item.product.price}</strong>
                    </p>
                    <p className="checkoutProduct__quantity">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="checkout__section">
            <div className="checkout__title">
              <h3>Payment Method</h3>
            </div>
            <div className="checkout__paymentDetails">
              <div style={{marginBottom: '20px', padding: '10px', backgroundColor: '#f0f2f2', border: '1px solid #D5D9D9', borderRadius: '4px'}}>
                 <strong>Payment Method:</strong> Cash on Delivery (COD) only.
              </div>

              <div className="checkout__priceContainer">
                 <p className="checkout__total">Order Total: <strong>${cartTotal.toFixed(2)}</strong></p>
                 <button className="btn-primary" type="submit" disabled={placing}>
                   {placing ? 'Processing...' : 'Place your order'}
                 </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
