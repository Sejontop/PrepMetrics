// src/pages/analytics/SubjectAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Analytics.css';

const SubjectAnalytics = () => {
  const { subjectId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjectAnalytics();
    fetchSubjectDetails();
  }, [subjectId]);

  const fetchSubjectDetails = async () => {
    try {
      const response = await axios.get(`/api/subjects/slug/${subjectId}`);
      setSubject(response.data.data.subject);
    } catch (error) {
      console.error('Error fetching subject:', error);
    }
  };

  const fetchSubjectAnalytics = async () => {
    try {
      // Get subject ID from slug
      const subjectsRes = await axios.get('/api/subjects');
      const foundSubject = subjectsRes.data.data.find(s => s.slug === subjectId);
      
      if (foundSubject) {
        const response = await axios.get(`/api/analytics/subject/${foundSubject._id}`);
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching subject analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading subject analytics...</div>;
  }

  if (!analytics) {
    return (
      <div className="no-data">
        <h2>No Data Available</h2>
        <p>Start taking quizzes to see your analytics!</p>
        <Link to="/subjects" className="btn-primary">Browse Subjects</Link>
      </div>
    );
  }

  const { summary, topicAnalysis, progressTimeline, speedData, readinessBreakdown } = analytics;

  return (
    <div className="subject-analytics-container">
      {/* Header */}
      <div className="subject-analytics-header">
        <Link to="/analytics" className="back-link">← Back to Analytics</Link>
        <h1>{subject?.name || 'Subject'} Analytics</h1>
        <p>Detailed performance insights for this subject</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon">🎯</div>
          <div className="summary-content">
            <h3>{summary.quizzesCompleted}</h3>
            <p>Quizzes Completed</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <h3>{summary.averageAccuracy}%</h3>
            <p>Average Accuracy</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">🏆</div>
          <div className="summary-content">
            <h3>{summary.interviewReadiness}%</h3>
            <p>Interview Readiness</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">⏱️</div>
          <div className="summary-content">
            <h3>{summary.timeSpent} mins</h3>
            <p>Time Invested</p>
          </div>
        </div>
      </div>

      {/* Interview Readiness */}
      <div className="readiness-section">
        <h2>Interview Readiness Analysis</h2>
        <div className="readiness-card">
          <div className="readiness-score-display">
            <div className="readiness-circle">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" className="circle-bg" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  className="circle-progress"
                  style={{
                    strokeDashoffset: 283 - (283 * readinessBreakdown.overall) / 100
                  }}
                />
              </svg>
              <div className="readiness-text">
                <span className="readiness-value">{readinessBreakdown.overall}%</span>
                <span className="readiness-label">Ready</span>
              </div>
            </div>
            <div className="readiness-status">
              <h3>{readinessBreakdown.recommendation.level}</h3>
              <p>{readinessBreakdown.recommendation.message}</p>
            </div>
          </div>

          <div className="readiness-breakdown">
            <h3>Readiness Components</h3>
            <div className="component">
              <span className="component-label">Consistency</span>
              <div className="component-bar">
                <div 
                  className="component-fill"
                  style={{ width: `${readinessBreakdown.components.consistency}%` }}
                />
              </div>
              <span className="component-value">{readinessBreakdown.components.consistency.toFixed(0)}%</span>
            </div>
            <div className="component">
              <span className="component-label">Accuracy</span>
              <div className="component-bar">
                <div 
                  className="component-fill"
                  style={{ width: `${readinessBreakdown.components.accuracy}%` }}
                />
              </div>
              <span className="component-value">{readinessBreakdown.components.accuracy.toFixed(0)}%</span>
            </div>
            <div className="component">
              <span className="component-label">Topic Coverage</span>
              <div className="component-bar">
                <div 
                  className="component-fill"
                  style={{ width: `${readinessBreakdown.components.topicCoverage}%` }}
                />
              </div>
              <span className="component-value">{readinessBreakdown.components.topicCoverage.toFixed(0)}%</span>
            </div>
          </div>

          <div className="recommendations">
            <h3>Recommendations</h3>
            <ul>
              {readinessBreakdown.recommendation.suggestions.map((suggestion, idx) => (
                <li key={idx}>✓ {suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="chart-section">
        <h2>Progress Over Time</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressTimeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="attempt" label={{ value: 'Attempt', position: 'insideBottom', offset: -5 }} />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => `Attempt ${value}`}
                formatter={(value, name) => [value, name === 'accuracy' ? 'Accuracy (%)' : 'Score']}
              />
              <Legend />
              <Line type="monotone" dataKey="accuracy" stroke="#6366f1" strokeWidth={2} name="Accuracy" />
              <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} name="Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Topic Analysis */}
      <div className="topic-analysis-section">
        <h2>Topic-wise Performance</h2>
        <div className="topic-analysis-grid">
          {topicAnalysis.map((topic, idx) => (
            <div key={idx} className={`topic-card status-${topic.status.toLowerCase().replace(' ', '-')}`}>
              <div className="topic-header">
                <h3>{topic.topic}</h3>
                <span className={`topic-status ${topic.status.toLowerCase().replace(' ', '-')}`}>
                  {topic.status}
                </span>
              </div>
              <div className="topic-stats">
                <div className="topic-stat">
                  <span className="stat-label">Accuracy:</span>
                  <span className="stat-value">{topic.accuracy}%</span>
                </div>
                <div className="topic-stat">
                  <span className="stat-label">Questions:</span>
                  <span className="stat-value">{topic.questionsAttempted}</span>
                </div>
              </div>
              <div className="topic-progress-bar">
                <div 
                  className="topic-progress-fill"
                  style={{ width: `${topic.accuracy}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Speed Analysis */}
      {speedData.length > 0 && (
        <div className="chart-section">
          <h2>Speed vs Accuracy</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={speedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="avgTimePerQuestion" fill="#f59e0b" name="Avg Time (s)" />
                <Bar yAxisId="right" dataKey="accuracy" fill="#6366f1" name="Accuracy (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Certificate Status */}
      {summary.certificateEarned ? (
        <div className="certificate-status earned">
          <span className="certificate-icon">🎓</span>
          <div className="certificate-content">
            <h3>Certificate Earned!</h3>
            <p>You've completed this subject and earned your certificate.</p>
            <Link to="/certificates" className="btn-view-certificate">
              View Certificate
            </Link>
          </div>
        </div>
      ) : (
        <div className="certificate-status not-earned">
          <span className="certificate-icon">🎯</span>
          <div className="certificate-content">
            <h3>Keep Going!</h3>
            <p>Complete more quizzes with good accuracy to earn your certificate.</p>
            <Link to={`/quiz/setup/${subjectId}`} className="btn-continue">
              Continue Practicing
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectAnalytics;