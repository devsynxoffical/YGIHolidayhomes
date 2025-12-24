import { useState, useEffect } from 'react';
import './PropertyForm.css';

function PropertyForm({ apiBaseUrl, token, property, onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    metaTitle: '',
    metaDescription: '',
    area: '',
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    beds: 3,
    price: 0,
    rating: 4.5,
    location: '',
    highlights: [],
    dtcm: '',
    sleeps: '',
    featured: false,
    available: true,
    slug: '',
    description: '',
    images: [], // Always initialize as array
    space: {
      kitchen: '',
      living: '',
      facilities: ''
    },
    sleeping: [],
    access: [],
    rules: [],
    amenities: [],
    guestAccess: '',
    otherNotes: '',
    excludeDiscount: false,
    excludeCleaningFee: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [highlightInput, setHighlightInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [amenityInput, setAmenityInput] = useState('');
  const [ruleInput, setRuleInput] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedImageCategory, setSelectedImageCategory] = useState('Living Room');
  const [imageFallbacks, setImageFallbacks] = useState({}); // Store fallback URLs for each image
  
  // Image categories matching the frontend PropertyPhotos component
  const imageCategories = [
    'Living Room',
    'Bedroom 1',
    'Bedroom 2',
    'Bedroom 3',
    'Kitchen',
    'Dining Room',
    'Bathroom 1',
    'Bathroom 2',
    'Balcony',
    'Exterior',
    'Other'
  ];
  
  // Ensure inputs always have string values (not undefined)
  useEffect(() => {
    if (highlightInput === undefined) setHighlightInput('');
    if (imageInput === undefined) setImageInput('');
    if (amenityInput === undefined) setAmenityInput('');
    if (ruleInput === undefined) setRuleInput('');
  }, []);

  useEffect(() => {
    if (property) {
      console.log('Loading property for editing:', property);
      console.log('Property images:', property.images);
      
      // Process images: Use stored URLs directly (they should be full URLs from MongoDB)
      // For old relative paths, we'll try to convert them, but prefer stored full URLs
      const websiteUrl = import.meta.env.VITE_WEBSITE_URL || 'https://www.ygiholidayhomes.com';
      
      const processedImages = (property.images || []).map((img, idx) => {
        const imageUrl = typeof img === 'string' ? img : (img?.url || img);
        
        if (!imageUrl || !imageUrl.trim()) return null;
        
        const trimmedUrl = imageUrl.trim();
        
        // If it's already a full URL (http/https), use it directly
        if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
          return { original: trimmedUrl, urls: [trimmedUrl] };
        }
        
        // If it's a MongoDB API path (/api/images/...), make it full URL
        if (trimmedUrl.includes('/api/images/')) {
          const fullUrl = trimmedUrl.startsWith('/api/images/') 
            ? `${apiBaseUrl}${trimmedUrl}`
            : trimmedUrl.startsWith('api/images/')
            ? `${apiBaseUrl}/${trimmedUrl}`
            : trimmedUrl;
          return { original: trimmedUrl, urls: [fullUrl] };
        }
        
        // For old relative paths (starting with ./), try MongoDB first
        // Only add website URL fallback if not on localhost (to avoid CORS issues)
        if (trimmedUrl.startsWith('./')) {
          const cleanPath = trimmedUrl.replace(/^\.\//, '').replace(/\\/g, '/');
          const encodedFilename = encodeURIComponent(cleanPath);
          const mongoUrl = `${apiBaseUrl}/api/images/filename/${encodedFilename}`;
          
          // Only add website URL fallback if not on localhost
          const urls = [mongoUrl];
          if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
            const websitePath = cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;
            const websiteFullUrl = `${websiteUrl}${websitePath}`;
            urls.push(websiteFullUrl);
          }
          
          return { original: trimmedUrl, urls };
        }
        
        // If it's a relative path without ./, try MongoDB
        // Only add website URL fallback if not on localhost
        if (!trimmedUrl.startsWith('http') && !trimmedUrl.startsWith('/api')) {
          const encodedFilename = encodeURIComponent(trimmedUrl);
          const mongoUrl = `${apiBaseUrl}/api/images/filename/${encodedFilename}`;
          
          const urls = [mongoUrl];
          if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
            const cleanPath = trimmedUrl.startsWith('/') ? trimmedUrl : '/' + trimmedUrl;
            const websiteFullUrl = `${websiteUrl}${cleanPath}`;
            urls.push(websiteFullUrl);
          }
          
          return { original: trimmedUrl, urls };
        }
        
        return { original: trimmedUrl, urls: [trimmedUrl] };
      }).filter(img => img !== null); // Remove any null/undefined
      
      // Extract just the URLs for formData (use the first URL of each, which is the preferred one)
      const imageUrls = processedImages.map(img => img.urls[0]);
      
      // Store fallback URLs for error handling
      const fallbacks = {};
      processedImages.forEach((img, idx) => {
        if (img.urls.length > 1) {
          fallbacks[idx] = img.urls.slice(1); // All URLs except the first
        }
      });
      setImageFallbacks(fallbacks);
      
      console.log('Processed images for preview:', processedImages);
      console.log('Image URLs for formData:', imageUrls);
      console.log('Image fallbacks:', fallbacks);
      
      setFormData({
        title: property.title || '',
        metaTitle: property.metaTitle || '',
        metaDescription: property.metaDescription || '',
        area: property.area || '',
        bedrooms: property.bedrooms || 2,
        bathrooms: property.bathrooms || 2,
        guests: property.guests || 4,
        beds: property.beds || 3,
        price: property.price || 0,
        rating: property.rating || 4.5,
        location: property.location || '',
        highlights: property.highlights || [],
        dtcm: property.dtcm || '',
        sleeps: property.sleeps || '',
        featured: property.featured || false,
        available: property.available !== undefined ? property.available : true,
        slug: property.slug || '',
        description: property.description || '',
        images: imageUrls,
        space: property.space || { kitchen: '', living: '', facilities: '' },
        sleeping: property.sleeping || [],
        access: property.access || [],
        rules: property.rules || [],
        amenities: property.amenities || [],
        guestAccess: property.guestAccess || '',
        otherNotes: property.otherNotes || '',
        excludeDiscount: property.excludeDiscount || false,
        excludeCleaningFee: property.excludeCleaningFee || false
      });
    } else {
      // Reset form when no property is selected
      setFormData({
        title: '',
        metaTitle: '',
        metaDescription: '',
        area: '',
        bedrooms: 2,
        bathrooms: 2,
        guests: 4,
        beds: 3,
        price: 0,
        rating: 4.5,
        location: '',
        highlights: [],
        dtcm: '',
        sleeps: '',
        featured: false,
        available: true,
        slug: '',
        description: '',
        images: [],
        space: { kitchen: '', living: '', facilities: '' },
        sleeping: [],
        access: [],
        rules: [],
        amenities: [],
        guestAccess: '',
        otherNotes: '',
        excludeDiscount: false,
        excludeCleaningFee: false
      });
      setImageFallbacks({});
    }
  }, [property, apiBaseUrl]);

  // Ensure inputs always have string values (not undefined) to fix controlled input warning
  useEffect(() => {
    if (highlightInput === undefined) setHighlightInput('');
    if (imageInput === undefined) setImageInput('');
    if (amenityInput === undefined) setAmenityInput('');
    if (ruleInput === undefined) setRuleInput('');
  }, [highlightInput, imageInput, amenityInput, ruleInput]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayAdd = (field, value) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));
  };

  const handleArrayRemove = async (field, index) => {
    // If removing an image, also delete it from MongoDB
    if (field === 'images') {
      const imageUrl = formData.images[index];
      if (imageUrl) {
        // Extract imageId from URL (format: https://domain/api/images/{imageId})
        const imageIdMatch = imageUrl.match(/\/api\/images\/([a-fA-F0-9]{24})/);
        if (imageIdMatch && imageIdMatch[1]) {
          const imageId = imageIdMatch[1];
          try {
            const response = await fetch(`${apiBaseUrl}/api/admin/images/${imageId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              console.log('✅ Image deleted from MongoDB:', imageId);
            } else {
              console.warn('⚠️ Failed to delete image from MongoDB:', imageId);
            }
          } catch (err) {
            console.error('Error deleting image from MongoDB:', err);
            // Continue with removal from form even if MongoDB deletion fails
          }
        }
      }
      
      // Update fallbacks when removing images
      setImageFallbacks(prev => {
        const newFallbacks = {};
        // Reindex fallbacks after removal
        Object.keys(prev).forEach(key => {
          const keyNum = parseInt(key);
          if (keyNum < index) {
            newFallbacks[keyNum] = prev[key];
          } else if (keyNum > index) {
            newFallbacks[keyNum - 1] = prev[key];
          }
          // Skip the removed index
        });
        return newFallbacks;
      });
    }
    
    // Remove from form data
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleObjectArrayAdd = (field, obj) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], obj]
    }));
  };

  const handleObjectArrayRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    setError('');

    try {
      const uploadPromises = files.map(async (file, index) => {
        const formData = new FormData();
        formData.append('image', file);
        // Create filename with category prefix for better organization
        const categoryPrefix = selectedImageCategory.replace(/\s+/g, '-').toLowerCase();
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const filename = `${categoryPrefix}_${timestamp}_${index}.${fileExtension}`;
        
        formData.append('filename', filename);
        formData.append('propertyId', property?.id || '');
        formData.append('category', selectedImageCategory); // Use selected category

        setUploadProgress(prev => ({ ...prev, [index]: 0 }));

        const response = await fetch(`${apiBaseUrl}/api/images/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to upload ${file.name}`);
        }

        const data = await response.json();
        setUploadProgress(prev => ({ ...prev, [index]: 100 }));
        
        // Backend should return a full URL, use it directly
        // Only construct URL if backend returns a relative path (shouldn't happen)
        let imageUrl = data.url;
        if (!imageUrl || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
          // Fallback: construct full URL if backend didn't return one
          if (imageUrl && imageUrl.startsWith('/api/images/')) {
            imageUrl = `${apiBaseUrl}${imageUrl}`;
          } else if (data.imageId) {
            // Use imageId to construct URL
            imageUrl = `${apiBaseUrl}/api/images/${data.imageId}`;
          } else {
            console.error('Invalid image URL from backend:', data);
            throw new Error('Invalid image URL received from server');
          }
        }
        
        console.log('Uploaded image URL:', imageUrl); // Debug log
        
        return {
          url: imageUrl,
          category: data.category || selectedImageCategory,
          imageId: data.imageId
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      
      // Add uploaded images to form data
      // Store as array of URLs (strings) for compatibility
      const newImageUrls = uploadedImages.map(img => img.url);
      console.log('Uploaded image URLs:', newImageUrls);
      
      setFormData(prev => {
        const updatedImages = [...(prev.images || []), ...newImageUrls];
        console.log('Updated formData.images:', updatedImages);
        return {
          ...prev,
          images: updatedImages
        };
      });
      
      // Clear fallbacks for newly uploaded images (they're MongoDB URLs, no fallback needed)
      // Keep existing fallbacks for old images

      alert(`✅ Successfully uploaded ${uploadedImages.length} image(s) to MongoDB in "${selectedImageCategory}" category!`);
    } catch (err) {
      setError(err.message || 'Failed to upload images');
      console.error('Error uploading images:', err);
    } finally {
      setUploadingImages(false);
      setUploadProgress({});
      // Reset file input
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Filter images: only keep full URLs (MongoDB URLs or valid http/https URLs)
      // Remove relative paths (old local paths) as they won't work with MongoDB
      const validImages = Array.isArray(formData.images) 
        ? formData.images
            .map(img => {
              // Handle both string URLs and object format
              const imageUrl = typeof img === 'string' ? img : (img?.url || img);
              return imageUrl;
            })
            .filter(img => {
              if (!img || !img.trim()) return false;
              const trimmed = img.trim();
              // Only keep full URLs (http/https) or MongoDB API paths
              return trimmed.startsWith('http://') || 
                     trimmed.startsWith('https://') || 
                     trimmed.startsWith('/api/images/');
            })
        : [];
      
      // Ensure images array is properly formatted
      const submitData = {
        ...formData,
        images: validImages
      };
      
      console.log('Submitting property with images:', submitData.images);
      console.log('Filtered out relative paths, kept only full URLs');
      
      const url = property 
        ? `${apiBaseUrl}/api/admin/properties/${property.id}`
        : `${apiBaseUrl}/api/admin/properties`;
      
      const method = property ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save property');
      }

      // Show success message
      alert(`✅ Property ${property ? 'updated' : 'created'} successfully!\n\n` +
        `✅ Changes are now live! The frontend automatically fetches from the API, so your changes will appear on the website immediately after refresh.`);
      
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save property');
      console.error('Error saving property:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="property-form-container">
      <div className="form-header">
        <h1>{property ? 'Edit Property' : 'Add New Property'}</h1>
        <button className="cancel-btn" onClick={onCancel}>Cancel</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="property-form">
        {/* Basic Information */}
        <section className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Slug *</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Meta Title</label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Area</label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Meta Description</label>
            <textarea
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              rows="2"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>DTCM Code</label>
              <input
                type="text"
                name="dtcm"
                value={formData.dtcm}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* Property Details */}
        <section className="form-section">
          <h2>Property Details</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>Guests</label>
              <input
                type="number"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                min="1"
              />
            </div>
            
            <div className="form-group">
              <label>Beds</label>
              <input
                type="number"
                name="beds"
                value={formData.beds}
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (AED/night) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>Rating</label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                min="0"
                max="5"
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label>Sleeps</label>
              <input
                type="text"
                name="sleeps"
                value={formData.sleeps}
                onChange={handleChange}
                placeholder="e.g., 3 Queen sized beds"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                />
                Featured
              </label>
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                />
                Available
              </label>
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="excludeDiscount"
                  checked={formData.excludeDiscount}
                  onChange={handleChange}
                />
                Exclude Discount
              </label>
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="excludeCleaningFee"
                  checked={formData.excludeCleaningFee}
                  onChange={handleChange}
                />
                Exclude Cleaning Fee
              </label>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="form-section">
          <h2>Highlights</h2>
          <div className="array-input-group">
            <input
              type="text"
              value={highlightInput}
              onChange={(e) => setHighlightInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleArrayAdd('highlights', highlightInput);
                  setHighlightInput('');
                }
              }}
              placeholder="Add highlight (press Enter)"
            />
            <button
              type="button"
              onClick={() => {
                handleArrayAdd('highlights', highlightInput);
                setHighlightInput('');
              }}
            >
              Add
            </button>
          </div>
          <div className="tag-list">
            {formData.highlights.map((highlight, index) => (
              <span key={index} className="tag">
                {highlight}
                <button
                  type="button"
                  onClick={() => handleArrayRemove('highlights', index)}
                  className="tag-remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>

        {/* Images */}
        <section className="form-section">
          <h2>Images</h2>
          
          {/* Image Category Selection */}
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Select Image Category/Section *</label>
            <select
              value={selectedImageCategory}
              onChange={(e) => setSelectedImageCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#fff'
              }}
            >
              {imageCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <p style={{ marginTop: '5px', fontSize: '14px', color: '#666' }}>
              Select the section where these images belong (e.g., Living Room, Bedroom 1, Kitchen, etc.)
            </p>
          </div>
          
          {/* Image Upload */}
          <div className="image-upload-section">
            <label className="upload-label">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploadingImages}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <span className="upload-button">
                {uploadingImages ? 'Uploading...' : '📤 Upload Images to ' + selectedImageCategory}
              </span>
            </label>
            <p className="upload-hint">
              Select multiple images to upload to MongoDB. Images will be categorized as "{selectedImageCategory}".
            </p>
            
            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
              <div style={{ marginTop: '10px' }}>
                {Object.entries(uploadProgress).map(([index, progress]) => (
                  <div key={index} style={{ marginBottom: '5px' }}>
                    <div style={{ 
                      width: '100%', 
                      backgroundColor: '#f0f0f0', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${progress}%`,
                        height: '20px',
                        backgroundColor: '#4CAF50',
                        transition: 'width 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '12px'
                      }}>
                        {progress < 100 ? `${progress}%` : 'Complete'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manual Image URL Input */}
          <div className="array-input-group" style={{ marginTop: '15px' }}>
            <input
              type="text"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleArrayAdd('images', imageInput);
                  setImageInput('');
                }
              }}
              placeholder="Or enter image URL/path manually (press Enter)"
            />
            <button
              type="button"
              onClick={() => {
                handleArrayAdd('images', imageInput);
                setImageInput('');
              }}
            >
              Add URL
            </button>
          </div>

          {/* Image Preview Grid */}
          {formData.images && formData.images.length > 0 ? (
            <div className="image-preview-grid">
              {formData.images.map((image, index) => {
                // Handle both string URLs and object format
                const imageUrl = typeof image === 'string' ? image : (image?.url || image);
                
                if (!imageUrl || !imageUrl.trim()) {
                  return null; // Skip empty images
                }
                
                // Get fallback URLs for this image index
                const fallbackUrls = imageFallbacks[index] || [];
                
                // Use the current URL (which is the first in our list)
                let fullImageUrl = imageUrl.trim();
                if (!fullImageUrl.startsWith('http://') && !fullImageUrl.startsWith('https://')) {
                  if (fullImageUrl.startsWith('/api/images/')) {
                    fullImageUrl = `${apiBaseUrl}${fullImageUrl}`;
                  } else if (fullImageUrl.startsWith('api/images/')) {
                    fullImageUrl = `${apiBaseUrl}/${fullImageUrl}`;
                  } else {
                    fullImageUrl = `${apiBaseUrl}/${fullImageUrl}`;
                  }
                }
                
                // Create a unique key for this image
                const imageKey = `img-${index}-${fullImageUrl.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}`;
                
                // Track tried URLs using a closure
                const triedUrls = new Set([fullImageUrl]);
                
                console.log(`Preview image ${index}:`, { 
                  original: imageUrl, 
                  full: fullImageUrl,
                  fallbacks: fallbackUrls 
                }); // Debug log
                
                return (
                  <div key={imageKey} className="image-preview-item">
                    <img 
                      src={fullImageUrl}
                      alt={`Preview ${index + 1}`}
                      crossOrigin="anonymous"
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        backgroundColor: '#f0f0f0',
                        display: 'block'
                      }}
                      onError={(e) => {
                        const img = e.target;
                        const currentSrc = img.src;
                        triedUrls.add(currentSrc);
                        
                        // Try fallback URLs if available
                        if (fallbackUrls.length > 0) {
                          // Find next URL that we haven't tried yet
                          const nextUrl = fallbackUrls.find(url => {
                            try {
                              const urlObj = new URL(url);
                              const currentObj = new URL(currentSrc);
                              return urlObj.href !== currentObj.href && !triedUrls.has(url);
                            } catch {
                              return url !== currentSrc && !triedUrls.has(url);
                            }
                          });
                          
                          if (nextUrl) {
                            console.log(`Trying fallback URL for image ${index}:`, nextUrl);
                            triedUrls.add(nextUrl);
                            img.src = nextUrl;
                            return; // Try next URL
                          }
                        }
                        
                        // All URLs failed - show placeholder and prevent further errors
                        img.onerror = null;
                        console.error(`Failed to load image ${index} after trying all URLs:`, {
                          original: imageUrl,
                          full: fullImageUrl,
                          fallbacks: fallbackUrls,
                          triedSrc: currentSrc
                        });
                        // Use a data URL for placeholder to avoid network requests
                        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                        img.style.objectFit = 'contain';
                        img.style.backgroundColor = '#f0f0f0';
                      }}
                      onLoad={() => {
                        console.log(`✅ Successfully loaded image ${index}:`, fullImageUrl);
                      }}
                    />
                    <div className="image-preview-overlay">
                      <button
                        type="button"
                        onClick={() => {
                          console.log('Removing image at index:', index);
                          handleArrayRemove('images', index);
                        }}
                        className="image-remove-btn"
                        title="Remove image (will also delete from MongoDB)"
                      >
                        ×
                      </button>
                    </div>
                    <div className="image-url-preview" style={{ 
                      fontSize: '11px', 
                      color: '#666', 
                      padding: '5px',
                      wordBreak: 'break-all',
                      maxHeight: '40px',
                      overflow: 'hidden'
                    }}>
                      {typeof image === 'object' && image.category ? `${image.category}: ` : ''}
                      {fullImageUrl.length > 60 ? `${fullImageUrl.substring(0, 60)}...` : fullImageUrl}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic', marginTop: '10px' }}>
              No images uploaded yet. Upload images above to see previews.
            </p>
          )}
        </section>

        {/* Space Information */}
        <section className="form-section">
          <h2>Space Information</h2>
          
          <div className="form-group">
            <label>Kitchen</label>
            <textarea
              value={formData.space.kitchen}
              onChange={(e) => handleNestedChange('space', 'kitchen', e.target.value)}
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label>Living</label>
            <textarea
              value={formData.space.living}
              onChange={(e) => handleNestedChange('space', 'living', e.target.value)}
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label>Facilities</label>
            <textarea
              value={formData.space.facilities}
              onChange={(e) => handleNestedChange('space', 'facilities', e.target.value)}
              rows="3"
            />
          </div>
        </section>

        {/* Guest Access & Notes */}
        <section className="form-section">
          <h2>Guest Access & Notes</h2>
          
          <div className="form-group">
            <label>Guest Access</label>
            <textarea
              name="guestAccess"
              value={formData.guestAccess}
              onChange={handleChange}
              rows="4"
            />
          </div>
          
          <div className="form-group">
            <label>Other Notes</label>
            <textarea
              name="otherNotes"
              value={formData.otherNotes}
              onChange={handleChange}
              rows="4"
            />
          </div>
        </section>

        {/* Rules */}
        <section className="form-section">
          <h2>Rules</h2>
          <div className="array-input-group">
            <textarea
              value={ruleInput}
              onChange={(e) => setRuleInput(e.target.value)}
              placeholder="Add rule (one per line)"
              rows="2"
            />
            <button
              type="button"
              onClick={() => {
                ruleInput.split('\n').forEach(rule => {
                  if (rule.trim()) handleArrayAdd('rules', rule.trim());
                });
                setRuleInput('');
              }}
            >
              Add Rules
            </button>
          </div>
          <div className="tag-list">
            {formData.rules.map((rule, index) => (
              <div key={index} className="tag tag-large">
                {rule}
                <button
                  type="button"
                  onClick={() => handleArrayRemove('rules', index)}
                  className="tag-remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Amenities */}
        <section className="form-section">
          <h2>Amenities</h2>
          <div className="array-input-group">
            <input
              type="text"
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleArrayAdd('amenities', amenityInput);
                  setAmenityInput('');
                }
              }}
              placeholder="Add amenity (press Enter)"
            />
            <button
              type="button"
              onClick={() => {
                handleArrayAdd('amenities', amenityInput);
                setAmenityInput('');
              }}
            >
              Add
            </button>
          </div>
          <div className="tag-list">
            {formData.amenities.map((amenity, index) => (
              <span key={index} className="tag">
                {amenity}
                <button
                  type="button"
                  onClick={() => handleArrayRemove('amenities', index)}
                  className="tag-remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Saving...' : property ? 'Update Property' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PropertyForm;

