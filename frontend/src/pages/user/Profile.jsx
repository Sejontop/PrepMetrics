// src/pages/user/Profile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    theme: 'light',
    defaultDifficulty: 'medium'
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.profile?.bio || '',
        theme: user.preferences?.theme || 'light',
        defaultDifficulty: user.preferences?.defaultDifficulty || 'medium'
      });
    }
    fetchUserStats();
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const response = await axios.get('/users/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await updateProfile(formData);
      setMessage('Profile updated successfully! ✓');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !stats) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-large">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p className="profile-email">{user.email}</p>
          <span className="profile-role">{user.role === 'admin' ? '👑 Admin' : '🎓 Student'}</span>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      {/* Statistics Overview */}
      <div className="stats-section">
        <h2>Your Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>{stats.totalQuizzes}</h3>
              <p>Total Quizzes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.averageAccuracy}%</h3>
              <p>Avg Accuracy</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <h3>{stats.currentStreak}</h3>
              <p>Current Streak</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <h3>{stats.totalTimeSpent}m</h3>
              <p>Total Time</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3>{stats.totalQuestionsAttempted}</h3>
              <p>Questions Done</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏅</div>
            <div className="stat-content">
              <h3>{stats.longestStreak}</h3>
              <p>Best Streak</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>{stats.subjectsStarted}</h3>
              <p>Subjects Started</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎓</div>
            <div className="stat-content">
              <h3>{stats.certificatesEarned}</h3>
              <p>Certificates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="settings-section">
        <div className="section-header">
          <h2>Profile Settings</h2>
          {!isEditing && (
            <button 
              className="btn-edit"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio (Optional)</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="theme">Theme Preference</label>
              <select
                id="theme"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
              >
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="defaultDifficulty">Default Quiz Difficulty</label>
              <select
                id="defaultDifficulty"
                name="defaultDifficulty"
                value={formData.defaultDifficulty}
                onChange={handleChange}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-save"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-display">
            <div className="display-item">
              <label>Name:</label>
              <span>{user.name}</span>
            </div>
            <div className="display-item">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            <div className="display-item">
              <label>Bio:</label>
              <span>{user.profile?.bio || 'No bio added yet'}</span>
            </div>
            <div className="display-item">
              <label>Theme:</label>
              <span className="capitalize">{user.preferences?.theme}</span>
            </div>
            <div className="display-item">
              <label>Default Difficulty:</label>
              <span className="capitalize">{user.preferences?.defaultDifficulty}</span>
            </div>
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="account-section">
        <h2>Account Information</h2>
        <div className="account-info">
          <div className="info-item">
            <span className="info-label">Member Since:</span>
            <span className="info-value">
              {new Date(user.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Last Active:</span>
            <span className="info-value">
              {user.profile?.lastActivityDate 
                ? new Date(user.profile.lastActivityDate).toLocaleDateString()
                : 'Today'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Account Type:</span>
            <span className="info-value capitalize">{user.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
