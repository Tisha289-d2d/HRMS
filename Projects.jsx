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

const priorityColors = {
  'Low': '#22c55e',
  'Medium': '#f59e0b',
  'High': '#f97316',
  'Critical': '#ef4444',
};

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});

  useEffect(() => {
    fetchProjects();
  }, [page, statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await API.get('/projects', { params });
      setProjects(res.data.data || []);
      setMeta(res.data.meta || {});
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? This action cannot be undone.')) return;
    try {
      await API.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Project Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage organization projects and assignments</p>
        </div>
        <Link to="/admin/projects/create" className="btn-primary">+ Create Project</Link>
      </div>

      <div className="hrms-card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h2>All Projects ({meta.total || 0})</h2>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name, code, client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '8px 12px' }}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
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
              {project.client_name && (
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Client: {project.client_name}
                </p>
              )}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>Progress</span>
                  <span>{project.progress_percentage}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${project.progress_percentage}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                <span>📅 {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'} - {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '12px', marginBottom: '12px' }}>
                <span className="badge" style={{ backgroundColor: priorityColors[project.priority] || '#6b7280', color: '#fff', fontSize: '11px' }}>
                  {project.priority}
                </span>
                <span className="badge" style={{ backgroundColor: '#6366f1', color: '#fff', fontSize: '11px' }}>
                  {project.member_count || 0} Members
                </span>
                <span className="badge" style={{ backgroundColor: '#8b5cf6', color: '#fff', fontSize: '11px' }}>
                  {project.total_tasks || 0} Tasks
                </span>
              </div>
              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', gap: '8px' }}>
                <Link to={`/admin/projects/${project.id}`} className="btn-primary" style={{ flex: 1, textAlign: 'center', padding: '8px', fontSize: '13px' }}>
                  View Details
                </Link>
                <Link to={`/admin/projects/edit/${project.id}`} className="btn-ghost" style={{ padding: '8px 12px', fontSize: '13px' }}>
                  Edit
                </Link>
                <button className="btn-ghost" onClick={() => handleDelete(project.id)} style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--danger)' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>No projects found.</div>
          )}
        </div>
      )}

      {meta.last_page > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          <button className="btn-ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span style={{ padding: '8px 16px', color: 'var(--text-secondary)' }}>Page {meta.current_page} of {meta.last_page}</span>
          <button className="btn-ghost" disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

export default Projects;
