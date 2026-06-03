import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, Shield } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Scroll detection for hiding/showing navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Scrolling down and past navbar height
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setIsScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + Number(item.qty), 0);

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''} ${!isVisible ? 'hidden' : ''}`}>
        <div className="container navbar-container">
          <Link to="/" className="navbar-logo" onClick={() => setIsMobileMenuOpen(false)}>
            MAHESHWAGH<span className="text-gradient">_ART</span>
          </Link>

          <ul className={`navbar-links ${isMobileMenuOpen ? 'open' : ''}`}>
            <li><Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
            <li><Link to="/gallery" onClick={() => setIsMobileMenuOpen(false)}>Gallery</Link></li>
            <li><Link to="/art-academy" onClick={() => setIsMobileMenuOpen(false)}>Art Academy</Link></li>
            <li><Link to="/custom-request" onClick={() => setIsMobileMenuOpen(false)}>Custom Request</Link></li>
            <li><Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link></li>
          </ul>

          <div className="navbar-actions">
            <Link to="/cart" className="icon-link cart-link" onClick={() => setIsMobileMenuOpen(false)}>
              <ShoppingCart size={22} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {userInfo ? (
              <div className="user-actions">
                {userInfo.role === 'admin' && (
                  <Link to="/admin" className="icon-link admin-link" title="Admin Dashboard">
                    <Shield size={22} />
                  </Link>
                )}
                <button onClick={handleLogout} className="logout-btn">
                  LOGOUT
                </button>
              </div>
            ) : (
              <Link to="/login" className="login-btn">
                LOGIN
              </Link>
            )}

            <button 
              className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`} 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
        
        {isMobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)} />
        )}
      </nav>
    </>
  );
};

export default Navbar;

