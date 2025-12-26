import { useState, useEffect } from 'react';
import * as FaIcons from 'react-icons/fa';
import './Dashboard.css';

const { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaArrowLeft } = FaIcons;

function BookingsView({ apiBaseUrl, token, onViewChange, viewType = 'all' }) {
  // Dummy bookings data
  const DUMMY_BOOKINGS = [
    {
      id: '1',
      propertyId: '1',
      propertyTitle: 'Luxury Downtown Apartment',
      guestName: 'John Smith',
      guestEmail: 'john.smith@email.com',
      checkIn: '2025-01-15',
      checkOut: '2025-01-20',
      nights: 5,
      totalAmount: 2250,
      status: 'confirmed',
      bookingDate: '2025-01-10',
      paymentStatus: 'paid'
    },
    {
      id: '2',
      propertyId: '2',
      propertyTitle: 'Beachfront Villa',
      guestName: 'Sarah Johnson',
      guestEmail: 'sarah.j@email.com',
      checkIn: '2025-01-18',
      checkOut: '2025-01-25',
      nights: 7,
      totalAmount: 8400,
      status: 'confirmed',
      bookingDate: '2025-01-12',
      paymentStatus: 'paid'
    },
    {
      id: '3',
      propertyId: '4',
      propertyTitle: 'Penthouse with Panoramic Views',
      guestName: 'Michael Chen',
      guestEmail: 'm.chen@email.com',
      checkIn: '2025-01-20',
      checkOut: '2025-01-27',
      nights: 7,
      totalAmount: 14000,
      status: 'confirmed',
      bookingDate: '2025-01-14',
      paymentStatus: 'paid'
    },
    {
      id: '4',
      propertyId: '3',
      propertyTitle: 'Modern Studio Apartment',
      guestName: 'Emma Wilson',
      guestEmail: 'emma.w@email.com',
      checkIn: '2025-01-22',
      checkOut: '2025-01-25',
      nights: 3,
      totalAmount: 840,
      status: 'pending',
      bookingDate: '2025-01-16',
      paymentStatus: 'pending'
    },
    {
      id: '5',
      propertyId: '5',
      propertyTitle: 'Family-Friendly Apartment',
      guestName: 'David Brown',
      guestEmail: 'd.brown@email.com',
      checkIn: '2025-01-25',
      checkOut: '2025-01-30',
      nights: 5,
      totalAmount: 2750,
      status: 'confirmed',
      bookingDate: '2025-01-18',
      paymentStatus: 'paid'
    },
    {
      id: '6',
      propertyId: '1',
      propertyTitle: 'Luxury Downtown Apartment',
      guestName: 'Lisa Anderson',
      guestEmail: 'lisa.a@email.com',
      checkIn: '2025-01-28',
      checkOut: '2025-02-02',
      nights: 5,
      totalAmount: 2250,
      status: 'confirmed',
      bookingDate: '2025-01-20',
      paymentStatus: 'paid'
    },
    {
      id: '7',
      propertyId: '6',
      propertyTitle: 'Cozy Garden Villa',
      guestName: 'Robert Taylor',
      guestEmail: 'r.taylor@email.com',
      checkIn: '2025-02-01',
      checkOut: '2025-02-08',
      nights: 7,
      totalAmount: 5600,
      status: 'confirmed',
      bookingDate: '2025-01-22',
      paymentStatus: 'paid'
    },
    {
      id: '8',
      propertyId: '7',
      propertyTitle: 'Executive Suite',
      guestName: 'Jennifer Lee',
      guestEmail: 'j.lee@email.com',
      checkIn: '2025-02-05',
      checkOut: '2025-02-10',
      nights: 5,
      totalAmount: 3250,
      status: 'confirmed',
      bookingDate: '2025-01-24',
      paymentStatus: 'paid'
    },
    {
      id: '9',
      propertyId: '2',
      propertyTitle: 'Beachfront Villa',
      guestName: 'Thomas White',
      guestEmail: 't.white@email.com',
      checkIn: '2025-02-10',
      checkOut: '2025-02-15',
      nights: 5,
      totalAmount: 6000,
      status: 'confirmed',
      bookingDate: '2025-01-26',
      paymentStatus: 'paid'
    },
    {
      id: '10',
      propertyId: '4',
      propertyTitle: 'Penthouse with Panoramic Views',
      guestName: 'Amanda Martinez',
      guestEmail: 'a.martinez@email.com',
      checkIn: '2025-02-12',
      checkOut: '2025-02-19',
      nights: 7,
      totalAmount: 14000,
      status: 'confirmed',
      bookingDate: '2025-01-28',
      paymentStatus: 'paid'
    }
  ];

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usingDummyData, setUsingDummyData] = useState(true);
  const [filter, setFilter] = useState(viewType); // 'all', 'current', 'confirmed', 'pending'

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const filterParam = filter === 'all' ? '' : `?filter=${filter}`;
      const response = await fetch(`${apiBaseUrl}/api/admin/bookings${filterParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings || []);
      setUsingDummyData(false);
      setError('');
    } catch (err) {
      console.error('Error fetching bookings:', err);
      // Fallback to dummy data if backend fails
      setBookings(DUMMY_BOOKINGS);
      setUsingDummyData(true);
      setError('Using demo data (backend not connected)');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Check if date is valid and not epoch date
      if (isNaN(date.getTime()) || date.getFullYear() < 2000) {
        return 'N/A';
      }
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const getFilteredBookings = () => {
    // First, filter out incomplete bookings (missing critical info or invalid dates)
    let validBookings = bookings.filter(b => {
      // Must have property title and guest name
      if (!b.propertyTitle || b.propertyTitle === 'Unknown Property' || 
          !b.guestName || b.guestName === 'Unknown Guest') {
        return false;
      }
      // Must have valid dates
      if (!b.checkIn || !b.checkOut) return false;
      try {
        const checkInDate = new Date(b.checkIn);
        const checkOutDate = new Date(b.checkOut);
        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) return false;
        // Check if dates are not epoch (Jan 1, 1970) or before 2000
        if (checkInDate.getFullYear() < 2000 || checkOutDate.getFullYear() < 2000) return false;
        return true;
      } catch (e) {
        return false;
      }
    });

    // Apply additional filters
    if (filter === 'current') {
      // Show bookings from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return validBookings.filter(b => new Date(b.bookingDate) >= thirtyDaysAgo);
    }
    if (filter === 'confirmed') {
      return validBookings.filter(b => b.status === 'confirmed');
    }
    if (filter === 'pending') {
      return validBookings.filter(b => b.status === 'pending');
    }
    return validBookings;
  };

  const filteredBookings = getFilteredBookings();
  const totalRevenue = filteredBookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  if (loading) {
    return (
      <div className="dashboard-welcome">
        <div className="loading-state">Loading bookings...</div>
      </div>
    );
  }

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
            <h1>{viewType === 'current' ? 'Current Bookings' : 'All Bookings'}</h1>
            <p>Manage and view all booking information</p>
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
      {!usingDummyData && bookings.length > 0 && (
        <div style={{ 
          backgroundColor: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffc107',
          padding: '8px 12px',
          borderRadius: '4px',
          marginBottom: '20px',
          fontSize: '13px'
        }}>
          ℹ️ Only bookings with complete information (property name, guest name, and valid dates) are displayed. Incomplete bookings are automatically filtered out.
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px',
              border: `1px solid ${filter === 'all' ? '#28a745' : '#ddd'}`,
              background: filter === 'all' ? '#28a745' : 'white',
              color: filter === 'all' ? 'white' : '#333',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('current')}
            style={{
              padding: '8px 16px',
              border: `1px solid ${filter === 'current' ? '#28a745' : '#ddd'}`,
              background: filter === 'current' ? '#28a745' : 'white',
              color: filter === 'current' ? 'white' : '#333',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Last 30 Days ({bookings.filter(b => {
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              return new Date(b.bookingDate) >= thirtyDaysAgo;
            }).length})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            style={{
              padding: '8px 16px',
              border: `1px solid ${filter === 'confirmed' ? '#28a745' : '#ddd'}`,
              background: filter === 'confirmed' ? '#28a745' : 'white',
              color: filter === 'confirmed' ? 'white' : '#333',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            style={{
              padding: '8px 16px',
              border: `1px solid ${filter === 'pending' ? '#28a745' : '#ddd'}`,
              background: filter === 'pending' ? '#28a745' : 'white',
              color: filter === 'pending' ? 'white' : '#333',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Pending ({bookings.filter(b => b.status === 'pending').length})
          </button>
        </div>
        <div style={{ 
          padding: '12px 20px',
          background: '#f8f9fa',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#28a745'
        }}>
          Total Revenue: AED {formatCurrency(totalRevenue)}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          background: '#f8f9fa',
          borderRadius: '4px'
        }}>
          <p style={{ fontSize: '16px', marginBottom: '10px' }}>No bookings found for the selected filter.</p>
          {usingDummyData && (
            <p style={{ fontSize: '14px', color: '#666' }}>
              Note: Only bookings with complete information are displayed. Incomplete bookings from Stripe (missing property name, guest name, or dates) are automatically filtered out.
            </p>
          )}
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gap: '15px'
        }}>
          {filteredBookings.map((booking) => (
            <div 
              key={booking.id}
              style={{
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '15px'
              }}>
                <div style={{ flex: '1', minWidth: '250px' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                    {booking.propertyTitle}
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    <div><strong>Guest:</strong> {booking.guestName}</div>
                    <div><strong>Email:</strong> {booking.guestEmail}</div>
                    <div>
                      <strong>Check-in:</strong> {formatDate(booking.checkIn)} → 
                      <strong> Check-out:</strong> {formatDate(booking.checkOut)}
                      {(!booking.checkIn || !booking.checkOut || formatDate(booking.checkIn) === 'N/A' || formatDate(booking.checkOut) === 'N/A') && (
                        <span style={{ color: '#dc3545', fontSize: '12px', marginLeft: '10px' }}>
                          (Incomplete booking data)
                        </span>
                      )}
                    </div>
                    <div><strong>Nights:</strong> {booking.nights}</div>
                  </div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '10px'
                }}>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold',
                    color: '#28a745'
                  }}>
                    AED {formatCurrency(booking.totalAmount)}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: booking.status === 'confirmed' ? '#d4edda' : '#fff3cd',
                      color: booking.status === 'confirmed' ? '#155724' : '#856404',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {booking.status === 'confirmed' ? <FaCheckCircle /> : <FaTimesCircle />} {booking.status}
                    </span>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: booking.paymentStatus === 'paid' ? '#d1ecf1' : '#f8d7da',
                      color: booking.paymentStatus === 'paid' ? '#0c5460' : '#721c24'
                    }}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    Booked: {formatDate(booking.bookingDate)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingsView;

