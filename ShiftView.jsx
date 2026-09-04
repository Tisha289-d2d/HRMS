import React, { useState, useEffect } from 'react';
import API from '../../api/api';
import Loader from '../../components/loaders/Loader';

const EmployeeShiftView = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/employee-shifts');
      setShifts(res.data.data || res.data);
    } catch (err) {
      console.error('Failed to load shifts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Shifts</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View your assigned work shifts</p>
        </div>
      </div>

      <div className="hrms-card">
        <div className="card-header"><h2>Assigned Shifts</h2></div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? <Loader /> : shifts.length === 0 ? (
            <div className="empty-state">No shifts assigned yet</div>
          ) : (
            <div className="hrms-table-wrap">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Shift Name</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.shift?.name || 'N/A'}</strong></td>
                      <td>{s.shift?.start_time || '-'}</td>
                      <td>{s.shift?.end_time || '-'}</td>
                      <td>{s.start_date ? new Date(s.start_date).toLocaleDateString() : '-'}</td>
                      <td>{s.end_date ? new Date(s.end_date).toLocaleDateString() : 'Ongoing'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeShiftView;
