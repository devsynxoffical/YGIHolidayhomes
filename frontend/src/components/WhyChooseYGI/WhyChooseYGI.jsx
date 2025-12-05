import React from 'react';
import './WhyChooseYGI.css';

const WhyChooseYGI = () => {
  const features = [
    {
      id: 1,
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      title: "Prime Dubai Locations",
      description: "Stay steps away from iconic destinations like Palm Jumeirah, Dubai Marina, and Downtown. Our homes are perfectly situated for both leisure and business travelers."
    },
    {
      id: 2,
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      title: "Seamless Guest Experience",
      description: "From 24/7 concierge support to hassle-free check-in, YGI ensures a smooth and stress-free stay so you can focus on what matters—your Dubai experience."
    },
    {
      id: 3,
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9,22 9,12 15,12 15,22" />
        </svg>
      ),
      title: "Luxury & Comfort Combined",
      description: "Our fully furnished properties are styled with modern interiors, spacious layouts, and hotel-quality amenities to give you the comfort of home with the luxury of a resort."
    },
    {
      id: 4,
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <circle cx="12" cy="16" r="1" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      title: "Smart & Secure Living",
      description: "Enjoy the latest smart home features including digital locks, fast Wi-Fi, and round-the-clock security, ensuring peace of mind throughout your stay."
    }
  ];

  return (
    <section className="why-choose-ygi section">
      <div className="container">
        <div className="why-choose-header">
          <h2 className="why-choose-title">
            Why Book with YGI Holiday Homes?
          </h2>
          <p className="why-choose-subtitle">
            Experience the perfect blend of luxury, comfort, and convenience in Dubai's most sought-after locations
          </p>
        </div>

        <div className="why-choose-grid">
          {features.map((feature) => (
            <div key={feature.id} className="why-choose-card">
              <div className="card-icon">
                {feature.icon}
              </div>
              <h3 className="card-title">{feature.title}</h3>
              <p className="card-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseYGI;
