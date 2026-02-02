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

  const fetchQuiz = async () => {
    try {
      // Axios baseURL is already /api, so we use /quizzes
      const response = await axios.get(`/quizzes/${quizId}`);
      const quizData = response.data.data;
      
      if (!quizData || !quizData.questions) {
         throw new Error("Invalid Quiz Data structure");
      }

      setQuiz(quizData);
      
      if (quizData.quizConfig && quizData.quizConfig.mode === 'timed') {
        setTimeLeft(quizData.quizConfig.timeLimit || 600);
      }
      
      const initialAnswers = {};
      quizData.questions.forEach((q, idx) => {
        initialAnswers[idx] = { 
          questionId: q.question?._id || q.question, 
          userAnswer: null, 
          timeSpent: 0 
        };
      });
      setAnswers(initialAnswers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      alert('Failed to load quiz. Please start a new quiz from Dashboard.');
      navigate('/');
    }
  };

  const handleAnswerSelect = (answerText) => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        userAnswer: answerText,
        timeSpent: (prev[currentIndex]?.timeSpent || 0) + timeSpent
      }
    }));
    setQuestionStartTime(Date.now());
  };

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit?')) return;
    setSubmitting(true);
    try {
      const answersArray = Object.values(answers);
      await axios.put(`/quizzes/${quizId}/submit`, { answers: answersArray });
      navigate(`/quiz/${quizId}/results`);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Submit failed. Check if backend is running.');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading quiz...</div>;
  if (!quiz) return <div className="error">Quiz not found</div>;

  const currentQuestionData = quiz.questions[currentIndex]?.question;
  if (!currentQuestionData) return <div className="error">Question data missing</div>;

  return (
    <div className="quiz-interface">
      <div className="quiz-header">
        <div className="quiz-info">
          <h2>{quiz.subject?.name || 'Quiz'}</h2>
          <span className="difficulty-badge">{quiz.quizConfig?.difficulty}</span>
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }} 
          />
        </div>
        <p>Question {currentIndex + 1} of {quiz.questions.length}</p>
      </div>

      <div className="quiz-body">
        <div className="question-container">
          {/* CORRECTED: Using questionText as per your DB structure */}
          <div className="question-text">
            {currentQuestionData.questionText}
          </div>

          <div className="options-container">
            {currentQuestionData.options?.map((option, idx) => {
              const optionLabel = typeof option === 'object' ? option.text : option;
              return (
                <button
                  key={idx}
                  className={`option-btn ${answers[currentIndex]?.userAnswer === optionLabel ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(optionLabel)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                  <span className="option-text">{optionLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="quiz-controls">
        <button 
          className="btn-control" 
          onClick={() => {
            setCurrentIndex(prev => prev - 1);
            setQuestionStartTime(Date.now());
          }} 
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>

        {currentIndex < quiz.questions.length - 1 ? (
          <button 
            className="btn-control btn-primary" 
            onClick={() => {
              setCurrentIndex(prev => prev + 1);
              setQuestionStartTime(Date.now());
            }}
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