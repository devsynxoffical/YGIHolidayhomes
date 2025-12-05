import React, { useState } from 'react';
import PriceDisplay from '../PriceDisplay/PriceDisplay';
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
          src={product.image} 
          alt={product.name}
          className="product-image"
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
        <p className="product-location">{product.location}</p>
        <p className="product-type">{product.type}</p>
        <p className="product-posted">{product.posted}</p>
        <div className="product-bedrooms">
          <span className="bedroom-count">{product.bedrooms}</span>
          <span className="bedroom-icon">🛏️</span>
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
