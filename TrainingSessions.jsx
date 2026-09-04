import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../../components/loaders/Loader';

const statusColors = {
  'Scheduled': '#f59e0b',
  'In Progress': '#3b82f6',
  'Completed': '#22c55e',
  'Cancelled': '#ef4444',
};

function TrainingSessions() {
  const [trainings, setTrainings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});

  useEffect(() => {
    fetchTrainings();
    fetchCourses();
  }, [page, statusFilter, modeFilter, courseFilter]);

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (statusFilter) params.status = statusFilter;
      if (modeFilter) params.mode = modeFilter;
      if (courseFilter) params.course_id = courseFilter;
      if (search) params.search = search;
      const res = await API.get('/trainings', { params });
      setTrainings(res.data.data || []);
      setMeta(res.data.meta || {});
    } catch (err) {
      toast.error('Failed to load trainings');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await API.get('/all-training-categories');
      const allCourses = await API.get('/courses', { params: { per_page: 100 } });
      setCourses(allCourses.data.data || []);
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this training?')) return;
    try {
      await API.delete(`/trainings/${id}`);
      toast.success('Training deleted');
      fetchTrainings();
    } catch (err) {
      toast.error('Failed to delete training');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTrainings();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Training Sessions</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Schedule and manage training sessions</p>
        </div>
        <Link to="/admin/training/sessions/create" className="btn-primary">+ Create Training</Link>
      </div>

      <div className="hrms-card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h2>All Sessions ({meta.total || 0})</h2>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search trainings..." value={search}
                onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="form-control" style={{ width: 'auto' }} value={courseFilter}
              onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}>
              <option value="">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <select className="form-control" style={{ width: 'auto' }} value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select className="form-control" style={{ width: 'auto' }} value={modeFilter}
              onChange={(e) => { setModeFilter(e.target.value); setPage(1); }}>
              <option value="">All Modes</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
            <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>Search</button>
          </form>
        </div>
      </div>

      {loading ? <Loader /> : (
        <div className="hrms-card" style={{ padding: 0 }}>
          <div className="hrms-table-wrap">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Course</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Assigned</th>
                  <th>Attended</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trainings.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: '600' }}>{t.title}</td>
                    <td>{t.course?.title || 'N/A'}</td>
                    <td><span className="badge" style={{ backgroundColor: t.mode === 'Online' ? '#8b5cf6' : '#6366f1', color: '#fff', fontSize: '11px' }}>{t.mode}</span></td>
                    <td><span className="badge" style={{ backgroundColor: statusColors[t.status] || '#6b7280', color: '#fff', fontSize: '11px' }}>{t.status}</span></td>
                    <td style={{ fontSize: '13px' }}>{t.start_date ? new Date(t.start_date).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ fontSize: '13px' }}>{t.end_date ? new Date(t.end_date).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ fontWeight: '600' }}>{t.assigned_count || 0}</td>
                    <td style={{ fontWeight: '600', color: '#22c55e' }}>{t.attended_count || 0}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <Link to={`/admin/training/sessions/${t.id}`} className="btn-ghost" style={{ fontSize: '12px', padding: '4px 8px' }}>View</Link>
                        <Link to={`/admin/training/sessions/edit/${t.id}`} className="btn-ghost" style={{ fontSize: '12px', padding: '4px 8px' }}>Edit</Link>
                        <button className="btn-ghost" onClick={() => handleDelete(t.id)}
                          style={{ color: 'var(--danger)', fontSize: '12px', padding: '4px 8px' }}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {trainings.length === 0 && <div className="empty-state">No training sessions found.</div>}
          </div>
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

export default TrainingSessions;
