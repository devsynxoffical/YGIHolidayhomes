import React, { createContext, useContext, useState, useEffect } from 'react';
import { properties as fallbackProperties } from '../data/properties';

const PropertiesContext = createContext();

// Backend API URL - use Railway URL or fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ygiholidayhomes-production.up.railway.app';

export const PropertiesProvider = ({ children }) => {
  const [properties, setProperties] = useState(fallbackProperties);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/properties`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success && data.properties && data.properties.length > 0) {
          setProperties(data.properties);
          setError(null);
          console.log(`✅ Loaded ${data.properties.length} properties from API`);
        } else {
          // If API returns empty, use fallback
          console.warn('⚠️ API returned empty properties, using fallback');
          setProperties(fallbackProperties);
        }
      } catch (err) {
        console.warn('⚠️ Failed to fetch properties from API, using fallback:', err.message);
        // Use fallback properties if API fails
        setProperties(fallbackProperties);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <PropertiesContext.Provider value={{ properties, loading, error }}>
      {children}
    </PropertiesContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertiesContext);
  if (!context) {
    throw new Error('useProperties must be used within a PropertiesProvider');
  }
  return context;
};

