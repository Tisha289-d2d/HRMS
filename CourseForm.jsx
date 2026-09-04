import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../../components/loaders/Loader';

function CourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [form, setForm] = useState({
    category_id: '',
    title: '',
    description: '',
    duration: '',
    status: 'Active',
  });
  const [material, setMaterial] = useState(null);

  useEffect(() => {
    fetchCategories();
    if (isEdit) fetchCourse();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/all-training-categories');
      setCategories(res.data.data || []);
    } catch (err) {}
  };

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/courses/${id}`);
      const c = res.data.data;
      setForm({
        category_id: c.category_id || '',
        title: c.title,
        description: c.description || '',
        duration: c.duration || '',
        status: c.status,
      });
    } catch (err) {
      toast.error('Failed to load course');
      navigate('/admin/training/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('duration', form.duration);
      fd.append('status', form.status);
      if (form.category_id) fd.append('category_id', form.category_id);
      if (material) fd.append('material_file', material);

      if (isEdit) {
        fd.append('_method', 'PUT');
        await API.post(`/courses/${id}`, fd);
        toast.success('Course updated');
      } else {
        await API.post('/courses', fd);
        toast.success('Course created');
      }
      navigate('/admin/training/courses');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save course');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? 'Edit Course' : 'Create Course'}</h1>
      </div>

      <div className="hrms-card" style={{ maxWidth: '700px' }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input type="text" className="form-control" value={form.title}
                onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={form.category_id}
                onChange={e => setForm({...form, category_id: e.target.value})}>
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="4" value={form.description}
                onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Duration</label>
                <input type="text" className="form-control" placeholder="e.g. 2 hours, 3 days" value={form.duration}
                  onChange={e => setForm({...form, duration: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status}
                  onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Material File (PDF, DOC, Video, etc.)</label>
              <input type="file" className="form-control" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.mp4"
                onChange={e => setMaterial(e.target.files[0])} />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="submit" className="btn-primary">{isEdit ? 'Update Course' : 'Create Course'}</button>
              <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CourseForm;
