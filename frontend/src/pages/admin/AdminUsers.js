import { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/admin/users').then(r => setUsers(r.data.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    await api.put(`/admin/users/${id}/toggle`);
    toast.success('Updated'); load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-up">
      <PageHeader title="User Management" subtitle={`${users.length} users`} />
      <div className="card">
        {users.map(u => (
          <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--pm-indigo)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{u.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{u.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email} · Joined {new Date(u.createdAt).toLocaleDateString()}</div>
            </div>
            <span className={`badge ${u.role === 'admin' ? 'badge-red' : 'badge-indigo'}`}>{u.role}</span>
            <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Blocked'}</span>
            <button className="btn btn-outline" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => toggle(u._id)}>
              {u.isActive ? 'Block' : 'Unblock'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
