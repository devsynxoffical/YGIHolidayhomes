import { useState, useEffect, useRef } from 'react';
import { useNotification } from './common/NotificationContext';
import './PropertyList.css';

// Website URL where images are hosted
const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL || 'https://www.ygiholidayhomes.com';

// Helper function to clean image URL by removing query parameters (especially category)
const cleanImageUrl = (url) => {
  if (!url) return url;

  try {
    // Remove query parameters (especially category parameter which is metadata only)
    // The API doesn't need these parameters to serve the image
    const urlObj = new URL(url);
    urlObj.search = ''; // Remove all query parameters
    return urlObj.toString();
  } catch (e) {
    // If URL parsing fails (e.g., relative path or invalid URL), manually remove query params
    return url.split('?')[0].split('&')[0];
  }
};

// Helper function to convert relative image paths to absolute URLs
// Returns an array of URLs to try (MongoDB first, then website URL for old paths)
const getImageUrls = (imagePath, apiBaseUrl) => {
  if (!imagePath) return [];

  // Remove query parameters first (category, etc.) - they're metadata only
  let cleanPath = imagePath;
  if (cleanPath.includes('?')) {
    cleanPath = cleanPath.split('?')[0];
  }

  // If already an absolute URL (http/https), return cleaned version
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return [cleanImageUrl(cleanPath)];
  }

  // If it's a MongoDB image path (/api/images/...)
  if (cleanPath.includes('/api/images/')) {
    // Check if it's already a full URL
    if (cleanPath.startsWith('http')) {
      return [cleanImageUrl(cleanPath)];
    }
    // It's a relative path, construct full URL and clean it
    const fullUrl = `${apiBaseUrl}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
    return [cleanImageUrl(fullUrl)];
  }

  // Check if it's a MongoDB image ID (24 character hex string)
  // Remove any trailing characters that might be added (like :1)
  const idMatch = cleanPath.match(/^([0-9a-fA-F]{24})/);
  if (idMatch) {
    return [`${apiBaseUrl}/api/images/${idMatch[1]}`];
  }

  // For old relative paths (starting with ./), try MongoDB first
  // Only add website URL fallback if not on localhost (to avoid CORS issues)
  if (cleanPath.startsWith('./')) {
    const pathWithoutPrefix = cleanPath.replace(/^\.\//, '').replace(/\\/g, '/');
    const encodedFilename = encodeURIComponent(pathWithoutPrefix);

    const urls = [`${apiBaseUrl}/api/images/filename/${encodedFilename}`];

    // Only add website URL fallback if not on localhost
    if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
      const websitePath = pathWithoutPrefix.startsWith('/') ? pathWithoutPrefix : '/' + pathWithoutPrefix;
      const websiteUrl = `${WEBSITE_URL}${websitePath}`;
      urls.push(websiteUrl);
    }

    return urls; // Try MongoDB first, then website (if not localhost)
  }

  // If it's not a full URL and not a MongoDB path, try website URL (only if not localhost)
  if (!cleanPath.startsWith('http') && !cleanPath.startsWith('/api') && !cleanPath.match(/^[0-9a-fA-F]{24}/)) {
    // On localhost, don't try website URL (will fail CORS)
    if (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')) {
      return []; // Return empty array, will show placeholder
    }

    let pathForWebsite = cleanPath;
    if (pathForWebsite.startsWith('./')) {
      pathForWebsite = pathForWebsite.substring(1); // Remove ./
    }
    // Ensure path starts with /
    if (!pathForWebsite.startsWith('/')) {
      pathForWebsite = '/' + pathForWebsite;
    }
    return [`${WEBSITE_URL}${pathForWebsite}`];
  }

  return [];
};

function PropertyList({ apiBaseUrl, token, onEdit, onAdd }) {
  const { showNotification } = useNotification();
  // Dummy properties data for when backend is not connected
  const DUMMY_PROPERTIES = [
    {
      id: '1',
      title: 'Luxury Downtown Apartment',
      location: 'Dubai Marina',
      price: 450,
      bedrooms: 2,
      bathrooms: 2,
      description: 'Beautiful modern apartment with stunning city views. Fully furnished with premium amenities.',
      available: true,
      featured: true,
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']
    },
    {
      id: '2',
      title: 'Beachfront Villa',
      location: 'Jumeirah Beach',
      price: 1200,
      bedrooms: 4,
      bathrooms: 3,
      description: 'Spacious villa with direct beach access. Perfect for families and large groups.',
      available: true,
      featured: true,
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800']
    },
    {
      id: '3',
      title: 'Modern Studio Apartment',
      location: 'Business Bay',
      price: 280,
      bedrooms: 1,
      bathrooms: 1,
      description: 'Cozy studio apartment in the heart of Business Bay. Ideal for business travelers.',
      available: true,
      featured: false,
      images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800']
    },
    {
      id: '4',
      title: 'Penthouse with Panoramic Views',
      location: 'Downtown Dubai',
      price: 2000,
      bedrooms: 3,
      bathrooms: 3,
      description: 'Luxurious penthouse with breathtaking views of Burj Khalifa and the city skyline.',
      available: true,
      featured: true,
      images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800']
    },
    {
      id: '5',
      title: 'Family-Friendly Apartment',
      location: 'Dubai Hills',
      price: 550,
      bedrooms: 3,
      bathrooms: 2,
      description: 'Comfortable family apartment in a quiet neighborhood with parks and amenities nearby.',
      available: true,
      featured: false,
      images: ['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800']
    },
    {
      id: '6',
      title: 'Cozy Garden Villa',
      location: 'Arabian Ranches',
      price: 800,
      bedrooms: 3,
      bathrooms: 2,
      description: 'Charming villa with private garden. Perfect for a relaxing holiday getaway.',
      available: true,
      featured: false,
      images: ['https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800']
    },
    {
      id: '7',
      title: 'Executive Suite',
      location: 'DIFC',
      price: 650,
      bedrooms: 2,
      bathrooms: 2,
      description: 'Elegant executive suite in the financial district. Close to business centers and restaurants.',
      available: true,
      featured: false,
      images: ['https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800']
    }
  ];

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingDummyData, setUsingDummyData] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      // Fetch from the same endpoint the frontend uses (public endpoint)
      // This ensures admin panel shows exactly what frontend shows
      const response = await fetch(`${apiBaseUrl}/api/properties`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Properties API response:', data);

      // Ensure we're getting the same data structure as frontend
      const fetchedProperties = data.properties || data || [];

      if (Array.isArray(fetchedProperties) && fetchedProperties.length > 0) {
        setProperties(fetchedProperties);
        setUsingDummyData(false);
        setError('');
        console.log(`✅ Loaded ${fetchedProperties.length} properties from API (synced with frontend)`);
      } else {
        setProperties([]);
        setUsingDummyData(false);
        setError('No properties found. The properties.json file may be empty. You can add properties using the "Add Property" button.');
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to load properties';
      console.error('Error fetching properties:', err);
      console.error('API URL:', `${apiBaseUrl}/api/properties`);

      // Only use dummy data if we have no properties and backend failed
      if (properties.length === 0) {
        setProperties(DUMMY_PROPERTIES);
        setUsingDummyData(true);
        setError('Backend connection failed - using demo data');
      } else {
        // Keep existing properties and show error
        setError(`Failed to refresh: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    // If using dummy data, just remove from local state
    if (usingDummyData) {
      setProperties(properties.filter(p => p.id !== id));
      showNotification('Property removed from demo data. Changes will be lost on refresh.', 'info');
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/properties/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete property');
      }

      // Refresh the list
      fetchProperties();
    } catch (err) {
      showNotification('Failed to delete property', 'error');
      console.error('Error deleting property:', err);
    }
  };


  if (loading) {
    return (
      <div className="property-list-container">
        <div className="loading">Loading properties...</div>
      </div>
    );
  }

  return (
    <div className="property-list-container">
      <div className="list-header">
        <h1>Properties</h1>
        <div className="header-actions">
          <button className="add-btn" onClick={onAdd}>+ Add New Property</button>
        </div>
      </div>

      {error && !usingDummyData && (
        <div className="error-banner" style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
          <br />
          <small style={{ marginTop: '10px', display: 'block' }}>
            💡 Tip: Check the browser console (F12) for more details.
            If properties.json is empty, you can add properties manually using the "Add Property" button.
          </small>
        </div>
      )}
      {usingDummyData && (
        <div style={{
          backgroundColor: '#d1ecf1',
          color: '#0c5460',
          border: '1px solid #bee5eb',
          padding: '8px 12px',
          borderRadius: '4px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          ℹ️ Using demo data (backend not connected)
        </div>
      )}
      {!usingDummyData && properties.length > 0 && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          padding: '8px 12px',
          borderRadius: '4px',
          marginBottom: '20px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>✅</span>
          <span>Showing {properties.length} properties synced with frontend (from backend API)</span>
        </div>
      )}

      {properties.length === 0 ? (
        <div className="empty-state">
          <p>No properties found.</p>
          <p className="empty-hint">
            The properties.json file is empty. You can either:
            <br />
            1. Add properties manually using the "Add Property" button below
            <br />
          </p>
          <button onClick={onAdd}>Add Your First Property</button>
        </div>
      ) : (
        <div className="properties-grid">
          {properties.map((property) => (
            <div key={property.id} className="property-card">
              <div className="property-image">
                {(() => {
                  // Try to find valid image URLs
                  // For old relative paths, we'll try MongoDB first, then website URL
                  let allImageUrls = [];

                  if (property.images && property.images.length > 0) {
                    for (const img of property.images) {
                      // Handle both string URLs and object format {url: "...", category: "..."}
                      const imagePath = typeof img === 'string' ? img : (img?.url || img?.originalUrl || '');
                      if (imagePath) {
                        const urls = getImageUrls(imagePath, apiBaseUrl);
                        if (urls.length > 0) {
                          allImageUrls.push(...urls);
                          // If we found a MongoDB URL (not from old path), prefer it
                          const hasMongoUrl = urls.some(url => url.includes('/api/images/') && !url.includes('/api/images/filename/'));
                          if (hasMongoUrl) {
                            break; // Found direct MongoDB URL, use it
                          }
                        }
                      }
                    }
                  }

                  // Use first available URL, keep rest for fallback
                  const finalUrl = allImageUrls[0] || null;

                  // Debug logging
                  if (finalUrl) {
                    console.log(`🖼️ Property "${property.title}" - Trying image URL:`, finalUrl);
                    if (allImageUrls.length > 1) {
                      console.log(`   ${allImageUrls.length - 1} fallback URL(s) available`);
                    }
                    // Log if URLs were cleaned
                    if (property.images && property.images.length > 0) {
                      const originalFirst = property.images[0];
                      if (typeof originalFirst === 'string' && originalFirst.includes('?')) {
                        console.log(`🧹 Cleaned URL from: "${originalFirst.substring(0, 100)}..." -> "${finalUrl.substring(0, 100)}..."`);
                      }
                    }
                  } else {
                    console.warn(`⚠️ Property "${property.title}" - No image URLs found. Images:`, property.images);
                  }

                  if (finalUrl) {
                    // Create a unique key for this image to track retries
                    const imageKey = `img-${property.id}-${finalUrl.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '-')}`;

                    return (
                      <img
                        key={imageKey}
                        src={finalUrl}
                        alt={property.title}
                        loading="lazy"
                        crossOrigin="anonymous"
                        data-fallback-urls={JSON.stringify(allImageUrls.slice(1))}
                        data-tried-index="0"
                        onError={(e) => {
                          const img = e.target;
                          const currentSrc = img.src;
                          const fallbackUrls = JSON.parse(img.getAttribute('data-fallback-urls') || '[]');
                          let triedIndex = parseInt(img.getAttribute('data-tried-index') || '0');

                          console.warn(`❌ Failed to load image for "${property.title}":`, currentSrc);

                          // Try next URL in the list if available
                          if (triedIndex < fallbackUrls.length) {
                            const nextUrl = fallbackUrls[triedIndex];
                            triedIndex++;
                            img.setAttribute('data-tried-index', triedIndex.toString());
                            console.log(`🔄 Trying fallback URL ${triedIndex}/${fallbackUrls.length}:`, nextUrl);
                            img.src = nextUrl;
                            return; // Try next URL
                          }

                          // All URLs failed - show placeholder and prevent further errors
                          img.onerror = null; // Remove error handler to prevent loop
                          console.error(`❌ All image URLs failed for "${property.title}". Tried ${triedIndex + 1} URL(s)`);
                          // Use a data URL for placeholder to avoid network requests
                          img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                          img.style.objectFit = 'contain';
                          img.style.backgroundColor = '#f0f0f0';
                        }}
                        onLoad={(e) => {
                          // Image loaded successfully
                          console.log(`✅ Image loaded for "${property.title}":`, e.target.src);
                        }}
                      />
                    );
                  } else {
                    return <div className="no-image">No Image Available</div>;
                  }
                })()}
                {property.featured && <span className="featured-badge">Featured</span>}
                {!property.available && <span className="unavailable-badge">Unavailable</span>}
              </div>

              <div className="property-info">
                <h3>{property.title || 'Untitled Property'}</h3>
                <div className="property-details">
                  <span>📍 {property.location || 'N/A'}</span>
                  <span>💰 AED {property.price || 0}/night</span>
                  <span>🛏️ {property.bedrooms || 0} BR, {property.bathrooms || 0} BA</span>
                </div>
                {property.description && (
                  <p className="property-description">
                    {property.description.substring(0, 100)}...
                  </p>
                )}
              </div>

              <div className="property-actions">
                <button
                  className="edit-btn"
                  onClick={() => onEdit(property)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(property.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PropertyList;

