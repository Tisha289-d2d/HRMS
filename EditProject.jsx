import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../components/loaders/Loader';

function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    project_code: '',
    project_name: '',
    client_name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'Pending',
    priority: 'Medium',
    budget: '',
    progress_percentage: 0,
    project_manager_id: '',
    member_ids: [],
  });

  useEffect(() => {
    Promise.all([fetchProject(), fetchEmployees()]);
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await API.get(`/projects/${id}`);
      const p = res.data.data;
      setForm({
        project_code: p.project_code || '',
        project_name: p.project_name || '',
        client_name: p.client_name || '',
        description: p.description || '',
        start_date: p.start_date || '',
        end_date: p.end_date || '',
        status: p.status || 'Pending',
        priority: p.priority || 'Medium',
        budget: p.budget || '',
        progress_percentage: p.progress_percentage || 0,
        project_manager_id: p.project_manager_id || '',
        member_ids: (p.members || []).map(m => m.employee_id),
      });
    } catch (err) {
      toast.error('Failed to load project');
      navigate('/admin/projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await API.get('/employees');
      setEmployees(res.data.data || res.data || []);
    } catch (err) {
      toast.error('Failed to load employees');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        budget: form.budget ? parseFloat(form.budget) : null,
        project_manager_id: form.project_manager_id || null,
        member_ids: form.member_ids,
      };
      await API.put(`/projects/${id}`, payload);
      toast.success('Project updated successfully');
      navigate('/admin/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMember = (empId) => {
    setForm(prev => ({
      ...prev,
      member_ids: prev.member_ids.includes(empId)
        ? prev.member_ids.filter(m => m !== empId)
        : [...prev.member_ids, empId],
    }));
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Edit Project</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Update project details</p>
        </div>
      </div>

      <div className="hrms-card" style={{ maxWidth: '900px' }}>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Project Code *</label>
              <input type="text" className="form-control" value={form.project_code}
                onChange={e => setForm({...form, project_code: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input type="text" className="form-control" value={form.project_name}
                onChange={e => setForm({...form, project_name: e.target.value})} required />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Client Name</label>
              <input type="text" className="form-control" value={form.client_name}
                onChange={e => setForm({...form, client_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Budget</label>
              <input type="number" step="0.01" min="0" className="form-control" value={form.budget}
                onChange={e => setForm({...form, budget: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows="3" value={form.description}
              onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input type="date" className="form-control" value={form.start_date}
                onChange={e => setForm({...form, start_date: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input type="date" className="form-control" value={form.end_date}
                onChange={e => setForm({...form, end_date: e.target.value})} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status}
                onChange={e => setForm({...form, status: e.target.value})}>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-control" value={form.priority}
                onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Progress ({form.progress_percentage}%)</label>
            <input type="range" min="0" max="100" value={form.progress_percentage}
              onChange={e => setForm({...form, progress_percentage: parseInt(e.target.value)})}
              style={{ width: '100%' }} />
          </div>

          <div className="form-group">
            <label className="form-label">Project Manager</label>
            <select className="form-control" value={form.project_manager_id}
              onChange={e => setForm({...form, project_manager_id: e.target.value})}>
              <option value="">Select Manager</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.user?.name || `Employee #${emp.id}`}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Team Members</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {employees.map(emp => (
                <label key={emp.id} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
                  border: `1px solid ${form.member_ids.includes(emp.id) ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
                  background: form.member_ids.includes(emp.id) ? 'var(--primary-light, #eff6ff)' : 'transparent',
                }}>
                  <input type="checkbox" checked={form.member_ids.includes(emp.id)}
                    onChange={() => toggleMember(emp.id)} style={{ accentColor: 'var(--primary)' }} />
                  {emp.user?.name || `Employee #${emp.id}`}
                </label>
              ))}
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0', borderTop: '1px solid var(--border)', marginTop: '16px' }}>
            <button type="button" className="btn-ghost" onClick={() => navigate('/admin/projects')}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProject;
