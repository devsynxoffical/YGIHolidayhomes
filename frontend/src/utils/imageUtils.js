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

  // Remove query parameters first (category, etc.) - they're metadata only
  let cleanPath = imagePath;
  if (cleanPath.includes('?')) {
    cleanPath = cleanPath.split('?')[0];
  }

  // If already a full URL (http/https), return cleaned version
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanImageUrl(cleanPath);
  }

  // If it's a MongoDB image ID (24 character hex string), use direct API
  // Also handle IDs with trailing characters (like :1)
  const idMatch = cleanPath.match(/^([0-9a-fA-F]{24})/);
  if (idMatch) {
    return `${API_BASE_URL}/api/images/${idMatch[1]}`;
  }

  // Clean the path (remove ./ prefix, normalize slashes)
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
 * Clean image URL by removing query parameters (especially category)
 * @param {string} url - Image URL that may contain query parameters
 * @returns {string} - Cleaned URL without query parameters
 */
function cleanImageUrl(url) {
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
}

/**
 * Get image URL with fallback to local path
 * @param {string} imagePath - Image path
 * @param {string} fallbackPath - Fallback path if MongoDB fails
 * @returns {string} - Image URL
 */
export function getImageUrlWithFallback(imagePath, fallbackPath = null) {
  if (!imagePath) return fallbackPath || '';

  // Remove query parameters first (category, etc.) - they're metadata only
  let cleanPath = imagePath;
  const hadQueryParams = cleanPath.includes('?');
  if (hadQueryParams) {
    cleanPath = cleanPath.split('?')[0];
    console.log(`🧹 Cleaned URL: "${imagePath}" -> "${cleanPath}"`);
  }

  // If it's already a full URL (http/https), return cleaned version
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    const cleaned = cleanImageUrl(cleanPath);
    if (cleaned !== cleanPath) {
      console.log(`🧹 Further cleaned URL: "${cleanPath}" -> "${cleaned}"`);
    }
    return cleaned;
  }

  // If it's already a MongoDB API URL path, make it full URL and clean it
  if (cleanPath.includes('/api/images/')) {
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      return cleanImageUrl(cleanPath);
    }
    // It's a relative path like /api/images/xxx, make it full URL
    const fullUrl = `${API_BASE_URL}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
    return cleanImageUrl(fullUrl);
  }

  // Check if it's a MongoDB image ID (24 character hex string)
  // Remove any trailing characters that might be added (like :1)
  const idMatch = cleanPath.match(/^([0-9a-fA-F]{24})/);
  if (idMatch) {
    const finalUrl = `${API_BASE_URL}/api/images/${idMatch[1]}`;
    console.log(`🆔 Extracted MongoDB ID: "${cleanPath}" -> "${finalUrl}"`);
    return finalUrl;
  }

  // Try MongoDB first - convert local path to MongoDB URL
  const mongoUrl = getImageUrl(cleanPath);

  // Return MongoDB URL (will fallback via onError handler if it fails)
  return mongoUrl;
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

