import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../../components/loaders/Loader';

function TrainingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [form, setForm] = useState({
    course_id: '',
    trainer_id: '',
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    meeting_link: '',
    mode: 'Offline',
    status: 'Scheduled',
  });

  useEffect(() => {
    fetchCourses();
    fetchTrainers();
    if (isEdit) fetchTraining();
  }, [id]);

  const fetchCourses = async () => {
    try {
      const res = await API.get('/courses', { params: { per_page: 100 } });
      setCourses(res.data.data || []);
    } catch (err) {}
  };

  const fetchTrainers = async () => {
    try {
      const res = await API.get('/trainers');
      setTrainers(res.data.data || []);
    } catch (err) {}
  };

  const fetchTraining = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/trainings/${id}`);
      const t = res.data.data;
      setForm({
        course_id: t.course_id || '',
        trainer_id: t.trainer_id || '',
        title: t.title,
        description: t.description || '',
        start_date: t.start_date || '',
        end_date: t.end_date || '',
        location: t.location || '',
        meeting_link: t.meeting_link || '',
        mode: t.mode,
        status: t.status,
      });
    } catch (err) {
      toast.error('Failed to load training');
      navigate('/admin/training/sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await API.put(`/trainings/${id}`, form);
        toast.success('Training updated');
      } else {
        await API.post('/trainings', form);
        toast.success('Training created');
      }
      navigate('/admin/training/sessions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save training');
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? 'Edit Training' : 'Create Training'}</h1>
      </div>

      <div className="hrms-card" style={{ maxWidth: '700px' }}>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input type="text" className="form-control" value={form.title}
                onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Course</label>
                <select className="form-control" value={form.course_id}
                  onChange={e => setForm({...form, course_id: e.target.value})}>
                  <option value="">Select Course</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Trainer</label>
                <select className="form-control" value={form.trainer_id}
                  onChange={e => setForm({...form, trainer_id: e.target.value})}>
                  <option value="">Select Trainer</option>
                  {trainers.map(tr => (
                    <option key={tr.id} value={tr.id}>{tr.user?.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="3" value={form.description}
                onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input type="date" className="form-control" value={form.start_date}
                  onChange={e => setForm({...form, start_date: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input type="date" className="form-control" value={form.end_date}
                  onChange={e => setForm({...form, end_date: e.target.value})} />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Mode</label>
                <select className="form-control" value={form.mode}
                  onChange={e => setForm({...form, mode: e.target.value})}>
                  <option value="Offline">Offline</option>
                  <option value="Online">Online</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status}
                  onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            {form.mode === 'Offline' ? (
              <div className="form-group">
                <label className="form-label">Location</label>
                <input type="text" className="form-control" placeholder="Room, building address" value={form.location}
                  onChange={e => setForm({...form, location: e.target.value})} />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Meeting Link</label>
                <input type="url" className="form-control" placeholder="https://meet.google.com/..." value={form.meeting_link}
                  onChange={e => setForm({...form, meeting_link: e.target.value})} />
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="submit" className="btn-primary">{isEdit ? 'Update Training' : 'Create Training'}</button>
              <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TrainingForm;
