import { useState, useEffect } from 'react';
import './PropertyList.css'; // Re-use PropertyList styles for consistency

function PropertyImagesList({ apiBaseUrl, token, onViewImages }) {
    const DUMMY_PROPERTIES = [
        {
            id: '1',
            title: 'Luxury Downtown Apartment',
            location: 'Dubai Marina',
            images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800']
        },
        {
            id: '2',
            title: 'Beachfront Villa',
            location: 'Jumeirah Beach',
            images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800']
        },
        {
            id: '7',
            title: 'Luxurious & Elegant 2BR near Burj Khalifa • Standpoint Tower A',
            location: 'Downtown Dubai',
            images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800']
        }
    ];

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProperties();
    }, [apiBaseUrl, token]);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            // Use the same public endpoint as PropertyList for consistency
            const response = await fetch(`${apiBaseUrl}/api/properties`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch properties');
            }

            const data = await response.json();
            const fetchedProperties = data.properties || data || [];

            if (Array.isArray(fetchedProperties) && fetchedProperties.length > 0) {
                setProperties(fetchedProperties);
                setError(null);
            } else {
                // If API returns empty, try dummy data if configured, or just show empty
                console.warn('API returned empty properties, checking for fallback...');
                setProperties(DUMMY_PROPERTIES); // Fallback to dummy data for this demo
                // setError('Invalid data format received from server');
            }
        } catch (err) {
            console.error('Error fetching properties:', err);
            console.log('Falling back to DUMMY_PROPERTIES due to error');
            setProperties(DUMMY_PROPERTIES); // Explicit fallback on error
            setError(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading properties...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="property-list-container">
            <div className="list-header">
                <h1>Manage Property Images</h1>
                <p>Select a property to manage its images</p>
            </div>

            <div className="property-grid">
                {properties.map(property => (
                    <div key={property.id} className="property-card">
                        {property.images && property.images.length > 0 && (
                            <div className="property-image">
                                <img
                                    src={
                                        // Handle both string URLs and object format
                                        typeof property.images[0] === 'string'
                                            ? property.images[0]
                                            : (property.images[0]?.url || '')
                                    }
                                    alt={property.title}
                                    onError={(e) => {
                                        // Use a gray placeholder SVG data URI to avoid external dependencies
                                        e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20300%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A15pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22300%22%20height%3D%22200%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22108.8%22%20y%3D%22108.9%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                                    }}
                                />
                            </div>
                        )}

                        <div className="property-info">
                            <h3>{property.title}</h3>
                            <p className="property-location">{property.location}</p>

                            <div className="property-actions">
                                <button
                                    className="edit-btn"
                                    onClick={() => onViewImages(property)}
                                    style={{ width: '100%' }}
                                >
                                    📷 Manage Images
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {properties.length === 0 && (
                    <div className="no-properties">
                        <p>No properties found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PropertyImagesList;
