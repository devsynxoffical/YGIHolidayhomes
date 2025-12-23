import { useState, useEffect } from 'react';
import './PropertyList.css';

// Website URL where images are hosted
const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL || 'https://www.ygiholidayhomes.com';

// Helper function to convert relative image paths to absolute URLs
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If already an absolute URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Convert relative paths (./path) to absolute paths (/path)
  let cleanPath = imagePath;
  if (imagePath.startsWith('./')) {
    cleanPath = imagePath.substring(1); // Remove ./
  }
  
  // Ensure path starts with /
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  
  // Return full URL (browser will handle spaces in URLs)
  return `${WEBSITE_URL}${cleanPath}`;
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
                {property.images && property.images.length > 0 ? (
                  <img 
                    src={getImageUrl(property.images[0])}
                    alt={property.title}
                    loading="lazy"
                    onError={(e) => {
                      // Try alternative image or show placeholder
                      if (property.images.length > 1) {
                        e.target.src = getImageUrl(property.images[1]);
                      } else {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }
                    }}
                  />
                ) : (
                  <div className="no-image">No Image</div>
                )}
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

