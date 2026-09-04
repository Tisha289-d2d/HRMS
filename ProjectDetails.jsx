import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../components/loaders/Loader';

const statusColors = {
  'Pending': '#f59e0b', 'Active': '#3b82f6', 'On Hold': '#f97316',
  'Completed': '#22c55e', 'Cancelled': '#ef4444',
};

const taskStatusColors = {
  'Pending': '#f59e0b', 'In Progress': '#3b82f6',
  'Completed': '#22c55e', 'Overdue': '#ef4444',
};

const priorityColors = {
  'Low': '#22c55e', 'Medium': '#f59e0b',
  'High': '#f97316', 'Critical': '#ef4444',
};

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    employee_id: '', title: '', description: '', due_date: '', priority: 'Medium',
  });
  const [editForm, setEditForm] = useState({ status: '', progress: 0, remarks: '' });

  useEffect(() => {
    fetchProject();
    fetchEmployees();
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/projects/${id}`);
      setProject(res.data.data);
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
    } catch (err) { console.error(err); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await API.post('/project-tasks', { ...taskForm, project_id: parseInt(id) });
      toast.success('Task created');
      setShowTaskModal(false);
      setTaskForm({ employee_id: '', title: '', description: '', due_date: '', priority: 'Medium' });
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editTask) return;
    try {
      await API.put(`/project-tasks/${editTask.id}`, editForm);
      toast.success('Task updated');
      setEditTask(null);
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/project-tasks/${taskId}`);
      toast.success('Task deleted');
      fetchProject();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const openEditModal = (task) => {
    setEditTask(task);
    setEditForm({
      status: task.status,
      progress: task.progress || 0,
      remarks: task.remarks || '',
    });
  };

  if (loading) return <Loader />;
  if (!project) return <div className="empty-state">Project not found.</div>;

  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter(t => t.status === 'Completed').length || 0;
  const inProgressTasks = project.tasks?.filter(t => t.status === 'In Progress').length || 0;
  const pendingTasks = project.tasks?.filter(t => t.status === 'Pending').length || 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <Link to="/admin/projects" style={{ fontSize: '14px', color: 'var(--primary)' }}>← Back to Projects</Link>
          </div>
          <h1 style={{ margin: 0 }}>{project.project_name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            <span style={{ fontFamily: 'monospace' }}>{project.project_code}</span>
            {project.client_name && ` · Client: ${project.client_name}`}
          </p>
        </div>
        <Link to={`/admin/projects/edit/${project.id}`} className="btn-primary">Edit Project</Link>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="hrms-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Status</div>
          <span className="badge" style={{ backgroundColor: statusColors[project.status] || '#6b7280', color: '#fff', fontSize: '14px', padding: '6px 16px' }}>
            {project.status}
          </span>
        </div>
        <div className="hrms-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Priority</div>
          <span className="badge" style={{ backgroundColor: priorityColors[project.priority] || '#6b7280', color: '#fff', fontSize: '14px', padding: '6px 16px' }}>
            {project.priority}
          </span>
        </div>
        <div className="hrms-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Budget</div>
          <div style={{ fontSize: '20px', fontWeight: '700' }}>
            {project.budget ? `$${parseFloat(project.budget).toLocaleString()}` : 'N/A'}
          </div>
        </div>
        <div className="hrms-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Timeline</div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>
            {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}
            {' — '}
            {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}
          </div>
        </div>
        <div className="hrms-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Manager</div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>
            {project.manager?.user?.name || 'Not assigned'}
          </div>
        </div>
        <div className="hrms-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Tasks</div>
          <div style={{ fontSize: '20px', fontWeight: '700', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ color: '#22c55e' }}>{completedTasks}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>/</span>
            <span style={{ color: '#3b82f6' }}>{inProgressTasks}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>/</span>
            <span style={{ color: '#f59e0b' }}>{pendingTasks}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>of {totalTasks}</span>
          </div>
        </div>
      </div>

      <div className="hrms-card" style={{ marginBottom: '24px' }}>
        <h2>Overall Progress</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span>Project Completion</span>
              <span style={{ fontWeight: '700', fontSize: '18px', color: 'var(--primary)' }}>{project.progress_percentage}%</span>
            </div>
            <div style={{ width: '100%', height: '14px', background: 'var(--border)', borderRadius: '7px', overflow: 'hidden' }}>
              <div style={{
                width: `${project.progress_percentage}%`, height: '100%',
                background: 'linear-gradient(90deg, var(--primary), #6366f1)',
                borderRadius: '7px', transition: 'width 0.5s ease',
              }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="hrms-card">
          <div className="card-header">
            <h2>Team Members ({project.members?.length || 0})</h2>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {project.members?.length > 0 ? (
              <div style={{ padding: '16px' }}>
                {project.members.map(member => (
                  <div key={member.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '8px 0', borderBottom: '1px solid var(--border)',
                  }}>
                    <div className="emp-avatar" style={{ width: '36px', height: '36px', fontSize: '14px' }}>
                      {(member.employee?.user?.name || 'U').charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{member.employee?.user?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {member.role || 'Team Member'} · Assigned {member.assigned_date ? new Date(member.assigned_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '24px' }}>No members assigned.</div>
            )}
          </div>
        </div>

        <div className="hrms-card">
          <div className="card-header">
            <h2>Task Summary</h2>
          </div>
          <div className="card-body" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>✅ Completed</span>
                <span style={{ fontWeight: '700', color: '#22c55e' }}>{completedTasks}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🔄 In Progress</span>
                <span style={{ fontWeight: '700', color: '#3b82f6' }}>{inProgressTasks}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>⏳ Pending</span>
                <span style={{ fontWeight: '700', color: '#f59e0b' }}>{pendingTasks}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600' }}>Total</span>
                <span style={{ fontWeight: '700' }}>{totalTasks}</span>
              </div>
              {project.tasks?.filter(t => t.status === 'Overdue').length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>⚠️ Overdue</span>
                  <span style={{ fontWeight: '700', color: '#ef4444' }}>{project.tasks.filter(t => t.status === 'Overdue').length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="hrms-card">
        <div className="card-header">
          <h2>Tasks ({totalTasks})</h2>
          <button className="btn-primary" onClick={() => setShowTaskModal(true)}>+ Add Task</button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {project.tasks?.length > 0 ? (
            <div className="hrms-table-wrap">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {project.tasks.map(task => (
                    <tr key={task.id}>
                      <td style={{ fontWeight: '600' }}>{task.title}</td>
                      <td>{task.employee?.user?.name || 'Unassigned'}</td>
                      <td>
                        <span className="badge" style={{ backgroundColor: priorityColors[task.priority] || '#6b7280', color: '#fff', fontSize: '11px' }}>
                          {task.priority}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px' }}>
                          <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${task.progress || 0}%`, height: '100%',
                              background: task.progress >= 100 ? '#22c55e' : 'var(--primary)',
                              borderRadius: '3px', transition: 'width 0.3s',
                            }}></div>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>{task.progress || 0}%</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ backgroundColor: taskStatusColors[task.status] || '#6b7280', color: '#fff', fontSize: '11px' }}>
                          {task.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn-ghost" onClick={() => openEditModal(task)}
                            style={{ fontSize: '12px', padding: '4px 8px' }}>
                            Edit
                          </button>
                          <button className="btn-ghost" onClick={() => handleDeleteTask(task.id)}
                            style={{ color: 'var(--danger)', fontSize: '12px', padding: '4px 8px' }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '32px' }}>No tasks yet. Create the first task!</div>
          )}
        </div>
      </div>

      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create Task</h2>
              <button className="modal-close" onClick={() => setShowTaskModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateTask}>
                <div className="form-group">
                  <label className="form-label">Task Title *</label>
                  <input type="text" className="form-control" value={taskForm.title}
                    onChange={e => setTaskForm({...taskForm, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="3" value={taskForm.description}
                    onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Assign To *</label>
                    <select className="form-control" value={taskForm.employee_id}
                      onChange={e => setTaskForm({...taskForm, employee_id: e.target.value})} required>
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.user?.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input type="date" className="form-control" value={taskForm.due_date}
                      onChange={e => setTaskForm({...taskForm, due_date: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-control" value={taskForm.priority}
                    onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-ghost" onClick={() => setShowTaskModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Create Task</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {editTask && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Task: {editTask.title}</h2>
              <button className="modal-close" onClick={() => setEditTask(null)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdateTask}>
                <div className="form-group">
                  <label className="form-label">Progress ({editForm.progress}%)</label>
                  <input type="range" min="0" max="100" value={editForm.progress}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      let st = editForm.status;
                      if (val >= 100) st = 'Completed';
                      else if (val > 0 && editForm.status === 'Pending') st = 'In Progress';
                      setEditForm({ ...editForm, progress: val, status: st });
                    }}
                    style={{ width: '100%' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <textarea className="form-control" rows="3" value={editForm.remarks}
                    onChange={e => setEditForm({ ...editForm, remarks: e.target.value })} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-ghost" onClick={() => setEditTask(null)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetails;
