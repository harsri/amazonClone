import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__backToTop" onClick={() => window.scrollTo(0, 0)}>
        Back to top
      </div>
      <div className="footer__links">
        <div className="footer__linkCol">
          <h3>Get to Know Us</h3>
          <ul>
            <li><Link to="/support">Careers</Link></li>
            <li><Link to="/support">Blog</Link></li>
            <li><Link to="/support">About Us</Link></li>
          </ul>
        </div>
        <div className="footer__linkCol">
          <h3>Make Money with Us</h3>
          <ul>
            <li><Link to="/support">Sell products on Amazon 247</Link></li>
            <li><Link to="/support">Become an Affiliate</Link></li>
            <li><Link to="/support">Advertise Your Products</Link></li>
          </ul>
        </div>
        <div className="footer__linkCol">
          <h3>Let Us Help You</h3>
          <ul>
            <li><Link to="/support">Your Account</Link></li>
            <li><Link to="/orders">Your Orders</Link></li>
            <li><Link to="/support">Help & Support</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
         <div className="footer__bottomLine">
           <Link to="/support">Conditions of Use & Sale</Link>
           <Link to="/support">Privacy Notice</Link>
           <Link to="/support">Interest-Based Ads</Link>
         </div>
        <p>&copy; 2026 Amazon 247. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
