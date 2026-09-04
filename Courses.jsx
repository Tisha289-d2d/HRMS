import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../../components/loaders/Loader';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [page, categoryFilter, statusFilter]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (categoryFilter) params.category_id = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await API.get('/courses', { params });
      setCourses(res.data.data || []);
      setMeta(res.data.meta || {});
    } catch (err) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get('/all-training-categories');
      setCategories(res.data.data || []);
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await API.delete(`/courses/${id}`);
      toast.success('Course deleted');
      fetchCourses();
    } catch (err) {
      toast.error('Failed to delete course');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCourses();
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await API.post('/training-categories', catForm);
      toast.success('Category created');
      setShowCategoryModal(false);
      setCatForm({ name: '', description: '' });
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Course Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage training courses and materials</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-ghost" onClick={() => setShowCategoryModal(true)}>+ Category</button>
          <Link to="/admin/training/courses/create" className="btn-primary">+ Create Course</Link>
        </div>
      </div>

      <div className="hrms-card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h2>All Courses ({meta.total || 0})</h2>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search courses..." value={search}
                onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="form-control" style={{ width: 'auto' }} value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select className="form-control" style={{ width: 'auto' }} value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>Search</button>
          </form>
        </div>
      </div>

      {loading ? <Loader /> : (
        <div className="grid-3">
          {courses.map(course => (
            <div key={course.id} className="hrms-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{course.category?.name || 'Uncategorized'}</span>
                  <h3 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: '700' }}>{course.title}</h3>
                </div>
                <span className="badge" style={{
                  backgroundColor: course.status === 'Active' ? '#22c55e' : '#6b7280',
                  color: '#fff',
                }}>{course.status}</span>
              </div>
              {course.description && (
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {course.description}
                </p>
              )}
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                <span>⏱ {course.duration || 'N/A'}</span>
                <span>🎓 {course.trainings_count || 0} sessions</span>
              </div>
              {course.material_file && (
                <div style={{ marginBottom: '12px' }}>
                  <a href={`http://localhost/project/hrms-backend/public/storage/${course.material_file}`}
                    target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ fontSize: '12px', padding: '4px 10px' }}>
                    📎 View Material
                  </a>
                </div>
              )}
              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', gap: '8px' }}>
                <Link to={`/admin/training/courses/${course.id}`} className="btn-primary" style={{ flex: 1, textAlign: 'center', padding: '8px', fontSize: '13px' }}>
                  View Details
                </Link>
                <Link to={`/admin/training/courses/edit/${course.id}`} className="btn-ghost" style={{ padding: '8px 12px', fontSize: '13px' }}>
                  Edit
                </Link>
                <button className="btn-ghost" onClick={() => handleDelete(course.id)}
                  style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--danger)' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>No courses found.</div>
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

      {showCategoryModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Create Category</h2>
              <button className="modal-close" onClick={() => setShowCategoryModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateCategory}>
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input type="text" className="form-control" value={catForm.name}
                    onChange={e => setCatForm({...catForm, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="3" value={catForm.description}
                    onChange={e => setCatForm({...catForm, description: e.target.value})} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-ghost" onClick={() => setShowCategoryModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;
