import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, LinearScale, CategoryScale, Tooltip } from 'chart.js';
Chart.register(BarElement, LinearScale, CategoryScale, Tooltip);

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/analytics/platform').then(r => setData(r.data.data));
  }, []);

  if (!data) return <LoadingSpinner />;

  const barData = {
    labels: data.subjectEngagement.map(s => s.name),
    datasets: [
      { label: 'Attempts', data: data.subjectEngagement.map(s => s.count), backgroundColor: '#6366f1', borderRadius: 6 },
      { label: 'Avg Score', data: data.subjectEngagement.map(s => s.avgScore), backgroundColor: '#14b8a6', borderRadius: 6 },
    ],
  };

  return (
    <div className="fade-up">
      <PageHeader title="Platform Overview" subtitle="Real-time platform-level analytics" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon="👥" label="Total Users" value={data.totalUsers} color="#6366f1" />
        <StatCard icon="📝" label="Total Attempts" value={data.totalAttempts} color="#14b8a6" />
        <StatCard icon="📚" label="Active Subjects" value={data.subjectEngagement.length} color="#f59e0b" />
      </div>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Subject Engagement & Scores</h3>
        <Bar data={barData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
      </div>
    </div>
  );
}
