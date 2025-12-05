// Google Apps Script for YGI Holiday Homes Booking System

// Required function for web app deployment
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'Google Apps Script is running correctly!',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    // Get the active spreadsheet - make sure you have a Google Sheet open when deploying
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getActiveSheet();
    
    // Log for debugging
    console.log('Spreadsheet name:', spreadsheet.getName());
    console.log('Sheet name:', sheet.getName());
    
    let data;
    
    // Handle both JSON and form data
    if (e.postData && e.postData.contents) {
      try {
        // Try to parse as JSON first
        data = JSON.parse(e.postData.contents);
        console.log('Received JSON data:', data);
      } catch (error) {
        console.log('Not JSON, treating as form data');
        // If not JSON, treat as form data
        data = e.parameter;
      }
    } else {
      // Form data
      data = e.parameter;
      console.log('Received form data:', data);
    }
    
    // Get current timestamp
    const timestamp = new Date();
    
    // Prepare row data
    const rowData = [
      timestamp,
      data.propertyId || '',
      data.propertyName || '',
      data.guestName || data.name || '',
      data.email || '',
      data.phone || '',
      data.checkIn || '',
      data.checkOut || '',
      data.guests || '',
      data.totalPrice || '',
      'New Booking'
    ];
    
    // Log the data being added
    console.log('Adding row data:', rowData);
    
    // Add the data to the sheet
    sheet.appendRow(rowData);
    
    // Log success
    console.log('Data successfully added to sheet');
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Booking submitted successfully!',
        bookingId: timestamp.getTime()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log the error for debugging
    console.error('Error in doPost:', error);
    console.error('Error stack:', error.stack);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Error submitting booking: ' + error.toString(),
        error: error.message,
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Function to set up sheet headers
function setupSheetHeaders() {
  const sheet = SpreadsheetApp.getActiveSheet();
  
  // Check if headers already exist
  const firstRow = sheet.getRange(1, 1, 1, 11).getValues()[0];
  const hasHeaders = firstRow[0] === 'Timestamp';
  
  if (!hasHeaders) {
    // Add headers
    const headers = [
      'Timestamp',
      'Property ID', 
      'Property Name',
      'Guest Name',
      'Email',
      'Phone',
      'Check In',
      'Check Out',
      'Guests',
      'Total Price',
      'Status'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    console.log('Headers added to sheet');
  } else {
    console.log('Headers already exist');
  }
}

// Test function to verify the script works
function testBooking() {
  // First setup headers
  setupSheetHeaders();
  
  const testData = {
    propertyId: 'TEST001',
    propertyName: '2-BR Princess Tower',
    guestName: 'John Doe',
    email: 'john@example.com',
    phone: '+971501234567',
    checkIn: '2024-01-15',
    checkOut: '2024-01-20',
    guests: 4,
    totalPrice: 4000
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  console.log(result.getContent());
}

// Test function for form data
function testFormData() {
  // First setup headers
  setupSheetHeaders();
  
  const mockEvent = {
    parameter: {
      propertyId: 'FORM_TEST_001',
      propertyName: 'Form Test Property',
      name: 'Form Test User',
      email: 'formtest@example.com',
      phone: '+971501234567',
      checkIn: '2024-01-15',
      checkOut: '2024-01-20',
      guests: 2,
      totalPrice: 1000
    }
  };
  
  const result = doPost(mockEvent);
  console.log(result.getContent());
}
