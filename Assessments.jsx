import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../../components/loaders/Loader';

function Assessments() {
  const [assessments, setAssessments] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [trainingFilter, setTrainingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});

  useEffect(() => {
    fetchAssessments();
    fetchTrainings();
  }, [page, trainingFilter, statusFilter]);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (trainingFilter) params.training_id = trainingFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await API.get('/assessments', { params });
      setAssessments(res.data.data || []);
      setMeta(res.data.meta || {});
    } catch (err) {
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainings = async () => {
    try {
      const res = await API.get('/trainings', { params: { per_page: 100 } });
      setTrainings(res.data.data || []);
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assessment?')) return;
    try {
      await API.delete(`/assessments/${id}`);
      toast.success('Assessment deleted');
      fetchAssessments();
    } catch (err) {
      toast.error('Failed to delete assessment');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAssessments();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Assessments</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create and manage training assessments</p>
        </div>
        <Link to="/admin/training/assessments/create" className="btn-primary">+ Create Assessment</Link>
      </div>

      <div className="hrms-card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h2>All Assessments ({meta.total || 0})</h2>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search assessments..." value={search}
                onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="form-control" style={{ width: 'auto' }} value={trainingFilter}
              onChange={(e) => { setTrainingFilter(e.target.value); setPage(1); }}>
              <option value="">All Trainings</option>
              {trainings.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            <select className="form-control" style={{ width: 'auto' }} value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Closed">Closed</option>
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
                  <th>Training</th>
                  <th>Total Marks</th>
                  <th>Passing Marks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: '600' }}>{a.title}</td>
                    <td>{a.training?.title || 'N/A'}</td>
                    <td>{a.total_marks}</td>
                    <td>{a.passing_marks}</td>
                    <td>
                      <span className="badge" style={{
                        backgroundColor: a.status === 'Published' ? '#22c55e' : a.status === 'Draft' ? '#f59e0b' : '#6b7280',
                        color: '#fff', fontSize: '11px',
                      }}>{a.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <Link to={`/admin/training/assessments/${a.id}`} className="btn-ghost" style={{ fontSize: '12px', padding: '4px 8px' }}>View</Link>
                        <Link to={`/admin/training/assessments/edit/${a.id}`} className="btn-ghost" style={{ fontSize: '12px', padding: '4px 8px' }}>Edit</Link>
                        <button className="btn-ghost" onClick={() => handleDelete(a.id)}
                          style={{ color: 'var(--danger)', fontSize: '12px', padding: '4px 8px' }}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {assessments.length === 0 && <div className="empty-state">No assessments found.</div>}
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

export default Assessments;
