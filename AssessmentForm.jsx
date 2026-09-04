import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../../components/loaders/Loader';

function AssessmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [form, setForm] = useState({
    training_id: '',
    title: '',
    description: '',
    total_marks: 100,
    passing_marks: 50,
    status: 'Draft',
  });

  useEffect(() => {
    fetchTrainings();
    if (isEdit) fetchAssessment();
  }, [id]);

  const fetchTrainings = async () => {
    try {
      const res = await API.get('/trainings', { params: { per_page: 100 } });
      setTrainings(res.data.data || []);
    } catch (err) {}
  };

  const fetchAssessment = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/assessments/${id}`);
      const a = res.data.data;
      setForm({
        training_id: a.training_id || '',
        title: a.title,
        description: a.description || '',
        total_marks: a.total_marks,
        passing_marks: a.passing_marks,
        status: a.status,
      });
    } catch (err) {
      toast.error('Failed to load assessment');
      navigate('/admin/training/assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (parseInt(form.passing_marks) > parseInt(form.total_marks)) {
        toast.error('Passing marks cannot exceed total marks');
        return;
      }
      if (isEdit) {
        await API.put(`/assessments/${id}`, form);
        toast.success('Assessment updated');
      } else {
        await API.post('/assessments', form);
        toast.success('Assessment created');
      }
      navigate('/admin/training/assessments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save assessment');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? 'Edit Assessment' : 'Create Assessment'}</h1>
      </div>

      <div className="hrms-card" style={{ maxWidth: '600px' }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Training *</label>
              <select className="form-control" value={form.training_id}
                onChange={e => setForm({...form, training_id: e.target.value})} required>
                <option value="">Select Training</option>
                {trainings.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input type="text" className="form-control" value={form.title}
                onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="3" value={form.description}
                onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Total Marks *</label>
                <input type="number" className="form-control" min="1" value={form.total_marks}
                  onChange={e => setForm({...form, total_marks: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Passing Marks *</label>
                <input type="number" className="form-control" min="1" value={form.passing_marks}
                  onChange={e => setForm({...form, passing_marks: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status}
                onChange={e => setForm({...form, status: e.target.value})}>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="submit" className="btn-primary">{isEdit ? 'Update Assessment' : 'Create Assessment'}</button>
              <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AssessmentForm;
