import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../../components/loaders/Loader';

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/courses/${id}`);
      setCourse(res.data.data);
    } catch (err) {
      toast.error('Failed to load course');
      navigate('/admin/training/courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!course) return <div className="empty-state">Course not found.</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <Link to="/admin/training/courses" style={{ fontSize: '14px', color: 'var(--primary)' }}>← Back to Courses</Link>
          </div>
          <h1 style={{ margin: 0 }}>{course.title}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{course.category?.name || 'Uncategorized'}</p>
        </div>
        <Link to={`/admin/training/courses/edit/${course.id}`} className="btn-primary">Edit Course</Link>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="hrms-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Status</div>
          <span className="badge" style={{
            backgroundColor: course.status === 'Active' ? '#22c55e' : '#6b7280',
            color: '#fff', fontSize: '14px', padding: '6px 16px',
          }}>{course.status}</span>
        </div>
        <div className="hrms-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Duration</div>
          <div style={{ fontSize: '20px', fontWeight: '700' }}>{course.duration || 'N/A'}</div>
        </div>
        <div className="hrms-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Training Sessions</div>
          <div style={{ fontSize: '20px', fontWeight: '700' }}>{course.trainings?.length || 0}</div>
        </div>
        <div className="hrms-card" style={{ gridColumn: 'span 2' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Description</div>
          <div style={{ fontSize: '14px' }}>{course.description || 'No description provided.'}</div>
        </div>
        <div className="hrms-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Created By</div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>{course.creator?.name || 'System'}</div>
        </div>
      </div>

      {course.material_file && (
        <div className="hrms-card" style={{ marginBottom: '24px' }}>
          <div className="card-header"><h2>Course Material</h2></div>
          <div className="card-body">
            <a href={`http://localhost/project/hrms-backend/public/storage/${course.material_file}`}
              target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-block' }}>
              📎 Download Material
            </a>
          </div>
        </div>
      )}

      {course.trainings?.length > 0 && (
        <div className="hrms-card">
          <div className="card-header"><h2>Training Sessions ({course.trainings.length})</h2></div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="hrms-table-wrap">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Mode</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {course.trainings.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: '600' }}>{t.title}</td>
                      <td><span className="badge" style={{ backgroundColor: t.status === 'Completed' ? '#22c55e' : t.status === 'In Progress' ? '#3b82f6' : t.status === 'Scheduled' ? '#f59e0b' : '#ef4444', color: '#fff', fontSize: '11px' }}>{t.status}</span></td>
                      <td>{t.mode}</td>
                      <td>{t.start_date ? new Date(t.start_date).toLocaleDateString() : 'N/A'}</td>
                      <td>{t.end_date ? new Date(t.end_date).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <Link to={`/admin/training/sessions/${t.id}`} className="btn-ghost" style={{ fontSize: '12px', padding: '4px 8px' }}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetails;
