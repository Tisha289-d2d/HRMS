import { useState, useEffect } from 'react';
import API from '../../api/api';

function UpcomingBirthdaysCard() {
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcoming();
  }, []);

  const fetchUpcoming = async () => {
    try {
      const res = await API.get('/birthdays/upcoming', { params: { days: 7 } });
      setBirthdays(res.data.data || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (birthdays.length === 0) return null;

  return (
    <div className="hrms-card" style={{ borderLeft: '4px solid #3b82f6', marginBottom: '20px' }}>
      <div className="card-header">
        <h2>📅 Upcoming Birthdays</h2>
        <span className="badge badge-info">Next 7 days</span>
      </div>
      <div className="card-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {birthdays.slice(0, 5).map(b => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="emp-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                {b.name?.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '13px' }}>{b.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {b.department || ''} · {b.days_until === 0 ? 'Tomorrow!' : `In ${b.days_until} days`}
                </div>
              </div>
              {b.age && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Turn {b.age + 1}</span>}
            </div>
          ))}
          {birthdays.length > 5 && (
            <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>
              +{birthdays.length - 5} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UpcomingBirthdaysCard;
