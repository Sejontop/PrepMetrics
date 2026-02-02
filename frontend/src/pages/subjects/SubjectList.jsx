// src/pages/subjects/SubjectList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './SubjectList.css';

const SubjectList = () => {
  const [subjects, setSubjects] = useState([]);
  const [groupedSubjects, setGroupedSubjects] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      // Backend se data lane ke liye full URL use kiya hai
      const response = await axios.get('http://localhost:5000/api/subjects');
      
      if (response.data.success) {
        setSubjects(response.data.data);
        setGroupedSubjects(response.data.grouped);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = Object.keys(groupedSubjects);

  const filteredSubjects = selectedCategory === 'all' 
    ? subjects 
    : groupedSubjects[selectedCategory] || [];

  if (loading) {
    return (
      <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
        <div className="loader"></div>
        <p>Loading subjects...</p>
      </div>
    );
  }

  return (
    <div className="subjects-container">
      <div className="subjects-header">
        <h1>📚 Browse Subjects</h1>
        <p>Choose a subject to start your preparation journey</p>
      </div>

      <div className="category-filter">
        <button
          className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All Subjects
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="subjects-grid">
        {filteredSubjects.length === 0 ? (
          <div className="no-subjects">
            <p>No subjects available in this category</p>
          </div>
        ) : (
          filteredSubjects.map(subject => (
            <div key={subject._id} className="subject-card-detailed">
              <div className="subject-icon-large">
                {subject.icon || '📖'}
              </div>
              
              <div className="subject-content">
                <h3>{subject.name}</h3>
                <p className="subject-category">{subject.category}</p>
                <p className="subject-description">
                  {subject.description || 'Master the fundamentals and ace your interviews'}
                </p>

                <div className="subject-stats-row">
                  <div className="subject-stat">
                    <span className="stat-icon">📝</span>
                    <span>{subject.totalQuestions} Questions</span>
                  </div>
                  <div className="subject-stat">
                    <span className="stat-icon">🎯</span>
                    <span>{subject.stats?.totalAttempts || 0} Attempts</span>
                  </div>
                </div>

                {/* MODIFIED: Link now uses subject._id instead of slug */}
                <Link 
                  to={`/quiz/setup/${subject._id}`}
                  className="btn-start-subject"
                >
                  Start Practice →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="info-section">
        <div className="info-card">
          <span className="info-icon-large">🎯</span>
          <h3>Interview-Ready Questions</h3>
          <p>Practice with real interview questions used by top companies</p>
        </div>
        <div className="info-card">
          <span className="info-icon-large">📊</span>
          <h3>Detailed Analytics</h3>
          <p>Track your progress with comprehensive performance insights</p>
        </div>
        <div className="info-card">
          <span className="info-icon-large">🏆</span>
          <h3>Earn Certificates</h3>
          <p>Complete subjects and earn verified certificates</p>
        </div>
      </div>
    </div>
  );
};

export default SubjectList;