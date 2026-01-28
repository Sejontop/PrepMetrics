// src/pages/certificates/Certificates.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Certificates.css';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await axios.get('/api/certificates/my-certificates');
      setCertificates(response.data.data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async (subjectId) => {
    try {
      await axios.post(`/api/certificates/generate/${subjectId}`);
      alert('Certificate generated successfully!');
      fetchCertificates();
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert(error.response?.data?.message || 'Failed to generate certificate');
    }
  };

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
  };

  const handleDownload = (certificate) => {
    // This would typically generate a PDF
    alert('Certificate download feature coming soon!');
  };

  if (loading) {
    return <div className="loading">Loading certificates...</div>;
  }

  return (
    <div className="certificates-container">
      <div className="certificates-header">
        <h1>🎓 My Certificates</h1>
        <p>Your achievements and earned credentials</p>
      </div>

      {certificates.length === 0 ? (
        <div className="no-certificates">
          <span className="no-cert-icon">🎯</span>
          <h2>No Certificates Yet</h2>
          <p>Complete subjects with good performance to earn certificates</p>
          <a href="/subjects" className="btn-browse">
            Browse Subjects
          </a>
        </div>
      ) : (
        <div className="certificates-grid">
          {certificates.map(cert => (
            <div key={cert._id} className="certificate-card">
              <div className="certificate-header">
                <span className="cert-icon">{cert.subject.icon || '🎓'}</span>
                <span className="cert-badge">Verified</span>
              </div>

              <div className="certificate-content">
                <h3>{cert.subject.name}</h3>
                <p className="cert-category">{cert.subject.category}</p>

                <div className="cert-stats">
                  <div className="cert-stat">
                    <span className="cert-stat-label">Quizzes:</span>
                    <span className="cert-stat-value">{cert.performanceData.totalQuizzes}</span>
                  </div>
                  <div className="cert-stat">
                    <span className="cert-stat-label">Accuracy:</span>
                    <span className="cert-stat-value">{cert.performanceData.averageAccuracy}%</span>
                  </div>
                  <div className="cert-stat">
                    <span className="cert-stat-label">Score:</span>
                    <span className="cert-stat-value">{cert.performanceData.overallScore}</span>
                  </div>
                </div>

                <div className="cert-id">
                  ID: {cert.certificateId}
                </div>

                <div className="cert-date">
                  Issued: {new Date(cert.issuedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>

                <div className="cert-actions">
                  <button 
                    className="btn-view-cert"
                    onClick={() => handleViewCertificate(cert)}
                  >
                    View
                  </button>
                  <button 
                    className="btn-download-cert"
                    onClick={() => handleDownload(cert)}
                  >
                    Download
                  </button>
                  <a 
                    href={cert.verification.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-verify-cert"
                  >
                    Verify
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCertificate && (
        <div className="certificate-modal" onClick={() => setSelectedCertificate(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedCertificate(null)}>
              ×
            </button>
            
            <div className="certificate-display">
              <div className="cert-border">
                <div className="cert-header-large">
                  <h1>Certificate of Completion</h1>
                  <span className="cert-icon-large">🎓</span>
                </div>

                <div className="cert-body">
                  <p className="cert-text">This is to certify that</p>
                  <h2 className="cert-name">{selectedCertificate.user?.name}</h2>
                  <p className="cert-text">has successfully completed</p>
                  <h3 className="cert-subject">{selectedCertificate.subject.name}</h3>
                  <p className="cert-category-text">{selectedCertificate.subject.category}</p>

                  <div className="cert-performance-display">
                    <div className="perf-item">
                      <span className="perf-label">Quizzes Completed</span>
                      <span className="perf-value">{selectedCertificate.performanceData.totalQuizzes}</span>
                    </div>
                    <div className="perf-item">
                      <span className="perf-label">Average Accuracy</span>
                      <span className="perf-value">{selectedCertificate.performanceData.averageAccuracy}%</span>
                    </div>
                    <div className="perf-item">
                      <span className="perf-label">Overall Score</span>
                      <span className="perf-value">{selectedCertificate.performanceData.overallScore}</span>
                    </div>
                  </div>

                  <div className="cert-footer">
                    <div className="cert-signature">
                      <div className="signature-line"></div>
                      <p>PrepMetrics Platform</p>
                    </div>

                    <div className="cert-details">
                      <p>Certificate ID: <strong>{selectedCertificate.certificateId}</strong></p>
                      <p>Issue Date: {new Date(selectedCertificate.issuedDate).toLocaleDateString()}</p>
                      <p className="verify-text">
                        Verify at: {selectedCertificate.verification.verificationUrl}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;