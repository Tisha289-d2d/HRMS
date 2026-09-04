import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../../components/loaders/Loader';

function AssessmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [showAddResult, setShowAddResult] = useState(false);
  const [resultForm, setResultForm] = useState({ employee_id: '', marks_obtained: '', remarks: '' });
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchAssessment();
    fetchEmployees();
    fetchResults();
  }, [id]);

  const fetchAssessment = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/assessments/${id}`);
      setAssessment(res.data.data);
    } catch (err) {
      toast.error('Failed to load assessment');
      navigate('/admin/training/assessments');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await API.get('/employees');
      setEmployees(res.data.data || res.data || []);
    } catch (err) {}
  };

  const fetchResults = async () => {
    try {
      const res = await API.get(`/assessments/${id}/results`);
      setResults(res.data.data || []);
    } catch (err) {}
  };

  const handleAddResult = async (e) => {
    e.preventDefault();
    try {
      await API.post('/assessment-results', {
        assessment_id: parseInt(id),
        employee_id: parseInt(resultForm.employee_id),
        marks_obtained: parseInt(resultForm.marks_obtained),
        remarks: resultForm.remarks,
      });
      toast.success('Result saved');
      setShowAddResult(false);
      setResultForm({ employee_id: '', marks_obtained: '', remarks: '' });
      fetchResults();
      fetchAssessment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save result');
    }
  };

  if (loading) return <Loader />;
  if (!assessment) return <div className="empty-state">Assessment not found.</div>;

  const passedCount = results.filter(r => r.marks_obtained >= assessment.passing_marks).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <Link to="/admin/training/assessments" style={{ fontSize: '14px', color: 'var(--primary)' }}>← Back to Assessments</Link>
          </div>
          <h1 style={{ margin: 0 }}>{assessment.title}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Training: {assessment.training?.title || 'N/A'}</p>
        </div>
        <Link to={`/admin/training/assessments/edit/${assessment.id}`} className="btn-primary">Edit Assessment</Link>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="hrms-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Status</div>
          <span className="badge" style={{
            backgroundColor: assessment.status === 'Published' ? '#22c55e' : assessment.status === 'Draft' ? '#f59e0b' : '#6b7280',
            color: '#fff', fontSize: '14px', padding: '6px 16px',
          }}>{assessment.status}</span>
        </div>
        <div className="hrms-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Marks</div>
          <div style={{ fontSize: '20px', fontWeight: '700' }}>{assessment.total_marks}</div>
        </div>
        <div className="hrms-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Passing Marks</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e' }}>{assessment.passing_marks}</div>
        </div>
      </div>

      {assessment.description && (
        <div className="hrms-card" style={{ marginBottom: '24px' }}>
          <div className="card-header"><h2>Description</h2></div>
          <div className="card-body"><p>{assessment.description}</p></div>
        </div>
      )}

      <div className="hrms-card">
        <div className="card-header">
          <h2>Results ({results.length})</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Passed: <strong style={{ color: '#22c55e' }}>{passedCount}</strong> / Failed: <strong style={{ color: '#ef4444' }}>{results.length - passedCount}</strong>
            </span>
            {assessment.status === 'Published' && (
              <button className="btn-primary" onClick={() => setShowAddResult(true)}>+ Add Result</button>
            )}
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {results.length > 0 ? (
            <div className="hrms-table-wrap">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Marks Obtained</th>
                    <th>Percentage</th>
                    <th>Result</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => {
                    const pct = ((r.marks_obtained / assessment.total_marks) * 100).toFixed(1);
                    const passed = r.marks_obtained >= assessment.passing_marks;
                    return (
                      <tr key={r.id}>
                        <td style={{ fontWeight: '600' }}>{r.employee?.user?.name || 'Unknown'}</td>
                        <td>{r.marks_obtained} / {assessment.total_marks}</td>
                        <td>{pct}%</td>
                        <td>
                          <span className="badge" style={{
                            backgroundColor: passed ? '#22c55e' : '#ef4444',
                            color: '#fff', fontSize: '11px',
                          }}>{passed ? 'Passed' : 'Failed'}</span>
                        </td>
                        <td style={{ fontSize: '13px' }}>{r.remarks || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '32px' }}>No results recorded yet.</div>
          )}
        </div>
      </div>

      {showAddResult && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Add Result</h2>
              <button className="modal-close" onClick={() => setShowAddResult(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddResult}>
                <div className="form-group">
                  <label className="form-label">Employee *</label>
                  <select className="form-control" value={resultForm.employee_id}
                    onChange={e => setResultForm({...resultForm, employee_id: e.target.value})} required>
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.user?.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Marks Obtained * (out of {assessment.total_marks})</label>
                  <input type="number" className="form-control" min="0" max={assessment.total_marks}
                    value={resultForm.marks_obtained}
                    onChange={e => setResultForm({...resultForm, marks_obtained: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <textarea className="form-control" rows="2" value={resultForm.remarks}
                    onChange={e => setResultForm({...resultForm, remarks: e.target.value})} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-ghost" onClick={() => setShowAddResult(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Result</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssessmentDetails;
