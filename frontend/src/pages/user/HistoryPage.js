import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function HistoryPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/attempts/my').then(r => setAttempts(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-up">
      <PageHeader title="📋 Attempt History" subtitle={`${attempts.length} total attempts`} />
      <div className="card" style={{ overflow: 'hidden' }}>
        {attempts.length === 0 && <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No attempts yet. Start a quiz!</p>}
        {attempts.map((a, i) => (
          <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
            onClick={() => navigate(`/attempts/${a._id}`)}>
            <div style={{ fontSize: 22 }}>{a.subject?.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{a.quiz?.title || a.subject?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {new Date(a.completedAt).toLocaleDateString()} · {a.totalQuestions} questions
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: a.score >= 70 ? 'var(--pm-green)' : a.score >= 50 ? 'var(--pm-amber)' : 'var(--pm-red)' }}>{a.score}%</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.passed ? '✓ Passed' : '✗ Failed'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
