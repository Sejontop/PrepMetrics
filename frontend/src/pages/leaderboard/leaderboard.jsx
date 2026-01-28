// src/pages/leaderboard/leaderboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Leaderboard.css';

const Leaderboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('global');
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    if (isAuthenticated && selectedSubject === 'global') {
      fetchMyRank();
    }
  }, [selectedSubject, page]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/api/subjects');
      setSubjects(response.data.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const url = selectedSubject === 'global' 
        ? `/api/leaderboard/global?page=${page}&limit=50`
        : `/api/leaderboard/subject/${selectedSubject}?page=${page}&limit=50`;
      
      const response = await axios.get(url);
      setLeaderboardData(response.data.data);
      
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRank = async () => {
    try {
      const response = await axios.get('/api/leaderboard/my-rank');
      setMyRank(response.data.data);
    } catch (error) {
      console.error('Error fetching rank:', error);
    }
  };

  const handleSubjectChange = (subjectId) => {
    setSelectedSubject(subjectId);
    setPage(1);
  };

  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <p>Compete with others and see where you stand!</p>
      </div>

      {/* My Rank Card */}
      {isAuthenticated && myRank && selectedSubject === 'global' && (
        <div className="my-rank-card">
          <div className="my-rank-content">
            <span className="my-rank-label">Your Global Rank</span>
            <div className="my-rank-details">
              <span className="my-rank-number">#{myRank.globalRank}</span>
              <span className="my-rank-total">out of {myRank.totalUsers} users</span>
            </div>
          </div>
          <div className="my-rank-percentile">
            <span className="percentile-label">Top</span>
            <span className="percentile-value">{myRank.percentile}%</span>
          </div>
        </div>
      )}

      {/* Subject Filter */}
      <div className="filter-section">
        <label>View Leaderboard:</label>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${selectedSubject === 'global' ? 'active' : ''}`}
            onClick={() => handleSubjectChange('global')}
          >
            🌍 Global
          </button>
          {subjects.map(subject => (
            <button
              key={subject._id}
              className={`filter-btn ${selectedSubject === subject._id ? 'active' : ''}`}
              onClick={() => handleSubjectChange(subject._id)}
            >
              {subject.icon} {subject.name}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="leaderboard-table-container">
        {loading ? (
          <div className="loading">Loading leaderboard...</div>
        ) : leaderboardData.length === 0 ? (
          <div className="no-data">
            <span className="no-data-icon">📊</span>
            <p>No leaderboard data available yet</p>
          </div>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Quizzes</th>
                <th>Accuracy</th>
                <th>Streak</th>
                {selectedSubject !== 'global' && <th>Score</th>}
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((entry) => (
                <tr 
                  key={entry.rank} 
                  className={`
                    ${getRankClass(entry.rank)} 
                    ${isAuthenticated && entry.name === user?.name ? 'my-entry' : ''}
                  `}
                >
                  <td className="rank-cell">
                    <span className="rank-badge">
                      {getRankMedal(entry.rank)}
                    </span>
                  </td>
                  <td className="user-cell">
                    <div className="user-info">
                      <div className="user-avatar">
                        {entry.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="user-name">{entry.name}</span>
                      {isAuthenticated && entry.name === user?.name && (
                        <span className="you-badge">You</span>
                      )}
                    </div>
                  </td>
                  <td>{entry.quizzesTaken || entry.quizzesCompleted}</td>
                  <td>
                    <span className="accuracy-badge">
                      {entry.accuracy}%
                    </span>
                  </td>
                  <td>
                    <span className="streak-badge">
                      🔥 {entry.currentStreak}
                    </span>
                  </td>
                  {selectedSubject !== 'global' && (
                    <td><strong>{entry.totalScore}</strong></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Previous
          </button>
          <span className="pagination-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;