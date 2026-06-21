import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

export default function Header() {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="streak-badge">
          🔥 <span>{user?.currentStreak || 0} day streak</span>
        </div>
      </div>
      <div className="header-right">
        <button className="theme-toggle btn btn-ghost" onClick={toggle} title="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
}
