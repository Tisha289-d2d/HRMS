import { useState, useEffect } from 'react';
import API from '../../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../../components/loaders/Loader';

function TrainingDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await API.get('/training-stats');
      setStats(res.data);
    } catch (err) {
      toast.error('Failed to load training stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1>Training Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Overview of training and development activities</p>
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Completion Rate: <strong>{stats?.completion_rate || 0}%</strong>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="hrms-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Trainings</div>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>{stats?.total_trainings || 0}</div>
        </div>
        <div className="hrms-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Scheduled</div>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>{stats?.scheduled || 0}</div>
        </div>
        <div className="hrms-card" style={{ borderLeft: '4px solid #22c55e' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Completed</div>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>{stats?.completed || 0}</div>
        </div>
        <div className="hrms-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>In Progress</div>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>{stats?.in_progress || 0}</div>
        </div>
        <div className="hrms-card" style={{ borderLeft: '4px solid #f97316' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Assignments</div>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>{stats?.total_assignments || 0}</div>
        </div>
        <div className="hrms-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Cancelled</div>
          <div style={{ fontSize: '28px', fontWeight: '700' }}>{stats?.cancelled || 0}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="hrms-card">
          <div className="card-header"><h2>Monthly Trend</h2></div>
          <div className="card-body">
            {stats?.monthly_trend?.length > 0 ? (
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Month</th>
                    <th>Trainings</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.monthly_trend.map((item, i) => (
                    <tr key={i}>
                      <td>{item.year}</td>
                      <td>{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][item.month - 1]}</td>
                      <td>{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">No data available.</div>
            )}
          </div>
        </div>
        <div className="hrms-card">
          <div className="card-header"><h2>Attendance Overview</h2></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <span>✅ Present</span>
                <span style={{ fontWeight: '700', fontSize: '20px', color: '#22c55e' }}>{stats?.present_attendance || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <span>📋 Total Attendance Records</span>
                <span style={{ fontWeight: '700', fontSize: '20px' }}>{stats?.total_attendance || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <span>🎓 Completed Assignments</span>
                <span style={{ fontWeight: '700', fontSize: '20px', color: '#22c55e' }}>{stats?.completed_assignments || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrainingDashboard;
