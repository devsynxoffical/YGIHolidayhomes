import { useState, useEffect } from 'react';
import './Dashboard.css';

function DashboardView({ apiBaseUrl, token, onViewChange }) {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setStatistics(data.statistics);
      setError('');
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Failed to load statistics');
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

  const stats = statistics || {
    totalProperties: 0,
    availableProperties: 0,
    totalBookings: 0,
    currentBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  };

  return (
    <div className="dashboard-welcome">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome to YGI Holiday Homes Admin Panel</p>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">🏠</div>
          <div className="stat-content">
            <h3>Total Properties</h3>
            <p className="stat-value">{stats.totalProperties}</p>
            <p className="stat-description">{stats.availableProperties} available</p>
            <button onClick={() => onViewChange('list')}>Manage Properties</button>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Total Bookings</h3>
            <p className="stat-value">{stats.totalBookings}</p>
            <p className="stat-description">All time bookings</p>
            <button onClick={() => onViewChange('list')}>View Details</button>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Current Bookings</h3>
            <p className="stat-value">{stats.currentBookings}</p>
            <p className="stat-description">Active in last 30 days</p>
            <button onClick={() => onViewChange('list')}>View Details</button>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">AED {stats.totalRevenue.toLocaleString()}</p>
            <p className="stat-description">All time earnings</p>
            <button onClick={() => onViewChange('list')}>View Details</button>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Monthly Revenue</h3>
            <p className="stat-value">AED {stats.monthlyRevenue.toLocaleString()}</p>
            <p className="stat-description">This month's earnings</p>
            <button onClick={() => onViewChange('list')}>View Details</button>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
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

