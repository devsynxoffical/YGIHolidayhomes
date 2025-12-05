import React, { useState } from 'react';
import './SearchFilter.css';

const SearchFilter = ({ onNavigate }) => {
  const [searchFilters, setSearchFilters] = useState({
    propertyType: '',
    city: '',
    bedrooms: '',
    bathrooms: '',
    minPrice: '',
    maxPrice: ''
  });

  const handleInputChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Validate that at least one filter is selected
    const hasFilters = Object.values(searchFilters).some(value => value && value !== '');
    
    // Create search parameters object
    const searchParams = {
      propertyType: searchFilters.propertyType || 'All Types',
      city: searchFilters.city || 'All Cities',
      bedrooms: searchFilters.bedrooms || 'Any Bedrooms',
      bathrooms: searchFilters.bathrooms || 'Any Bathrooms',
      minPrice: searchFilters.minPrice || 'Min Price',
      maxPrice: searchFilters.maxPrice || 'Max Price'
    };

    // Navigate to Book an Apartment page with search parameters
    if (onNavigate) {
      onNavigate('book', null, searchParams);
    }
  };

  const handleQuickSearch = (quickSearchTerm) => {
    // Set a quick search and navigate
    const quickSearchParams = {
      propertyType: 'All Types',
      city: quickSearchTerm,
      bedrooms: 'Any Bedrooms',
      bathrooms: 'Any Bathrooms',
      minPrice: 'Min Price',
      maxPrice: 'Max Price'
    };
    
    if (onNavigate) {
      onNavigate('book', null, quickSearchParams);
    }
  };

  return (
    <section className="search-wrap">
      <h1 className="search-title">Find Short Term Rentals In Dubai</h1>

      {/* Quick Search Tags */}
      <div className="quick-search-tags">
        <h3>Popular Searches:</h3>
        <div className="tag-container">
          <button 
            className="quick-tag"
            onClick={() => handleQuickSearch('Dubai Marina')}
          >
            Dubai Marina
          </button>
          <button 
            className="quick-tag"
            onClick={() => handleQuickSearch('Princess Tower')}
          >
            Princess Tower
          </button>
          <button 
            className="quick-tag"
            onClick={() => handleQuickSearch('Downtown Dubai')}
          >
            Downtown Dubai
          </button>
          <button 
            className="quick-tag"
            onClick={() => handleQuickSearch('Urban Oasis')}
          >
            Urban Oasis
          </button>
          <button 
            className="quick-tag"
            onClick={() => handleQuickSearch('Luxury')}
          >
            Luxury
          </button>
          <button 
            className="quick-tag"
            onClick={() => handleQuickSearch('Family')}
          >
            Family Friendly
          </button>
        </div>
      </div>

      <div className="search-card">
        <form className="search-grid" onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div className="field">
            <label>Property Type</label>
            <select 
              value={searchFilters.propertyType}
              onChange={(e) => handleInputChange('propertyType', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Studio">Studio</option>
            </select>
          </div>

          <div className="field">
            <label>Location</label>
            <select 
              value={searchFilters.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
            >
              <option value="">All Cities</option>
              <option value="Dubai Marina">Dubai Marina</option>
              <option value="Downtown Dubai">Downtown Dubai</option>
              <option value="JBR">JBR Beach</option>
              <option value="Palm Jumeirah">Palm Jumeirah</option>
              <option value="Princess Tower">Princess Tower</option>
              <option value="Dorra Bay">Dorra Bay</option>
              <option value="Marina Walk">Marina Walk</option>
              <option value="Burj Khalifa">Burj Khalifa</option>
            </select>
          </div>

          <div className="field">
            <label>Bedrooms</label>
            <select 
              value={searchFilters.bedrooms}
              onChange={(e) => handleInputChange('bedrooms', e.target.value)}
            >
              <option value="">Any Bedrooms</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3 Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
            </select>
          </div>

          {/* Row 2 */}
          <div className="field">
            <label>Bathrooms</label>
            <select 
              value={searchFilters.bathrooms}
              onChange={(e) => handleInputChange('bathrooms', e.target.value)}
            >
              <option value="">Any Bathrooms</option>
              <option value="1">1 Bathroom</option>
              <option value="2">2 Bathrooms</option>
              <option value="3">3 Bathrooms</option>
              <option value="4">4+ Bathrooms</option>
            </select>
          </div>

          <div className="field">
            <label>Min Price</label>
            <select 
              value={searchFilters.minPrice}
              onChange={(e) => handleInputChange('minPrice', e.target.value)}
            >
              <option value="">Min Price</option>
              <option value="500">AED 500</option>
              <option value="800">AED 800</option>
              <option value="1000">AED 1,000</option>
              <option value="1500">AED 1,500</option>
              <option value="2000">AED 2,000</option>
            </select>
          </div>

          <div className="field">
            <label>Max Price</label>
            <select 
              value={searchFilters.maxPrice}
              onChange={(e) => handleInputChange('maxPrice', e.target.value)}
            >
              <option value="">Max Price</option>
              <option value="1000">AED 1,000</option>
              <option value="1500">AED 1,500</option>
              <option value="2000">AED 2,000</option>
              <option value="3000">AED 3,000</option>
              <option value="5000">AED 5,000+</option>
            </select>
          </div>

          {/* Button pinned bottom-right */}
          <div className="actions">
            <button type="submit" className="btn-primary">Search Properties</button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SearchFilter;
