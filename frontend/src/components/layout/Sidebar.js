import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard',    icon: '⚡', label: 'Dashboard' },
  { to: '/subjects',     icon: '📚', label: 'Subjects' },
  { to: '/analytics',    icon: '📊', label: 'Analytics' },
  { to: '/leaderboard',  icon: '🏆', label: 'Leaderboard' },
  { to: '/certificates', icon: '🎓', label: 'Certificates' },
  { to: '/history',      icon: '🕓', label: 'History' },
  { to: '/profile',      icon: '👤', label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">⚡</span>
        <span className="logo-text">PrepMetrics</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink to="/admin" className="nav-item nav-admin">
            <span className="nav-icon">🛡️</span>
            <span className="nav-label">Admin Panel</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>
        <button className="btn btn-ghost logout-btn" onClick={() => { logout(); navigate('/login'); }}>
          ↩ Sign out
        </button>
      </div>
    </aside>
  );
}
