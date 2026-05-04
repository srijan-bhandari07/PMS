import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header({ onToggleSidebar, onOpenMaintLog, onOpenManageUsers }) {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const isAdmin = (currentUser?.role || '').toLowerCase() === 'admin';

  return (
    <header>
      <button className="hamburger" aria-label="Toggle sidebar" onClick={onToggleSidebar}>
        <i className="fas fa-bars" />
        <span style={{ display: 'none' }}>Menu</span>
      </button>

      <div className="logo">
        <h1>PMS</h1>
      </div>

      <div className="top-nav">
        <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">
          Dashboard
        </Link>

        {isAdmin && (
          <Link
            className={`nav-link ${location.pathname === '/manager-insights' ? 'active' : ''}`}
            to="/manager-insights"
          >
            Managerial Insights
          </Link>
        )}
      </div>

      <div className="user-info">
        {isAdmin && (
          <>
            <button
              className="btn small"
              onClick={onOpenMaintLog}
              title="Open Maintenance Log"
              type="button"
            >
              <i className="fas fa-clipboard-list" /> Maintenance Log
            </button>

            <button
              className="btn small"
              onClick={onOpenManageUsers}
              title="Manage Users"
              type="button"
            >
              <i className="fas fa-users-cog" /> Manage Users
            </button>
          </>
        )}

        <img
          src="https://xsgames.co/randomusers/avatar.php?g=male"
          alt="User"
        />
        <div>{currentUser?.name || 'Guest'}</div>
        <span className="role-pill">{currentUser?.role || 'user'}</span>

        <button className="btn small" onClick={logout} type="button">
          <i className="fas fa-sign-out-alt" /> Logout
        </button>
      </div>
    </header>
  );
}