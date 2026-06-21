import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReadinessBadge from '../../components/common/ReadinessBadge';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js';
import './DashboardPage.css';

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/analytics/dashboard'), api.get('/subjects')])
      .then(([a, s]) => { setData(a.data.data); setSubjects(s.data.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const totalAccuracy = data.totalAttempts > 0
    ? Math.round((user.totalScore || 0) / data.totalAttempts)
    : 0;

  const scoreLabels  = data.scoreTrend.map((a, i) => `#${i + 1}`);
  const scoreValues  = data.scoreTrend.map(a => a.score);

  const chartData = {
    labels: scoreLabels,
    datasets: [{
      data: scoreValues,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,.1)',
      fill: true,
      tension: .4,
      pointRadius: 4,
      pointBackgroundColor: '#6366f1',
    }],
  };

  return (
    <div className="dashboard fade-up">
      <PageHeader
        title={`Welcome back, ${user.name.split(' ')[0]} 👋`}
        subtitle="Here's your interview preparation at a glance"
      />

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard icon="📝" label="Total Attempts" value={data.totalAttempts} color="#6366f1" />
        <StatCard icon="🎯" label="Avg. Accuracy" value={`${totalAccuracy}%`} color="#14b8a6" />
        <StatCard icon="🔥" label="Current Streak" value={`${data.streak.current} days`} sub={`Best: ${data.streak.longest} days`} color="#f97316" />
        <StatCard icon="📚" label="Subjects Covered" value={data.subjectStats.length} color="#f59e0b" />
      </div>

      <div className="dashboard-grid">
        {/* Score Trend */}
        <div className="card trend-card">
          <h3 className="card-title">Score Trend</h3>
          {scoreValues.length > 0 ? (
            <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }} />
          ) : (
            <div className="empty-state">Complete your first quiz to see trends</div>
          )}
        </div>

        {/* Subject Readiness */}
        <div className="card readiness-card">
          <h3 className="card-title">Subject Readiness</h3>
          <div className="readiness-list">
            {data.subjectStats.length > 0 ? data.subjectStats.map(s => (
              <div key={s._id} className="readiness-row">
                <span className="readiness-subject" style={{ color: s.subjectColor }}>
                  {s.subjectIcon} {s.subjectName}
                </span>
                <ReadinessBadge score={Math.round(s.avgReadiness)} />
              </div>
            )) : <div className="empty-state">No attempts yet</div>}
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="card quick-start">
        <h3 className="card-title">Quick Start a Quiz</h3>
        <div className="subject-grid">
          {subjects.slice(0, 8).map(s => (
            <button key={s._id} className="subject-chip" onClick={() => navigate('/subjects')}
              style={{ '--chip-color': s.color }}>
              <span>{s.icon}</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
