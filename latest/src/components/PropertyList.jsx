import { useState, useEffect } from 'react';
import './PropertyList.css';

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
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      setProperties(data.properties || []);
      setError('');
    } catch (err) {
      setError('Failed to load properties. Make sure the backend is running.');
      console.error('Error fetching properties:', err);
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
        <button className="add-btn" onClick={onAdd}>+ Add New Property</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {properties.length === 0 ? (
        <div className="empty-state">
          <p>No properties found.</p>
          <button onClick={onAdd}>Add Your First Property</button>
        </div>
      ) : (
        <div className="properties-grid">
          {properties.map((property) => (
            <div key={property.id} className="property-card">
              <div className="property-image">
                {property.images && property.images.length > 0 ? (
                  <img 
                    src={property.images[0].startsWith('./') 
                      ? `/src/${property.images[0].substring(2)}` 
                      : property.images[0]} 
                    alt={property.title}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
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

