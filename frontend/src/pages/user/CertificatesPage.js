import { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import './CertificatesPage.css';

export default function CertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/certificates/my'), api.get('/subjects')])
      .then(([c, s]) => { setCerts(c.data.data); setSubjects(s.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const checkEligibility = async (subjectId) => {
    setChecking(subjectId);
    try {
      const { data } = await api.post(`/certificates/check/${subjectId}`);
      if (data.success) {
        toast.success('🎓 Certificate issued!');
        setCerts(prev => [...prev.filter(c => c.subject._id !== subjectId), data.data]);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Could not check eligibility');
    } finally { setChecking(null); }
  };

  const hasCert = (subjectId) => certs.find(c => c.subject?._id === subjectId);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="certs-page fade-up">
      <PageHeader title="🎓 Certificates" subtitle="Earn certificates by achieving ≥70% average across 5+ attempts per subject" />

      <div className="certs-grid">
        {subjects.map(s => {
          const cert = hasCert(s._id);
          return (
            <div key={s._id} className={`cert-card card${cert ? ' earned' : ''}`} style={{ '--cc': s.color }}>
              <div className="cert-icon">{s.icon}</div>
              <div className="cert-body">
                <div className="cert-subject">{s.name}</div>
                {cert ? (
                  <>
                    <div className="cert-id">ID: {cert.certificateId}</div>
                    <div className="cert-score">Score: {cert.score}%</div>
                    <div className="cert-earned">✅ Certificate Earned</div>
                  </>
                ) : (
                  <button className="btn btn-outline cert-check-btn"
                    onClick={() => checkEligibility(s._id)}
                    disabled={checking === s._id}>
                    {checking === s._id ? 'Checking…' : 'Check Eligibility'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
