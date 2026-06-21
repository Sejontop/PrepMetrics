import { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const emptyQ = { text: '', type: 'mcq', difficulty: 'medium', subject: '', topic: '', options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }], explanation: '', timeLimitSec: 60 };

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [form, setForm] = useState(emptyQ);
  const [filters, setFilters] = useState({ subject: '', difficulty: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const params = new URLSearchParams(filters).toString();
    const [q, s, t] = await Promise.all([
      api.get(`/admin/questions?${params}`),
      api.get('/subjects'),
      api.get('/topics'),
    ]);
    setQuestions(q.data.data); setSubjects(s.data.data); setTopics(t.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filters]);

  const save = async () => {
    if (!form.text || !form.subject || !form.topic) return toast.error('Fill required fields');
    setSaving(true);
    try {
      await api.post('/admin/questions', form);
      toast.success('Question created'); setForm(emptyQ); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    await api.delete(`/admin/questions/${id}`);
    toast.success('Deleted'); load();
  };

  const filteredTopics = topics.filter(t => t.subject?._id === form.subject || t.subject === form.subject);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fade-up">
      <PageHeader title="Question Management" subtitle={`${questions.length} questions`} />

      {/* Add Form */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Add New Question</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Subject *</label>
            <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value, topic: '' }))}>
              <option value="">Select subject</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Topic *</label>
            <select value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}>
              <option value="">Select topic</option>
              {filteredTopics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="mcq">MCQ</option>
                <option value="aptitude">Aptitude</option>
                <option value="conceptual">Conceptual</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Question *</label>
          <textarea rows={3} value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="Enter question text…" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Options (mark the correct one)</label>
          {form.options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'center' }}>
              <input type="radio" name="correctOpt" checked={opt.isCorrect}
                onChange={() => setForm(f => ({ ...f, options: f.options.map((o, j) => ({ ...o, isCorrect: j === i })) }))} />
              <input value={opt.text} placeholder={`Option ${String.fromCharCode(65 + i)}`}
                onChange={e => setForm(f => ({ ...f, options: f.options.map((o, j) => j === i ? { ...o, text: e.target.value } : o) }))} />
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Explanation</label>
          <input value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} placeholder="Explain the correct answer…" />
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : '+ Add Question'}</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select style={{ maxWidth: 200 }} value={filters.subject} onChange={e => setFilters(f => ({ ...f, subject: e.target.value }))}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <select style={{ maxWidth: 150 }} value={filters.difficulty} onChange={e => setFilters(f => ({ ...f, difficulty: e.target.value }))}>
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="card">
        {questions.map((q, i) => (
          <div key={q._id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', width: 24, flexShrink: 0, paddingTop: 2 }}>{i + 1}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{q.text}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-indigo">{q.subject?.name}</span>
                <span className="badge badge-indigo">{q.topic?.name}</span>
                <span className={`badge badge-${q.difficulty === 'easy' ? 'green' : q.difficulty === 'medium' ? 'amber' : 'red'}`}>{q.difficulty}</span>
                <span className="badge badge-indigo">{q.type}</span>
              </div>
            </div>
            <button className="btn btn-danger" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => del(q._id)}>Delete</button>
          </div>
        ))}
        {questions.length === 0 && <p style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No questions found</p>}
      </div>
    </div>
  );
}
