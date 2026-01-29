import React, { useState } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import PriceDisplay from '../PriceDisplay/PriceDisplay';
import { useProperties } from '../../contexts/PropertiesContext';
import './Bestsellers.css';

const Bestsellers = ({ onNavigate }) => {
  const { properties } = useProperties();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Get the first 4 properties with complete data and images
  const bestsellerProducts = properties
    .filter(prop => prop.images && prop.images.length > 0 && prop.available)
    .slice(0, 4)
    .map(prop => ({
      ...prop, // Spread all original property fields to preserve all flags and data
      name: prop.title,
      image: prop.images[0], // Use first image as main image
      type: "Apartments for Rent",
      posted: "Available now"
    }));

  return (
    <section className="bestsellers section">
      <div className="container">
        <div className="bestsellers-header">
          <div className="bestsellers-title-row">
            <h2 className="bestsellers-title">Featured Properties</h2>
            <div className="bestsellers-controls">
              <div className="sort-controls">
                <label>Sort By</label>
                <select className="sort-select" value={sortBy} onChange={handleSortChange}>
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
              <div className="view-toggle">
                <button
                  className={`view-btn list-view ${viewMode === 'list' ? 'active' : ''}`}
                  aria-label="List view"
                  onClick={() => handleViewModeChange('list')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </button>
                <button
                  className={`view-btn grid-view ${viewMode === 'grid' ? 'active' : ''}`}
                  aria-label="Grid view"
                  onClick={() => handleViewModeChange('grid')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bestsellers-grid grid grid-4">
          {bestsellerProducts.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>

        {/* Explore More Button */}
        <div className="explore-more-section">
          <p className="management-text">
            All our properties are professionally managed by YGI Holiday Homes, providing a smooth, stress-free experience for guests.
          </p>
          <button
            className="explore-more-btn"
            onClick={() => onNavigate('book')}
          >
            Explore More
          </button>
        </div>
      </div>
    </section>
  );
};

export default Bestsellers;
