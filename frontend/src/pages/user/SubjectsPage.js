import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import './SubjectsPage.css';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [config, setConfig] = useState({ difficulty: 'mixed', count: 10, isTimed: true });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get('/subjects'), api.get('/quizzes')])
      .then(([s, q]) => { setSubjects(s.data.data); setQuizzes(q.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const subjectQuizzes = quizzes.filter(q => q.subject?._id === selectedSubject?._id);

  const startQuiz = async (quizId) => navigate(`/quiz/${quizId}`);

  const generateAndStart = async () => {
    if (!selectedSubject) return;
    setGenerating(true);
    try {
      const { data } = await api.post('/quizzes/generate', {
        subjectId: selectedSubject._id, ...config
      });
      // Store generated quiz temporarily
      sessionStorage.setItem('pm_generated_quiz', JSON.stringify({
        ...data.data, subjectId: selectedSubject._id, subjectName: selectedSubject.name,
      }));
      navigate('/quiz/generated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not generate quiz');
    } finally { setGenerating(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="subjects-page fade-up">
      <PageHeader title="Subjects" subtitle="Choose a subject to start your preparation" />

      <div className="subjects-layout">
        <div className="subjects-list">
          {subjects.map(s => (
            <div key={s._id}
              className={`subject-card card${selectedSubject?._id === s._id ? ' selected' : ''}`}
              onClick={() => setSelectedSubject(s)}
              style={{ '--sc': s.color }}>
              <div className="sc-icon">{s.icon}</div>
              <div className="sc-body">
                <div className="sc-name">{s.name}</div>
                <div className="sc-quiz-count">{quizzes.filter(q => q.subject?._id === s._id).length} quizzes</div>
              </div>
              <div className="sc-arrow">›</div>
            </div>
          ))}
        </div>

        <div className="subject-detail">
          {selectedSubject ? (
            <>
              <div className="sd-header card" style={{ borderLeft: `4px solid ${selectedSubject.color}` }}>
                <div style={{ fontSize: 32 }}>{selectedSubject.icon}</div>
                <div>
                  <h2 style={{ fontWeight: 800 }}>{selectedSubject.name}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{selectedSubject.description || 'Practice curated interview questions'}</p>
                </div>
              </div>

              {/* Custom Quiz Generator */}
              <div className="card generator-card">
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>⚡ Generate Custom Quiz</h3>
                <div className="gen-row">
                  <div className="form-group">
                    <label>Difficulty</label>
                    <select value={config.difficulty} onChange={e => setConfig(c => ({ ...c, difficulty: e.target.value }))}>
                      <option value="mixed">Mixed</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Questions</label>
                    <select value={config.count} onChange={e => setConfig(c => ({ ...c, count: +e.target.value }))}>
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Mode</label>
                    <select value={config.isTimed ? 'timed' : 'untimed'} onChange={e => setConfig(c => ({ ...c, isTimed: e.target.value === 'timed' }))}>
                      <option value="timed">Timed</option>
                      <option value="untimed">Untimed</option>
                    </select>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={generateAndStart} disabled={generating}>
                  {generating ? 'Generating…' : '▶ Start Quiz'}
                </button>
              </div>

              {/* Existing Quizzes */}
              {subjectQuizzes.length > 0 && (
                <div className="card">
                  <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📋 Available Quizzes</h3>
                  {subjectQuizzes.map(q => (
                    <div key={q._id} className="quiz-row">
                      <div>
                        <div style={{ fontWeight: 600 }}>{q.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {q.questions?.length || 0} questions · {q.isTimed ? `${q.timeLimitMin} min` : 'Untimed'} · {q.difficulty}
                        </div>
                      </div>
                      <button className="btn btn-outline" onClick={() => startQuiz(q._id)}>Start →</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="card" style={{ padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👈</div>
              <p style={{ color: 'var(--text-muted)' }}>Select a subject to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
