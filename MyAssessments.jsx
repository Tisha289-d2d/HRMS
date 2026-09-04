import { useState, useEffect } from 'react';
import API from '../../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../../components/loaders/Loader';

function MyAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/my-assessments');
      setAssessments(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-header">
        <h1>My Assessments</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View your assessment results</p>
      </div>

      {assessments.length === 0 ? (
        <div className="empty-state">No assessments available for you.</div>
      ) : (
        <div className="hrms-card" style={{ padding: 0 }}>
          <div className="hrms-table-wrap">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Training</th>
                  <th>Total Marks</th>
                  <th>Passing Marks</th>
                  <th>Your Score</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map(a => {
                  const myResult = a.results?.[0];
                  const passed = myResult && myResult.marks_obtained >= a.passing_marks;
                  return (
                    <tr key={a.id}>
                      <td style={{ fontWeight: '600' }}>{a.title}</td>
                      <td>{a.training?.title || 'N/A'}</td>
                      <td>{a.total_marks}</td>
                      <td>{a.passing_marks}</td>
                      <td>
                        {myResult ? (
                          <span style={{ fontWeight: '700', color: passed ? '#22c55e' : '#ef4444' }}>
                            {myResult.marks_obtained} / {a.total_marks}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Not attempted</span>
                        )}
                      </td>
                      <td>
                        {myResult ? (
                          <span className="badge" style={{
                            backgroundColor: passed ? '#22c55e' : '#ef4444',
                            color: '#fff', fontSize: '11px',
                          }}>
                            {passed ? 'Passed' : 'Failed'}
                          </span>
                        ) : (
                          <span className="badge" style={{ backgroundColor: '#6b7280', color: '#fff', fontSize: '11px' }}>
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyAssessments;
