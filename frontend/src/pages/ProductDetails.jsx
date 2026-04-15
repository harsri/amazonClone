import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import './ProductDetails.scss';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const { addToWishlist } = useContext(WishlistContext);
  const [pincode, setPincode] = useState('');
  const [deliveryMsg, setDeliveryMsg] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handlePincodeCheck = async () => {
    try {
      const response = await api.post('/products/pincode', { pincode });
      setDeliveryMsg(response.data.message);
    } catch (error) {
      setDeliveryMsg("Error checking pincode or invalid pincode.");
    }
  };

  const handleBuyNow = () => {
    addToCart(product.id, 1);
    navigate('/checkout');
  };

  if (loading) return <div className="productDetails__loading">Loading...</div>;
  if (!product) return <div className="productDetails__loading">Product not found.</div>;

  return (
    <div className="productDetails">
      <div className="productDetails__left">
        <img 
          src={product.images?.[0]?.url || 'https://via.placeholder.com/400x400.png?text=Product'} 
          alt={product.title} 
        />
      </div>

      <div className="productDetails__center">
        <h2>{product.title}</h2>
        <div className="productDetails__rating">
          {Array(Math.floor(product.ratings)).fill().map((_, i) => <span key={i}>🌟</span>)}
        </div>
        <hr />
        <p className="productDetails__price">
          Price: <strong>${product.price}</strong>
        </p>
        <p className="productDetails__description">{product.description}</p>
        <hr />
        <div className="productDetails__delivery">
          <h4>Check Delivery Availability</h4>
          <div className="pincode__input">
             <input type="text" placeholder="Enter Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
             <button onClick={handlePincodeCheck} className="btn-secondary">Check</button>
          </div>
          {deliveryMsg && <p className="delivery__msg">{deliveryMsg}</p>}
        </div>
      </div>

      <div className="productDetails__right">
        <div className="productDetails__checkoutBox">
          <p className="price">${product.price}</p>
          <p className="stockStatus">{product.stock > 0 ? 'In Stock.' : 'Out of Stock.'}</p>
          
          <button 
             className="btn-primary" 
             style={{backgroundColor: '#ffa41c', borderColor: '#ff8f00', marginBottom: '10px'}}
             onClick={() => { addToCart(product.id, 1); toast.success("Added to cart"); }}
             disabled={product.stock <= 0}
          >
            Add to Cart
          </button>

          <button 
             className="btn-primary" 
             onClick={handleBuyNow}
             disabled={product.stock <= 0}
          >
            Buy Now
          </button>
          
          <button 
             className="btn-secondary" 
             style={{marginTop: '10px'}}
             onClick={() => { addToWishlist(product.id); }}
          >
            Add to Wishlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
