import React, { useState } from 'react';
import './DiscountBanner.css';

const DiscountBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="discount-banner">
      <div className="container">
        <div className="discount-banner-content">
          <div className="discount-text">
            <strong>Limited Time Offer!</strong>
            <span>Use code <code>WELCOME10</code> for 10% OFF your booking</span>
          </div>
          <button 
            className="discount-close-btn"
            onClick={() => setIsVisible(false)}
            aria-label="Close banner"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscountBanner;
