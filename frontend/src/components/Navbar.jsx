import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import './Navbar.scss';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (category) params.append('category', category);
    navigate(`/?${params.toString()}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar__left">
        <Link to="/" className="navbar__brand">
          <h2>AmazonClone</h2>
        </Link>
      </div>

      <form className="navbar__search" onSubmit={handleSearch}>
        <select className="navbar__searchCategory" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Regions</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Books">Books</option>
        </select>
        <input 
          type="text" 
          className="navbar__searchInput" 
          placeholder="Search..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit" className="navbar__searchIcon">
          <FiSearch />
        </button>
      </form>

      <div className="navbar__right">
        {user ? (
          <div className="navbar__option" onClick={logout}>
            <span className="navbar__optionLineOne">Hello, {user.name}</span>
            <span className="navbar__optionLineTwo">Sign Out</span>
          </div>
        ) : (
          <Link to="/login" className="navbar__option">
            <span className="navbar__optionLineOne">Hello, Guest</span>
            <span className="navbar__optionLineTwo">Sign In</span>
          </Link>
        )}

        <Link to="/orders" className="navbar__option">
          <span className="navbar__optionLineOne">Returns</span>
          <span className="navbar__optionLineTwo">& Orders</span>
        </Link>
        <Link to="/wishlist" className="navbar__option">
          <span className="navbar__optionLineOne">Your</span>
          <span className="navbar__optionLineTwo">Wishlist</span>
        </Link>
        <Link to="/support" className="navbar__option">
          <span className="navbar__optionLineOne">Support</span>
          <span className="navbar__optionLineTwo">& Help</span>
        </Link>

        <Link to="/cart" className="navbar__optionBasket">
          <FiShoppingCart />
          <span className="navbar__optionLineTwo navbar__basketCount">{cartCount}</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
