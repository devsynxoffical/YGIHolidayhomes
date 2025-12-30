import { useState, useEffect } from 'react';
import * as FaIcons from 'react-icons/fa';
import './Dashboard.css';

const { FaMoneyBillWave, FaChartBar, FaArrowLeft, FaCalendarAlt } = FaIcons;

function RevenueView({ apiBaseUrl, token, onViewChange, viewType = 'all' }) {
  // Dummy revenue data
  const DUMMY_REVENUE_DATA = {
    totalRevenue: 99754.43,
    monthlyRevenue: 8454.43,
    transactions: [
      { id: '1', date: '2025-01-15', property: 'Luxury Downtown Apartment', amount: 2250, type: 'booking' },
      { id: '2', date: '2025-01-18', property: 'Beachfront Villa', amount: 8400, type: 'booking' },
      { id: '3', date: '2025-01-20', property: 'Penthouse with Panoramic Views', amount: 14000, type: 'booking' },
      { id: '4', date: '2025-01-22', property: 'Modern Studio Apartment', amount: 840, type: 'booking' },
      { id: '5', date: '2025-01-25', property: 'Family-Friendly Apartment', amount: 2750, type: 'booking' },
      { id: '6', date: '2025-01-28', property: 'Luxury Downtown Apartment', amount: 2250, type: 'booking' },
      { id: '7', date: '2025-02-01', property: 'Cozy Garden Villa', amount: 5600, type: 'booking' },
      { id: '8', date: '2025-02-05', property: 'Executive Suite', amount: 3250, type: 'booking' },
      { id: '9', date: '2025-02-10', property: 'Beachfront Villa', amount: 6000, type: 'booking' },
      { id: '10', date: '2025-02-12', property: 'Penthouse with Panoramic Views', amount: 14000, type: 'booking' },
    ],
    monthlyBreakdown: [
      { month: 'January 2025', revenue: 91300.00, bookings: 6 },
      { month: 'February 2025', revenue: 8454.43, bookings: 4 },
    ],
    propertyBreakdown: [
      { property: 'Penthouse with Panoramic Views', revenue: 28000, bookings: 2 },
      { property: 'Beachfront Villa', revenue: 14400, bookings: 2 },
      { property: 'Cozy Garden Villa', revenue: 5600, bookings: 1 },
      { property: 'Executive Suite', revenue: 3250, bookings: 1 },
      { property: 'Luxury Downtown Apartment', revenue: 4500, bookings: 2 },
      { property: 'Family-Friendly Apartment', revenue: 2750, bookings: 1 },
      { property: 'Modern Studio Apartment', revenue: 840, bookings: 1 },
    ]
  };

  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usingDummyData, setUsingDummyData] = useState(true);
  const [filter, setFilter] = useState(viewType); // 'all', 'monthly', 'property'

  useEffect(() => {
    if (token) {
      fetchRevenueData();
    }
  }, [token]);

  const fetchRevenueData = async () => {
    if (!token) {
      console.warn('No token available, skipping revenue fetch');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/admin/revenue`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication failed - token may have expired');
          setError('Authentication failed. Please refresh the page and login again.');
          return;
        }
        throw new Error('Failed to fetch revenue data');
      }

      const data = await response.json();
      setRevenueData({
        totalRevenue: data.revenue?.totalRevenue || 0,
        monthlyRevenue: data.revenue?.monthlyRevenue || 0,
        transactions: data.revenue?.transactions || [],
        monthlyBreakdown: data.revenue?.monthlyBreakdown || [],
        propertyBreakdown: data.revenue?.propertyBreakdown || []
      });
      setUsingDummyData(false);
      setError('');
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      // Fallback to dummy data if backend fails
      setRevenueData(DUMMY_REVENUE_DATA);
      setUsingDummyData(true);
      setError('Using demo data (backend not connected)');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  if (loading) {
    return (
      <div className="dashboard-welcome">
        <div className="loading-state">Loading revenue data...</div>
      </div>
    );
  }

  const data = revenueData || DUMMY_REVENUE_DATA;
  const currentMonthTransactions = (data.transactions || []).filter(t => {
    const transactionDate = new Date(t.date);
    const now = new Date();
    return transactionDate.getMonth() === now.getMonth() && 
           transactionDate.getFullYear() === now.getFullYear();
  });

  return (
    <div className="dashboard-welcome">
      <div className="dashboard-header" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={() => onViewChange('dashboard')}
            style={{
              background: 'none',
              border: '1px solid #28a745',
              color: '#28a745',
              padding: '8px 15px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          <div>
            <h1>{viewType === 'monthly' ? 'Monthly Revenue' : 'Revenue Overview'}</h1>
            <p>Track earnings and financial performance</p>
          </div>
        </div>
      </div>

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

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <FaMoneyBillWave style={{ color: '#ffc107', fontSize: '24px' }} />
            <h3 style={{ margin: 0, fontSize: '16px', color: '#666' }}>Total Revenue</h3>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>
            AED {formatCurrency(data.totalRevenue)}
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
            All time earnings
          </div>
        </div>

        <div style={{
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <FaChartBar style={{ color: '#17a2b8', fontSize: '24px' }} />
            <h3 style={{ margin: 0, fontSize: '16px', color: '#666' }}>Monthly Revenue</h3>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#17a2b8' }}>
            AED {formatCurrency(data.monthlyRevenue)}
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
            This month's earnings
          </div>
        </div>

        <div style={{
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <FaCalendarAlt style={{ color: '#28a745', fontSize: '24px' }} />
            <h3 style={{ margin: 0, fontSize: '16px', color: '#666' }}>This Month</h3>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>
            {currentMonthTransactions.length}
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
            Transactions this month
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid #eee',
        paddingBottom: '10px'
      }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: `3px solid ${filter === 'all' ? '#28a745' : 'transparent'}`,
            background: 'none',
            color: filter === 'all' ? '#28a745' : '#666',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: filter === 'all' ? 'bold' : 'normal'
          }}
        >
          All Transactions
        </button>
        <button
          onClick={() => setFilter('monthly')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: `3px solid ${filter === 'monthly' ? '#28a745' : 'transparent'}`,
            background: 'none',
            color: filter === 'monthly' ? '#28a745' : '#666',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: filter === 'monthly' ? 'bold' : 'normal'
          }}
        >
          Monthly Breakdown
        </button>
        <button
          onClick={() => setFilter('property')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: `3px solid ${filter === 'property' ? '#28a745' : 'transparent'}`,
            background: 'none',
            color: filter === 'property' ? '#28a745' : '#666',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: filter === 'property' ? 'bold' : 'normal'
          }}
        >
          By Property
        </button>
      </div>

      {/* Content based on filter */}
      {filter === 'all' && (
        <div style={{ 
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '15px 20px',
            background: '#f8f9fa',
            borderBottom: '1px solid #ddd',
            fontWeight: 'bold'
          }}>
            Recent Transactions
          </div>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {(data.transactions || []).map((transaction) => (
              <div 
                key={transaction.id}
                style={{
                  padding: '15px 20px',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {transaction.property}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {formatDate(transaction.date)}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: '#28a745'
                }}>
                  AED {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filter === 'monthly' && (
        <div style={{ 
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '15px 20px',
            background: '#f8f9fa',
            borderBottom: '1px solid #ddd',
            fontWeight: 'bold'
          }}>
            Monthly Revenue Breakdown
          </div>
          <div>
            {(data.monthlyBreakdown || []).map((month, index) => (
              <div 
                key={index}
                style={{
                  padding: '20px',
                  borderBottom: index < (data.monthlyBreakdown || []).length - 1 ? '1px solid #eee' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                    {month.month}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {month.bookings} booking{month.bookings !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  color: '#28a745'
                }}>
                  AED {formatCurrency(month.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filter === 'property' && (
        <div style={{ 
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '15px 20px',
            background: '#f8f9fa',
            borderBottom: '1px solid #ddd',
            fontWeight: 'bold'
          }}>
            Revenue by Property
          </div>
          <div>
            {(data.propertyBreakdown || []).map((item, index) => (
              <div 
                key={index}
                style={{
                  padding: '20px',
                  borderBottom: index < (data.propertyBreakdown || []).length - 1 ? '1px solid #eee' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                    {item.property}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {item.bookings} booking{item.bookings !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  color: '#28a745'
                }}>
                  AED {formatCurrency(item.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RevenueView;

