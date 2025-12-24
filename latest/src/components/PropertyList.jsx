import { useState, useEffect } from 'react';
import './PropertyList.css';

// Website URL where images are hosted
const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL || 'https://www.ygiholidayhomes.com';

// Helper function to convert relative image paths to absolute URLs
// Returns an array of URLs to try (MongoDB first, then website URL for old paths)
const getImageUrls = (imagePath, apiBaseUrl) => {
  if (!imagePath) return [];
  
  // If already an absolute URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return [imagePath];
  }
  
  // If it's a MongoDB image path (/api/images/...)
  if (imagePath.includes('/api/images/')) {
    // Check if it's already a full URL
    if (imagePath.startsWith('http')) {
      return [imagePath];
    }
    // It's a relative path, construct full URL
    return [`${apiBaseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`];
  }
  
  // For old relative paths (starting with ./), try MongoDB first
  // Only add website URL fallback if not on localhost (to avoid CORS issues)
  if (imagePath.startsWith('./')) {
    const cleanPath = imagePath.replace(/^\.\//, '').replace(/\\/g, '/');
    const encodedFilename = encodeURIComponent(cleanPath);
    
    const urls = [`${apiBaseUrl}/api/images/filename/${encodedFilename}`];
    
    // Only add website URL fallback if not on localhost
    if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
      const websitePath = cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;
      const websiteUrl = `${WEBSITE_URL}${websitePath}`;
      urls.push(websiteUrl);
    }
    
    return urls; // Try MongoDB first, then website (if not localhost)
  }
  
  // If it's not a full URL and not a MongoDB path, try website URL (only if not localhost)
  if (!imagePath.startsWith('http') && !imagePath.startsWith('/api')) {
    // On localhost, don't try website URL (will fail CORS)
    if (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')) {
      return []; // Return empty array, will show placeholder
    }
    
    let cleanPath = imagePath;
    if (cleanPath.startsWith('./')) {
      cleanPath = cleanPath.substring(1); // Remove ./
    }
    // Ensure path starts with /
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }
    return [`${WEBSITE_URL}${cleanPath}`];
  }
  
  return [];
};

function PropertyList({ apiBaseUrl, token, onEdit, onAdd }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/admin/properties`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Properties API response:', data);
      setProperties(data.properties || []);
      setError('');
      
      if (!data.properties || data.properties.length === 0) {
        setError('No properties found. The properties.json file may be empty. You can add properties using the "Add Property" button.');
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to load properties';
      setError(`Error: ${errorMsg}. Make sure the backend is running and accessible.`);
      console.error('Error fetching properties:', err);
      console.error('API URL:', `${apiBaseUrl}/api/admin/properties`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
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
      alert('Failed to delete property');
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

      {error && (
        <div className="error-banner">
          {error}
          <br />
          <small style={{ marginTop: '10px', display: 'block' }}>
            💡 Tip: Check the browser console (F12) for more details. 
            If properties.json is empty, you can add properties manually using the "Add Property" button.
          </small>
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
                      const urls = getImageUrls(img, apiBaseUrl);
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
                  
                  // Use first available URL, keep rest for fallback
                  const finalUrl = allImageUrls[0] || null;
                  const fallbackUrls = allImageUrls.slice(1);
                  let triedUrls = new Set([finalUrl]); // Track which URLs we've tried
                  
                  if (finalUrl) {
                    return (
                      <img 
                        src={finalUrl}
                        alt={property.title}
                        loading="lazy"
                        onError={(e) => {
                          // Try next URL in the list if available
                          const currentSrc = e.target.src;
                          triedUrls.add(currentSrc);
                          
                          // Find next URL we haven't tried
                          const nextUrl = fallbackUrls.find(url => !triedUrls.has(url));
                          
                          if (nextUrl) {
                            // Try next URL
                            triedUrls.add(nextUrl);
                            e.target.src = nextUrl;
                            return;
                          }
                          
                          // All URLs failed - show placeholder and prevent further errors
                          e.target.onerror = null; // Remove error handler to prevent loop
                          // Use a data URL for placeholder to avoid network requests
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                          e.target.style.objectFit = 'contain';
                          e.target.style.backgroundColor = '#f0f0f0';
                        }}
                        onLoad={(e) => {
                          // Image loaded successfully
                          console.log('✅ Image loaded:', finalUrl);
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

