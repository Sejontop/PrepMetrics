import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './AdminLayout.css';

const adminNav = [
  { to: '/admin',           icon: '📊', label: 'Overview', end: true },
  { to: '/admin/questions', icon: '❓', label: 'Questions' },
  { to: '/admin/subjects',  icon: '📚', label: 'Subjects' },
  { to: '/admin/users',     icon: '👥', label: 'Users' },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">🛡️ Admin Panel</div>
        <nav className="admin-nav">
          {adminNav.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}>
              {n.icon} {n.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '12px' }}>
          <NavLink to="/dashboard" className="admin-nav-item">← User View</NavLink>
          <button className="btn btn-danger" style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
            onClick={() => { logout(); navigate('/login'); }}>Sign Out</button>
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-topbar">
          <span style={{ fontWeight: 700, fontSize: 16 }}>PrepMetrics Admin</span>
          <button className="btn btn-ghost" onClick={toggle}>{theme === 'light' ? '🌙' : '☀️'}</button>
        </div>
        <main className="admin-content"><Outlet /></main>
      </div>
    </div>
  );
}
