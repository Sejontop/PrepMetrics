import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import './QuizPage.css';

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questionTimes, setQuestionTimes] = useState({});
  const [qStart, setQStart] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(null);
  const [totalStart] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      if (quizId === 'generated') {
        const raw = sessionStorage.getItem('pm_generated_quiz');
        if (!raw) return navigate('/subjects');
        const gen = JSON.parse(raw);
        setQuiz({ ...gen, _isGenerated: true });
        if (gen.isTimed && gen.timeLimitMin) setTimeLeft(gen.timeLimitMin * 60);
      } else {
        const { data } = await api.get(`/quizzes/${quizId}`);
        setQuiz(data.data);
        if (data.data.isTimed) setTimeLeft(data.data.timeLimitMin * 60);
      }
    };
    loadQuiz().catch(e => { toast.error('Quiz not found'); navigate('/subjects'); });
  }, [quizId, navigate]);

  // Timer
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const recordAndMove = useCallback((nextIdx) => {
    const elapsed = Math.round((Date.now() - qStart) / 1000);
    setQuestionTimes(prev => ({ ...prev, [current]: (prev[current] || 0) + elapsed }));
    setQStart(Date.now());
    setCurrent(nextIdx);
  }, [current, qStart]);

  const handleAnswer = (optIdx) => {
    setAnswers(prev => ({ ...prev, [current]: optIdx }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const elapsed = Math.round((Date.now() - qStart) / 1000);
      const times = { ...questionTimes, [current]: (questionTimes[current] || 0) + elapsed };
      const qs = quiz.questions || [];

      const responses = qs.map((q, i) => ({
        questionId: q._id,
        selectedOption: answers[i] !== undefined ? answers[i] : null,
        timeTakenSec: times[i] || 0,
      }));

      const totalTime = Math.round((Date.now() - totalStart) / 1000);
      const subjectId = quiz.subject?._id || quiz.subjectId;

      const { data } = await api.post('/attempts', {
        quizId: quiz._isGenerated ? null : quiz._id,
        subjectId,
        responses: responses.filter(r => r.selectedOption !== null),
        timeTakenSec: totalTime,
      });

      if (quiz._isGenerated) sessionStorage.removeItem('pm_generated_quiz');
      navigate(`/attempts/${data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
      setSubmitting(false);
    }
  };

  if (!quiz) return <LoadingSpinner />;

  const questions = quiz.questions || [];
  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;
  const answered = Object.keys(answers).length;
  const mins = timeLeft !== null ? String(Math.floor(timeLeft / 60)).padStart(2, '0') : null;
  const secs = timeLeft !== null ? String(timeLeft % 60).padStart(2, '0') : null;
  const timerDanger = timeLeft !== null && timeLeft < 60;

  return (
    <div className="quiz-page fade-up">
      {/* Header */}
      <div className="quiz-header card">
        <div className="quiz-info">
          <h2 className="quiz-title">{quiz.title || `${quiz.subjectName || ''} Quiz`}</h2>
          <span className="quiz-progress-text">{current + 1} / {questions.length}</span>
        </div>
        <div className="quiz-meta">
          <span className="answered-count">{answered} answered</span>
          {timeLeft !== null && (
            <span className={`timer${timerDanger ? ' danger' : ''}`}>⏱ {mins}:{secs}</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className="question-card card fade-up" key={current}>
        <div className="question-meta">
          <span className={`badge badge-${q.difficulty === 'easy' ? 'green' : q.difficulty === 'medium' ? 'amber' : 'red'}`}>
            {q.difficulty?.toUpperCase()}
          </span>
          <span className="badge badge-indigo">{q.type?.toUpperCase()}</span>
        </div>
        <p className="question-text">{q.text}</p>
        <div className="options-grid">
          {q.options?.map((opt, i) => (
            <button key={i}
              className={`option-btn${answers[current] === i ? ' selected' : ''}`}
              onClick={() => handleAnswer(i)}>
              <span className="option-letter">{String.fromCharCode(65 + i)}</span>
              <span>{opt.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="quiz-nav">
        <button className="btn btn-outline" onClick={() => recordAndMove(current - 1)} disabled={current === 0}>
          ← Previous
        </button>
        <div className="dot-nav">
          {questions.map((_, i) => (
            <button key={i} className={`dot${i === current ? ' active' : ''}${answers[i] !== undefined ? ' done' : ''}`}
              onClick={() => recordAndMove(i)} />
          ))}
        </div>
        {current < questions.length - 1 ? (
          <button className="btn btn-primary" onClick={() => recordAndMove(current + 1)}>Next →</button>
        ) : (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : '✓ Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  );
}
