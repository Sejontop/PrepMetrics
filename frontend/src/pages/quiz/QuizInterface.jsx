// src/pages/quiz/QuizInterface.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './QuizInterface.css';

const QuizInterface = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const timerRef = useRef(null);

  useEffect(() => {
    fetchQuiz();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizId]);

  useEffect(() => {
    if (quiz && quiz.quizConfig.mode === 'timed' && timeLeft !== null) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timerRef.current);
    }
  }, [quiz, timeLeft]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`/api/quizzes/${quizId}`);
      const quizData = response.data.data;
      setQuiz(quizData);
      
      if (quizData.quizConfig.mode === 'timed') {
        setTimeLeft(quizData.quizConfig.timeLimit);
      }
      
      // Initialize answers object
      const initialAnswers = {};
      quizData.questions.forEach((q, idx) => {
        initialAnswers[idx] = { questionId: q.question._id, userAnswer: null, timeSpent: 0 };
      });
      setAnswers(initialAnswers);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      alert('Failed to load quiz');
      navigate('/');
    }
  };

  const handleAnswerSelect = (answer) => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        userAnswer: answer,
        timeSpent: prev[currentIndex].timeSpent + timeSpent
      }
    }));
    
    setQuestionStartTime(Date.now());
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleJumpToQuestion = (index) => {
    setCurrentIndex(index);
    setQuestionStartTime(Date.now());
  };

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit this quiz?')) {
      return;
    }

    setSubmitting(true);
    try {
      // Convert answers object to array
      const answersArray = Object.values(answers);
      
      await axios.put(`/api/quizzes/${quizId}/submit`, { answers: answersArray });
      navigate(`/quiz/${quizId}/results`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading quiz...</div>;
  if (!quiz) return <div>Quiz not found</div>;

  const currentQuestion = quiz.questions[currentIndex]?.question;
  const currentAnswer = answers[currentIndex]?.userAnswer;
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.values(answers).filter(a => a.userAnswer).length;

  return (
    <div className="quiz-interface">
      {/* Header */}
      <div className="quiz-header">
        <div className="quiz-info">
          <h2>{quiz.subject.name}</h2>
          <span className="difficulty-badge">{quiz.quizConfig.difficulty}</span>
        </div>
        
        {quiz.quizConfig.mode === 'timed' && (
          <div className={`timer ${timeLeft < 60 ? 'timer-warning' : ''}`}>
            <span className="timer-icon">⏱️</span>
            <span className="timer-text">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-text">
          Question {currentIndex + 1} of {quiz.questions.length}
        </span>
      </div>

      <div className="quiz-body">
        {/* Question Navigation */}
        <div className="question-nav">
          <div className="nav-grid">
            {quiz.questions.map((_, idx) => (
              <button
                key={idx}
                className={`nav-btn ${idx === currentIndex ? 'active' : ''} ${
                  answers[idx]?.userAnswer ? 'answered' : ''
                }`}
                onClick={() => handleJumpToQuestion(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="nav-stats">
            <div className="stat">
              <span className="stat-label">Answered:</span>
              <span className="stat-value">{answeredCount}/{quiz.questions.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Remaining:</span>
              <span className="stat-value">{quiz.questions.length - answeredCount}</span>
            </div>
          </div>
        </div>

        {/* Question Display */}
        <div className="question-container">
          <div className="question-header">
            <span className="question-number">Question {currentIndex + 1}</span>
            <span className="question-marks">{currentQuestion.marks} mark(s)</span>
          </div>
          
          <div className="question-text">
            {currentQuestion.questionText}
          </div>

          <div className="options-container">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                className={`option-btn ${
                  currentAnswer === option.text ? 'selected' : ''
                }`}
                onClick={() => handleAnswerSelect(option.text)}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="option-text">{option.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="quiz-controls">
        <button
          className="btn-control"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>

        <button
          className="btn-control btn-clear"
          onClick={() => handleAnswerSelect(null)}
          disabled={!currentAnswer}
        >
          Clear Answer
        </button>

        {currentIndex < quiz.questions.length - 1 ? (
          <button
            className="btn-control btn-primary"
            onClick={handleNext}
          >
            Next →
          </button>
        ) : (
          <button
            className="btn-control btn-submit"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizInterface;