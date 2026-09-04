import { useState, useEffect } from 'react';
import API from '../../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../../components/loaders/Loader';

function EmpBirthdayList() {
  const [view, setView] = useState('today');
  const [birthdays, setBirthdays] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishModal, setWishModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [wishMsg, setWishMsg] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = view === 'today' ? '/birthdays/today' : '/birthdays/upcoming';
      const params = view === 'upcoming' ? { days: 30 } : {};
      const res = await API.get(endpoint, { params });
      setBirthdays(res.data.data || []);

      const wishesRes = await API.get('/birthday-wishes/received');
      setWishes(wishesRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const sendWish = async (e) => {
    e.preventDefault();
    if (!wishMsg.trim() || wishMsg.length < 3) {
      toast.error('Wish must be at least 3 characters');
      return;
    }
    setSending(true);
    try {
      await API.post('/birthday-wishes', {
        employee_id: selectedEmployee.id,
        message: wishMsg,
      });
      toast.success('Wish sent! 🎉');
      setWishModal(false);
      setWishMsg('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send wish');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Team Birthdays</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Celebrate with your teammates</p>
        </div>
      </div>

      <div className="hrms-card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div style={{ display: 'flex', gap: '8px' }}>
            {['today', 'upcoming'].map(v => (
              <button key={v} className={view === v ? 'btn-primary' : 'btn-ghost'}
                onClick={() => setView(v)}
                style={{ padding: '6px 16px', fontSize: '13px', textTransform: 'capitalize' }}>
                {v === 'today' ? "Today's Birthdays" : 'Upcoming'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? <Loader /> : (
        <>
          <div className="grid-2" style={{ marginBottom: '24px' }}>
            {birthdays.length > 0 ? birthdays.map(b => (
              <div key={b.id} className="hrms-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div className="emp-avatar" style={{ width: 48, height: 48, fontSize: 20 }}>
                    {b.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{b.name}</h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.designation}</span>
                  </div>
                </div>
                {b.department && (
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    🏢 {b.department}
                  </div>
                )}
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {b.dob && `🎂 ${new Date(b.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
                  {b.days_until !== undefined && ` · In ${b.days_until === 0 ? 'Today!' : `${b.days_until} days`}`}
                </div>
                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <button className="btn-primary" style={{ width: '100%', fontSize: '13px' }}
                    onClick={() => { setSelectedEmployee(b); setWishMsg(''); setWishModal(true); }}>
                    🎉 Send Wishes
                  </button>
                </div>
              </div>
            )) : (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                {view === 'today' ? 'No birthdays today' : 'No upcoming birthdays'}
              </div>
            )}
          </div>

          {wishes.length > 0 && (
            <div className="hrms-card">
              <div className="card-header">
                <h2>💌 Wishes Received</h2>
              </div>
              <div className="card-body" style={{ padding: '0' }}>
                <div className="hrms-table-wrap">
                  <table className="hrms-table">
                    <thead>
                      <tr>
                        <th>From</th>
                        <th>Message</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wishes.map(w => (
                        <tr key={w.id}>
                          <td>
                            <div className="emp-name">
                              <div className="emp-avatar">{w.wished_by?.name?.charAt(0)}</div>
                              {w.wished_by?.name}
                            </div>
                          </td>
                          <td style={{ maxWidth: '300px', whiteSpace: 'pre-wrap' }}>{w.message}</td>
                          <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {new Date(w.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {wishModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Send Birthday Wishes 🎂</h2>
              <button className="modal-close" onClick={() => setWishModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                Send wishes to <strong>{selectedEmployee?.name}</strong>
              </p>
              <form onSubmit={sendWish}>
                <div className="form-group">
                  <label className="form-label">Your Message</label>
                  <textarea className="form-control" rows="4" value={wishMsg}
                    onChange={e => setWishMsg(e.target.value)}
                    placeholder="Write your birthday wishes..."
                    minLength={3} maxLength={500} required />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {wishMsg.length}/500 characters
                  </span>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-ghost" onClick={() => setWishModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={sending}>
                    {sending ? 'Sending...' : 'Send Wish 🎉'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmpBirthdayList;
