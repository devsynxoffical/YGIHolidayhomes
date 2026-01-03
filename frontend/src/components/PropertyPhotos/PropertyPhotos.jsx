import React, { useState, useEffect } from 'react';
import { getImageUrlWithFallback } from '../../utils/imageUtils';
import { properties } from '../../data/properties';
import './PropertyPhotos.css';

const PropertyPhotos = ({ property, onNavigate }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Centralized property data is now imported from properties.js
  const getPropertyData = () => {
    // Determine local fallback data from central properties.js for legacy records only
    const propertyId = property?.id;
    const isLegacyId = propertyId && (
      (typeof propertyId === 'string' && /^[1-7]$/.test(propertyId)) ||
      (typeof propertyId === 'number' && propertyId >= 1 && propertyId <= 7)
    );

    const localData = isLegacyId ? properties.find(p => p.id === Number(propertyId)) : null;

    // Combine API data with local data if available
    const baseProperty = property ? { ...localData, ...property } : { ...localData };

    // Merge images (API + Local) and deduplicate
    const apiImages = (property && property.images) || [];
    const localImages = (localData && localData.images) || [];
    baseProperty.images = [...new Set([...apiImages, ...localImages])];

    // Ensure title and location
    if (!baseProperty.title) baseProperty.title = localData?.title || 'Property';
    if (!baseProperty.location) baseProperty.location = localData?.location || 'Location not specified';

    return baseProperty;
  };

  const mockProperty = getPropertyData();

  // Ensure we have an images array
  if (!mockProperty.images) {
    mockProperty.images = [];
  }

  // Helper function to extract category from image path/URL
  const getImageCategory = (imagePath) => {
    if (!imagePath) return 'Other';

    const pathStr = typeof imagePath === 'string' ? imagePath : '';

    // 1. Check for explicit category in query param (highest priority, matches admin)
    if (pathStr.includes('category=')) {
      try {
        const urlStr = pathStr.startsWith('http') ? pathStr : `http://dummy.com${pathStr.startsWith('/') ? '' : '/'}${pathStr}`;
        const urlObj = new URL(urlStr);
        const catParam = urlObj.searchParams.get('category');
        if (catParam) {
          // Map slug back to display name
          const categories = ['Living Room', 'Bedroom 1', 'Bedroom 2', 'Bedroom 3', 'Kitchen', 'Dining Room', 'Bathroom 1', 'Bathroom 2', 'Balcony', 'Exterior', 'Other'];
          const found = categories.find(c => c.replace(/\s+/g, '-').toLowerCase() === catParam.toLowerCase());
          if (found) return found;
        }
      } catch (e) { /* ignore */ }
    }

    const lowerPath = pathStr.toLowerCase();

    // 2. Check for category keywords in the path
    if (lowerPath.includes('living room') || lowerPath.includes('livingroom') || lowerPath.includes('living-room')) {
      return 'Living Room';
    }
    if (lowerPath.includes('br1') || lowerPath.includes('bedroom 1') || lowerPath.includes('bedroom-1')) {
      return 'Bedroom 1';
    }
    if (lowerPath.includes('br2') || lowerPath.includes('bedroom 2') || lowerPath.includes('bedroom-2')) {
      return 'Bedroom 2';
    }
    if (lowerPath.includes('br3') || lowerPath.includes('bedroom 3') || lowerPath.includes('bedroom-3')) {
      return 'Bedroom 3';
    }
    if (lowerPath.includes('kitchen') || lowerPath.includes('full kitchen')) {
      return 'Kitchen';
    }
    if (lowerPath.includes('dinning room') || lowerPath.includes('dining area') || lowerPath.includes('dining room') || lowerPath.includes('dining-room')) {
      return 'Dining Room';
    }
    if (lowerPath.includes('bathroom 1') || lowerPath.includes('bathroom-1')) {
      return 'Bathroom 1';
    }
    if (lowerPath.includes('bathroom2') || lowerPath.includes('bathroom 2') || lowerPath.includes('bathroom-2')) {
      return 'Bathroom 2';
    }
    if (lowerPath.includes('balcony')) {
      return 'Balcony';
    }
    if (lowerPath.includes('exterior')) {
      return 'Exterior';
    }
    if (lowerPath.includes('otherpics') || lowerPath.includes('other')) {
      return 'Other';
    }

    return 'Other';
  };

  // Organize images by category
  const imageCategories = {
    all: mockProperty.images,
    'Living Room': mockProperty.images.filter(img => getImageCategory(img) === 'Living Room'),
    'Bedroom 1': mockProperty.images.filter(img => getImageCategory(img) === 'Bedroom 1'),
    'Bedroom 2': mockProperty.images.filter(img => getImageCategory(img) === 'Bedroom 2'),
    'Kitchen': mockProperty.images.filter(img => getImageCategory(img) === 'Kitchen'),
    'Dining Room': mockProperty.images.filter(img => getImageCategory(img) === 'Dining Room'),
    'Bathroom 1': mockProperty.images.filter(img => getImageCategory(img) === 'Bathroom 1'),
    'Bathroom 2': mockProperty.images.filter(img => getImageCategory(img) === 'Bathroom 2'),
    'Balcony': mockProperty.images.filter(img => getImageCategory(img) === 'Balcony'),
    'Exterior': mockProperty.images.filter(img => getImageCategory(img) === 'Exterior'),
    'Other': mockProperty.images.filter(img => getImageCategory(img) === 'Other')
  };

  const currentImages = imageCategories[selectedCategory] || imageCategories.all;

  const handleImageClick = (index) => {
    setSelectedImage(index);
    setIsLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev + 1) % currentImages.length);
  };

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCloseLightbox();
    } else if (e.key === 'ArrowRight') {
      handleNextImage();
    } else if (e.key === 'ArrowLeft') {
      handlePrevImage();
    }
  };

  useEffect(() => {
    if (isLightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen]);

  return (
    <div className="property-photos">
      {/* Header */}
      <div className="photos-header">
        <button
          className="back-btn"
          onClick={() => onNavigate('property-details', property)}
          aria-label="Back to property details"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="header-actions">
          <button className="share-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16,6 12,2 8,6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share
          </button>
          <button className="save-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            Save
          </button>
        </div>
      </div>

      <div className="container">
        {/* Property Info */}
        <div className="property-info">
          <h1>{mockProperty.title}</h1>
          <p className="location">{mockProperty.location}</p>
        </div>

        {/* Photo Tour Section */}
        <div className="photo-tour-section">
          <h2>Photo tour</h2>

          {/* Category Grid */}
          <div className="category-grid">
            {Object.entries(imageCategories).filter(([category, images]) =>
              category !== 'all' && images.length > 0
            ).map(([category, images]) => (
              <div
                key={category}
                className="category-item"
                onClick={() => {
                  setSelectedCategory(category);
                  handleImageClick(0);
                }}
              >
                <img
                  src={getImageUrlWithFallback(images[0])}
                  alt={category}
                  loading="lazy"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    // Fallback to local path
                    const websiteUrl = import.meta.env.VITE_WEBSITE_URL || 'https://www.ygiholidayhomes.com';
                    const imgPath = images[0];
                    if (imgPath && !imgPath.startsWith('http')) {
                      e.target.src = `${websiteUrl}${imgPath.startsWith('/') ? '' : '/'}${imgPath.replace(/^\.\//, '')}`;
                    }
                  }}
                />
                <div className="category-label">{category}</div>
              </div>
            ))}
          </div>
        </div>

        {/* All Photos by Category */}
        <div className="all-photos-section">
          {Object.entries(imageCategories).filter(([category, images]) =>
            category !== 'all' && images.length > 0
          ).map(([category, images]) => (
            <div key={category} className="category-section">
              <h3>{category}</h3>
              <div className="category-photos">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="category-photo"
                    onClick={() => {
                      setSelectedCategory(category);
                      handleImageClick(index);
                    }}
                  >
                    <img
                      src={getImageUrlWithFallback(image)}
                      alt={`${category} ${index + 1}`}
                      loading="lazy"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        // Fallback to local path
                        const websiteUrl = import.meta.env.VITE_WEBSITE_URL || 'https://www.ygiholidayhomes.com';
                        if (image && !image.startsWith('http')) {
                          e.target.src = `${websiteUrl}${image.startsWith('/') ? '' : '/'}${image.replace(/^\.\//, '')}`;
                        }
                      }}
                    />
                    <div className="photo-label">{category} {index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* All Photos Grid (Fall back if categories miss images or to show everything) */}
        <div className="property-section all-images-grid" style={{ marginTop: '40px' }}>
          <h3>All Photos</h3>
          <div className="category-photos">
            {mockProperty.images.map((image, index) => (
              <div
                key={`all-${index}`}
                className="category-photo"
                onClick={() => {
                  setSelectedCategory('all');
                  handleImageClick(index);
                }}
              >
                <img
                  src={getImageUrlWithFallback(image)}
                  alt={`Property ${index + 1}`}
                  loading="lazy"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    // Fallback to local path
                    const websiteUrl = import.meta.env.VITE_WEBSITE_URL || 'https://www.ygiholidayhomes.com';
                    if (image && !image.startsWith('http')) {
                      e.target.src = `${websiteUrl}${image.startsWith('/') ? '' : '/'}${image.replace(/^\.\//, '')}`;
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox */}
        {isLightboxOpen && (
          <div className="lightbox" onClick={handleCloseLightbox}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close" onClick={handleCloseLightbox}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <button className="lightbox-prev" onClick={handlePrevImage}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <button className="lightbox-next" onClick={handleNextImage}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              <img
                src={getImageUrlWithFallback(currentImages[selectedImage])}
                crossOrigin="anonymous"
                onError={(e) => {
                  // Fallback to local path
                  const websiteUrl = import.meta.env.VITE_WEBSITE_URL || 'https://www.ygiholidayhomes.com';
                  const img = currentImages[selectedImage];
                  if (img && !img.startsWith('http')) {
                    e.target.src = `${websiteUrl}${img.startsWith('/') ? '' : '/'}${img.replace(/^\.\//, '')}`;
                  }
                }}
                alt={`${mockProperty.title} - ${selectedCategory} ${selectedImage + 1}`}
                className="lightbox-image"
              />

              <div className="lightbox-counter">
                {selectedImage + 1} / {currentImages.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyPhotos;