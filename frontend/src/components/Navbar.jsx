import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiChevronDown, FiMapPin, FiPackage, FiHeart, FiHelpCircle, FiLogOut, FiBookOpen, FiUser, FiMenu } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import './Navbar.scss';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const { wishlistItems } = useContext(WishlistContext);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [location, setLocation] = useState({ city: '', pincode: '' });
  const menuRef = useRef(null);

  const cartCount = cartItems.reduce((a, i) => a + i.quantity, 0);

  // Auto-detect location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`);
          const data = await res.json();
          setLocation({ city: data.city || data.locality || 'India', pincode: data.postcode || '' });
        } catch { setLocation({ city: 'India', pincode: '' }); }
      }, () => setLocation({ city: 'India', pincode: '' }));
    }
  }, []);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (category) params.append('category', category);
    navigate(`/?${params.toString()}`);
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className="navbar">
        {/* Logo */}
        <Link to="/" className="navbar__brand">
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" className="navbar__logo" />
          <span className="navbar__brandIn">.in</span>
        </Link>

        {/* Location */}
        <div className="navbar__location" onClick={() => navigate('/addresses')}>
          <FiMapPin className="navbar__locIcon" />
          <div>
            <span className="navbar__locLine1">Deliver to {user?.name?.split(' ')[0] || ''}</span>
            <span className="navbar__locLine2">{location.city || 'Update location'} {location.pincode}</span>
          </div>
        </div>

        {/* Search */}
        <form className="navbar__search" onSubmit={handleSearch}>
          <select className="navbar__searchCategory" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Books">Books</option>
            <option value="Home & Kitchen">Home & Kitchen</option>
            <option value="Beauty & Health">Beauty & Health</option>
            <option value="Sports & Outdoors">Sports & Outdoors</option>
            <option value="Toys & Games">Toys & Games</option>
            <option value="Grocery">Grocery</option>
          </select>
          <input type="text" className="navbar__searchInput" placeholder="Search products, brands and more..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button type="submit" className="navbar__searchIcon"><FiSearch /></button>
        </form>

        {/* Right */}
        <div className="navbar__right">
          <div className="navbar__userMenu" ref={menuRef}>
            <button className="navbar__option" onClick={() => setUserMenuOpen(v => !v)}>
              <span className="navbar__optionLineOne">Hello, {user?.name?.split(' ')[0] || 'Sign in'}</span>
              <span className="navbar__optionLineTwo">Account & Lists <FiChevronDown size={11} /></span>
            </button>
            {userMenuOpen && (
              <div className="navbar__dropdown">
                {user ? (<>
                  <div className="navbar__dropdownHeader"><strong>{user.name}</strong><span>{user.email}</span></div>
                  <Link to="/orders" className="navbar__dropdownItem" onClick={() => setUserMenuOpen(false)}><FiPackage /> Your Orders</Link>
                  <Link to="/addresses" className="navbar__dropdownItem" onClick={() => setUserMenuOpen(false)}><FiMapPin /> Address Book</Link>
                  <Link to="/wishlist" className="navbar__dropdownItem" onClick={() => setUserMenuOpen(false)}><FiHeart /> Wishlist {wishlistItems.length > 0 && <span className="navbar__dropdownBadge">{wishlistItems.length}</span>}</Link>
                  <Link to="/support" className="navbar__dropdownItem" onClick={() => setUserMenuOpen(false)}><FiHelpCircle /> Help & Support</Link>
                  <button className="navbar__dropdownItem navbar__dropdownSignout" onClick={() => { logout(); setUserMenuOpen(false); }}><FiLogOut /> Sign Out</button>
                </>) : (<>
                  <Link to="/login" className="navbar__dropdownSignin" onClick={() => setUserMenuOpen(false)}>Sign In</Link>
                  <p className="navbar__dropdownNew">New customer? <Link to="/login">Start here.</Link></p>
                </>)}
              </div>
            )}
          </div>

          <Link to="/orders" className="navbar__option navbar__hideSmall">
            <span className="navbar__optionLineOne">Returns</span>
            <span className="navbar__optionLineTwo">& Orders</span>
          </Link>

          <Link to="/cart" className="navbar__optionBasket">
            <FiShoppingCart />
            {cartCount > 0 && <span className="navbar__basketCount">{cartCount}</span>}
            <span className="navbar__cartText">Cart</span>
          </Link>
        </div>
      </nav>

      {/* Sub Navbar */}
      <div className="subNavbar">
        <div className="subNavbar__items">
          <div className="subNavbar__item subNavbar__menu" onClick={() => setIsDrawerOpen(true)}>
            <FiMenu size={18} />
            <span>All</span>
          </div>
          <div className="subNavbar__rufus">
            <div className="subNavbar__rufusIcon"></div>
            <span>Rufus</span>
          </div>
          <span className="subNavbar__item">MX Player</span>
          <span className="subNavbar__item">Sell</span>
          <span className="subNavbar__item">Gift Cards</span>
          <span className="subNavbar__item">Amazon Pay</span>
          <span className="subNavbar__item" onClick={() => navigate('/orders')}>Buy Again</span>
          <span className="subNavbar__item">Amazon Basics</span>
          <span className="subNavbar__item">Prime</span>
          <span className="subNavbar__item">Gift Ideas</span>
        </div>
        <div className="subNavbar__banner">
          <strong>Summer Escape Sale</strong> | Flat ₹100 Off on First Order
        </div>
      </div>

      {/* Sidebar Drawer */}
      <div className={`drawerOverlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
      <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer__header">
          <FiUser size={24} />
          <span>Hello, {user?.name?.split(' ')[0] || 'Sign in'}</span>
          <button className="drawer__close" onClick={() => setIsDrawerOpen(false)}>×</button>
        </div>
        <div className="drawer__content">
          <div className="drawer__section">
            <h3>Trending</h3>
            <p>Bestsellers</p>
            <p>New Releases</p>
            <p>Movers and Shakers</p>
          </div>
          <div className="drawer__section">
            <h3>Digital Content and Devices</h3>
            <p>Echo & Alexa</p>
            <p>Fire TV</p>
            <p>Kindle E-Readers & eBooks</p>
            <p>Audible Audiobooks</p>
            <p>Amazon Prime Video</p>
            <p>Amazon Prime Music</p>
          </div>
          <div className="drawer__section">
            <h3>Shop by Category</h3>
            <p>Mobiles, Computers</p>
            <p>TV, Appliances, Electronics</p>
            <p>Men's Fashion</p>
            <p>Women's Fashion</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
