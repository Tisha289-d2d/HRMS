import { useState, useEffect } from 'react';
import API from '../../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../../components/loaders/Loader';

function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await API.get('/my-certificates');
      setCertificates(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-header">
        <h1>My Certificates</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View and download your training certificates</p>
      </div>

      {certificates.length === 0 ? (
        <div className="empty-state">No certificates issued to you yet.</div>
      ) : (
        <div className="grid-2">
          {certificates.map(c => (
            <div key={c.id} className="hrms-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{c.title}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.training?.title || 'N/A'}</span>
                </div>
                <span className="badge" style={{
                  backgroundColor: c.status === 'Issued' ? '#22c55e' : c.status === 'Pending' ? '#f59e0b' : '#ef4444',
                  color: '#fff', fontSize: '11px',
                }}>{c.status}</span>
              </div>
              {c.issued_date && (
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Issued: {new Date(c.issued_date).toLocaleDateString()}
                </div>
              )}
              {c.file_path && (
                <a href={`/api/storage/${c.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  📄 Download Certificate
                </a>
              )}

              {c.status === 'Issued' && !c.file_path && (
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Certificate file not available for download. Contact HR.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCertificates;
