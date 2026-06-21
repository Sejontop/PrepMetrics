export default function ReadinessBadge({ score }) {
  const getLevel = (s) => {
    if (s >= 85) return { label: 'Interview Ready', color: '#22c55e', bg: '#dcfce7' };
    if (s >= 70) return { label: 'Almost Ready',    color: '#eab308', bg: '#fef9c3' };
    if (s >= 50) return { label: 'Needs Practice',  color: '#f97316', bg: '#ffedd5' };
    return         { label: 'Beginner',             color: '#ef4444', bg: '#fee2e2' };
  };
  const level = getLevel(score);
  return (
    <span style={{ background: level.bg, color: level.color, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
      {level.label} · {score}%
    </span>
  );
}
