import { useState, useEffect } from 'react';
import API from '../../../api/api';
import Loader from '../../../components/loaders/Loader';

function EmpBirthdayWishes() {
  const [sentWishes, setSentWishes] = useState([]);
  const [receivedWishes, setReceivedWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('received');

  useEffect(() => {
    fetchWishes();
  }, []);

  const fetchWishes = async () => {
    setLoading(true);
    try {
      const [receivedRes, sentRes] = await Promise.all([
        API.get('/birthday-wishes/received'),
        API.get('/birthday-wishes/sent'),
      ]);
      setReceivedWishes(receivedRes.data.data || []);
      setSentWishes(sentRes.data.data || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (wishes, emptyMsg) => (
    <div className="hrms-table-wrap">
      <table className="hrms-table">
        <thead>
          <tr>
            <th>{tab === 'received' ? 'From' : 'To'}</th>
            <th>Message</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {wishes.length > 0 ? wishes.map(w => (
            <tr key={w.id}>
              <td>
                <div className="emp-name">
                  <div className="emp-avatar">
                    {tab === 'received' ? w.wished_by?.name?.charAt(0) : w.employee?.name?.charAt(0)}
                  </div>
                  {tab === 'received' ? w.wished_by?.name : w.employee?.name}
                </div>
              </td>
              <td style={{ maxWidth: '300px', whiteSpace: 'pre-wrap' }}>{w.message}</td>
              <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {new Date(w.created_at).toLocaleDateString()}
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="3" className="empty-state">{emptyMsg}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Birthday Wishes</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Wishes you've sent and received</p>
        </div>
      </div>

      <div className="hrms-card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className={tab === 'received' ? 'btn-primary' : 'btn-ghost'}
              onClick={() => setTab('received')}
              style={{ padding: '6px 16px', fontSize: '13px' }}>
              Received ({receivedWishes.length})
            </button>
            <button className={tab === 'sent' ? 'btn-primary' : 'btn-ghost'}
              onClick={() => setTab('sent')}
              style={{ padding: '6px 16px', fontSize: '13px' }}>
              Sent ({sentWishes.length})
            </button>
          </div>
        </div>
        <div className="card-body" style={{ padding: '0' }}>
          {loading ? <Loader /> : (
            tab === 'received'
              ? renderTable(receivedWishes, 'No wishes received yet')
              : renderTable(sentWishes, 'No wishes sent yet')
          )}
        </div>
      </div>
    </div>
  );
}

export default EmpBirthdayWishes;
