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

  const [statistics, setStatistics] = useState(DUMMY_STATISTICS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usingDummyData, setUsingDummyData] = useState(true);

  useEffect(() => {
    fetchStatistics();
    // Refresh statistics every 30 seconds
    const interval = setInterval(fetchStatistics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/admin/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      if (data.success && data.statistics) {
        setStatistics(data.statistics);
        setUsingDummyData(false);
        setError('');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
      // Use dummy data when backend is not available
      setStatistics(DUMMY_STATISTICS);
      setUsingDummyData(true);
      setError('Using demo data (backend not connected)');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !statistics) {
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

  return (
    <div className="dashboard-welcome">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome to YGI Holiday Homes Admin Panel</p>
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
      {usingDummyData && (
        <div style={{ 
          backgroundColor: '#d1ecf1',
          color: '#0c5460',
          border: '1px solid #bee5eb',
          padding: '8px 12px',
          borderRadius: '4px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          ℹ️ Using demo data (backend not connected)
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

