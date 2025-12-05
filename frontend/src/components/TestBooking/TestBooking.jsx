import React, { useState } from 'react';
import { submitBookingToGoogleSheets } from '../../utils/googleSheets';

const TestBooking = () => {
  const [testData, setTestData] = useState({
    propertyId: 'TEST001',
    propertyName: '2-BR Princess Tower',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+971501234567',
    checkIn: '2024-01-15',
    checkOut: '2024-01-20',
    guests: 4,
    totalPrice: 4000
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await submitBookingToGoogleSheets(testData);
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        message: 'Test failed: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Test Google Sheets Integration</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Test Data:</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div>
            <label>Property ID:</label>
            <input
              type="text"
              value={testData.propertyId}
              onChange={(e) => handleInputChange('propertyId', e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <div>
            <label>Property Name:</label>
            <input
              type="text"
              value={testData.propertyName}
              onChange={(e) => handleInputChange('propertyName', e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <div>
            <label>Guest Name:</label>
            <input
              type="text"
              value={testData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={testData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <div>
            <label>Phone:</label>
            <input
              type="tel"
              value={testData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <div>
            <label>Check-in Date:</label>
            <input
              type="date"
              value={testData.checkIn}
              onChange={(e) => handleInputChange('checkIn', e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <div>
            <label>Check-out Date:</label>
            <input
              type="date"
              value={testData.checkOut}
              onChange={(e) => handleInputChange('checkOut', e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <div>
            <label>Number of Guests:</label>
            <input
              type="number"
              value={testData.guests}
              onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <div>
            <label>Total Price:</label>
            <input
              type="number"
              value={testData.totalPrice}
              onChange={(e) => handleInputChange('totalPrice', parseFloat(e.target.value))}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        </div>
      </div>
      
      <button
        onClick={handleTest}
        disabled={loading}
        style={{
          padding: '12px 24px',
          backgroundColor: '#0FA968',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Testing...' : 'Test Booking Submission'}
      </button>
      
      {result && (
        <div style={{
          padding: '15px',
          borderRadius: '8px',
          backgroundColor: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          color: result.success ? '#155724' : '#721c24'
        }}>
          <h4>{result.success ? 'Success!' : 'Error'}</h4>
          <p>{result.message}</p>
          {result.bookingId && <p>Booking ID: {result.bookingId}</p>}
        </div>
      )}
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h4>Instructions:</h4>
        <ol>
          <li>Make sure you've set up your Google Apps Script and deployed it</li>
          <li>Update the GOOGLE_APPS_SCRIPT_URL in frontend/src/utils/googleSheets.js</li>
          <li>Click "Test Booking Submission" to send test data to your Google Sheet</li>
          <li>Check your Google Sheet to see if the data appears</li>
        </ol>
      </div>
    </div>
  );
};

export default TestBooking;
