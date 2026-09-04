import { useState, useEffect } from 'react';
import API from '../../api/api';

function TodayBirthdaysCard() {
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchToday();
  }, []);

  const fetchToday = async () => {
    try {
      const res = await API.get('/birthdays/today');
      setBirthdays(res.data.data || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (birthdays.length === 0) return null;

  return (
    <div className="hrms-card" style={{ borderLeft: '4px solid #f59e0b', marginBottom: '20px' }}>
      <div className="card-header">
        <h2>🎂 Today's Birthdays</h2>
        <span className="badge badge-warning">{birthdays.length} Celebrating</span>
      </div>
      <div className="card-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {birthdays.map(b => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="emp-avatar" style={{ width: 40, height: 40, fontSize: 16 }}>
                {b.name?.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{b.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {b.designation} {b.department ? `· ${b.department}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TodayBirthdaysCard;
