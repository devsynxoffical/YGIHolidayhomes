// Utility functions for creating and managing slugs

/**
 * Convert a string to a URL-friendly slug
 * @param {string} text - The text to convert to slug
 * @returns {string} - The slugified text
 */
export const createSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
};

/**
 */
export const generatePropertyPhotosSlug = (property) => {
  if (!property) return 'photos';

  const title = property.title || property.name || 'property';
  const id = property.id || '';

  return createSlug(`${title}-${id}-photos`);
};

import { properties as fallbackProperties } from '../data/properties';

/**
 * Route mappings with slugs
 */
export const ROUTE_SLUGS = {
  'home': '',
  'about': 'about-us',
  'contact': 'contact-us',
  'book': 'book-apartments-dubai',
  'expert': 'dubai-rental-properties',
  'payment': 'payment',
  'privacy': 'privacy-policy',
  'terms': 'terms-and-conditions',
  'property-details': 'property', // This is a fallback/prefix, actual routing checks property slugs
  'property-photos': 'photos'
};

// Store properties from context (will be set by App component)
let currentProperties = fallbackProperties;

/**
 * Set properties from context (called by App component)
 * @param {Array} properties - The properties array
 */
export const setProperties = (properties) => {
  currentProperties = properties || fallbackProperties;
};

/**
 * Get page from slug
 * @param {string} slug - The URL slug
 * @returns {string} - The page identifier
 */
export const getPageFromSlug = (slug) => {
  // Check static routes first
  const slugToPage = Object.entries(ROUTE_SLUGS).find(([page, pageSlug]) => pageSlug === slug);
  if (slugToPage) {
    return slugToPage[0];
  }

  // Check if it's a property slug
  const property = currentProperties.find(p => p.slug === slug);
  if (property) {
    return 'property-details';
  }

  return 'home';
};

/**
 * Get property by slug
 * @param {string} slug - The URL slug
 * @returns {Object|null} - The property object or null
 */
export const getPropertyBySlug = (slug) => {
  return currentProperties.find(p => p.slug === slug) || null;
};

/**
 * Get slug from page
 * @param {string} page - The page identifier
 * @returns {string} - The URL slug
 */
export const getSlugFromPage = (page) => {
  return ROUTE_SLUGS[page] || '';
};

/**
 * Update browser URL with slug
 * @param {string} slug - The slug to set in URL
 * @param {Object} state - Optional state to store in history
 */
export const updateUrl = (slug, state = {}) => {
  let url = slug ? `/${slug}` : '/';

  // Add search parameters if they exist
  if (state.searchParams) {
    const searchParams = new URLSearchParams();
    Object.entries(state.searchParams).forEach(([key, value]) => {
      if (value && value !== 'All Types' && value !== 'All Cities' && value !== 'Any Bedrooms' && value !== 'Any Bathrooms' && value !== 'Min Price' && value !== 'Max Price') {
        searchParams.set(key, value);
      }
    });

    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  window.history.pushState(state, '', url);
};

/**
 * Parse current URL to get slug
 * @returns {string} - Current slug from URL
 */
export const getCurrentSlug = () => {
  const path = window.location.pathname;
  return path === '/' ? '' : path.substring(1);
};

/**
 * Parse search parameters from URL
 * @returns {Object} - Search parameters object
 */
export const getSearchParamsFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const searchParams = {};

  // Map URL parameters to search filter keys
  const paramMapping = {
    'propertyType': 'propertyType',
    'city': 'city',
    'bedrooms': 'bedrooms',
    'bathrooms': 'bathrooms',
    'minPrice': 'minPrice',
    'maxPrice': 'maxPrice'
  };

  Object.entries(paramMapping).forEach(([urlKey, filterKey]) => {
    const value = urlParams.get(urlKey);
    if (value) {
      searchParams[filterKey] = value;
    }
  });

  return searchParams;
};
