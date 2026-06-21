import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReadinessBadge from '../../components/common/ReadinessBadge';
import './AttemptResultPage.css';

export default function AttemptResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);

  useEffect(() => {
    api.get(`/attempts/${id}`).then(r => setAttempt(r.data.data));
  }, [id]);

  if (!attempt) return <LoadingSpinner />;

  const { score, correctAnswers, totalQuestions, responses, subject, timeTakenSec, readinessScore, passed } = attempt;
  const mins = Math.floor(timeTakenSec / 60);
  const secs = timeTakenSec % 60;

  return (
    <div className="result-page fade-up">
      {/* Score Banner */}
      <div className={`score-banner card${passed ? ' passed' : ' failed'}`}>
        <div className="score-circle">
          <span className="score-num">{score}</span>
          <span className="score-pct">%</span>
        </div>
        <div className="score-info">
          <div className="score-status">{passed ? '✅ Passed' : '❌ Needs Improvement'}</div>
          <div className="score-subject">{subject?.icon} {subject?.name}</div>
          <div className="score-stats">
            <span>✓ {correctAnswers}/{totalQuestions} correct</span>
            <span>⏱ {mins}m {secs}s</span>
            <ReadinessBadge score={readinessScore} />
          </div>
        </div>
      </div>

      {/* Question Review */}
      <div className="card review-card">
        <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 16 }}>Question Review</h3>
        {responses?.map((r, i) => {
          const q = r.question;
          if (!q) return null;
          return (
            <div key={i} className={`review-item${r.isCorrect ? ' correct' : ' wrong'}`}>
              <div className="review-q-header">
                <span className={`review-badge${r.isCorrect ? ' correct' : ' wrong'}`}>
                  {r.isCorrect ? '✓' : '✗'}
                </span>
                <span className="review-q-num">Q{i + 1}</span>
                <span className="review-difficulty badge badge-indigo">{q.difficulty}</span>
                <span className="review-time">⏱ {r.timeTakenSec}s</span>
              </div>
              <p className="review-q-text">{q.text}</p>
              <div className="review-options">
                {q.options?.map((opt, oi) => (
                  <div key={oi} className={`review-opt${opt.isCorrect ? ' correct-opt' : ''}${r.selectedOption === oi && !opt.isCorrect ? ' wrong-opt' : ''}`}>
                    {String.fromCharCode(65 + oi)}. {opt.text}
                    {opt.isCorrect && <span className="correct-mark"> ✓</span>}
                    {r.selectedOption === oi && !opt.isCorrect && <span className="wrong-mark"> ✗ (Your answer)</span>}
                  </div>
                ))}
              </div>
              {q.explanation && <div className="review-explanation">💡 {q.explanation}</div>}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={() => navigate('/subjects')}>Try Another Quiz</button>
        <button className="btn btn-outline" onClick={() => navigate('/analytics')}>View Analytics</button>
      </div>
    </div>
  );
}
