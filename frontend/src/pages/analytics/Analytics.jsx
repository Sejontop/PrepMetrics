// src/pages/analytics/Analytics.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics/dashboard');
      setAnalyticsData(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (!analyticsData) {
    return <div className="no-data">No analytics data available</div>;
  }

  const { overallStats, performanceTrend, subjectPerformance, timeAnalysis, difficultyPerformance, weeklyActivity } = analyticsData;

  // Prepare data for charts
  const difficultyData = [
    { name: 'Easy', value: difficultyPerformance.easy.total, accuracy: difficultyPerformance.easy.correct },
    { name: 'Medium', value: difficultyPerformance.medium.total, accuracy: difficultyPerformance.medium.correct },
    { name: 'Hard', value: difficultyPerformance.hard.total, accuracy: difficultyPerformance.hard.correct }
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>📊 Performance Analytics</h1>
        <p>Detailed insights into your preparation journey</p>
      </div>

      {/* Overall Statistics */}
      <div className="stats-overview">
        <div className="stat-card-large">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h2>{overallStats.totalQuizzes}</h2>
            <p>Total Quizzes Completed</p>
          </div>
        </div>

        <div className="stat-card-large">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h2>{overallStats.overallAccuracy}%</h2>
            <p>Overall Accuracy</p>
          </div>
        </div>

        <div className="stat-card-large">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h2>{overallStats.currentStreak}</h2>
            <p>Current Streak Days</p>
          </div>
        </div>

        <div className="stat-card-large">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h2>{overallStats.totalQuestions}</h2>
            <p>Questions Attempted</p>
          </div>
        </div>
      </div>

      {/* Performance Trend */}
      <div className="chart-section">
        <h2>Performance Trend</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#6366f1" 
                strokeWidth={2}
                name="Accuracy (%)"
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Weekly Activity */}
        <div className="chart-section">
          <h2>Weekly Activity</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quizzes" fill="#6366f1" name="Quizzes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Difficulty Distribution */}
        <div className="chart-section">
          <h2>Difficulty Distribution</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, value}) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subject Performance */}
      <div className="subject-performance-section">
        <h2>Subject-wise Performance</h2>
        <div className="subject-performance-grid">
          {subjectPerformance.map((subject, idx) => (
            <div key={idx} className="subject-performance-card">
              <div className="subject-performance-header">
                <h3>{subject.subject}</h3>
                <span className={`readiness-score ${getReadinessClass(subject.interviewReadiness)}`}>
                  {subject.interviewReadiness}% Ready
                </span>
              </div>

              <div className="subject-performance-stats">
                <div className="performance-stat">
                  <span className="stat-label">Quizzes:</span>
                  <span className="stat-value">{subject.quizzesCompleted}</span>
                </div>
                <div className="performance-stat">
                  <span className="stat-label">Accuracy:</span>
                  <span className="stat-value">{subject.averageAccuracy}%</span>
                </div>
                <div className="performance-stat">
                  <span className="stat-label">Strong Topics:</span>
                  <span className="stat-value">{subject.strengthTopics}</span>
                </div>
                <div className="performance-stat">
                  <span className="stat-label">Weak Topics:</span>
                  <span className="stat-value">{subject.weakTopics}</span>
                </div>
              </div>

              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${subject.averageAccuracy}%` }}
                />
              </div>

              {subject.certificateEarned && (
                <div className="certificate-badge">
                  🎓 Certificate Earned
                </div>
              )}

              <Link 
                to={`/analytics/${subject.slug}`}
                className="btn-view-details"
              >
                View Detailed Analytics →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Time Analysis */}
      <div className="time-analysis-section">
        <h2>Time Analysis</h2>
        <div className="time-stats">
          <div className="time-stat-card">
            <div className="time-icon">⏱️</div>
            <div className="time-content">
              <h3>{timeAnalysis.totalMinutes} mins</h3>
              <p>Total Time Spent</p>
            </div>
          </div>
          <div className="time-stat-card">
            <div className="time-icon">📊</div>
            <div className="time-content">
              <h3>{timeAnalysis.averagePerQuiz} mins</h3>
              <p>Average per Quiz</p>
            </div>
          </div>
          <div className="time-stat-card">
            <div className="time-icon">🎯</div>
            <div className="time-content">
              <h3>{timeAnalysis.totalQuizzes}</h3>
              <p>Sessions Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty Performance Breakdown */}
      <div className="difficulty-breakdown-section">
        <h2>Performance by Difficulty</h2>
        <div className="difficulty-cards">
          <div className="difficulty-card easy">
            <h3>Easy Questions</h3>
            <div className="difficulty-stats">
              <div className="difficulty-stat">
                <span className="stat-label">Attempted:</span>
                <span className="stat-value">{difficultyPerformance.easy.total}</span>
              </div>
              <div className="difficulty-stat">
                <span className="stat-label">Correct:</span>
                <span className="stat-value">{difficultyPerformance.easy.correct}</span>
              </div>
              <div className="difficulty-stat">
                <span className="stat-label">Accuracy:</span>
                <span className="stat-value">
                  {difficultyPerformance.easy.total > 0 
                    ? ((difficultyPerformance.easy.correct / difficultyPerformance.easy.total) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="difficulty-card medium">
            <h3>Medium Questions</h3>
            <div className="difficulty-stats">
              <div className="difficulty-stat">
                <span className="stat-label">Attempted:</span>
                <span className="stat-value">{difficultyPerformance.medium.total}</span>
              </div>
              <div className="difficulty-stat">
                <span className="stat-label">Correct:</span>
                <span className="stat-value">{difficultyPerformance.medium.correct}</span>
              </div>
              <div className="difficulty-stat">
                <span className="stat-label">Accuracy:</span>
                <span className="stat-value">
                  {difficultyPerformance.medium.total > 0 
                    ? ((difficultyPerformance.medium.correct / difficultyPerformance.medium.total) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="difficulty-card hard">
            <h3>Hard Questions</h3>
            <div className="difficulty-stats">
              <div className="difficulty-stat">
                <span className="stat-label">Attempted:</span>
                <span className="stat-value">{difficultyPerformance.hard.total}</span>
              </div>
              <div className="difficulty-stat">
                <span className="stat-label">Correct:</span>
                <span className="stat-value">{difficultyPerformance.hard.correct}</span>
              </div>
              <div className="difficulty-stat">
                <span className="stat-label">Accuracy:</span>
                <span className="stat-value">
                  {difficultyPerformance.hard.total > 0 
                    ? ((difficultyPerformance.hard.correct / difficultyPerformance.hard.total) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getReadinessClass = (score) => {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'moderate';
  return 'needs-work';
};

export default Analytics;

