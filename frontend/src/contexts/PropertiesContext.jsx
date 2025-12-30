import React, { createContext, useContext, useState, useEffect } from 'react';
import { properties as fallbackProperties } from '../data/properties';

const PropertiesContext = createContext();

// Backend API URL - use Railway URL or fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ygiholidayhomes-production.up.railway.app';

export const PropertiesProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        // Add cache-busting timestamp to ensure fresh data
        const timestamp = new Date().getTime();
        const url = `${API_BASE_URL}/api/properties?_t=${timestamp}`;
        console.log(`🔄 Fetching properties from: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
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
          console.log(`✅ Loaded ${data.properties.length} properties from API (live data)`);
        } else if (data.properties && Array.isArray(data.properties)) {
          // Even if empty, use the API response (empty array)
          setProperties(data.properties);
          setError(null);
          console.log(`✅ Loaded ${data.properties.length} properties from API (empty but live)`);
        } else {
          // Invalid response format
          throw new Error('Invalid response format from API');
        }
      } catch (err) {
        console.error('❌ Failed to fetch properties from API:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          apiUrl: `${API_BASE_URL}/api/properties`
        });
        // Don't use fallback - show error instead
        setProperties([]);
        setError(`Failed to load properties: ${err.message}. Please refresh the page.`);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
    
    // Refresh properties every 5 minutes to ensure fresh data
    const refreshInterval = setInterval(fetchProperties, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
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

