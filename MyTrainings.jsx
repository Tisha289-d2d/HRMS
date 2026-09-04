import { useState, useEffect } from 'react';
import API from '../../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../../components/loaders/Loader';

const statusColors = {
  'Scheduled': '#f59e0b', 'In Progress': '#3b82f6',
  'Completed': '#22c55e', 'Cancelled': '#ef4444',
};

function MyTrainings() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const res = await API.get('/my-trainings');
      setTrainings(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load trainings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-header">
        <h1>My Trainings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View your assigned training sessions</p>
      </div>

      {trainings.length === 0 ? (
        <div className="empty-state">No trainings assigned to you yet.</div>
      ) : (
        <div className="grid-2">
          {trainings.map(t => (
            <div key={t.id} className="hrms-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.course?.title || 'Training'}</span>
                  <h3 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '700' }}>{t.title}</h3>
                </div>
                <span className="badge" style={{ backgroundColor: statusColors[t.status] || '#6b7280', color: '#fff' }}>
                  {t.status}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                <span>📅 {t.start_date ? new Date(t.start_date).toLocaleDateString() : 'N/A'} - {t.end_date ? new Date(t.end_date).toLocaleDateString() : 'N/A'}</span>
                <span>📍 {t.mode === 'Online' ? 'Online' : t.location || 'In Person'}</span>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>Your Progress</span>
                  <span style={{ fontWeight: '700' }}>{t.assignment_progress || 0}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${t.assignment_progress || 0}%`, height: '100%',
                    background: t.assignment_progress >= 100 ? '#22c55e' : 'var(--primary)',
                    borderRadius: '4px', transition: 'width 0.3s',
                  }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>Status: <strong>{t.assignment_status || 'Pending'}</strong></span>
                {t.attendance_status && <span>Attendance: <strong>{t.attendance_status}</strong></span>}
              </div>

              {t.trainer?.user?.name && (
                <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  👨‍🏫 Trainer: {t.trainer.user.name}
                </div>
              )}

              {t.meeting_link && t.status === 'In Progress' && (
                <div style={{ marginTop: '12px' }}>
                  <a href={t.meeting_link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px' }}>
                    🔗 Join Meeting
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTrainings;
