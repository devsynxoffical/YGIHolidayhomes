import React, { useState } from 'react';
import PriceDisplay from '../PriceDisplay/PriceDisplay';
import { getImageUrlWithFallback } from '../../utils/imageUtils';
import './ProductCard.css';

const ProductCard = ({ product, onNavigate }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showConfigurator, setShowConfigurator] = useState(false);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleConfiguratorHover = () => {
    setShowConfigurator(true);
  };

  const handleConfiguratorLeave = () => {
    setShowConfigurator(false);
  };

  const handleCardClick = () => {
    // Navigate to property details page when property card is clicked
    if (onNavigate) {
      onNavigate('property-details', product);
    }
  };

  return (
    <div className="product-card clickable" onClick={handleCardClick}>
      <div className="product-image-container">
        <img 
          src={getImageUrlWithFallback(product.image || (product.images && product.images[0]))} 
          alt={product.name}
          className="product-image"
          crossOrigin="anonymous"
          onError={(e) => {
            // Fallback to placeholder if all attempts fail
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
            e.target.style.objectFit = 'contain';
          }}
        />
        
        {/* Featured Badge */}
        {product.featured && <span className="badge featured">Featured</span>}
        
        {/* Rating Badge */}
        <div className="rating-badge">
          <span className="star">★</span>
          <span>{product.rating}</span>
        </div>
        
        {/* Wishlist Button */}
        <button 
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.title || product.name}</h3>
        <div className="product-location-area">
          <p className="product-location">{product.location}</p>
          {product.area && (
            <p className="product-area">📍 {product.area}</p>
          )}
        </div>
        {product.description && (
          <p className="product-description">{product.description}</p>
        )}
        <div className="product-details">
          <div className="product-bedrooms">
            <span className="bedroom-count">{product.bedrooms}</span>
            <span className="bedroom-icon">🛏️</span>
          </div>
          {product.bathrooms && (
            <div className="product-bathrooms">
              <span className="bathroom-count">{product.bathrooms}</span>
              <span className="bathroom-icon">🛁</span>
            </div>
          )}
          {product.guests && (
            <div className="product-guests">
              <span className="guest-count">{product.guests}</span>
              <span className="guest-icon">👥</span>
            </div>
          )}
          {product.beds && (
            <div className="product-beds">
              <span className="beds-count">{product.beds}</span>
              <span className="beds-icon">🛏️</span>
            </div>
          )}
        </div>
        {product.sleeps && (
          <p className="product-sleeps">💤 {product.sleeps}</p>
        )}
        {product.highlights && product.highlights.length > 0 && (
          <div className="product-highlights">
            {product.highlights.slice(0, 3).map((highlight, index) => (
              <span key={index} className="highlight-tag">{highlight}</span>
            ))}
            {product.highlights.length > 3 && (
              <span className="highlight-more">+{product.highlights.length - 3} more</span>
            )}
          </div>
        )}
        {product.amenities && product.amenities.length > 0 && (
          <div className="product-amenities">
            <h4 className="amenities-title">What this place offers:</h4>
            <div className="amenities-list">
              {product.amenities.slice(0, 6).map((amenity, index) => (
                <span key={index} className="amenity-tag">
                  {amenity.length > 20 ? amenity.substring(0, 20) + '...' : amenity}
                </span>
              ))}
              {product.amenities.length > 6 && (
                <span className="amenity-more">+{product.amenities.length - 6} more amenities</span>
              )}
            </div>
          </div>
        )}
        <div className="product-meta">
          <p className="product-type">{product.type}</p>
          <p className="product-posted">{product.posted}</p>
        </div>
        <div className="product-price">
          <PriceDisplay 
            price={product.price} 
            showPeriod={true} 
            period="/ Per Night"
            size="medium"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
