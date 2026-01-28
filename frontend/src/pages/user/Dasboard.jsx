// src/pages/user/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, quizzesRes] = await Promise.all([
        axios.get('/api/analytics/dashboard'),
        axios.get('/api/quizzes/history?limit=5')
      ]);
      
      setStats(analyticsRes.data.data);
      setRecentQuizzes(quizzesRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}! 👋</h1>
        <p className="subtitle">Here's your learning journey at a glance</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>{stats?.overallStats.totalQuizzes || 0}</h3>
            <p>Quizzes Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats?.overallStats.overallAccuracy || 0}%</h3>
            <p>Overall Accuracy</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>{stats?.overallStats.currentStreak || 0}</h3>
            <p>Day Streak</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{stats?.overallStats.totalQuestions || 0}</h3>
            <p>Questions Attempted</p>
          </div>
        </div>
      </div>

      {/* Subject Progress */}
      <div className="section">
        <div className="section-header">
          <h2>Subject Progress</h2>
          <Link to="/subjects" className="btn-link">View All →</Link>
        </div>
        <div className="subject-grid">
          {stats?.subjectPerformance.slice(0, 4).map((subject, idx) => (
            <div key={idx} className="subject-card">
              <div className="subject-header">
                <h3>{subject.subject}</h3>
                <span className={`readiness-badge ${getReadinessClass(subject.interviewReadiness)}`}>
                  {subject.interviewReadiness}% Ready
                </span>
              </div>
              <div className="subject-stats">
                <div className="stat-item">
                  <span className="label">Quizzes:</span>
                  <span className="value">{subject.quizzesCompleted}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Accuracy:</span>
                  <span className="value">{subject.averageAccuracy}%</span>
                </div>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${subject.averageAccuracy}%` }}
                />
              </div>
              <Link 
                to={`/quiz/setup/${subject.slug}`} 
                className="btn-start-quiz"
              >
                Start Quiz
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="section">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <Link to="/analytics" className="btn-link">View Analytics →</Link>
        </div>
        <div className="activity-list">
          {recentQuizzes.map((quiz) => (
            <div key={quiz._id} className="activity-item">
              <div className="activity-icon">📊</div>
              <div className="activity-content">
                <h4>{quiz.subject.name}</h4>
                <p>
                  Score: {quiz.results.marksObtained}/{quiz.results.totalMarks} • 
                  Accuracy: {quiz.results.accuracy}%
                </p>
                <span className="activity-date">
                  {new Date(quiz.completedAt).toLocaleDateString()}
                </span>
              </div>
              <Link 
                to={`/quiz/${quiz._id}/results`} 
                className="btn-view"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Activity Chart */}
      {stats?.weeklyActivity && (
        <div className="section">
          <h2>Weekly Activity</h2>
          <div className="activity-chart">
            {stats.weeklyActivity.map((day, idx) => (
              <div key={idx} className="chart-bar">
                <div 
                  className="bar-fill"
                  style={{ height: `${(day.quizzes / 5) * 100}%` }}
                  title={`${day.quizzes} quizzes`}
                />
                <span className="bar-label">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const getReadinessClass = (score) => {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'moderate';
  return 'needs-work';
};

export default Dashboard;