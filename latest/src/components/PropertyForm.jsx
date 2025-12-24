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
    images: [],
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
  
  // Ensure inputs always have string values (not undefined)
  useEffect(() => {
    if (highlightInput === undefined) setHighlightInput('');
    if (imageInput === undefined) setImageInput('');
    if (amenityInput === undefined) setAmenityInput('');
    if (ruleInput === undefined) setRuleInput('');
  }, []);

  useEffect(() => {
    if (property) {
      setFormData({
        ...property,
        highlights: property.highlights || [],
        images: property.images || [],
        sleeping: property.sleeping || [],
        access: property.access || [],
        rules: property.rules || [],
        amenities: property.amenities || [],
        space: property.space || { kitchen: '', living: '', facilities: '' }
      });
    }
  }, [property]);

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

  const handleArrayRemove = (field, index) => {
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
        formData.append('filename', file.name);
        formData.append('propertyId', property?.id || '');
        formData.append('category', 'property');

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
        return data.url; // Return the MongoDB image URL
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Add uploaded image URLs to form data
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

      alert(`✅ Successfully uploaded ${uploadedUrls.length} image(s) to MongoDB!`);
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
        body: JSON.stringify(formData)
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
                {uploadingImages ? 'Uploading...' : '📤 Upload Images'}
              </span>
            </label>
            <p className="upload-hint">Select multiple images to upload to MongoDB</p>
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
          {formData.images.length > 0 && (
            <div className="image-preview-grid">
              {formData.images.map((image, index) => (
                <div key={index} className="image-preview-item">
                  <img 
                    src={image.startsWith('http') || image.startsWith('/api/images') 
                      ? image 
                      : `${apiBaseUrl}${image.startsWith('/') ? '' : '/'}${image}`} 
                    alt={`Preview ${index + 1}`}
                    onError={(e) => {
                      // Fallback for local images
                      const websiteUrl = import.meta.env.VITE_WEBSITE_URL || 'https://www.ygiholidayhomes.com';
                      if (image && !image.startsWith('http') && !image.startsWith('/api')) {
                        e.target.src = `${websiteUrl}/${image.replace(/^\.\//, '')}`;
                      }
                    }}
                  />
                  <div className="image-preview-overlay">
                    <button
                      type="button"
                      onClick={() => handleArrayRemove('images', index)}
                      className="image-remove-btn"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                  <div className="image-url-preview">{image.substring(0, 50)}...</div>
                </div>
              ))}
            </div>
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

