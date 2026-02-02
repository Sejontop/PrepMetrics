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
      // FIXED: Removed '/api' because it's already in axios baseURL
      const response = await axios.get(`/quizzes/${quizId}`);
      setQuiz(response.data.data);
    } catch (error) {
      console.error('Error fetching quiz results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading results...</div>;
  if (!quiz) return <div className="error">Quiz not found</div>;

  const { results, performance } = quiz;
  const scorePercentage = (results?.marksObtained / results?.totalMarks) * 100 || 0;

  return (
    <div className="quiz-results">
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
            <p className="subject-name">{quiz.subject?.name}</p>
            <div className="score-breakdown">
              <div className="breakdown-item">
                <span className="label">Marks:</span>
                <span className="value">{results?.marksObtained}/{results?.totalMarks}</span>
              </div>
              <div className="breakdown-item">
                <span className="label">Accuracy:</span>
                <span className="value">{results?.accuracy}%</span>
              </div>
              <div className="breakdown-item">
                <span className="label">Time:</span>
                <span className="value">{Math.floor(results?.totalTimeSpent / 60)}m {results?.totalTimeSpent % 60}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="stats-grid">
        <div className="stat-box"><div className="stat-icon correct">✓</div><div className="stat-content"><h3>{results?.correctAnswers}</h3><p>Correct</p></div></div>
        <div className="stat-box"><div className="stat-icon incorrect">✗</div><div className="stat-content"><h3>{results?.incorrectAnswers}</h3><p>Incorrect</p></div></div>
        <div className="stat-box"><div className="stat-icon skipped">−</div><div className="stat-content"><h3>{results?.skippedQuestions}</h3><p>Skipped</p></div></div>
        <div className="stat-box"><div className="stat-icon time">⏱</div><div className="stat-content"><h3>{results?.averageTimePerQuestion}s</h3><p>Avg. per Q</p></div></div>
      </div>

      {/* Performance Analysis */}
      <div className="performance-section">
        <h2>Performance Analysis</h2>
        <div className="analysis-card">
          <h3>Difficulty Breakdown</h3>
          <div className="difficulty-bars">
            {performance?.difficultyWiseScore && Object.entries(performance.difficultyWiseScore).map(([level, data]) => (
              data.total > 0 && (
                <div key={level} className="difficulty-bar">
                  <div className="bar-header"><span>{level.toUpperCase()}</span><span>{data.correct}/{data.total}</span></div>
                  <div className="bar-container"><div className={`bar-fill ${level}`} style={{ width: `${data.accuracy}%` }} /></div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Answers */}
      <div className="answers-section">
        <button className="btn-toggle-answers" onClick={() => setShowAnswers(!showAnswers)}>
          {showAnswers ? 'Hide' : 'Show'} Detailed Answers
        </button>

        {showAnswers && (
          <div className="answers-list">
            {quiz.questions.map((item, idx) => (
              <div key={idx} className={`answer-card ${item.isCorrect ? 'correct' : 'incorrect'} ${item.skipped ? 'skipped' : ''}`}>
                <div className="answer-header">
                  <span>Question {idx + 1}</span>
                  <span className={`status-badge`}>{item.skipped ? 'Skipped' : item.isCorrect ? 'Correct' : 'Incorrect'}</span>
                </div>
                {/* FIXED: Using questionText like QuizInterface */}
                <p className="answer-question">{item.question?.questionText}</p>
                <div className="answer-details">
                  <p><strong>Your Answer:</strong> {item.userAnswer || 'None'}</p>
                  {!item.isCorrect && <p><strong>Correct Answer:</strong> <span className="text-success">{item.question?.correctAnswer}</span></p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="results-actions">
        <Link to="/" className="btn-action">Back to Dashboard</Link>
        <Link to={`/quiz/setup/${quiz.subject?._id}`} className="btn-action btn-primary">Take Another Quiz</Link>
      </div>
    </div>
  );
};

export default QuizResults;