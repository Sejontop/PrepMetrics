// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Admin.css';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  const fetchAdminAnalytics = async () => {
    try {
      const response = await axios.get('/api/admin/analytics');
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching admin analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  if (!analytics) {
    return <div className="no-data">Failed to load analytics</div>;
  }

  const { overview, subjectStats, difficultyStats, topUsers, recentActivity } = analytics;

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>👑 Admin Dashboard</h1>
        <p>Platform management and analytics</p>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/admin/questions" className="action-card">
          <span className="action-icon">📝</span>
          <div className="action-content">
            <h3>Manage Questions</h3>
            <p>Add, edit, or delete questions</p>
          </div>
        </Link>

        <Link to="/admin/subjects" className="action-card">
          <span className="action-icon">📚</span>
          <div className="action-content">
            <h3>Manage Subjects</h3>
            <p>Configure subjects and topics</p>
          </div>
        </Link>

        <div className="action-card" onClick={() => alert('Feature coming soon!')}>
          <span className="action-icon">👥</span>
          <div className="action-content">
            <h3>Manage Users</h3>
            <p>View and moderate users</p>
          </div>
        </div>

        <div className="action-card" onClick={() => alert('Feature coming soon!')}>
          <span className="action-icon">📊</span>
          <div className="action-content">
            <h3>Reports</h3>
            <p>Generate detailed reports</p>
          </div>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="overview-section">
        <h2>Platform Overview</h2>
        <div className="overview-grid">
          <div className="overview-card">
            <div className="overview-icon users">👥</div>
            <div className="overview-content">
              <h3>{overview.totalUsers}</h3>
              <p>Total Users</p>
              <span className="overview-subtext">{overview.activeUsers} active</span>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon quizzes">🎯</div>
            <div className="overview-content">
              <h3>{overview.totalQuizzes}</h3>
              <p>Total Quizzes</p>
              <span className="overview-subtext">{overview.avgQuizzesPerUser} avg/user</span>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon questions">❓</div>
            <div className="overview-content">
              <h3>{overview.totalQuestions}</h3>
              <p>Total Questions</p>
              <span className="overview-subtext">In database</span>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon subjects">📚</div>
            <div className="overview-content">
              <h3>{overview.totalSubjects}</h3>
              <p>Active Subjects</p>
              <span className="overview-subtext">Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Subject Performance */}
        <div className="chart-section">
          <h2>Subject Performance</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalAttempts" fill="#6366f1" name="Attempts" />
                <Bar dataKey="avgAccuracy" fill="#10b981" name="Avg Accuracy" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Difficulty Distribution */}
        <div className="chart-section">
          <h2>Question Difficulty Distribution</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({_id, count}) => `${_id}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {difficultyStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="top-performers-section">
        <h2>Top Performers</h2>
        <div className="performers-table-container">
          <table className="performers-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Email</th>
                <th>Quizzes</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((user, idx) => (
                <tr key={user._id}>
                  <td>#{idx + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.totalQuizzes}</td>
                  <td>
                    <span className="accuracy-badge">
                      {user.accuracy.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <h2>Recent Quiz Activity</h2>
        <div className="activity-list">
          {recentActivity.map((activity) => (
            <div key={activity._id} className="activity-item">
              <div className="activity-avatar">
                {activity.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="activity-details">
                <p className="activity-user">{activity.user?.name || 'Unknown User'}</p>
                <p className="activity-text">
                  Completed <strong>{activity.subject?.name}</strong> quiz
                </p>
                <p className="activity-stats">
                  Score: {activity.results?.marksObtained}/{activity.results?.totalMarks} • 
                  Accuracy: {activity.results?.accuracy}%
                </p>
              </div>
              <div className="activity-time">
                {new Date(activity.completedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
