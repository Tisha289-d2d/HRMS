import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../components/loaders/Loader';

const statusColors = {
  'Pending': '#f59e0b',
  'Active': '#3b82f6',
  'On Hold': '#f97316',
  'Completed': '#22c55e',
  'Cancelled': '#ef4444',
};

function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = { per_page: 50 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await API.get('/projects', { params });
      setProjects(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Projects</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Projects you are assigned to</p>
        </div>
      </div>

      <div className="hrms-card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h2>Assigned Projects ({projects.length})</h2>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search projects..." value={search}
                onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="form-control" style={{ width: 'auto', padding: '8px 12px' }}
              value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>Search</button>
          </form>
        </div>
      </div>

      {loading ? <Loader /> : (
        <div className="grid-3">
          {projects.map(project => (
            <div key={project.id} className="hrms-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{project.project_code}</span>
                  <h3 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '700' }}>{project.project_name}</h3>
                </div>
                <span className="badge" style={{ backgroundColor: statusColors[project.status] || '#6b7280', color: '#fff' }}>
                  {project.status}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', flex: 1 }}>
                {project.description || 'No description.'}
              </p>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>Progress</span>
                  <span>{project.progress_percentage}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${project.progress_percentage}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <span>{project.member_count || 0} members</span>
                <span>Tasks: {project.completed_tasks || 0}/{project.total_tasks || 0}</span>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>You are not assigned to any projects yet.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default MyProjects;
