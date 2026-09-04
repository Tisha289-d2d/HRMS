import React, { useState, useEffect } from 'react';
import API from '../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../components/loaders/Loader';

const Shifts = () => {
  const [shifts, setShifts] = useState([]);
  const [employeeShifts, setEmployeeShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('shifts'); // shifts or assignments

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [shiftForm, setShiftForm] = useState({
    name: '',
    start_time: '',
    end_time: '',
    is_active: true
  });

  const [assignForm, setAssignForm] = useState({
    employee_id: '',
    shift_id: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchShifts();
    fetchEmployeeShifts();
    fetchEmployees();
  }, []);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/shifts');
      setShifts(res.data.data || res.data);
    } catch (err) {
      toast.error('Failed to load shifts');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeShifts = async () => {
    try {
      const res = await API.get('/employee-shifts');
      setEmployeeShifts(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await API.get('/employees');
      setEmployees(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShiftSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/shifts', shiftForm);
      toast.success('Shift created successfully');
      setIsShiftModalOpen(false);
      fetchShifts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create shift');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/employee-shifts', assignForm);
      toast.success('Shift assigned successfully');
      setIsAssignModalOpen(false);
      fetchEmployeeShifts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign shift');
    }
  };

  const handleDeleteShift = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shift?')) return;
    try {
      await API.delete(`/shifts/${id}`);
      toast.success('Shift deleted');
      fetchShifts();
    } catch (err) {
      toast.error('Failed to delete shift');
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Remove this assignment?')) return;
    try {
      await API.delete(`/employee-shifts/${id}`);
      toast.success('Assignment removed');
      fetchEmployeeShifts();
    } catch (err) {
      toast.error('Failed to remove assignment');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Shift Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage work shifts and employee assignments</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-outline" onClick={() => setIsShiftModalOpen(true)}>
            + New Shift
          </button>
          <button className="btn-primary" onClick={() => setIsAssignModalOpen(true)}>
            + Assign Shift
          </button>
        </div>
      </div>

      <div className="hrms-card" style={{ padding: 0, marginBottom: '24px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
          <button 
            onClick={() => setActiveTab('shifts')}
            style={{
              flex: 1, padding: '14px', border: 'none', background: activeTab === 'shifts' ? '#fff' : 'transparent',
              borderBottom: activeTab === 'shifts' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'shifts' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'shifts' ? '700' : '400', cursor: 'pointer'
            }}
          >
            Manage Shifts
          </button>
          <button 
            onClick={() => setActiveTab('assignments')}
            style={{
              flex: 1, padding: '14px', border: 'none', background: activeTab === 'assignments' ? '#fff' : 'transparent',
              borderBottom: activeTab === 'assignments' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'assignments' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'assignments' ? '700' : '400', cursor: 'pointer'
            }}
          >
            Employee Assignments
          </button>
        </div>
      </div>

      <div className="hrms-card">
        {activeTab === 'shifts' ? (
          <div className="card-body" style={{ padding: 0 }}>
            <div className="hrms-table-wrap">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Shift Name</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? <tr><td colSpan="5"><Loader /></td></tr> : shifts.map(shift => (
                    <tr key={shift.id}>
                      <td><strong>{shift.name}</strong></td>
                      <td><span className="badge badge-info">{shift.start_time}</span></td>
                      <td><span className="badge badge-info">{shift.end_time}</span></td>
                      <td>
                        <span className={`badge ${shift.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {shift.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button className="btn-ghost" onClick={() => handleDeleteShift(shift.id)} style={{ color: 'var(--danger)' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card-body" style={{ padding: 0 }}>
            <div className="hrms-table-wrap">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Shift</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeShifts.map(es => (
                    <tr key={es.id}>
                      <td>
                        <div className="emp-name">
                          <div className="emp-avatar">{(es.employee?.user?.name || 'U').charAt(0)}</div>
                          {es.employee?.user?.name || 'Unknown'}
                        </div>
                      </td>
                      <td><span className="badge badge-purple">{es.shift?.name} ({es.shift?.start_time} - {es.shift?.end_time})</span></td>
                      <td>{es.start_date || '-'}</td>
                      <td>{es.end_date || '-'}</td>
                      <td>
                        <button className="btn-ghost" onClick={() => handleDeleteAssignment(es.id)} style={{ color: 'var(--danger)' }}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isShiftModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Shift</h2>
            </div>
            <div className="modal-body">
              <form onSubmit={handleShiftSubmit}>
                <div className="form-group">
                  <label className="form-label">Shift Name</label>
                  <input type="text" className="form-control" value={shiftForm.name} onChange={e => setShiftForm({...shiftForm, name: e.target.value})} required />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input type="time" className="form-control" value={shiftForm.start_time} onChange={e => setShiftForm({...shiftForm, start_time: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input type="time" className="form-control" value={shiftForm.end_time} onChange={e => setShiftForm({...shiftForm, end_time: e.target.value})} required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-ghost" onClick={() => setIsShiftModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Create Shift</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isAssignModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Assign Shift</h2>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAssignSubmit}>
                <div className="form-group">
                  <label className="form-label">Employee</label>
                  <select className="form-control" value={assignForm.employee_id} onChange={e => setAssignForm({...assignForm, employee_id: e.target.value})} required>
                    <option value="">Select Employee</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.user?.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Shift</label>
                  <select className="form-control" value={assignForm.shift_id} onChange={e => setAssignForm({...assignForm, shift_id: e.target.value})} required>
                    <option value="">Select Shift</option>
                    {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.start_time} - {s.end_time})</option>)}
                  </select>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-control" value={assignForm.start_date} onChange={e => setAssignForm({...assignForm, start_date: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date (Optional)</label>
                    <input type="date" className="form-control" value={assignForm.end_date} onChange={e => setAssignForm({...assignForm, end_date: e.target.value})} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-ghost" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Assign</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shifts;
