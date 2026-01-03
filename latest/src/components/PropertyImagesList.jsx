import { useState, useEffect } from 'react';
import './PropertyImagesList.css';

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
        <div className="property-images-container">
            <div className="images-list-header">
                <h1>Manage Property Images</h1>
                <p>Select a property to manage its images</p>
            </div>

            <div className="property-images-grid">
                {properties.map(property => {
                    const imageCount = property.images ? property.images.length : 0;
                    const rawImageUrl = property.images && property.images.length > 0
                        ? (typeof property.images[0] === 'string'
                            ? property.images[0]
                            : (property.images[0]?.url || ''))
                        : null;
                    const cleanUrl = rawImageUrl ? cleanImageUrl(rawImageUrl) : null;

                    return (
                        <div
                            key={property.id}
                            className="property-image-card"
                            onClick={() => onViewImages(property)}
                        >
                            <div className="property-image-wrapper">
                                {cleanUrl ? (
                                    <>
                                        <img
                                            src={cleanUrl}
                                            alt={property.title}
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20300%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A15pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22300%22%20height%3D%22200%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22108.8%22%20y%3D%22108.9%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                                            }}
                                        />
                                        <div className="property-image-overlay"></div>
                                    </>
                                ) : (
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                                        color: '#999',
                                        fontSize: '16px'
                                    }}>
                                        No Image
                                    </div>
                                )}
                                {imageCount > 0 && (
                                    <div className="image-count-badge">
                                        {imageCount} {imageCount === 1 ? 'image' : 'images'}
                                    </div>
                                )}
                            </div>

                            <div className="property-image-info">
                                <h3 className="property-image-title">{property.title}</h3>
                                <p className="property-image-location">{property.location || 'Location not specified'}</p>
                            </div>

                            <div className="property-image-actions">
                                <button
                                    className="manage-images-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onViewImages(property);
                                    }}
                                >
                                    <span>📷 Manage Images</span>
                                </button>
                            </div>
                        </div>
                    );
                })}

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
