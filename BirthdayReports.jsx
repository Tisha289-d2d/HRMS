import { useState, useEffect } from 'react';
import API from '../../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../../components/loaders/Loader';

function BirthdayReports() {
  const [reportType, setReportType] = useState('monthly');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (reportType === 'monthly') endpoint = '/birthdays/reports/monthly';
      else if (reportType === 'department') endpoint = '/birthdays/reports/department';
      else if (reportType === 'upcoming') endpoint = '/birthdays/reports/upcoming';

      const res = await API.get(endpoint);
      setData(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const renderMonthly = () => (
    <div className="hrms-table-wrap">
      <table className="hrms-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Birthdays</th>
            <th>Distribution</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((item, i) => {
            const maxCount = Math.max(...data.map(d => d.count), 1);
            return (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{item.month}</td>
                <td>{item.count}</td>
                <td style={{ width: '60%' }}>
                  <div style={{ width: '100%', height: '10px', background: 'var(--bg-main)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(item.count / maxCount) * 100}%`,
                      height: '100%',
                      background: item.count > 0 ? 'var(--primary)' : 'transparent',
                      borderRadius: '10px',
                      transition: 'width 0.3s',
                    }}></div>
                  </div>
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan="3" className="empty-state">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderDepartment = () => (
    <div className="hrms-table-wrap">
      <table className="hrms-table">
        <thead>
          <tr>
            <th>Department</th>
            <th>Birthdays</th>
            <th>Distribution</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((item, i) => {
            const maxCount = Math.max(...data.map(d => d.count), 1);
            return (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{item.department}</td>
                <td>{item.count}</td>
                <td style={{ width: '60%' }}>
                  <div style={{ width: '100%', height: '10px', background: 'var(--bg-main)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(item.count / maxCount) * 100}%`,
                      height: '100%',
                      background: 'var(--secondary)',
                      borderRadius: '10px',
                      transition: 'width 0.3s',
                    }}></div>
                  </div>
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan="3" className="empty-state">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderUpcoming = () => (
    <div className="hrms-table-wrap">
      <table className="hrms-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Birth Date</th>
            <th>Days Until</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((item, i) => (
            <tr key={i}>
              <td>
                <div className="emp-name">
                  <div className="emp-avatar">{item.name?.charAt(0)}</div>
                  {item.name}
                </div>
              </td>
              <td>{item.department || 'N/A'}</td>
              <td>{item.dob ? new Date(item.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'N/A'}</td>
              <td>
                <span className="badge badge-info">
                  {item.days_until === 0 ? 'Today!' : `${item.days_until} days`}
                </span>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="4" className="empty-state">No upcoming birthdays</td>
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
          <h1>Birthday Reports</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Analytics and reports</p>
        </div>
      </div>

      <div className="hrms-card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { key: 'monthly', label: 'Monthly' },
              { key: 'department', label: 'By Department' },
              { key: 'upcoming', label: 'Upcoming (30 days)' },
            ].map(r => (
              <button key={r.key} className={reportType === r.key ? 'btn-primary' : 'btn-ghost'}
                onClick={() => setReportType(r.key)}
                style={{ padding: '6px 16px', fontSize: '13px' }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body" style={{ padding: '0' }}>
          {loading ? <Loader /> : (
            reportType === 'monthly' ? renderMonthly() :
            reportType === 'department' ? renderDepartment() : renderUpcoming()
          )}
        </div>
      </div>
    </div>
  );
}

export default BirthdayReports;
