import React, { useState } from 'react';
import './Footer.css';

const Footer = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    setNewsletterMessage('');
    
    try {
      // Simulate API call for newsletter signup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically send the email to your backend
      console.log('Newsletter signup:', email);
      
      setNewsletterMessage('Thank you for subscribing! You\'ll receive our latest updates.');
      setEmail('');
    } catch (error) {
      setNewsletterMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Footer Columns */}
          <div className="footer-columns">
            <div className="footer-column">
              <h3 className="footer-title">YGI Holiday Homes</h3>
              <ul className="footer-links">
                <li><button className="footer-link" onClick={() => onNavigate('about')}>About Us</button></li>
                <li><button className="footer-link" onClick={() => { console.log('Contact button clicked'); onNavigate('contact'); }}>Contact</button></li>
                <li><button className="footer-link rent-property-btn" onClick={() => onNavigate('expert')}>Rent a Property</button></li>
                <li><button className="footer-link" onClick={() => onNavigate('book')}>Book an Apartment</button></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3 className="footer-title">Explore Properties</h3>
              <ul className="footer-links">
                <li><button className="footer-link" onClick={() => onNavigate('book', null, { city: 'Dubai Marina' })}>Dubai Marina</button></li>
                <li><button className="footer-link" onClick={() => onNavigate('book', null, { city: 'Palm Jumeirah' })}>Palm Jumeirah</button></li>
                <li><button className="footer-link" onClick={() => onNavigate('book', null, { city: 'Downtown Dubai' })}>Downtown Dubai</button></li>
                <li><button className="footer-link" onClick={() => onNavigate('book', null, { city: 'Prime Dubai Location' })}>Prime Dubai Location</button></li>
              </ul>
            </div>


            <div className="footer-column">
              <h3 className="footer-title">Newsletter</h3>
              <p className="footer-description">
                Get updates and stay connected - Subscribe to our newsletter for the latest Dubai properties.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                <div className="newsletter-input-group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="newsletter-input"
                    required
                    disabled={isSubmitting}
                  />
                  <button 
                    type="submit" 
                    className="newsletter-btn"
                    disabled={isSubmitting || !email}
                  >
                    {isSubmitting ? 'Sending...' : 'Send'}
                  </button>
                </div>
                {newsletterMessage && (
                  <div className={`newsletter-message ${newsletterMessage.includes('Thank you') ? 'success' : 'error'}`}>
                    {newsletterMessage}
                  </div>
                )}
              </form>
            </div>
          </div>


          {/* Copyright */}
          <div className="footer-bottom">
            <p className="copyright">© 2025 YGI Holiday Homes</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;