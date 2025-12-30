import { useState, useEffect } from 'react';
import './PropertyForm.css'; // Re-use PropertyForm styles for now

function PropertyImagesManager({ apiBaseUrl, token, property, onBack }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [imageFallbacks, setImageFallbacks] = useState({});
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
        if (property && property.images) {
            processImages(property.images);
        }
    }, [property, apiBaseUrl]);

    const processImages = (rawImages) => {
        // Logic adapted from PropertyForm.jsx to process images and categorize them
        const websiteUrl = import.meta.env.VITE_WEBSITE_URL || 'https://www.ygiholidayhomes.com';

        const processed = (rawImages || []).map((img, idx) => {
            const imageUrl = typeof img === 'string' ? img : (img?.url || img);
            if (!imageUrl || !imageUrl.trim()) return null;

            const trimmedUrl = imageUrl.trim();
            let fullUrl = trimmedUrl;

            // Construct Full URL logic from PropertyForm
            if (!trimmedUrl.startsWith('http')) {
                if (trimmedUrl.startsWith('/api/images/')) {
                    fullUrl = `${apiBaseUrl}${trimmedUrl}`;
                } else if (trimmedUrl.startsWith('api/images/')) {
                    fullUrl = `${apiBaseUrl}/${trimmedUrl}`;
                } else if (trimmedUrl.startsWith('./')) {
                    // Local relative path logic fallback
                    if (!window.location.hostname.includes('localhost')) {
                        const cleanPath = trimmedUrl.replace(/^\.\//, '').replace(/\\/g, '/');
                        fullUrl = `${websiteUrl}/${cleanPath}`;
                    }
                }
            }

            // Try to guess category from URL path if not preserved elsewhere
            let category = 'Other';
            const lowerUrl = fullUrl.toLowerCase();
            for (const cat of imageCategories) {
                const catSlug = cat.replace(/\s+/g, '-').toLowerCase();
                const catSlugSpace = cat.toLowerCase(); // e.g. "living room" in "living room"
                if (lowerUrl.includes(catSlug) || lowerUrl.includes(catSlugSpace) || lowerUrl.includes(cat.replace(/\s/g, ''))) {
                    category = cat;
                    break;
                }
            }

            // Override if backend returned explicit category object (not supported by simple array yet, but preparing)
            if (typeof img === 'object' && img.category) {
                category = img.category;
            }

            return {
                url: fullUrl,
                originalUrl: imageUrl, // key for deletion/updates
                category: category
            };
        }).filter(Boolean);

        setImages(processed);
    };

    const handleImageUpload = async (e, category) => {
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

            // Update local state AND backend property record
            const newImagesList = [...images, ...uploadedImages];
            setImages(newImagesList);
            await updatePropertyImages(newImagesList);

            alert(`✅ Uploaded ${uploadedImages.length} images to ${category}!`);
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

    const handleMakeCover = async (image) => {
        if (!images.length) return;

        // Move this image to index 0
        const otherImages = images.filter(img => img.originalUrl !== image.originalUrl);
        const newImagesList = [image, ...otherImages];

        setImages(newImagesList);
        await updatePropertyImages(newImagesList);
    };

    const handleMoveCategory = async (image, newCategory) => {
        // To persist category in a string-only backend, we append a query param or unique marker
        // If the URL already has a category param, replace it, otherwise append it

        let url = image.originalUrl;
        const categorySlug = newCategory.replace(/\s+/g, '-').toLowerCase();

        // Remove existing category param if present (simple regex for ?category=... or &category=...)
        url = url.replace(/[?&]category=[^&]*/, '');

        // Append new category
        const separator = url.includes('?') ? '&' : '?';
        const newUrl = `${url}${separator}category=${categorySlug}`;

        // Update the image object
        const updatedImage = {
            ...image,
            url: image.url, // Keep display URL same (browser handles query params fine)
            originalUrl: newUrl,
            category: newCategory
        };

        // Update list
        const updatedList = images.map(img =>
            img.originalUrl === image.originalUrl ? updatedImage : img
        );

        setImages(updatedList);
        await updatePropertyImages(updatedList);
        // Force re-process to ensure consistent state
        processImages(updatedList.map(img => img.originalUrl));
    };

    const handleRemoveImage = async (imageToRemove) => {
        if (!window.confirm('Are you sure you want to remove this image?')) return;

        // 1. Delete actual file if it's a MongoDB image
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

        // 2. Update property record
        const newImagesList = images.filter(img => img.originalUrl !== imageToRemove.originalUrl);
        setImages(newImagesList);
        await updatePropertyImages(newImagesList);
    };

    const updatePropertyImages = async (currentImages) => {
        // Filter back to just the array of strings the backend expects
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
                {imageCategories.map(category => (
                    <section key={category} className="form-section">
                        <h2>{category}</h2>

                        {/* Image Grid for this Category */}
                        <div className="image-preview-grid">
                            {images.filter(img => img.category === category).map((img, idx) => {
                                // Find actual index in the main 'images' array to determine if it's cover
                                const globalIndex = images.findIndex(i => i.originalUrl === img.originalUrl);
                                const isCover = globalIndex === 0;

                                return (
                                    <div key={idx} className="image-preview-item" style={isCover ? { border: '3px solid #ffd700' } : {}}>
                                        {isCover && <div className="cover-badge">⭐ Cover</div>}
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

                        {/* Actions for this Category */}
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
                                        {uploadingImages ? '...' : '➕ Upload'}
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

                            {/* Progress bars just for this category could go here if we tracked specific category uploads */}
                        </div>
                    </section>
                ))}

                <section className="form-section">
                    <h2>Raw/Other Images (Uncategorized)</h2>
                    <div className="image-preview-grid">
                        {images.filter(img => img.category === 'Other').map((img, idx) => {
                            const globalIndex = images.findIndex(i => i.originalUrl === img.originalUrl);
                            const isCover = globalIndex === 0;
                            return (
                                <div key={idx} className="image-preview-item" style={isCover ? { border: '3px solid #ffd700' } : {}}>
                                    {isCover && <div className="cover-badge">⭐ Cover</div>}
                                    <img src={img.url} alt={`Other ${idx}`} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
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
                                                {imageCategories.map(c => (
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
                    </div>
                </section>
            </div>
        </div>
    );
}

export default PropertyImagesManager;
