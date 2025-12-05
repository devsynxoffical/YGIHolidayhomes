import React, { useState, useEffect } from 'react';
import PriceDisplay from '../PriceDisplay/PriceDisplay';
import './FeaturedProperties.css';

const FeaturedProperties = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('featured-properties');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const properties = [
    {
      id: 1,
      title: "Luxury Marina Apartment",
      location: "Dubai Marina",
      price: 450,
      rating: 4.9,
      reviews: 128,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop",
      type: "Apartment",
      bedrooms: 2,
      bathrooms: 2,
      guests: 4
    },
    {
      id: 2,
      title: "Palm Jumeirah Villa",
      location: "Palm Jumeirah",
      price: 1200,
      rating: 4.8,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&h=300&fit=crop",
      type: "Villa",
      bedrooms: 4,
      bathrooms: 3,
      guests: 8
    },
    {
      id: 3,
      title: "Cozy 2-BR • Marina Residence 2",
      location: "Marina Residence 2, Palm Jumeirah",
      price: 2000,
      rating: 4.9,
      reviews: 156,
      image: "/Marina residency tower 2/Living room/0111eadd-7b05-4a99-841d-100a4f6b1e2a.avif",
      type: "Apartment",
      bedrooms: 2,
      bathrooms: 2,
      guests: 6
    },
    {
      id: 4,
      title: "Downtown Luxury Hotel",
      location: "Downtown Dubai",
      price: 350,
      rating: 4.7,
      reviews: 256,
      image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=500&h=300&fit=crop",
      type: "Hotel",
      bedrooms: 1,
      bathrooms: 1,
      guests: 2
    },
    {
      id: 5,
      title: "Beachfront Penthouse",
      location: "Jumeirah Beach",
      price: 800,
      rating: 4.9,
      reviews: 67,
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&h=300&fit=crop",
      type: "Apartment",
      bedrooms: 3,
      bathrooms: 2,
      guests: 6
    },
    {
      id: 6,
      title: "Business Bay Suite",
      location: "Business Bay",
      price: 280,
      rating: 4.6,
      reviews: 145,
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=300&fit=crop",
      type: "Hotel",
      bedrooms: 1,
      bathrooms: 1,
      guests: 2
    },
    {
      id: 7,
      title: "Arabian Ranches Villa",
      location: "Arabian Ranches",
      price: 650,
      rating: 4.8,
      reviews: 92,
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&h=300&fit=crop",
      type: "Villa",
      bedrooms: 3,
      bathrooms: 2,
      guests: 6
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`star ${index < Math.floor(rating) ? 'filled' : ''}`}
      >
        ★
      </span>
    ));
  };

  const handlePropertyClick = (property) => {
    // Navigate to property details page when property is clicked
    if (onNavigate) {
      onNavigate('property-details', property);
    }
  };

  const handleViewAllClick = () => {
    // Navigate to book apartment page when "View All Properties" is clicked
    if (onNavigate) {
      onNavigate('book');
    }
  };

  return (
    <section id="featured-properties" className="featured-properties">
      <div className="container">
        <div className={`section-header ${isVisible ? 'visible' : ''}`}>
          <h2 className="section-title">Featured Properties</h2>
          <p className="section-subtitle">
            Discover our handpicked selection of luxury accommodations
          </p>
        </div>

        <div className={`properties-grid ${isVisible ? 'visible' : ''}`}>
          {properties.map((property, index) => (
            <div
              key={property.id}
              className="property-card clickable"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handlePropertyClick(property)}
            >
              <div className="property-image">
                <img src={property.image} alt={property.title} />
                <div className="property-type">{property.type}</div>
                <div className="property-overlay">
                  <button className="view-details-btn">View Details</button>
                </div>
              </div>
              
              <div className="property-content">
                <div className="property-header">
                  <h3 className="property-title">{property.title}</h3>
                  <div className="property-location">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {property.location}
                  </div>
                </div>

                <div className="property-details">
                  <div className="property-info">
                    <span className="bedrooms">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 7V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {property.bedrooms} bed
                    </span>
                    <span className="bathrooms">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 6L9 7C9 8.10457 9.89543 9 11 9H13C14.1046 9 15 8.10457 15 7V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 6H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 6V4C9 2.89543 9.89543 2 11 2H13C14.1046 2 15 2.89543 15 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 12H21L20 21H4L3 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {property.bathrooms} bath
                    </span>
                    <span className="guests">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {property.guests} guests
                    </span>
                  </div>

                  <div className="property-rating">
                    <div className="stars">
                      {renderStars(property.rating)}
                    </div>
                    <span className="rating-text">
                      {property.rating} ({property.reviews} reviews)
                    </span>
                  </div>

                  <div className="property-price">
                    <PriceDisplay 
                      price={property.price} 
                      showPeriod={true} 
                      period="/ night"
                      size="medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`view-all-container ${isVisible ? 'visible' : ''}`}>
          <button className="view-all-btn" onClick={handleViewAllClick}>
            View All Properties
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
