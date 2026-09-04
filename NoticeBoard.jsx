import React, { useState, useEffect } from 'react';
import API from '../../api/api';
import Loader from '../../components/loaders/Loader';

const EmployeeNoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await API.get('/announcements');
      setNotices(res.data.data || res.data);
    } catch (err) {
      console.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadge = (category) => {
    switch(category) {
      case 'Urgent': return 'badge-danger';
      case 'Event': return 'badge-success';
      case 'Meeting': return 'badge-warning';
      case 'Policy': return 'badge-primary';
      default: return 'badge-info';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Urgent': return '🚨';
      case 'Event': return '🎉';
      case 'Policy': return '📜';
      case 'Meeting': return '🤝';
      default: return '📌';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Notice Board</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Stay updated with company notices</p>
        </div>
      </div>

      <div className="grid-2">
        {loading ? <Loader /> : notices.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>No notices yet</div>
        ) : (
          notices.map((notice) => (
            <div key={notice.id} className="hrms-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '32px' }}>{getCategoryIcon(notice.category)}</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>{notice.title}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(notice.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
                {notice.content}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <span className={`badge ${getCategoryBadge(notice.category)}`}>
                  {notice.category}
                </span>
                {notice.author?.name && (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Posted by {notice.author.name}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployeeNoticeBoard;
