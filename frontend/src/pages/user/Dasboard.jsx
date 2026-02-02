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
      // FIXED: Paths are clean because of axios.defaults.baseURL = '/api'
      const [analyticsRes, quizzesRes] = await Promise.all([
        axios.get('/quizzes/dashboard'), 
        axios.get('/quizzes/history?limit=5')
      ]);
      
      if (analyticsRes.data.success) {
        setStats(analyticsRes.data.data);
      }
      
      if (quizzesRes.data.success) {
        setRecentQuizzes(quizzesRes.data.data);
      }
    } catch (error) {
      console.error('Dashboard error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getReadinessClass = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'moderate';
    return 'needs-work';
  };

  if (loading) return <div className="loading">Loading Dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || 'Student'}! 👋</h1>
        <p className="subtitle">Here's your learning journey at a glance</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>{stats?.overallStats?.totalQuizzes || 0}</h3>
            <p>Quizzes Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats?.overallStats?.overallAccuracy || 0}%</h3>
            <p>Overall Accuracy</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>{stats?.overallStats?.currentStreak || 0}</h3>
            <p>Day Streak</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{stats?.overallStats?.totalQuestions || 0}</h3>
            <p>Questions Attempted</p>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Subject Progress</h2>
          <Link to="/subjects" className="btn-link">View All →</Link>
        </div>
        <div className="subject-grid">
          {stats?.subjectPerformance?.length > 0 ? (
            stats.subjectPerformance.slice(0, 4).map((subject, idx) => (
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
                <Link to={`/quiz/setup/${subject.id || subject._id}`} className="btn-start-quiz">
                  Start Quiz
                </Link>
              </div>
            ))
          ) : (
            <p className="no-data">No subject data available. Start a quiz to see progress!</p>
          )}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <Link to="/analytics" className="btn-link">View Analytics →</Link>
        </div>
        <div className="activity-list">
          {recentQuizzes.length > 0 ? (
            recentQuizzes.map((quiz) => (
              <div key={quiz._id} className="activity-item">
                <div className="activity-icon">📊</div>
                <div className="activity-content">
                  <h4>{quiz.subject?.name || 'General Quiz'}</h4>
                  <p>
                    Score: {quiz.results?.marksObtained || 0}/{quiz.results?.totalMarks || 0} • 
                    Accuracy: {quiz.results?.accuracy || 0}%
                  </p>
                  <span className="activity-date">
                    {quiz.completedAt ? new Date(quiz.completedAt).toLocaleDateString() : 'Just now'}
                  </span>
                </div>
                <Link to={`/quiz/${quiz._id}/results`} className="btn-view">View Details</Link>
              </div>
            ))
          ) : (
            <p className="no-data">No recent activity. Let's take a quiz!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;