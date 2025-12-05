/**
 * Google Translate utility functions
 * Provides helper functions for managing language preferences and translation
 */

/**
 * Set the Google Translate language preference
 * @param {string} targetLanguage - The target language code (e.g., 'ar', 'fr', 'es')
 */
export const setLanguage = (targetLanguage) => {
  const value = `/en/${targetLanguage}`;
  
  // Set cookie for current domain
  document.cookie = `googtrans=${value}; path=/; max-age=31536000`; // 1 year expiry
  
  // Set cookie for current hostname (more specific)
  document.cookie = `googtrans=${value}; domain=${location.hostname}; path=/; max-age=31536000`;
  
  // Reload page to apply translation
  window.location.reload();
};

/**
 * Get the current language preference from cookies
 * @returns {string|null} - The current language code or null if not set
 */
export const getCurrentLanguage = () => {
  const cookies = document.cookie.split(';');
  const googtransCookie = cookies.find(cookie => 
    cookie.trim().startsWith('googtrans=')
  );
  
  if (googtransCookie) {
    const value = googtransCookie.split('=')[1];
    const parts = value.split('/');
    return parts.length > 2 ? parts[2] : null;
  }
  
  return null;
};

/**
 * Check if a specific language is currently active
 * @param {string} languageCode - The language code to check
 * @returns {boolean} - True if the language is active
 */
export const isLanguageActive = (languageCode) => {
  const currentLang = getCurrentLanguage();
  return currentLang === languageCode;
};

/**
 * Reset translation to original language (English)
 */
export const resetToEnglish = () => {
  // Remove the googtrans cookie
  document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = `googtrans=; domain=${location.hostname}; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  
  // Reload page
  window.location.reload();
};

/**
 * Language options for the translate widget
 * Optimized for Dubai/ME market with common languages
 * Ordered by priority: English, Arabic, Russian, German, French, Urdu, Hindi, then others
 */
export const languageOptions = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
];

/**
 * Get language name by code
 * @param {string} code - Language code
 * @returns {string} - Language name
 */
export const getLanguageName = (code) => {
  const option = languageOptions.find(opt => opt.code === code);
  return option ? option.name : code;
};

/**
 * Get language flag by code
 * @param {string} code - Language code
 * @returns {string} - Language flag emoji
 */
export const getLanguageFlag = (code) => {
  const option = languageOptions.find(opt => opt.code === code);
  return option ? option.flag : '🌐';
};
