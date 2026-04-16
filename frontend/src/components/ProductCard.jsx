import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FiHeart, FiTruck, FiInfo } from 'react-icons/fi';
import { FaHeart, FaStar } from 'react-icons/fa';
import { MdTrendingUp } from 'react-icons/md';
import './ProductCard.scss';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isWishlisted } = useContext(WishlistContext);

  const wishlisted = isWishlisted(product.id);

  // Calculate discount percentage
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Format bought count
  const formatBoughtCount = (count) => {
    if (count >= 1000) return Math.round(count / 1000) + 'K+';
    return count + '+';
  };

  // Calculate delivery date (2-3 days from now)
  const getDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow, ' + date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }
    
    return date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Render 5 stars with dynamic filling
  const renderStars = () => {
    const rating = product.ratings || 0;
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      let fillPercentage = 0;
      if (i <= Math.floor(rating)) {
        fillPercentage = 100;
      } else if (i - 1 < rating) {
        fillPercentage = (rating - Math.floor(rating)) * 100;
      }
      
      stars.push(
        <div key={i} className="productCard__starWrapper">
          <FaStar className="productCard__starBackground" />
          <div 
            className="productCard__starFilled" 
            style={{ width: `${fillPercentage}%` }}
          >
            <FaStar className="productCard__starIcon" />
          </div>
        </div>
      );
    }
    return stars;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
    toast.success('Added to cart!', { autoClose: 1500 });
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <Link to={`/product/${product.id}`} className="productCard">
      {product.isPremium && (
        <div className="productCard__sponsored">
          <span>Sponsored</span>
          <FiInfo size={14} />
        </div>
      )}
      <div className="productCard__imgWrap">
        <img src={product.images?.[0]?.url || 'https://picsum.photos/seed/placeholder/280/280'} alt={product.title} />
      </div>
      <div className="productCard__details">
        <div className="productCard__info">
          {product.brand && <p className="productCard__brand">{product.brand}</p>}
          <div className="productCard__titleWrap">
            {product.boughtCount > 500 && <MdTrendingUp className="productCard__trendingIcon" title="Trending" />}
            <p className="productCard__title">{product.title}</p>
          </div>
          <div className="productCard__ratingWrapper">
            <div className="productCard__starsContainer">
              {renderStars()}
            </div>
            <span className="productCard__ratingValue">{product.ratings?.toFixed(1)}</span>
            <span className="productCard__ratingCount">({product.ratingCount?.toLocaleString()})</span>
          </div>
          {product.boughtCount > 0 && (
            <p className="productCard__socialProof">
              {formatBoughtCount(product.boughtCount)} bought in past month
            </p>
          )}
          <div className="productCard__priceSection">
            <p className="productCard__price"><strong>{product.price?.toLocaleString('en-IN')}</strong></p>
            {product.originalPrice && (
              <>
                <p className="productCard__originalPrice">M.R.P. ₹{product.originalPrice?.toLocaleString('en-IN')}</p>
                <p className="productCard__discount">({discount}% off)</p>
              </>
            )}
          </div>
          <p className="productCard__offer">Up to 5% back with Amazon Pay ICICI card</p>
          <p className="productCard__delivery">
            <FiTruck className="productCard__deliveryIcon" /> FREE Delivery <span className="productCard__deliveryDate">{getDeliveryDate()}</span>
          </p>
          {product.stock > 0 && product.stock <= 2 && (
            <p className="productCard__stockWarning">Only {product.stock} left in stock.</p>
          )}
        </div>
      </div>
      <button className="productCard__cartBtn" onClick={handleAddToCart}>Add to Cart</button>
    </Link>
  );
};

export default ProductCard;
