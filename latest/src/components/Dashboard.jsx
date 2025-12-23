import './Dashboard.css';

function Dashboard({ currentView, onViewChange, onLogout, onAddProperty }) {
  return (
    <nav className="dashboard-nav">
      <div className="nav-header">
        <div className="nav-logo-container">
          <img 
            src="https://www.ygiholidayhomes.com/Images/logoFinal.png" 
            alt="YGI Holiday Homes" 
            className="nav-logo"
            onError={(e) => {
              // Fallback if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <h2 className="nav-logo-text" style={{ display: 'none' }}>YGI Admin</h2>
        </div>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
      <ul className="nav-menu">
        <li>
          <button 
            className={currentView === 'dashboard' ? 'active' : ''}
            onClick={() => onViewChange('dashboard')}
          >
            Dashboard
          </button>
        </li>
        <li>
          <button 
            className={currentView === 'list' ? 'active' : ''}
            onClick={() => onViewChange('list')}
          >
            Properties
          </button>
        </li>
        <li>
          <button 
            className={currentView === 'form' ? 'active' : ''}
            onClick={onAddProperty}
          >
            + Add Property
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Dashboard;

