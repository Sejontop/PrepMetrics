// src/pages/quiz/QuizSetup.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './QuizSetup.css';

const QuizSetup = () => {
  // Aapke code mein 'subjectId' tha, lekin Link mein slug use ho raha hai
  const { subjectId } = useParams(); 
  const navigate = useNavigate();
  
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [config, setConfig] = useState({
    mode: 'timed',
    difficulty: 'mixed',
    questionCount: 10,
    selectedTopics: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubjectData();
  }, [subjectId]);

  const fetchSubjectData = async () => {
    try {
      // CORRECTED: Added full backend URL (http://localhost:5000)
      const [subjectRes, topicsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/subjects/${subjectId}`),
        axios.get(`http://localhost:5000/api/topics?subject=${subjectId}`)
      ]);
      
      setSubject(subjectRes.data.data);
      setTopics(topicsRes.data.data);
    } catch (error) {
      console.error('Error fetching subject data:', error);
    }
  };

  const handleTopicToggle = (topicId) => {
    setConfig(prev => ({
      ...prev,
      selectedTopics: prev.selectedTopics.includes(topicId)
        ? prev.selectedTopics.filter(id => id !== topicId)
        : [...prev.selectedTopics, topicId]
    }));
  };

  const handleStartQuiz = async () => {
    setLoading(true);
    try {
      // CORRECTED: Added full backend URL for quiz generation
      const response = await axios.post('http://localhost:5000/api/quizzes/generate', {
        subjectId: subject._id,
        ...config
      });
      
      if (response.data.success) {
        navigate(`/quiz/${response.data.data._id}`);
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Check if questions exist for this subject.');
    } finally {
      setLoading(false);
    }
  };

  if (!subject) return <div className="loading" style={{ textAlign: 'center', marginTop: '50px' }}>Loading Quiz Settings...</div>;

  return (
    <div className="quiz-setup">
      <div className="setup-container">
        <div className="setup-header">
          <h1>Setup Your Quiz</h1>
          <p className="subject-name">{subject.name}</p>
        </div>

        <div className="setup-form">
          {/* Mode Selection */}
          <div className="form-section">
            <label>Quiz Mode</label>
            <div className="option-group">
              <button
                className={`option-btn ${config.mode === 'timed' ? 'active' : ''}`}
                onClick={() => setConfig({ ...config, mode: 'timed' })}
              >
                ⏱️ Timed
              </button>
              <button
                className={`option-btn ${config.mode === 'non-timed' ? 'active' : ''}`}
                onClick={() => setConfig({ ...config, mode: 'non-timed' })}
              >
                ♾️ Practice
              </button>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="form-section">
            <label>Difficulty Level</label>
            <div className="option-group">
              {['easy', 'medium', 'hard', 'mixed'].map(level => (
                <button
                  key={level}
                  className={`option-btn ${config.difficulty === level ? 'active' : ''}`}
                  onClick={() => setConfig({ ...config, difficulty: level })}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="form-section">
            <label>Number of Questions</label>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={config.questionCount}
              onChange={(e) => setConfig({ ...config, questionCount: parseInt(e.target.value) })}
              className="slider"
            />
            <span className="slider-value">{config.questionCount} Questions</span>
          </div>

          {/* Topic Selection */}
          {topics.length > 0 && (
            <div className="form-section">
              <label>Topics (Optional)</label>
              <div className="topics-grid">
                {topics.map(topic => (
                  <button
                    key={topic._id}
                    className={`topic-chip ${config.selectedTopics.includes(topic._id) ? 'selected' : ''}`}
                    onClick={() => handleTopicToggle(topic._id)}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
              <p className="help-text">
                {config.selectedTopics.length === 0 
                  ? 'All topics will be included' 
                  : `${config.selectedTopics.length} topic(s) selected`}
              </p>
            </div>
          )}

          {/* Start Button */}
          <button
            className="btn-start"
            onClick={handleStartQuiz}
            disabled={loading}
          >
            {loading ? 'Generating Quiz...' : 'Start Quiz 🚀'}
          </button>
        </div>

        {/* Quiz Info */}
        <div className="quiz-info">
          <div className="info-item">
            <span className="info-icon">⏱️</span>
            <div>
              <strong>Estimated Time</strong>
              <p>{Math.ceil(config.questionCount * 1.5)} minutes</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">📊</span>
            <div>
              <strong>Performance Tracking</strong>
              <p>Get detailed analytics after completion</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">🏆</span>
            <div>
              <strong>Leaderboard</strong>
              <p>Compete with others globally</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSetup;