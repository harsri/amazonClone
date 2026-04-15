import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import './ProductCard.scss';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { addToWishlist } = useContext(WishlistContext);

  const handleAddToCart = () => {
    addToCart(product.id, 1);
    toast.success(`${product.title} added to cart!`);
  };

  return (
    <div className="productCard">
      <div className="productCard__actionsOverlay">
         <FiHeart className="productCard__wishlistIcon" onClick={() => addToWishlist(product.id)} title="Add to Wishlist" />
      </div>
      <div className="productCard__info">
        <Link to={`/product/${product.id}`} className="productCard__link">
          <p className="productCard__title">{product.title}</p>
        </Link>
        <p className="productCard__price">
          <small>$</small>
          <strong>{product.price}</strong>
        </p>
        <div className="productCard__rating">
          {Array(Math.floor(product.ratings))
            .fill()
            .map((_, i) => (
              <p key={i}>🌟</p>
            ))}
        </div>
      </div>
      <Link to={`/product/${product.id}`} className="productCard__link">
        <img
          src={product.images?.[0]?.url || 'https://via.placeholder.com/300x300.png?text=Product+Image'}
          alt={product.title}
        />
      </Link>
      <button className="btn-primary" onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
