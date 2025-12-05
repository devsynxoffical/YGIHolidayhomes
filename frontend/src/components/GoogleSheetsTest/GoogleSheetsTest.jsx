import React, { useState } from 'react';
import { testGoogleSheetsConnection, testWebAppAccess, testFormSubmission } from '../../utils/googleSheets';
import './GoogleSheetsTest.css';

const GoogleSheetsTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [webAppResult, setWebAppResult] = useState(null);
  const [formTestResult, setFormTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingWebApp, setIsTestingWebApp] = useState(false);
  const [isTestingForm, setIsTestingForm] = useState(false);

  const handleTestWebApp = async () => {
    setIsTestingWebApp(true);
    setWebAppResult(null);
    
    try {
      const result = await testWebAppAccess();
      setWebAppResult(result);
    } catch (error) {
      setWebAppResult({
        success: false,
        error: 'Test failed: ' + error.message
      });
    } finally {
      setIsTestingWebApp(false);
    }
  };

  const handleTestForm = async () => {
    setIsTestingForm(true);
    setFormTestResult(null);
    
    try {
      const result = await testFormSubmission();
      setFormTestResult(result);
    } catch (error) {
      setFormTestResult({
        success: false,
        message: 'Form test failed: ' + error.message,
        error: error.message
      });
    } finally {
      setIsTestingForm(false);
    }
  };

  const handleTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const result = await testGoogleSheetsConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed: ' + error.message,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="google-sheets-test">
      <h3>Google Sheets Connection Test</h3>
      <p>Use this to test if your Google Sheets integration is working properly.</p>
      
      <div className="test-buttons">
        <button 
          onClick={handleTestWebApp} 
          disabled={isTestingWebApp}
          className="test-button web-app-test"
        >
          {isTestingWebApp ? 'Testing Web App...' : 'Test Web App Access'}
        </button>
        
        <button 
          onClick={handleTestForm} 
          disabled={isTestingForm}
          className="test-button form-test"
        >
          {isTestingForm ? 'Testing Form...' : 'Test Form Submission'}
        </button>
        
        <button 
          onClick={handleTest} 
          disabled={isLoading}
          className="test-button"
        >
          {isLoading ? 'Testing...' : 'Test Full Connection'}
        </button>
      </div>

      {webAppResult && (
        <div className={`test-result ${webAppResult.success ? 'success' : 'error'}`}>
          <h4>Web App Test: {webAppResult.success ? '✅ Success!' : '❌ Failed'}</h4>
          {webAppResult.success ? (
            <div>
              <p><strong>Message:</strong> {webAppResult.data?.message}</p>
              <p><strong>Timestamp:</strong> {webAppResult.data?.timestamp}</p>
            </div>
          ) : (
            <p><strong>Error:</strong> {webAppResult.error}</p>
          )}
        </div>
      )}

      {formTestResult && (
        <div className={`test-result ${formTestResult.success ? 'success' : 'error'}`}>
          <h4>Form Test: {formTestResult.success ? '✅ Success!' : '❌ Failed'}</h4>
          <p><strong>Message:</strong> {formTestResult.message}</p>
          {formTestResult.error && (
            <p><strong>Error:</strong> {formTestResult.error}</p>
          )}
          {formTestResult.bookingId && (
            <p><strong>Booking ID:</strong> {formTestResult.bookingId}</p>
          )}
        </div>
      )}

      {testResult && (
        <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
          <h4>Full Test: {testResult.success ? '✅ Success!' : '❌ Failed'}</h4>
          <p><strong>Message:</strong> {testResult.message}</p>
          {testResult.error && (
            <p><strong>Error:</strong> {testResult.error}</p>
          )}
          {testResult.bookingId && (
            <p><strong>Booking ID:</strong> {testResult.bookingId}</p>
          )}
        </div>
      )}

      <div className="setup-instructions">
        <h4>Setup Instructions:</h4>
        <ol>
          <li>Create a new Google Sheet</li>
          <li>Add these headers in row 1: Timestamp, Property ID, Property Name, Guest Name, Email, Phone, Check In, Check Out, Guests, Total Price, Status</li>
          <li>Go to Google Apps Script (script.google.com)</li>
          <li>Create a new project and paste the code from google-apps-script.js</li>
          <li>Deploy as web app with these settings:
            <ul>
              <li>Execute as: Me</li>
              <li>Who has access: Anyone</li>
            </ul>
          </li>
          <li>Copy the web app URL and update it in googleSheets.js</li>
        </ol>
      </div>
    </div>
  );
};

export default GoogleSheetsTest;
