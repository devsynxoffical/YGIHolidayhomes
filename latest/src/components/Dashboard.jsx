import './Dashboard.css';

function Dashboard({ currentView, onViewChange, onLogout, onAddProperty }) {
  return (
    <nav className="dashboard-nav">
      <div className="nav-header">
        <h2>YGI Admin</h2>
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

