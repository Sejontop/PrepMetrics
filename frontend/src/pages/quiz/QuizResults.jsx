// src/pages/quiz/QuizResults.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './QuizResults.css';

const QuizResults = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    fetchQuizResults();
  }, [quizId]);

  const fetchQuizResults = async () => {
    try {
      const response = await axios.get(`/api/quizzes/${quizId}`);
      setQuiz(response.data.data);
    } catch (error) {
      console.error('Error fetching quiz results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading results...</div>;
  if (!quiz) return <div>Quiz not found</div>;

  const { results, performance } = quiz;
  const scorePercentage = (results.marksObtained / results.totalMarks) * 100;

  return (
    <div className="quiz-results">
      {/* Results Header */}
      <div className="results-header">
        <div className="score-card">
          <div className="score-circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" className="circle-bg" />
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                className="circle-progress"
                style={{
                  strokeDashoffset: 283 - (283 * scorePercentage) / 100
                }}
              />
            </svg>
            <div className="score-text">
              <span className="score-value">{scorePercentage.toFixed(1)}%</span>
              <span className="score-label">Score</span>
            </div>
          </div>
          
          <div className="score-details">
            <h1>Quiz Completed! 🎉</h1>
            <p className="subject-name">{quiz.subject.name}</p>
            <div className="score-breakdown">
              <div className="breakdown-item">
                <span className="label">Marks:</span>
                <span className="value">{results.marksObtained}/{results.totalMarks}</span>
              </div>
              <div className="breakdown-item">
                <span className="label">Accuracy:</span>
                <span className="value">{results.accuracy}%</span>
              </div>
              <div className="breakdown-item">
                <span className="label">Time:</span>
                <span className="value">{Math.floor(results.totalTimeSpent / 60)}m {results.totalTimeSpent % 60}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-icon correct">✓</div>
          <div className="stat-content">
            <h3>{results.correctAnswers}</h3>
            <p>Correct</p>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon incorrect">✗</div>
          <div className="stat-content">
            <h3>{results.incorrectAnswers}</h3>
            <p>Incorrect</p>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon skipped">−</div>
          <div className="stat-content">
            <h3>{results.skippedQuestions}</h3>
            <p>Skipped</p>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon time">⏱</div>
          <div className="stat-content">
            <h3>{results.averageTimePerQuestion}s</h3>
            <p>Avg. per Q</p>
          </div>
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="performance-section">
        <h2>Performance Analysis</h2>
        
        {/* Difficulty-wise Performance */}
        <div className="analysis-card">
          <h3>Difficulty-wise Breakdown</h3>
          <div className="difficulty-bars">
            {['easy', 'medium', 'hard'].map(level => {
              const data = performance.difficultyWiseScore[level];
              return data.total > 0 ? (
                <div key={level} className="difficulty-bar">
                  <div className="bar-header">
                    <span className="bar-label">{level.toUpperCase()}</span>
                    <span className="bar-value">{data.correct}/{data.total}</span>
                  </div>
                  <div className="bar-container">
                    <div 
                      className={`bar-fill ${level}`}
                      style={{ width: `${data.accuracy}%` }}
                    />
                  </div>
                  <span className="bar-percentage">{data.accuracy.toFixed(1)}%</span>
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* Topic-wise Performance */}
        {performance.topicWiseScore.length > 0 && (
          <div className="analysis-card">
            <h3>Topic-wise Performance</h3>
            <div className="topic-performance">
              {performance.topicWiseScore.map((topic, idx) => (
                <div key={idx} className="topic-item">
                  <div className="topic-header">
                    <span className="topic-name">{topic.topic?.name || 'Unknown'}</span>
                    <span className="topic-score">{topic.correct}/{topic.total}</span>
                  </div>
                  <div className="topic-bar">
                    <div 
                      className="topic-fill"
                      style={{ 
                        width: `${topic.accuracy}%`,
                        backgroundColor: topic.accuracy >= 75 ? '#4caf50' : 
                                       topic.accuracy >= 50 ? '#ff9800' : '#f44336'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Answers */}
      <div className="answers-section">
        <button 
          className="btn-toggle-answers"
          onClick={() => setShowAnswers(!showAnswers)}
        >
          {showAnswers ? 'Hide' : 'Show'} Detailed Answers
        </button>

        {showAnswers && (
          <div className="answers-list">
            {quiz.questions.map((item, idx) => {
              const question = item.question;
              const isCorrect = item.isCorrect;
              const userAnswer = item.userAnswer;
              
              return (
                <div 
                  key={idx} 
                  className={`answer-card ${isCorrect ? 'correct' : 'incorrect'} ${
                    item.skipped ? 'skipped' : ''
                  }`}
                >
                  <div className="answer-header">
                    <span className="answer-number">Question {idx + 1}</span>
                    <span className={`answer-status ${isCorrect ? 'correct' : 'incorrect'}`}>
                      {item.skipped ? 'Skipped' : isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  
                  <p className="answer-question">{question.questionText}</p>
                  
                  <div className="answer-details">
                    {userAnswer && (
                      <div className="detail-item">
                        <strong>Your Answer:</strong>
                        <span className={!isCorrect ? 'wrong-answer' : ''}>
                          {userAnswer}
                        </span>
                      </div>
                    )}
                    
                    {!isCorrect && (
                      <div className="detail-item">
                        <strong>Correct Answer:</strong>
                        <span className="correct-answer">{question.correctAnswer}</span>
                      </div>
                    )}
                    
                    {question.explanation && (
                      <div className="detail-item">
                        <strong>Explanation:</strong>
                        <p>{question.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="results-actions">
        <Link to={`/analytics/${quiz.subject._id}`} className="btn-action">
          View Detailed Analytics
        </Link>
        <Link to={`/quiz/setup/${quiz.subject.slug}`} className="btn-action btn-primary">
          Take Another Quiz
        </Link>
        <Link to="/" className="btn-action">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default QuizResults;