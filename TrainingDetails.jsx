import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../../components/loaders/Loader';

const statusColors = {
  'Scheduled': '#f59e0b', 'In Progress': '#3b82f6',
  'Completed': '#22c55e', 'Cancelled': '#ef4444',
};

function TrainingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  useEffect(() => {
    fetchTraining();
    fetchEmployees();
  }, [id]);

  const fetchTraining = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/trainings/${id}`);
      setTraining(res.data.data);
    } catch (err) {
      toast.error('Failed to load training');
      navigate('/admin/training/sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await API.get('/employees');
      setEmployees(res.data.data || res.data || []);
    } catch (err) {}
  };

  const handleAssign = async () => {
    if (selectedEmployees.length === 0) return;
    try {
      await API.post('/training-assignments', {
        training_id: parseInt(id),
        employee_ids: selectedEmployees,
      });
      toast.success('Employees assigned');
      setShowAssignModal(false);
      setSelectedEmployees([]);
      fetchTraining();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign');
    }
  };

  const handleAttendanceSave = async () => {
    try {
      await API.post('/training-attendance', {
        training_id: parseInt(id),
        records: attendanceRecords,
      });
      toast.success('Attendance saved');
      setShowAttendanceModal(false);
      fetchTraining();
    } catch (err) {
      toast.error('Failed to save attendance');
    }
  };

  const openAttendanceModal = () => {
    const assigned = training?.assignments || [];
    const existing = training?.attendance || [];
    const records = assigned.map(a => {
      const existingRec = existing.find(e => e.employee_id === a.employee_id);
      return {
        employee_id: a.employee_id,
        employee_name: a.employee?.user?.name || 'Unknown',
        status: existingRec?.status || 'Present',
        remarks: existingRec?.remarks || '',
      };
    });
    setAttendanceRecords(records);
    setShowAttendanceModal(true);
  };

  if (loading) return <Loader />;
  if (!training) return <div className="empty-state">Training not found.</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <Link to="/admin/training/sessions" style={{ fontSize: '14px', color: 'var(--primary)' }}>← Back to Sessions</Link>
          </div>
          <h1 style={{ margin: 0 }}>{training.title}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {training.course?.title && `Course: ${training.course.title} · `}
            {training.mode} · Trainer: {training.trainer?.user?.name || 'Not assigned'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-ghost" onClick={openAttendanceModal}>Mark Attendance</button>
          <button className="btn-primary" onClick={() => setShowAssignModal(true)}>+ Assign Employees</button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="hrms-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Status</div>
          <span className="badge" style={{ backgroundColor: statusColors[training.status] || '#6b7280', color: '#fff', fontSize: '14px', padding: '6px 16px' }}>
            {training.status}
          </span>
        </div>
        <div className="hrms-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Duration</div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>
            {training.start_date ? new Date(training.start_date).toLocaleDateString() : 'N/A'}
            {' — '}
            {training.end_date ? new Date(training.end_date).toLocaleDateString() : 'N/A'}
          </div>
        </div>
        <div className="hrms-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Location / Link</div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>{training.location || training.meeting_link || 'N/A'}</div>
        </div>
        <div className="hrms-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Assigned Employees</div>
          <div style={{ fontSize: '20px', fontWeight: '700' }}>{training.assigned_count || 0}</div>
        </div>
        <div className="hrms-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Present</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e' }}>{training.attended_count || 0}</div>
        </div>
        <div className="hrms-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Trainer</div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>{training.trainer?.user?.name || 'Not assigned'}</div>
        </div>
      </div>

      {training.description && (
        <div className="hrms-card" style={{ marginBottom: '24px' }}>
          <div className="card-header"><h2>Description</h2></div>
          <div className="card-body">
            <p>{training.description}</p>
          </div>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="hrms-card">
          <div className="card-header">
            <h2>Assigned Employees ({training.assignments?.length || 0})</h2>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {training.assignments?.length > 0 ? (
              <div className="hrms-table-wrap">
                <table className="hrms-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Status</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {training.assignments.map(a => (
                      <tr key={a.id}>
                        <td>{a.employee?.user?.name || 'Unknown'}</td>
                        <td>
                          <span className="badge" style={{
                            backgroundColor: a.status === 'Completed' ? '#22c55e' : a.status === 'In Progress' ? '#3b82f6' : a.status === 'Pending' ? '#f59e0b' : '#ef4444',
                            color: '#fff', fontSize: '11px',
                          }}>{a.status}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${a.progress}%`, height: '100%', background: a.progress >= 100 ? '#22c55e' : 'var(--primary)', borderRadius: '3px' }}></div>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '600' }}>{a.progress}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '24px' }}>No employees assigned yet.</div>
            )}
          </div>
        </div>

        <div className="hrms-card">
          <div className="card-header">
            <h2>Attendance ({training.attendance?.length || 0})</h2>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {training.attendance?.length > 0 ? (
              <div className="hrms-table-wrap">
                <table className="hrms-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {training.attendance.map(a => (
                      <tr key={a.id}>
                        <td>{a.employee?.user?.name || 'Unknown'}</td>
                        <td>
                          <span className="badge" style={{
                            backgroundColor: a.status === 'Present' ? '#22c55e' : a.status === 'Late' ? '#f59e0b' : '#ef4444',
                            color: '#fff', fontSize: '11px',
                          }}>{a.status}</span>
                        </td>
                        <td style={{ fontSize: '13px' }}>{a.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '24px' }}>No attendance recorded.</div>
            )}
          </div>
        </div>
      </div>

      {training.assessments?.length > 0 && (
        <div className="hrms-card">
          <div className="card-header">
            <h2>Assessments ({training.assessments.length})</h2>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="hrms-table-wrap">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Total Marks</th>
                    <th>Passing Marks</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {training.assessments.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: '600' }}>{a.title}</td>
                      <td>{a.total_marks}</td>
                      <td>{a.passing_marks}</td>
                      <td>
                        <span className="badge" style={{
                          backgroundColor: a.status === 'Published' ? '#22c55e' : a.status === 'Draft' ? '#f59e0b' : '#6b7280',
                          color: '#fff', fontSize: '11px',
                        }}>{a.status}</span>
                      </td>
                      <td>
                        <Link to={`/admin/training/assessments/${a.id}`} className="btn-ghost" style={{ fontSize: '12px', padding: '4px 8px' }}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Assign Employees</h2>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Select Employees</label>
                <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px' }}>
                  {employees.map(emp => (
                    <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', cursor: 'pointer', borderRadius: '4px', hover: { background: 'var(--bg-secondary)' } }}>
                      <input type="checkbox" checked={selectedEmployees.includes(emp.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmployees([...selectedEmployees, emp.id]);
                          } else {
                            setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id));
                          }
                        }} />
                      <span>{emp.user?.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="button" className="btn-primary" onClick={handleAssign} disabled={selectedEmployees.length === 0}>
                  Assign ({selectedEmployees.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAttendanceModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Mark Attendance</h2>
              <button className="modal-close" onClick={() => setShowAttendanceModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {attendanceRecords.length === 0 ? (
                <div className="empty-state">No employees assigned. Please assign employees first.</div>
              ) : (
                <div className="hrms-table-wrap">
                  <table className="hrms-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Status</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map((rec, i) => (
                        <tr key={i}>
                          <td>{rec.employee_name}</td>
                          <td>
                            <select className="form-control" style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
                              value={rec.status}
                              onChange={e => {
                                const updated = [...attendanceRecords];
                                updated[i].status = e.target.value;
                                setAttendanceRecords(updated);
                              }}>
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                              <option value="Late">Late</option>
                            </select>
                          </td>
                          <td>
                            <input type="text" className="form-control" style={{ padding: '4px 8px', fontSize: '12px' }}
                              value={rec.remarks} placeholder="Optional"
                              onChange={e => {
                                const updated = [...attendanceRecords];
                                updated[i].remarks = e.target.value;
                                setAttendanceRecords(updated);
                              }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowAttendanceModal(false)}>Cancel</button>
                <button type="button" className="btn-primary" onClick={handleAttendanceSave} disabled={attendanceRecords.length === 0}>
                  Save Attendance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrainingDetails;
