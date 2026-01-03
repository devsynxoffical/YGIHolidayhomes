import { useState, useEffect } from 'react';
import { useNotification } from './common/NotificationContext';
import { properties as localProperties } from '../data/properties';
import './PropertyForm.css'; // Re-use PropertyForm styles for now

function PropertyImagesManager({ apiBaseUrl, token, property, onBack }) {
    const { showNotification } = useNotification();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [imageInput, setImageInput] = useState('');

    // Image categories
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

    useEffect(() => {
        if (property) {
            // Merge strategy: API images + Local hardcoded images
            const apiImages = property.images || [];

            // Find local data matches (by ID or Title fallback)
            // For original 7 properties, search for local fallback data to maintain legacy images
            const isLegacyId = property && (
                (typeof property.id === 'string' && /^[1-7]$/.test(property.id)) ||
                (typeof property.id === 'number' && property.id >= 1 && property.id <= 7)
            );

            const localData = isLegacyId
                ? localProperties.find(p => p.id === property.id || p.id === parseInt(property.id) || p.title === property.title)
                : null;
            const localImages = (localData && localData.images) || [];

            // Combine and deduplicate
            const combinedImages = [...new Set([...apiImages, ...localImages])];

            processImages(combinedImages);
        }
    }, [property, apiBaseUrl]);

    // Helper function to extract category from image path/URL (synchronized with frontend)
    const getImageCategory = (imagePath) => {
        if (!imagePath) return 'Other';

        const pathStr = typeof imagePath === 'string' ? imagePath : (imagePath?.url || '');
        const lowerPath = pathStr.toLowerCase();

        // 1. Check for explicit category in query param (highest priority)
        try {
            if (pathStr.includes('category=')) {
                const urlObj = new URL(pathStr.startsWith('http') ? pathStr : `http://dummy.com${pathStr.startsWith('/') ? '' : '/'}${pathStr}`);
                const catParam = urlObj.searchParams.get('category');
                if (catParam) {
                    // Map slug back to display name
                    const found = imageCategories.find(c => c.replace(/\s+/g, '-').toLowerCase() === catParam.toLowerCase());
                    if (found) return found;
                }
            }
        } catch (e) { /* ignore URL parsing errors */ }

        // 2. Check for category keywords in the path (synchronized with PropertyPhotos.jsx)
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

    const processImages = (rawImages) => {
        // Dynamic detection of website URL for loading local public/ images
        const websiteUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:5173'
            : (import.meta.env.VITE_WEBSITE_URL || 'https://www.ygiholidayhomes.com');

        const processed = (rawImages || []).map((img) => {
            const imageUrl = typeof img === 'string' ? img : (img?.url || img);
            if (!imageUrl || !imageUrl.trim()) return null;

            const trimmedUrl = imageUrl.trim();
            let fullUrl = trimmedUrl;

            // Construct Full URL
            if (!trimmedUrl.startsWith('http')) {
                if (trimmedUrl.startsWith('/api/images/')) {
                    fullUrl = `${apiBaseUrl}${trimmedUrl}`;
                } else if (trimmedUrl.startsWith('api/images/')) {
                    fullUrl = `${apiBaseUrl}/${trimmedUrl}`;
                } else {
                    // Local path (starts with / or ./) - load from website
                    const cleanPath = trimmedUrl.replace(/^\.\//, '').replace(/^\//, '').replace(/\\/g, '/');
                    fullUrl = `${websiteUrl}/${cleanPath}`;
                }
            }

            const category = getImageCategory(fullUrl);

            return {
                url: fullUrl,
                originalUrl: imageUrl,
                category: category
            };
        }).filter(Boolean);

        setImages(processed);
    };

    const handleImageUpload = async (e, category, replaceIndex = null) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingImages(true);
        setError('');

        try {
            const uploadPromises = files.map(async (file, index) => {
                const formData = new FormData();
                formData.append('image', file);
                const categoryPrefix = category.replace(/\s+/g, '-').toLowerCase();
                const timestamp = Date.now();
                const fileExtension = file.name.split('.').pop();
                const filename = `${categoryPrefix}_${timestamp}_${index}.${fileExtension}`;

                formData.append('filename', filename);
                formData.append('propertyId', property.id);
                formData.append('category', category);

                setUploadProgress(prev => ({ ...prev, [`${category}-${index}`]: 0 }));

                const response = await fetch(`${apiBaseUrl}/api/images/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (!response.ok) throw new Error(`Failed to upload ${file.name}`);

                const data = await response.json();
                setUploadProgress(prev => ({ ...prev, [`${category}-${index}`]: 100 }));

                let imageUrl = data.url;
                // Construct URL if needed
                if (imageUrl && !imageUrl.startsWith('http')) {
                    if (imageUrl.startsWith('/api/images/')) imageUrl = `${apiBaseUrl}${imageUrl}`;
                    else if (data.imageId) imageUrl = `${apiBaseUrl}/api/images/${data.imageId}`;
                }

                // Append category query parameter so it persists in the backend string array
                const categorySlug = category.replace(/\s+/g, '-').toLowerCase();
                const separator = imageUrl.includes('?') ? '&' : '?';
                const finalUrl = `${imageUrl}${separator}category=${categorySlug}`;

                return {
                    url: imageUrl, // Display URL (browser works fine with params too, but keeping clean)
                    originalUrl: finalUrl, // Persisted URL with category
                    category: category
                };
            });

            const uploadedImages = await Promise.all(uploadPromises);

            let newImagesList;
            if (replaceIndex !== null) {
                // Replacement strategy for a specific slot
                newImagesList = [...images];
                newImagesList[replaceIndex] = uploadedImages[0];
                // If more than one file was picked during a "replace", append the rest
                if (uploadedImages.length > 1) {
                    newImagesList.push(...uploadedImages.slice(1));
                }
            } else {
                newImagesList = [...images, ...uploadedImages];
            }

            setImages(newImagesList);
            await updatePropertyImages(newImagesList);

            showNotification(`✅ ${replaceIndex !== null ? 'Replaced image' : 'Uploaded ' + uploadedImages.length + ' images'} successfully!`);
        } catch (err) {
            setError(err.message || 'Failed to upload images');
        } finally {
            setUploadingImages(false);
            setUploadProgress({});
            e.target.value = '';
        }
    };

    const handleAddUrl = async (category) => {
        if (!imageInput.trim()) return;

        let url = imageInput.trim();
        const categorySlug = category.replace(/\s+/g, '-').toLowerCase();

        // Remove existing category param if present to avoid duplicates
        url = url.replace(/[?&]category=[^&]*/, '');

        const separator = url.includes('?') ? '&' : '?';
        const finalUrl = `${url}${separator}category=${categorySlug}`;

        const newImage = {
            url: url,
            originalUrl: finalUrl,
            category: category
        };

        const newImagesList = [...images, newImage];
        setImages(newImagesList);
        await updatePropertyImages(newImagesList);
        setImageInput('');
    };

    const handleReorderHeader = async (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= images.length) return;

        const newImagesList = [...images];
        const [movedItem] = newImagesList.splice(fromIndex, 1);
        newImagesList.splice(toIndex, 0, movedItem);

        setImages(newImagesList);
        await updatePropertyImages(newImagesList);
    };

    const handleMakeCover = async (image) => {
        if (!images.length) return;

        // Move this image to index 0
        const otherImages = images.filter(img => img.originalUrl !== image.originalUrl);
        const newImagesList = [image, ...otherImages];

        setImages(newImagesList);
        await updatePropertyImages(newImagesList);
    };

    const handleMoveCategory = async (image, newCategory) => {
        let url = image.originalUrl;
        const categorySlug = newCategory.replace(/\s+/g, '-').toLowerCase();
        url = url.replace(/[?&]category=[^&]*/, '');
        const separator = url.includes('?') ? '&' : '?';
        const newUrl = `${url}${separator}category=${categorySlug}`;

        const updatedImage = {
            ...image,
            url: image.url,
            originalUrl: newUrl,
            category: newCategory
        };

        const updatedList = images.map(img =>
            img.originalUrl === image.originalUrl ? updatedImage : img
        );

        setImages(updatedList);
        await updatePropertyImages(updatedList);
        processImages(updatedList.map(img => img.originalUrl));
    };

    const handleRemoveImage = async (imageToRemove) => {
        if (!window.confirm('Are you sure you want to remove this image?')) return;

        if (imageToRemove.originalUrl.includes('/api/images/')) {
            const imageIdMatch = imageToRemove.originalUrl.match(/\/api\/images\/([a-fA-F0-9]{24})/);
            if (imageIdMatch && imageIdMatch[1]) {
                try {
                    await fetch(`${apiBaseUrl}/api/admin/images/${imageIdMatch[1]}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } catch (e) { console.error("Error deleting file:", e); }
            }
        }

        const newImagesList = images.filter(img => img.originalUrl !== imageToRemove.originalUrl);
        setImages(newImagesList);
        await updatePropertyImages(newImagesList);
    };

    const updatePropertyImages = async (currentImages) => {
        const imagesPayload = currentImages.map(img => img.originalUrl);

        try {
            const response = await fetch(`${apiBaseUrl}/api/admin/properties/${property.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...property,
                    images: imagesPayload
                })
            });

            if (!response.ok) throw new Error('Failed to save property changes');

        } catch (err) {
            setError('Failed to save changes to property. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="property-form-container">
            <div className="form-header">
                <h1>Manage Images: {property.title}</h1>
                <button className="cancel-btn" onClick={onBack}>Back to List</button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="property-form">
                {/* Header Gallery (Top 5) Management */}
                <section className="form-section header-gallery-manager">
                    <h2 style={{ borderLeft: '4px solid #f59e0b', paddingLeft: '15px' }}>Header Gallery (Top 5)</h2>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>
                        These 5 images appear at the top of the property page. Slot 1 is the <strong>Large Cover Photo</strong>.
                    </p>

                    <div className="header-grid-editor" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '15px',
                        marginBottom: '30px'
                    }}>
                        {[0, 1, 2, 3, 4].map(idx => {
                            const img = images[idx];
                            return (
                                <div key={idx} className="header-slot" style={{
                                    position: 'relative',
                                    border: idx === 0 ? '3px solid #f59e0b' : '2px dashed #ddd',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    aspectRatio: '4/3',
                                    background: '#f9f9f9',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    transition: 'all 0.2s',
                                    boxShadow: idx === 0 ? '0 4px 12px rgba(245, 158, 11, 0.2)' : 'none',
                                    cursor: img ? 'default' : 'pointer'
                                }}>
                                    {img ? (
                                        <>
                                            <img src={img.url} alt={`Slot ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div className="slot-badge" style={{
                                                position: 'absolute',
                                                top: '8px',
                                                left: '8px',
                                                background: idx === 0 ? '#f59e0b' : 'rgba(0,0,0,0.6)',
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                            }}>
                                                {idx === 0 ? 'COVER' : idx + 1}
                                            </div>
                                            <div className="slot-actions" style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                background: 'rgba(0,0,0,0.85)',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                padding: '10px 5px',
                                                flexWrap: 'wrap',
                                                backdropFilter: 'blur(2px)'
                                            }}>
                                                <button
                                                    className="action-btn-small"
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveImage(img); }}
                                                    title="Delete Image"
                                                    style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >Delete</button>
                                                <label style={{
                                                    background: '#3b82f6',
                                                    color: 'white',
                                                    borderRadius: '4px',
                                                    padding: '3px 8px',
                                                    fontSize: '11px',
                                                    cursor: 'pointer',
                                                    display: 'inline-block',
                                                    fontWeight: 'bold'
                                                }} onClick={(e) => e.stopPropagation()}>
                                                    Replace
                                                    <input type="file" onChange={(e) => handleImageUpload(e, img.category, idx)} style={{ display: 'none' }} />
                                                </label>
                                                {idx !== 0 && (
                                                    <button
                                                        className="action-btn-small"
                                                        onClick={(e) => { e.stopPropagation(); handleMakeCover(img); }}
                                                        title="Set as Cover"
                                                        style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                                                    >Cover</button>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <label style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            gap: '10px',
                                            color: '#999'
                                        }}>
                                            <div style={{ fontSize: '32px' }}>➕</div>
                                            <div style={{ fontSize: '14px', fontWeight: '600' }}>Slot {idx + 1}</div>
                                            <input
                                                type="file"
                                                onChange={(e) => handleImageUpload(e, 'Other', idx)}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />

                {/* Photo Tour Overview */}
                <section className="form-section photo-tour-overview">
                    <h2 style={{ borderLeft: '4px solid #10b981', paddingLeft: '15px' }}>Full Photo Tour (by Category)</h2>
                    <div className="category-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '20px',
                        marginTop: '20px',
                        marginBottom: '30px'
                    }}>
                        {imageCategories.map(category => {
                            const categoryImages = images.filter(img => img.category === category);
                            if (categoryImages.length === 0) return null;

                            return (
                                <div
                                    key={category}
                                    className="category-item"
                                    style={{
                                        position: 'relative',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        height: '120px',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                        border: category === 'Other' ? '2px dashed #ccc' : 'none'
                                    }}
                                    onClick={() => {
                                        const section = document.getElementById(`category-${category.replace(/\s+/g, '-')}`);
                                        if (section) section.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    <img
                                        src={categoryImages[0].url}
                                        alt={category}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22120%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22200%22%20height%3D%22120%22%20fill%3D%22%23eee%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23999%22%3EBroken%20Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                                        }}
                                    />
                                    <div className="category-label" style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        background: category === 'Other' ? 'rgba(100,100,100,0.8)' : 'rgba(16, 185, 129, 0.8)',
                                        color: 'white',
                                        padding: '5px 10px',
                                        fontSize: '13px',
                                        textAlign: 'center',
                                        fontWeight: '600'
                                    }}>
                                        {category === 'Other' ? 'Uncategorized' : category} ({categoryImages.length})
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {imageCategories.map(category => (
                    <section key={category} id={`category-${category.replace(/\s+/g, '-')}`} className="form-section">
                        <h2 style={{ borderLeft: '4px solid #10b981', paddingLeft: '15px' }}>{category}</h2>

                        <div className="image-preview-grid">
                            {images.filter(img => img.category === category).map((img, idx) => {
                                const globalIndex = images.findIndex(i => i.originalUrl === img.originalUrl);
                                const isCover = globalIndex === 0;
                                const isInTop5 = globalIndex < 5;

                                return (
                                    <div key={idx} className="image-preview-item" style={isCover ? { border: '3px solid #f59e0b' } : (isInTop5 ? { border: '2px solid #3b82f6' } : {})}>
                                        {isCover && <div className="cover-badge" style={{ background: '#f59e0b' }}>⭐ Cover</div>}
                                        {!isCover && isInTop5 && <div className="cover-badge" style={{ background: '#3b82f6' }}>🖼️ Slot {globalIndex + 1}</div>}
                                        <img src={img.url} alt={`${category} ${idx}`} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />

                                        <div className="image-preview-overlay">
                                            <div className="overlay-actions">
                                                {!isCover && (
                                                    <button
                                                        className="action-btn cover-btn"
                                                        onClick={() => handleMakeCover(img)}
                                                        title="Set as Cover Photo"
                                                    >⭐</button>
                                                )}
                                                <select
                                                    className="category-move-select"
                                                    value=""
                                                    onChange={(e) => handleMoveCategory(img, e.target.value)}
                                                >
                                                    <option value="" disabled>MOVE ➡</option>
                                                    {imageCategories.filter(c => c !== category).map(c => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    className="action-btn remove-btn"
                                                    onClick={() => handleRemoveImage(img)}
                                                    title="Remove Image"
                                                >×</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {images.filter(img => img.category === category).length === 0 && (
                                <p style={{ color: '#999', padding: '10px' }}>No images in this section</p>
                            )}
                        </div>

                        <div className="image-upload-section" style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <label className="upload-label" style={{ marginBottom: 0 }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => handleImageUpload(e, category)}
                                        disabled={uploadingImages}
                                        style={{ display: 'none' }}
                                    />
                                    <span className="upload-button" style={{ padding: '5px 10px', fontSize: '14px' }}>
                                        {uploadingImages ? '...' : '➕ Upload to ' + category}
                                    </span>
                                </label>

                                <div style={{ flex: 1, display: 'flex' }}>
                                    <input
                                        type="text"
                                        placeholder="Paste URL..."
                                        value={imageInput}
                                        onChange={(e) => setImageInput(e.target.value)}
                                        style={{ flex: 1, marginRight: '5px' }}
                                    />
                                    <button type="button" onClick={() => handleAddUrl(category)}>Add URL</button>
                                </div>
                            </div>
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}

export default PropertyImagesManager;
