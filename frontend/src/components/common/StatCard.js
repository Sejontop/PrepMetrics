import './StatCard.css';
export default function StatCard({ icon, label, value, sub, color = '#6366f1' }) {
  return (
    <div className="stat-card card fade-up">
      <div className="stat-icon" style={{ background: color + '20', color }}>{icon}</div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}
