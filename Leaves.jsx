import { useEffect, useState } from "react";
import API from "../../api/api";
import { toast } from "react-toastify";

function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const res = await API.get("/reports/leaves");
      setLeaves(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Leaves Error:", err);
      setLeaves([]);
      toast.error("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      if (status === "approved") {
        await API.put(`/leaves/${id}/approve`);
        toast.success("Leave request approved");
      } else if (status === "rejected") {
        await API.put(`/leaves/${id}/reject`);
        toast.success("Leave request rejected");
      }
      loadLeaves();
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update leave status");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Leave Management</h1>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon orange">⏳</div>
          <div className="stat-info">
            <h3>{leaves.filter(l => ['pending', 'forwarded'].includes((l.status || '').toLowerCase())).length}</h3>
            <p>Pending Requests</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <h3>{leaves.filter(l => (l.status || '').toLowerCase() === 'approved').length}</h3>
            <p>Approved Requests</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">📁</div>
          <div className="stat-info">
            <h3>{leaves.length}</h3>
            <p>Total History</p>
          </div>
        </div>
      </div>

      <div className="hrms-card">
        <div className="card-header">
          <h2>Leave Requests</h2>
        </div>
        <div className="card-body" style={{ padding: '0' }}>
          <div className="hrms-table-wrap">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center" style={{ padding: '40px' }}>
                      Loading...
                    </td>
                  </tr>
                ) : leaves.length > 0 ? (
                  leaves.map((l) => {
                    const empName = l.employee?.user?.name || l.employee_name || "Unknown Employee";
                    return (
                      <tr key={l.id}>
                        <td>
                          <div className="emp-name" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div className="emp-avatar">{empName.charAt(0)}</div>
                              {empName}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', paddingLeft: '4px' }}>
                              <span>Paid: <strong style={{ color: (l.paid_leaves_this_month >= 2 ? '#d97706' : 'var(--text-primary)') }}>{l.paid_leaves_this_month ?? 0}/2</strong></span>
                              <span style={{ margin: '0 4px' }}>|</span>
                              <span>Sick: <strong style={{ color: (l.sick_leaves_this_month >= 5 ? '#d97706' : 'var(--text-primary)') }}>{l.sick_leaves_this_month ?? 0}/5</strong></span>
                              <span style={{ margin: '0 4px' }}>|</span>
                              <span>Unpaid: <strong>{l.unpaid_leaves_this_month ?? 0}</strong></span>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: '600' }}>
                          {l.leave_type || "N/A"}
                        </td>
                        <td>
                          <div style={{ fontSize: '13px' }}>
                            <strong>From:</strong> {l.start_date}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            <strong>To:</strong> {l.end_date}
                          </div>
                        </td>
                        <td style={{ maxWidth: '250px', wordBreak: 'break-word', fontSize: '13px' }}>
                          {l.reason}
                        </td>
                        <td>
                          <span className={`badge ${
                            (l.status || '').toLowerCase() === 'approved' ? 'badge-success' : 
                            (l.status || '').toLowerCase() === 'pending' ? 'badge-warning' : 
                            (l.status || '').toLowerCase() === 'forwarded' ? 'badge-info' :
                            'badge-danger'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                        <td>
                          {['forwarded', 'pending'].includes((l.status || '').toLowerCase()) ? (
                            <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => updateStatus(l.id, "approved")} 
                                className="btn-success"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  border: 'none',
                                  borderRadius: 'var(--radius)',
                                  cursor: 'pointer',
                                  backgroundColor: '#10b981',
                                  color: 'white',
                                  fontWeight: '600'
                                }}
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => updateStatus(l.id, "rejected")} 
                                className="btn-danger"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  border: 'none',
                                  borderRadius: 'var(--radius)',
                                  cursor: 'pointer',
                                  backgroundColor: '#ef4444',
                                  color: 'white',
                                  fontWeight: '600'
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
                      <h3>No leave requests found</h3>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaves;