import { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReadinessBadge from '../../components/common/ReadinessBadge';
import { Bar, Radar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart, BarElement, RadarController, RadialLinearScale,
  LineElement, PointElement, LinearScale, CategoryScale,
  ArcElement, Filler, Tooltip, Legend
} from 'chart.js';
import './AnalyticsPage.css';

Chart.register(BarElement, RadarController, RadialLinearScale, LineElement, PointElement, LinearScale, CategoryScale, ArcElement, Filler, Tooltip, Legend);

export default function AnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/analytics/dashboard').then(r => setData(r.data.data));
  }, []);

  if (!data) return <LoadingSpinner />;

  const COLORS = ['#6366f1','#14b8a6','#f59e0b','#22c55e','#ef4444','#f97316','#8b5cf6','#ec4899'];

  const subjectBarData = {
    labels: data.subjectStats.map(s => s.subjectName),
    datasets: [
      { label: 'Avg Score', data: data.subjectStats.map(s => s.avgScore), backgroundColor: COLORS, borderRadius: 6 },
    ],
  };

  const diffData = {
    labels: data.difficultyStats.map(d => d._id?.toUpperCase() || 'N/A'),
    datasets: [{
      data: data.difficultyStats.map(d => Math.round((d.correct / d.total) * 100)),
      backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
    }],
  };

  const weakTopics = data.topicStats.filter(t => t.topic);
  const radarData = {
    labels: data.subjectStats.map(s => s.subjectName.split(' ')[0]),
    datasets: [{
      label: 'Readiness',
      data: data.subjectStats.map(s => s.avgReadiness),
      backgroundColor: 'rgba(99,102,241,.15)',
      borderColor: '#6366f1',
      pointBackgroundColor: '#6366f1',
    }],
  };

  const trendData = {
    labels: data.scoreTrend.map((_, i) => `#${i + 1}`),
    datasets: [{
      label: 'Score',
      data: data.scoreTrend.map(a => a.score),
      borderColor: '#14b8a6',
      backgroundColor: 'rgba(20,184,166,.1)',
      fill: true, tension: .4,
    }],
  };

  return (
    <div className="analytics-page fade-up">
      <PageHeader title="Performance Analytics" subtitle="Deep dive into your interview preparation data" />

      <div className="analytics-grid">
        {/* Score Trend */}
        <div className="card analytics-card span-2">
          <h3 className="card-title">📈 Score Trend (Last 20 Attempts)</h3>
          {data.scoreTrend.length > 0
            ? <Line data={trendData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }} />
            : <p className="empty-state">No attempts yet</p>}
        </div>

        {/* Subject Bars */}
        <div className="card analytics-card">
          <h3 className="card-title">📊 Subject-Wise Average Score</h3>
          {data.subjectStats.length > 0
            ? <Bar data={subjectBarData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }} />
            : <p className="empty-state">No data yet</p>}
        </div>

        {/* Radar */}
        <div className="card analytics-card">
          <h3 className="card-title">🕸 Readiness Radar</h3>
          {data.subjectStats.length > 0
            ? <Radar data={radarData} options={{ responsive: true, scales: { r: { min: 0, max: 100 } } }} />
            : <p className="empty-state">No data yet</p>}
        </div>

        {/* Difficulty Donut */}
        <div className="card analytics-card">
          <h3 className="card-title">🎯 Accuracy by Difficulty</h3>
          {data.difficultyStats.length > 0
            ? <Doughnut data={diffData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
            : <p className="empty-state">No data yet</p>}
        </div>

        {/* Subject Readiness Table */}
        <div className="card analytics-card">
          <h3 className="card-title">🏷 Subject Readiness Summary</h3>
          <div className="readiness-table">
            {data.subjectStats.map(s => (
              <div key={s._id} className="rt-row">
                <span style={{ color: s.subjectColor, fontWeight: 600 }}>{s.subjectIcon} {s.subjectName}</span>
                <div className="rt-right">
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.totalAttempts} attempts</span>
                  <ReadinessBadge score={Math.round(s.avgReadiness)} />
                </div>
              </div>
            ))}
            {data.subjectStats.length === 0 && <p className="empty-state">No data yet</p>}
          </div>
        </div>

        {/* Weak Areas */}
        {weakTopics.length > 0 && (
          <div className="card analytics-card span-2">
            <h3 className="card-title">⚠️ Weakest Topics (Lowest Accuracy)</h3>
            <div className="weak-list">
              {weakTopics.map((t, i) => (
                <div key={i} className="weak-row">
                  <span className="weak-rank">#{i + 1}</span>
                  <span className="weak-topic">{t.topic?.name || 'Unknown Topic'}</span>
                  <div className="weak-bar-bg">
                    <div className="weak-bar-fill" style={{ width: `${Math.round(t.accuracy)}%`, background: t.accuracy < 40 ? '#ef4444' : t.accuracy < 65 ? '#f59e0b' : '#22c55e' }} />
                  </div>
                  <span className="weak-pct">{Math.round(t.accuracy)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
