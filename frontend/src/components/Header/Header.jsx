import React, { useState, useEffect } from 'react';
import GoogleTranslate from '../GoogleTranslate/GoogleTranslate';
import './Header.css';

const Header = ({ onNavigate, currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollDirection = scrollTop > lastScrollY ? 'down' : 'up';
      
      setIsScrolled(scrollTop > 50);
      
      // Hide header when scrolling down, show when scrolling up
      if (scrollTop > 100 && scrollDirection === 'down' && scrollTop - lastScrollY > 5) {
        setIsHidden(true);
      } else if (scrollDirection === 'up' || scrollTop < 100) {
        setIsHidden(false);
      }
      
      setLastScrollY(scrollTop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navigationItems = [
    { name: 'Book an Apartment', page: 'book' },
    { name: 'About Us', page: 'about' }, 
    { name: 'Contact', page: 'contact' },
    { name: 'Rent a Property', page: 'expert' }
  ];



  const handleNavigation = (page) => {
    // If clicking "Book an Apartment" while already on book page, clear search params
    if (page === 'book' && currentPage === 'book') {
      onNavigate(page, null, null); // Clear search parameters
    } else {
      onNavigate(page);
    }
    setIsMenuOpen(false);
  };



  return (
    <>
      {/* Main Header */}
      <header className={`header ${isScrolled ? 'scrolled' : ''} ${isHidden ? 'hidden' : ''} ${currentPage !== 'home' ? 'solid' : ''} ${currentPage === 'about' ? 'transparent' : ''} ${currentPage === 'expert' ? 'transparent' : ''}`}>
        <div className="container">
          <div className="header-content">
            {/* Logo */}
            <div className="logo">
              <button 
                onClick={() => handleNavigation('home')} 
                className="logo-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <img 
                  src="/Images/ygi logo.png2.png" 
                  alt="YGI Holiday Homes" 
                  className="logo-image"
                />
              </button>
            </div>

            {/* Navigation */}
            <nav className="nav">
              <ul className="nav-list">
                {navigationItems.map((item, index) => (
                  <li key={index} className="nav-item">
                    <button 
                      onClick={() => handleNavigation(item.page)}
                      className={`nav-link ${currentPage === item.page ? 'active' : ''} ${item.page === 'expert' ? 'rent-property-btn' : ''}`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Utilities */}
            <div className="header-utilities">
              {/* Google Translate */}
              <div className="utility-item language-selector">
                <GoogleTranslate />
              </div>
              
              

              {/* Mobile Menu Button */}
              <button 
                className="mobile-menu-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
              >
                <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              <ul className="mobile-nav-list">
                {navigationItems.map((item, index) => (
                  <li key={index} className="mobile-nav-item">
                    <button 
                      onClick={() => handleNavigation(item.page)}
                      className={`mobile-nav-link ${currentPage === item.page ? 'active' : ''}`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
              
            </div>
          </div>
        )}
      </header>

    </>
  );
};

export default Header;
