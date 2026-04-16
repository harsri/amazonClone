import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { AddressContext } from '../context/AddressContext';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Checkout.scss';

const DELIVERY_CHARGE = 49;
const TAX_RATE = 0.18;
const FREE_DELIVERY_THRESHOLD = 999;

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { addresses, defaultAddress, loading: addrLoading } = useContext(AddressContext);
  const navigate = useNavigate();

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (defaultAddress) setSelectedAddressId(defaultAddress.id);
  }, [defaultAddress]);

  if (!user) {
    return (
      <div className="checkout__login">
        <h2>Please <Link to="/login">sign in</Link> to place an order.</h2>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout__empty">
        <h2>Your cart is empty.</h2>
        <Link to="/" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  const subtotal = cartTotal;
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const grandTotal = parseFloat((subtotal + deliveryCharge + tax).toFixed(2));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedAddressId) {
      toast.error('Please select a delivery address.');
      return;
    }
    setPlacing(true);
    try {
      await api.post('/orders', { addressId: selectedAddressId, paymentMethod: 'COD' });
      await clearCart();
      toast.success('🎉 Order placed! Please keep cash ready for delivery.', { position: 'top-center', autoClose: 6000 });
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place order.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="checkout">
      <div className="checkout__container">
        <h1 className="checkout__heading">Secure Checkout</h1>

        <div className="checkout__body">
          {/* LEFT COLUMN */}
          <div className="checkout__left">
            {/* STEP 1 — Address */}
            <div className="checkout__section">
              <div className="checkout__stepHeader">
                <span className="checkout__stepNum">1</span>
                <h2>Delivery Address</h2>
                <Link to="/addresses" className="checkout__manageLink">Manage Addresses</Link>
              </div>

              {addrLoading ? (
                <p>Loading addresses...</p>
              ) : addresses.length === 0 ? (
                <div className="checkout__noAddress">
                  <p>You have no saved addresses.</p>
                  <Link to="/addresses" className="btn-primary">Add Address</Link>
                </div>
              ) : (
                <div className="checkout__addressList">
                  {addresses.map((addr, index) => (
                    <label key={addr.id} className={`checkout__addressRow ${selectedAddressId === addr.id ? 'selected' : ''}`}>
                      <input type="radio" name="address" value={addr.id} checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} />
                      <div className="checkout__addressInfo">
                        <strong>{addr.fullName}</strong>
                        {addr.addressLine1}, {addr.city}, {addr.state}, {addr.pincode}, India <br />
                        Phone number: {addr.phone}
                        <div className="checkout__addressLinks">
                          <Link to="/addresses">Edit address</Link> | <Link to="/addresses">Add delivery instructions</Link>
                        </div>
                      </div>
                    </label>
                  ))}
                  <div className="checkout__addAddressRow">
                    <input type="radio" disabled /> <Link to="/addresses" className="checkout__addLink">Add a new address</Link>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2 — Items */}
            <div className="checkout__section">
              <div className="checkout__stepHeader">
                <span className="checkout__stepNum">2</span>
                <h2>Review Items ({cartItems.length})</h2>
              </div>
              <div className="checkout__items">
                {cartItems.map(item => (
                  <div className="checkoutProduct" key={item.id}>
                    <img src={item.product.images?.[0]?.url || 'https://via.placeholder.com/90'} alt={item.product.title} />
                    <div className="checkoutProduct__info">
                      <p className="checkoutProduct__title">{item.product.title}</p>
                      <p className="checkoutProduct__price">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                      <p className="checkoutProduct__qty">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 3 — Payment */}
            <div className="checkout__section">
              <div className="checkout__stepHeader">
                <span className="checkout__stepNum">3</span>
                <h2>Payment Method</h2>
              </div>
              <div className="checkout__paymentOptions">
                <label className="checkout__paymentOption">
                  <input type="radio" name="payment" value="COD" defaultChecked />
                  <div className="checkout__paymentDetails">
                    <strong>Cash on Delivery (COD)</strong>
                    <p>Pay when your order arrives. Keep exact change ready.</p>
                  </div>
                </label>
                <label className="checkout__paymentOption disabled" title="Currently implementing gateway">
                  <input type="radio" name="payment" value="CARD" disabled />
                  <div className="checkout__paymentDetails">
                    <strong>Credit / Debit Card</strong>
                    <div className="checkout__paymentCards">
                      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 36'%3E%3Crect fill='%231A1F71' width='56' height='36' rx='2'/%3E%3Ccircle cx='21' cy='18' r='10' fill='%23EB001B'/%3E%3Ccircle cx='35' cy='18' r='10' fill='%23FF5F00'/%3E%3C/svg%3E" alt="Mastercard" title="Mastercard" />
                      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 32'%3E%3Crect fill='%231434CB' width='48' height='32'/%3E%3Ctext x='24' y='20' font-size='14' fill='white' text-anchor='middle' font-weight='bold'%3EVISA%3C/text%3E%3C/svg%3E" alt="Visa" title="Visa" />
                      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 32'%3E%3Crect fill='%23006FCF' width='48' height='32'/%3E%3Ctext x='24' y='20' font-size='10' fill='white' text-anchor='middle' font-weight='bold'%3EAMEX%3C/text%3E%3C/svg%3E" alt="American Express" title="American Express" />
                    </div>
                    <p style={{color: '#c45500', fontSize: '12px', marginTop: '4px'}}>Payment gateway coming soon.</p>
                  </div>
                </label>
                <label className="checkout__paymentOption disabled" title="Currently implementing gateway">
                  <input type="radio" name="payment" value="UPI" disabled />
                  <div className="checkout__paymentDetails">
                    <strong>UPI / Netbanking</strong>
                    <p>Google Pay, PhonePe, Paytm and more.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — Price Summary */}
          <div className="checkout__right">
            <div className="checkout__summary">
              <h3>Order Summary</h3>
              <div className="checkout__summaryRow">
                <span>Items ({cartItems.reduce((a, i) => a + i.quantity, 0)})</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="checkout__summaryRow">
                <span>Delivery</span>
                <span className={deliveryCharge === 0 ? 'checkout__free' : ''}>
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>
              <div className="checkout__summaryRow">
                <span>GST (18%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <hr />
              <div className="checkout__summaryRow checkout__summaryTotal">
                <strong>Order Total</strong>
                <strong>₹{grandTotal.toFixed(2)}</strong>
              </div>
              {deliveryCharge === 0 && (
                <p className="checkout__freeMsg">🎉 You get FREE delivery!</p>
              )}
              {deliveryCharge > 0 && (
                <p className="checkout__freeHint">Add ₹{(FREE_DELIVERY_THRESHOLD - subtotal).toFixed(0)} more for FREE delivery</p>
              )}
              <button
                className="checkout__placeBtn btn-primary"
                onClick={handlePlaceOrder}
                disabled={placing || addresses.length === 0}
              >
                {placing ? 'Placing Order...' : 'Place Order (COD)'}
              </button>
              <p className="checkout__secureNote">🔒 Safe and Secure Payments. Easy returns. 100% Authentic products.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
