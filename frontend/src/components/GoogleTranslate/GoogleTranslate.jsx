import React, { useEffect, useState } from 'react';
import './GoogleTranslate.css';

const GoogleTranslate = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isGoogleTranslateLoaded, setIsGoogleTranslateLoaded] = useState(false);

  useEffect(() => {
    // Load Google Translate script
    loadGoogleTranslateScript();
    
    // Check current language from cookies
    checkCurrentLanguage();

    // Apply translation if cookie exists
    applyTranslationIfNeeded();
  }, []);

  const loadGoogleTranslateScript = () => {
    // Check if script is already loaded
    if (window.google && window.google.translate) {
      setIsGoogleTranslateLoaded(true);
      return;
    }

    // Check if script tag already exists
    if (document.querySelector('script[src*="translate.google.com"]')) {
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.defer = true;
    
    // Define the callback function
    window.googleTranslateElementInit = () => {
      setIsGoogleTranslateLoaded(true);
      initializeTranslate();
    };

    document.head.appendChild(script);
  };

  const initializeTranslate = () => {
    if (window.google && window.google.translate) {
      try {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,ar,ru,de,fr,ur,hi,zh-CN,es,it,pt,ja,ko,tr,fa',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          multilanguagePage: true
        }, 'google_translate_element');
      } catch (error) {
        console.error('Error initializing Google Translate:', error);
      }
    }
  };

  const checkCurrentLanguage = () => {
    const cookies = document.cookie.split(';');
    const googtransCookie = cookies.find(cookie => 
      cookie.trim().startsWith('googtrans=')
    );
    
    if (googtransCookie) {
      const value = googtransCookie.split('=')[1];
      if (value && value !== '') {
        const parts = value.split('/');
        if (parts.length > 2) {
          setCurrentLanguage(parts[2]);
        }
      }
    }
  };

  const applyTranslationIfNeeded = () => {
    const cookies = document.cookie.split(';');
    const googtransCookie = cookies.find(cookie => 
      cookie.trim().startsWith('googtrans=')
    );
    
    if (googtransCookie && googtransCookie.split('=')[1] !== '') {
      // Apply translation using Google Translate API
      setTimeout(() => {
        if (window.google && window.google.translate) {
          const elements = document.querySelectorAll('*');
          elements.forEach(el => {
            if (el.getAttribute('data-original-text') === null) {
              el.setAttribute('data-original-text', el.textContent);
            }
          });
        }
      }, 1000);
    }
  };

  const handleLanguageChange = (language) => {
    if (language === 'en') {
      // Reset to English
      document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = `googtrans=; domain=${location.hostname}; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    } else {
      // Set language
      const value = `/en/${language}`;
      document.cookie = `googtrans=${value}; path=/; max-age=31536000`;
      document.cookie = `googtrans=${value}; domain=${location.hostname}; path=/; max-age=31536000`;
    }
    
    setCurrentLanguage(language);
    
    // Reload page to apply translation
    window.location.reload();
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇦🇪' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'fa', name: 'فارسی', flag: '🇮🇷' }
  ];

  return (
    <div className="google-translate-container">
      {/* Custom Language Selector */}
      <div className="custom-language-selector">
        <select 
          value={currentLanguage} 
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="language-select"
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Google Translate Widget (Hidden by default, shown if needed) */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>
    </div>
  );
};

export default GoogleTranslate;
