import { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const emptyS = { name: '', slug: '', description: '', icon: '📚', color: '#6366f1', order: 0 };

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(emptyS);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/subjects').then(r => setSubjects(r.data.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name || !form.slug) return toast.error('Name and slug required');
    try {
      await api.post('/admin/subjects', form);
      toast.success('Subject created'); setForm(emptyS); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const del = async (id) => {
    if (!window.confirm('Deactivate subject?')) return;
    await api.delete(`/admin/subjects/${id}`);
    toast.success('Deactivated'); load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-up">
      <PageHeader title="Subject Management" />
      <div className="card" style={{ padding: 22, marginBottom: 22 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Add Subject</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 60px 140px', gap: 12, marginBottom: 12 }}>
          <input placeholder="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input placeholder="Slug * (e.g. dbms)" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
          <input placeholder="Icon" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
          <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ height: 40 }} />
        </div>
        <button className="btn btn-primary" onClick={save}>+ Add Subject</button>
      </div>
      <div className="card">
        {subjects.map(s => (
          <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <div style={{ flex: 1, fontWeight: 600 }}>{s.name}</div>
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{s.slug}</span>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: s.color }} />
            <button className="btn btn-danger" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => del(s._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
