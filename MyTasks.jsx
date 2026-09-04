import { useState, useEffect } from 'react';
import API from '../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../components/loaders/Loader';

const statusColors = {
  'Pending': '#f59e0b',
  'In Progress': '#3b82f6',
  'Completed': '#22c55e',
  'Overdue': '#ef4444',
};

const priorityColors = {
  'Low': '#22c55e',
  'Medium': '#f59e0b',
  'High': '#f97316',
  'Critical': '#ef4444',
};

function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedTask, setSelectedTask] = useState(null);
  const [form, setForm] = useState({ status: '', progress: 0, remarks: '' });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await API.get('/project-tasks', { params: { per_page: 50 } });
      setTasks(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'All') return true;
    return t.status === activeTab;
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    try {
      const payload = { status: form.status, progress: form.progress, remarks: form.remarks };
      await API.put(`/project-tasks/${selectedTask.id}/progress`, payload);
      toast.success('Task updated successfully');
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    }
  };

  const openUpdateModal = (task) => {
    setSelectedTask(task);
    let status = task.status;
    if (task.progress >= 100) status = 'Completed';
    else if (task.progress > 0 && task.status === 'Pending') status = 'In Progress';
    setForm({ status, progress: task.progress || 0, remarks: task.remarks || '' });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Project Tasks</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Update progress and status on your assigned tasks</p>
        </div>
      </div>

      <div className="hrms-card" style={{ padding: 0, marginBottom: '24px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
          {['All', 'Pending', 'In Progress', 'Completed', 'Overdue'].map(tab => (
            <button key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '14px', border: 'none',
                background: activeTab === tab ? '#fff' : 'transparent',
                borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === tab ? '700' : '400', cursor: 'pointer',
              }}
            >
              {tab} ({tab === 'All' ? tasks.length : tasks.filter(t => t.status === tab).length})
            </button>
          ))}
        </div>
      </div>

      {loading ? <Loader /> : (
        <div className="grid-3">
          {filteredTasks.map(task => (
            <div key={task.id} className="hrms-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{task.title}</h3>
                <span className="badge" style={{ backgroundColor: priorityColors[task.priority] || '#6b7280', color: '#fff', fontSize: '11px' }}>
                  {task.priority}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', flex: 1 }}>
                {task.description || 'No description.'}
              </p>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Project: {task.project?.project_name || 'N/A'}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>Progress</span>
                  <span style={{ fontWeight: '700', color: task.progress >= 100 ? 'var(--success)' : 'var(--text-primary)' }}>
                    {task.progress || 0}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${task.progress || 0}%`, height: '100%',
                    background: task.progress >= 100 ? '#22c55e' : 'var(--primary)',
                    transition: 'width 0.3s ease',
                  }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: 'auto' }}>
                <span className="badge" style={{ backgroundColor: statusColors[task.status] || '#6b7280', color: '#fff', fontSize: '11px' }}>
                  {task.status}
                </span>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <button className="btn-primary" onClick={() => openUpdateModal(task)}
                style={{ width: '100%', marginTop: '12px', padding: '8px', fontSize: '13px' }}>
                Update Progress
              </button>
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>No tasks found.</div>
          )}
        </div>
      )}

      {selectedTask && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Update: {selectedTask.title}</h2>
              <button className="modal-close" onClick={() => setSelectedTask(null)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdate}>
                <div className="form-group">
                  <label className="form-label">Progress ({form.progress}%)</label>
                  <input type="range" min="0" max="100" value={form.progress}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      let st = form.status;
                      if (val >= 100) st = 'Completed';
                      else if (val > 0 && form.status === 'Pending') st = 'In Progress';
                      setForm({ ...form, progress: val, status: st });
                    }}
                    style={{ width: '100%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <textarea className="form-control" rows="3" value={form.remarks}
                    onChange={e => setForm({ ...form, remarks: e.target.value })}
                    placeholder="Add notes about your progress..." />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-ghost" onClick={() => setSelectedTask(null)}>Cancel</button>
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

export default MyTasks;
