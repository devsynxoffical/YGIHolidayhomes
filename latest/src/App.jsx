import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DashboardView from './components/DashboardView';
import PropertyList from './components/PropertyList';
import PropertyForm from './components/PropertyForm';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ygiholidayhomes-production.up.railway.app';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [editingProperty, setEditingProperty] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (authToken) => {
    setToken(authToken);
    setIsAuthenticated(true);
    localStorage.setItem('admin_token', authToken);
  };

  const handleLogout = () => {
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('admin_token');
    setCurrentView('dashboard');
    setEditingProperty(null);
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setCurrentView('form');
  };

  const handleAddProperty = () => {
    setEditingProperty(null);
    setCurrentView('form');
  };

  const handleFormCancel = () => {
    setEditingProperty(null);
    setCurrentView('list');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} apiBaseUrl={API_BASE_URL} />;
  }

  return (
    <div className="app">
      <Dashboard 
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
        onAddProperty={handleAddProperty}
      />
      
      <main className="main-content">
        {currentView === 'dashboard' && (
          <DashboardView 
            apiBaseUrl={API_BASE_URL}
            token={token}
            onViewChange={setCurrentView}
          />
        )}
        
        {currentView === 'list' && (
          <PropertyList 
            apiBaseUrl={API_BASE_URL}
            token={token}
            onEdit={handleEditProperty}
            onAdd={handleAddProperty}
          />
        )}
        
        {currentView === 'form' && (
          <PropertyForm 
            apiBaseUrl={API_BASE_URL}
            token={token}
            property={editingProperty}
            onCancel={handleFormCancel}
            onSuccess={() => setCurrentView('list')}
          />
        )}
      </main>
      </div>
  );
}

export default App;
