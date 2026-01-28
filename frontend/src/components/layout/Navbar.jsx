// src/components/layout/Navbar.js
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';
import logo from '../../assets/PrepMetrics.png'; //no default import of logo

const Navbar = () => {

  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img className="logo-icon" src={logo}/>
          PrepMetrics
        </Link>

        {isAuthenticated && (
          <ul className="navbar-menu">
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/subjects">Subjects</Link></li>
            <li><Link to="/analytics">Analytics</Link></li>
            <li><Link to="/leaderboard">Leaderboard</Link></li>
            <li><Link to="/certificates">Certificates</Link></li>
            {isAdmin && <li><Link to="/admin">Admin</Link></li>}
          </ul>
        )}

        <div className="navbar-actions">
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          {isAuthenticated ? (
            <div className="user-menu">
              <Link to="/profile" className="user-profile">
                <span className="user-avatar">{user?.name?.charAt(0)}</span>
                <span className="user-name">{user?.name}</span>
              </Link>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link 
                to="/login" 
                className={`auth-btn ${location.pathname === '/login' ? 'active' : ''}`}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className={`auth-btn ${location.pathname === '/register' ? 'active' : ''}`}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;