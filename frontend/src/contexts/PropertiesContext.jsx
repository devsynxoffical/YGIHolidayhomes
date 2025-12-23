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
        console.log(`🔄 Fetching properties from: ${API_BASE_URL}/api/properties`);
        
        const response = await fetch(`${API_BASE_URL}/api/properties`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('API Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response data:', data);
        
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
        console.error('❌ Failed to fetch properties from API:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          apiUrl: `${API_BASE_URL}/api/properties`
        });
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

