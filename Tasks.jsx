import React, { useState, useEffect } from 'react';
import API from '../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../components/loaders/Loader';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Pending');
  const [selectedTask, setSelectedTask] = useState(null);
  const [progressData, setProgressData] = useState({ progress: 0, status: 'Pending', remarks: '', attachment: null });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await API.get('/tasks/employee');
      setTasks(res.data.data || res.data);
    } catch (err) {
      toast.error('Failed to load your tasks');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'Overdue') return t.status === 'Overdue';
    if (activeTab === 'Completed') return t.status === 'Completed';
    return t.status !== 'Completed' && t.status !== 'Overdue';
  });

  const getPriorityColor = (p) => {
    if (p === 'Urgent') return '#dc2626'; // red
    if (p === 'High') return '#ea580c'; // orange
    if (p === 'Medium') return '#ca8a04'; // yellow
    return '#16a34a'; // green
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    
    const formData = new FormData();
    formData.append('_method', 'PUT'); // Laravel required for PUT with files
    formData.append('progress', progressData.progress);
    formData.append('status', progressData.progress == 100 ? 'Completed' : progressData.status);
    formData.append('remarks', progressData.remarks);
    if (progressData.attachment) {
      formData.append('attachment', progressData.attachment);
    }

    try {
      await API.post(`/tasks/${selectedTask.id}/progress`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Task progress updated successfully');
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update progress');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Tasks</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View and update your assigned tasks</p>
        </div>
      </div>

      <div className="hrms-card" style={{ padding: 0, marginBottom: '24px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
          {['Active', 'Completed', 'Overdue'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '14px', border: 'none', background: activeTab === tab ? '#fff' : 'transparent',
                borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === tab ? '700' : '400', cursor: 'pointer'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-3">
        {loading ? <Loader /> : filteredTasks.map(task => (
          <div key={task.id} className="hrms-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{task.title}</h3>
              <span className="badge" style={{ backgroundColor: getPriorityColor(task.priority), color: '#fff' }}>
                {task.priority}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', flex: 1 }}>
              {task.description || 'No description.'}
            </p>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span>Progress</span>
                <span>{task.progress}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${task.progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: 'auto' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: task.status === 'Overdue' ? 'var(--danger)' : 'var(--text-primary)' }}>
                {task.status}
              </span>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <button 
              className="btn-primary" 
              onClick={() => {
                setSelectedTask(task);
                setProgressData({ progress: task.progress, status: task.status, remarks: task.remarks || '', attachment: null });
              }} 
              style={{ width: '100%', marginTop: '12px', padding: '8px' }}
            >
              Update Progress
            </button>
          </div>
        ))}
        {filteredTasks.length === 0 && !loading && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>No tasks found.</div>
        )}
      </div>

      {selectedTask && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Update Progress: {selectedTask.title}</h2>
              <button className="modal-close" onClick={() => setSelectedTask(null)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdateProgress}>
                <div className="form-group">
                  <label className="form-label">Progress ({progressData.progress}%)</label>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={progressData.progress} 
                    onChange={e => setProgressData({...progressData, progress: e.target.value})} 
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select 
                    className="form-control" 
                    value={progressData.status} 
                    onChange={e => setProgressData({...progressData, status: e.target.value})}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    value={progressData.remarks} 
                    onChange={e => setProgressData({...progressData, remarks: e.target.value})}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label">Attachment (Optional)</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    onChange={e => setProgressData({...progressData, attachment: e.target.files[0]})} 
                  />
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
};

export default Tasks;
