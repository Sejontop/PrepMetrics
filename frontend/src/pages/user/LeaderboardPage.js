import { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import './LeaderboardPage.css';

export default function LeaderboardPage() {
  const [lb, setLb] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selSub, setSelSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([api.get('/leaderboard/global'), api.get('/subjects')])
      .then(([l, s]) => { setLb(l.data.data); setSubjects(s.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const loadSubject = async (sub) => {
    setSelSub(sub);
    if (sub) {
      const { data } = await api.get(`/leaderboard/subject/${sub._id}`);
      setLb(data.data);
    } else {
      const { data } = await api.get('/leaderboard/global');
      setLb(data.data);
    }
  };

  if (loading) return <LoadingSpinner />;

  const medal = ['🥇', '🥈', '🥉'];

  return (
    <div className="leaderboard-page fade-up">
      <PageHeader title="🏆 Leaderboard" subtitle="Top performers on PrepMetrics" />

      {/* Subject Filter */}
      <div className="lb-filters">
        <button className={`lb-filter-btn${!selSub ? ' active' : ''}`} onClick={() => loadSubject(null)}>🌐 Global</button>
        {subjects.map(s => (
          <button key={s._id} className={`lb-filter-btn${selSub?._id === s._id ? ' active' : ''}`} onClick={() => loadSubject(s)}>
            {s.icon} {s.name}
          </button>
        ))}
      </div>

      <div className="card lb-table">
        <div className="lb-header-row">
          <span>Rank</span><span>Name</span><span>Avg Score</span><span>Attempts</span><span>Best</span>
        </div>
        {lb.map((entry, i) => (
          <div key={i} className={`lb-row${entry.name === user?.name ? ' mine' : ''}`}>
            <span className="lb-rank">{medal[i] || `#${i + 1}`}</span>
            <span className="lb-name">{entry.name} {entry.name === user?.name && <span className="you-tag">You</span>}</span>
            <span className="lb-score">{entry.avgScore}%</span>
            <span className="lb-attempts">{entry.totalAttempts}</span>
            <span className="lb-best">{entry.bestScore}%</span>
          </div>
        ))}
        {lb.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32, fontSize: 13 }}>No entries yet. Be the first!</p>}
      </div>
    </div>
  );
}
