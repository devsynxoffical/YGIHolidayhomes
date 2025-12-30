import { useState, useEffect } from 'react';
import * as FaIcons from 'react-icons/fa';
import './Dashboard.css';

const {
  FaCalendarAlt, 
  FaCheckCircle, 
  FaBolt,
  FaBuilding,
  FaMoneyBillWave,
  FaChartBar
} = FaIcons;

function DashboardView({ apiBaseUrl, token, onViewChange }) {
  // Dummy data for when backend is not connected
  const DUMMY_STATISTICS = {
    totalProperties: 7,
    availableProperties: 7,
    totalBookings: 82,
    currentBookings: 10,
    totalRevenue: 99754.43,
    monthlyRevenue: 8454.43,
  };

  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingDummyData, setUsingDummyData] = useState(false);
  const [hasTriedFetch, setHasTriedFetch] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (token) {
      fetchStatistics();
      // Refresh statistics every 15 seconds for more real-time updates
      const interval = setInterval(fetchStatistics, 15000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchStatistics = async () => {
    if (!token) {
      console.warn('No token available, skipping statistics fetch');
      return;
    }

    try {
      setLoading(true);
      // Add cache-busting timestamp to ensure fresh data
      const timestamp = new Date().getTime();
      const response = await fetch(`${apiBaseUrl}/api/admin/statistics?t=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid - clear it and show error
          console.error('Authentication failed - token may have expired');
          setError('Authentication failed. Please refresh the page and login again.');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.statistics) {
        setStatistics(data.statistics);
        setUsingDummyData(false);
        setError('');
        setHasTriedFetch(true);
        setLastUpdated(new Date());
        
        // Log when live data is received
        if (data.statistics.dataSource === 'stripe') {
          console.log('✅ Live data received from Stripe:', {
            bookings: data.statistics.totalBookings,
            revenue: data.statistics.totalRevenue,
            lastUpdated: data.statistics.lastUpdated
          });
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setHasTriedFetch(true);
      
      // Only use dummy data if we've tried to fetch and failed
      if (!statistics) {
        setStatistics(DUMMY_STATISTICS);
        setUsingDummyData(true);
        setError('Backend connection failed - using demo data');
      }
      // If we already have real data, keep it and just log the error
    } finally {
      setLoading(false);
    }
  };

  if (loading && !statistics && !hasTriedFetch) {
    return (
      <div className="dashboard-welcome">
        <div className="loading-state">Loading dashboard...</div>
      </div>
    );
  }

  const stats = statistics || DUMMY_STATISTICS;

  // Helper function to format currency safely
  const formatCurrency = (value) => {
    const num = typeof value === 'number' ? value : parseFloat(value) || 0;
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatLastUpdated = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="dashboard-welcome">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1>Dashboard Overview</h1>
          <p>Welcome to YGI Holiday Homes Admin Panel</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          {lastUpdated && !usingDummyData && (
            <div style={{ fontSize: '12px', color: '#28a745', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span 
                className="live-indicator"
                style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#28a745',
                  display: 'inline-block'
                }}
              ></span>
              Live • Updated {formatLastUpdated(lastUpdated)}
            </div>
          )}
          <button 
            onClick={fetchStatistics}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: loading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            {loading ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {error && !usingDummyData && (
        <div className="error-banner" style={{ 
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}
      {usingDummyData && hasTriedFetch && (
        <div style={{ 
          backgroundColor: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffc107',
          padding: '8px 12px',
          borderRadius: '4px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          ⚠️ {error || 'Backend not connected - showing demo data'}
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-primary">
            <FaBuilding className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Total Properties</h3>
            <p className="stat-value">{stats.totalProperties || 0}</p>
            <p className="stat-description">{stats.availableProperties || 0} available</p>
            <button onClick={() => onViewChange('list')}>Manage Properties</button>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-secondary">
            <FaCalendarAlt className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Total Bookings</h3>
            <p className="stat-value">{stats.totalBookings || 0}</p>
            <p className="stat-description">All time bookings</p>
            <button onClick={() => onViewChange('bookings', { type: 'all' })}>View Details</button>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-success">
            <FaCheckCircle className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Current Bookings</h3>
            <p className="stat-value">{stats.currentBookings || 0}</p>
            <p className="stat-description">Active in last 30 days</p>
            <button onClick={() => onViewChange('bookings', { type: 'current' })}>View Details</button>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-warning">
            <FaMoneyBillWave className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">AED {formatCurrency(stats.totalRevenue)}</p>
            <p className="stat-description">All time earnings</p>
            <button onClick={() => onViewChange('revenue', { type: 'all' })}>View Details</button>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-info">
            <FaChartBar className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Monthly Revenue</h3>
            <p className="stat-value">AED {formatCurrency(stats.monthlyRevenue)}</p>
            <p className="stat-description">This month's earnings</p>
            <button onClick={() => onViewChange('revenue', { type: 'monthly' })}>View Details</button>
          </div>
        </div>

        <div className="stat-card stat-card-actions">
          <div className="stat-icon-wrapper stat-icon-accent">
            <FaBolt className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Quick Actions</h3>
            <p className="stat-description">Manage your website</p>
            <div className="quick-actions">
              <button onClick={() => onViewChange('list')}>View All Properties</button>
              <button onClick={() => onViewChange('form')} className="add-btn">+ Add New Property</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardView;

