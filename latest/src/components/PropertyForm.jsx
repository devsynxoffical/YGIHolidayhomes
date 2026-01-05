import { useState, useEffect } from 'react';
import { useNotification } from './common/NotificationContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import './PropertyForm.css';

function PropertyForm({ apiBaseUrl, token, property, onCancel, onSuccess }) {
  const { showNotification } = useNotification();
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
    excludeCleaningFee: false,
    discountPercentage: 0
  });

  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlockedRange, setNewBlockedRange] = useState({
    startDate: null,
    endDate: null,
    note: ''
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

      console.log('Processed images for preview:', processedImages);
      // Images not handled here anymore, passed through but not edited
      const imageUrls = (property.images || []);

      console.log('Images preserved for submission:', imageUrls);

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
        excludeCleaningFee: property.excludeCleaningFee || false,
        discountPercentage: property.discountPercentage || 0
      });

      // Fetch blocked dates
      const fetchBlockedDates = async () => {
        try {
          const response = await fetch(`${apiBaseUrl}/api/properties/${property.id}/booked-dates`);
          const data = await response.json();
          if (data.success) {
            // Filter only manual blocks for editing
            const manualBlocks = data.bookedDates
              .filter(d => d.type === 'manual')
              .map(d => ({
                id: Math.random().toString(36).substr(2, 9),
                startDate: new Date(d.checkIn),
                endDate: new Date(d.checkOut),
                note: d.note || ''
              }));
            setBlockedDates(manualBlocks);
          }
        } catch (err) {
          console.error('Error fetching blocked dates:', err);
        }
      };
      fetchBlockedDates();
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
        excludeCleaningFee: false,
        discountPercentage: 0
      });
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

  const addBlockedRange = () => {
    if (!newBlockedRange.startDate || !newBlockedRange.endDate) {
      showNotification('Please select both start and end dates', 'error');
      return;
    }
    if (isAfter(newBlockedRange.startDate, newBlockedRange.endDate)) {
      showNotification('Start date must be before end date', 'error');
      return;
    }

    setBlockedDates(prev => [...prev, {
      ...newBlockedRange,
      id: Math.random().toString(36).substr(2, 9)
    }]);

    setNewBlockedRange({
      startDate: null,
      endDate: null,
      note: ''
    });
  };

  const removeBlockedRange = (id) => {
    setBlockedDates(prev => prev.filter(range => range.id !== id));
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

      // Save blocked dates if property exists (or use the new ID from data.property.id)
      const finalId = property ? property.id : data.property.id;

      const blockedResponse = await fetch(`${apiBaseUrl}/api/admin/properties/${finalId}/blocked-dates`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          blockedDates: blockedDates.map(d => ({
            checkIn: format(d.startDate, 'yyyy-MM-dd'),
            checkOut: format(d.endDate, 'yyyy-MM-dd'),
            note: d.note
          }))
        })
      });

      if (!blockedResponse.ok) {
        console.warn('⚠️ Property saved but failed to update blocked dates');
      }

      // Show success message
      showNotification(
        `✅ Property ${property ? 'updated' : 'created'} successfully!\n\n` +
        `✅ Changes are now live! The frontend automatically fetches from the API, so your changes will appear on the website immediately after refresh.`
      );

      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save property');
      showNotification(`❌ Error: ${err.message}`, 'error');
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

            <div className="form-group">
              <label>Discount Percentage (%)</label>
              <input
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                step="1"
              />
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
        {/* Images section removed - managed in separate view */}
        <div className="form-section" style={{ background: '#f9f9f9', border: '1px dashed #ccc', textAlign: 'center', padding: '20px' }}>
          <p>Images are now managed in the "Property Images" section.</p>
        </div>

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

        {/* Blocked Dates Management */}
        <section className="form-section">
          <h2>Blocked Dates Management</h2>
          <p className="section-hint">Select date ranges to manually block this property from being booked (e.g., for maintenance or private use).</p>

          <div className="blocked-dates-manager">
            <div className="add-blocked-range">
              <div className="range-inputs">
                <div className="date-picker-group">
                  <label>Start Date</label>
                  <DatePicker
                    selected={newBlockedRange.startDate}
                    onChange={(date) => setNewBlockedRange(prev => ({ ...prev, startDate: date }))}
                    selectsStart
                    startDate={newBlockedRange.startDate}
                    endDate={newBlockedRange.endDate}
                    minDate={startOfDay(new Date())}
                    placeholderText="Select start date"
                    className="admin-datepicker"
                  />
                </div>
                <div className="date-picker-group">
                  <label>End Date</label>
                  <DatePicker
                    selected={newBlockedRange.endDate}
                    onChange={(date) => setNewBlockedRange(prev => ({ ...prev, endDate: date }))}
                    selectsEnd
                    startDate={newBlockedRange.startDate}
                    endDate={newBlockedRange.endDate}
                    minDate={newBlockedRange.startDate || startOfDay(new Date())}
                    placeholderText="Select end date"
                    className="admin-datepicker"
                  />
                </div>
                <div className="note-group">
                  <label>Note (Optional)</label>
                  <input
                    type="text"
                    value={newBlockedRange.note}
                    onChange={(e) => setNewBlockedRange(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="e.g., Owner use, Maintenance"
                  />
                </div>
                <button type="button" className="add-range-btn" onClick={addBlockedRange}>
                  Block Dates
                </button>
              </div>
            </div>

            <div className="blocked-ranges-list">
              <h3>Currently Blocked Ranges</h3>
              {blockedDates.length === 0 ? (
                <p className="no-ranges">No manually blocked dates for this property.</p>
              ) : (
                <div className="ranges-grid">
                  {blockedDates.map(range => (
                    <div key={range.id} className="range-card">
                      <div className="range-info">
                        <span className="range-dates">
                          {format(range.startDate, 'MMM dd, yyyy')} - {format(range.endDate, 'MMM dd, yyyy')}
                        </span>
                        {range.note && <span className="range-note">{range.note}</span>}
                      </div>
                      <button
                        type="button"
                        className="remove-range-btn"
                        onClick={() => removeBlockedRange(range.id)}
                        title="Remove block"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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

