import React, { useState, useEffect } from 'react';
import API from '../../api/api';
import Loader from '../../components/loaders/Loader';

const EmployeeAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await API.get('/announcements');
      setAnnouncements(res.data.data || res.data);
    } catch (err) {
      console.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type) => {
    switch(type) {
      case 'Urgent': return 'badge-danger';
      case 'Event': return 'badge-success';
      case 'Info': return 'badge-info';
      default: return 'badge-secondary';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Announcements</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Stay updated with company announcements</p>
        </div>
      </div>

      <div className="hrms-card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? <Loader /> : announcements.length === 0 ? (
            <div className="empty-state">No announcements yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {announcements.map((item) => (
                <div key={item.id} style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>{item.title}</h3>
                    <span className={`badge ${getTypeBadge(item.type)}`}>{item.type}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 8px 0', whiteSpace: 'pre-wrap' }}>{item.content}</p>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAnnouncements;
