/**
 * Utility functions for handling images from MongoDB
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ygiholidayhomes-production.up.railway.app';
const WEBSITE_BASE_URL = import.meta.env.VITE_WEBSITE_URL || 'https://www.ygiholidayhomes.com';

/**
 * Convert a local image path to MongoDB API URL
 * @param {string} imagePath - Local image path (e.g., "./Marina residency tower 2/Living room/image.avif")
 * @returns {string} - MongoDB API URL or fallback to local path
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return '';

  // If already a full URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a MongoDB image ID (24 character hex string), use direct API
  if (/^[0-9a-fA-F]{24}$/.test(imagePath)) {
    return `${API_BASE_URL}/api/images/${imagePath}`;
  }

  // Clean the path (remove ./ prefix, normalize slashes)
  let cleanPath = imagePath;
  if (cleanPath.startsWith('./')) {
    cleanPath = cleanPath.substring(2);
  }
  cleanPath = cleanPath.replace(/\\/g, '/');

  // Try to get image by filename from MongoDB
  // Encode the filename for URL
  const encodedFilename = encodeURIComponent(cleanPath);
  return `${API_BASE_URL}/api/images/filename/${encodedFilename}`;
}

/**
 * Get image URL with fallback to local path
 * @param {string} imagePath - Image path
 * @param {string} fallbackPath - Fallback path if MongoDB fails
 * @returns {string} - Image URL
 */
export function getImageUrlWithFallback(imagePath, fallbackPath = null) {
  if (!imagePath) return fallbackPath || '';

  // If it's already a MongoDB URL, return as is
  if (imagePath.includes('/api/images/')) {
    return imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}${imagePath}`;
  }

  // Try MongoDB first
  const mongoUrl = getImageUrl(imagePath);
  
  // If we have a fallback, use it; otherwise use the original path
  return mongoUrl || fallbackPath || `${WEBSITE_BASE_URL}/${imagePath.replace(/^\.\//, '')}`;
}

/**
 * Preload an image to check if it exists
 * @param {string} url - Image URL
 * @returns {Promise<boolean>} - True if image loads successfully
 */
export function preloadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Get all image URLs for a property
 * @param {Object} property - Property object with images array
 * @returns {Array<string>} - Array of image URLs
 */
export function getPropertyImageUrls(property) {
  if (!property || !property.images || !Array.isArray(property.images)) {
    return [];
  }

  return property.images.map(img => getImageUrl(img));
}

