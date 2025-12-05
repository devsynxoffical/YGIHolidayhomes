import React from 'react';
import './DiscoverHolidayHomes.css';

const DiscoverHolidayHomes = () => {
  const features = [
    "Premium apartments for rent in Dubai",
    "Expert online profile management",
    "Hassle-free check-in/check-out process",
    "Full guest support with 24/7 availability"
  ];

  return (
    <section className="discover-holiday-homes section">
      <div className="container">
        <div className="discover-content">
          <div className="discover-text">
            <h2 className="discover-title">
              Discover Holiday Homes
            </h2>
            <h3 className="discover-subtitle">
              Explore the best Holiday Homes in Dubai by YGI Holiday Homes
            </h3>
            <p className="discover-description">
              The simple and safe way to find short-term rentals in Dubai.
            </p>

            <div className="discover-main-text">
              <p>
                YGI Holiday Homes specializes in managing luxury holiday homes and affordable apartments in Dubai.
              </p>
            </div>

            <div className="discover-features">
              {features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  </div>
                  <span className="feature-text">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="discover-image">
            <img
              src="/Images/DSC01519.jpg"
              alt="Luxury Dubai apartment interior"
              className="discover-img"
              onError={(e) => {
                console.error('Discover image failed to load:', e.target.src);
                // Fallback to another image
                e.target.src = "/Images/hero1.avif";
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscoverHolidayHomes;
