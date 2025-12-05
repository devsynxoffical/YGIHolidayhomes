import React, { useState } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import PriceDisplay from '../PriceDisplay/PriceDisplay';
import './Bestsellers.css';

const Bestsellers = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const bestsellerProducts = [
    {
      id: 2,
      title: "Waterfront 2BHK near Beach • Princess Tower Marina",
      name: "Waterfront 2BHK near Beach • Princess Tower Marina",
      price: 800,
      image: "./2BR in Princess Tower  Furnished  Close to Metro/Living Room/12996379-3a7c-46ce-bb22-678686ede8f9.jpeg",
      images: [
        "./2BR in Princess Tower  Furnished  Close to Metro/Living Room/12996379-3a7c-46ce-bb22-678686ede8f9.jpeg",
        "./2BR in Princess Tower  Furnished  Close to Metro/BR1/188031da-df38-49ab-ac71-ccdd65a7c1e4.jpeg",
        "./2BR in Princess Tower  Furnished  Close to Metro/BR2/027f21fd-508e-4174-a894-fe6eb0a9b03e.avif",
        "./2BR in Princess Tower  Furnished  Close to Metro/kitchen/01695d3d-0834-4278-8fb7-4e894ba2f90c.avif",
        "./2BR in Princess Tower  Furnished  Close to Metro/Balcony/0122b155-7516-46f9-b4d0-d86d930260e0.avif"
      ],
      location: "Princess Tower, Dubai Marina",
      area: "Dubai Marina",
      type: "Apartments for Rent",
      posted: "Available now",
      bedrooms: 2,
      bathrooms: 2,
      guests: 4,
      beds: 3,
      rating: 4.8,
      highlights: ["Smartlock self check-in", "Indoor/Outdoor pools", "Gym", "Kids play", "24/7 security", "Parking"],
      dtcm: "DUB-PRI-YJVVG",
      sleeps: "BR1 — 1 Queen · BR2 — 2 Singles",
      featured: true,
      available: true,
      slug: "waterfront-2bhk-princess-tower-marina-yjvvg"
    },
    {
      id: 3,
      title: "Bright and Spacious 2BR - Dorra Bay",
      name: "Bright and Spacious 2BR - Dorra Bay",
      price: 800,
      image: "./Bright & comfy 2br Dora Bay/Living room/0ff58bc5-ec1f-4c92-ac95-75812ebbcb45.avif",
      images: [
        "./Bright & comfy 2br Dora Bay/Living room/0ff58bc5-ec1f-4c92-ac95-75812ebbcb45.avif",
        "./Bright & comfy 2br Dora Bay/BR1/5e5b5b5b-5e5b-5e5b-5e5b-5e5b5b5b5e5b.avif",
        "./Bright & comfy 2br Dora Bay/BR2/6f6f6f6f-6f6f-6f6f-6f6f-6f6f6f6f6f6f.avif",
        "./Bright & comfy 2br Dora Bay/Kitchen/7a7a7a7a-7a7a-7a7a-7a7a-7a7a7a7a7a7a.avif",
        "./Bright & comfy 2br Dora Bay/Balcony/8b8b8b8b-8b8b-8b8b-8b8b-8b8b8b8b8b8b.avif",
        "./Bright & comfy 2br Dora Bay/Exterior/06938194-63f7-458e-9781-ea4dea29fd89.avif"
      ],
      location: "Dorra Bay Tower, Dubai Marina",
      area: "Dubai Marina",
      type: "Apartments for Rent",
      posted: "Available now",
      bedrooms: 2,
      bathrooms: 2,
      guests: 6,
      beds: 3,
      rating: 4.7,
      highlights: ["Pool", "6-min to JBR Beach", "Walk to Marina Walk & cafés", "Gym", "Kids play", "Parking"],
      dtcm: "MAR-DOR-5FBLR",
      sleeps: "3 queen sized beds",
      featured: false,
      available: true,
      slug: "dorra-bay-2br-bright-comfy-marina-5fblr"
    },
    {
      id: 1,
      title: "Sea View 2BHK in Palm Jumeirah Marina",
      name: "Sea View 2BHK in Palm Jumeirah Marina",
      price: 2000,
      image: "./Marina residency tower 2/Living room/0111eadd-7b05-4a99-841d-100a4f6b1e2a.avif",
      images: [
        "./Marina residency tower 2/Living room/85a505d4-a5e9-4622-9ef3-ad8db3584b31.avif",
        "./Marina residency tower 2/Living room/0111eadd-7b05-4a99-841d-100a4f6b1e2a.avif",
        "./Marina residency tower 2/Exterior/0b0b4845-b6ea-4bf9-93be-e8f5a8aa17d9.avif",
        "./Marina residency tower 2/BR1/578706d0-8963-4cfa-a62c-d8e3a6ed9f2d.avif",
        "./Marina residency tower 2/BR2/57f183de-ff1b-4e07-acef-7426e0d7692f.avif",
        "./Marina residency tower 2/Full kitchen/7c30deba-b07f-48ec-8db0-3b5f6d059302.avif"
      ],
      location: "Marina Residence 2, Palm Jumeirah",
      area: "Palm Jumeirah",
      type: "Apartments for Rent",
      posted: "Available now",
      bedrooms: 2,
      bathrooms: 2,
      guests: 6,
      beds: 3,
      rating: 4.9,
      highlights: ["Steps to beach", "Direct access to Nakheel Mall", "Pool", "Kids pool", "Gym", "Concierge", "Smartlock"],
      dtcm: "PAL-MAR-IFZEN",
      sleeps: "3 Queen sized beds",
      featured: true,
      available: true,
      slug: "palm-jumeirah-marina-res-2-2br-ifzen"
    },
    {
      id: 4,
      title: "Family-friendly yet Affordable 2BHK in Princess Tower Marina",
      name: "Family-friendly yet Affordable 2BHK in Princess Tower Marina",
      price: 800,
      image: "./Family friendly 2BR/Living room/019dc95c-c729-483a-96d6-a128b6f687f2.avif",
      images: [
        "./Family friendly 2BR/Living room/019dc95c-c729-483a-96d6-a128b6f687f2.avif",
        "./Family friendly 2BR/BR1/2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b.avif",
        "./Family friendly 2BR/BR2/3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c3c.avif",
        "./Family friendly 2BR/Kitchen/4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4d.avif",
        "./Family friendly 2BR/Balcony/5e5e5e5e-5e5e-5e5e-5e5e-5e5e5e5e5e5e.avif"
      ],
      location: "Princess Tower, Dubai Marina",
      area: "Dubai Marina",
      type: "Apartments for Rent",
      posted: "Available now",
      bedrooms: 2,
      bathrooms: 2,
      guests: 4,
      beds: 3,
      rating: 4.6,
      highlights: ["Family-friendly", "Kids play area", "Indoor/Outdoor pools", "Gym", "24/7 security", "Parking"],
      dtcm: "DUB-PRI-FAMILY",
      sleeps: "BR1 — 1 Queen · BR2 — 2 Singles",
      featured: false,
      available: true,
      slug: "family-friendly-2bhk-princess-tower-marina"
    }
  ];

  return (
    <section className="bestsellers section">
      <div className="container">
        <div className="bestsellers-header">
          <div className="bestsellers-title-row">
            <h2 className="bestsellers-title">PROPERTIES</h2>
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
                    <line x1="8" y1="6" x2="21" y2="6"/>
                    <line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                </button>
                <button 
                  className={`view-btn grid-view ${viewMode === 'grid' ? 'active' : ''}`} 
                  aria-label="Grid view"
                  onClick={() => handleViewModeChange('grid')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
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
