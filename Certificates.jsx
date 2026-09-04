import { useState, useEffect } from 'react';
import API from '../../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../../components/loaders/Loader';

function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [trainingFilter, setTrainingFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState('');
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchCertificates();
    fetchTrainings();
  }, [page, statusFilter, trainingFilter]);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (statusFilter) params.status = statusFilter;
      if (trainingFilter) params.training_id = trainingFilter;
      const res = await API.get('/certificates', { params });
      setCertificates(res.data.data || []);
      setMeta(res.data.meta || {});
    } catch (err) {
      toast.error('Failed to load certificates');
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

  const handleBulkIssue = async () => {
    if (!selectedTraining) {
      toast.error('Please select a training');
      return;
    }
    try {
      // Backend requires employee_ids (Completed assignments only)
      // We fetch all employees first, then backend will filter by Completed status.
      const employeesRes = await API.get('/employees', { params: { per_page: 1000 } });
      const employees = employeesRes.data.data || employeesRes.data || [];
      const employeeIds = employees.map((e) => e.id);

      await API.post('/certificates/bulk-issue', {
        training_id: parseInt(selectedTraining),
        employee_ids: employeeIds,
        issued_date: issuedDate,
      });

      toast.success('Certificates issued to eligible employees');
      setShowBulkModal(false);
      fetchCertificates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue certificates');
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Revoke this certificate?')) return;
    try {
      await API.put(`/certificates/${id}`, { status: 'Revoked' });
      toast.success('Certificate revoked');
      fetchCertificates();
    } catch (err) {
      toast.error('Failed to revoke certificate');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Certificates</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Issue and manage training certificates</p>
        </div>
        <button className="btn-primary" onClick={() => setShowBulkModal(true)}>Bulk Issue Certificates</button>
      </div>

      <div className="hrms-card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h2>All Certificates ({meta.total || 0})</h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
              <option value="Pending">Pending</option>
              <option value="Issued">Issued</option>
              <option value="Revoked">Revoked</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? <Loader /> : (
        <div className="hrms-card" style={{ padding: 0 }}>
          <div className="hrms-table-wrap">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Employee</th>
                  <th>Training</th>
                  <th>Issued Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: '600' }}>{c.title}</td>
                    <td>{c.employee?.user?.name || 'Unknown'}</td>
                    <td>{c.training?.title || 'N/A'}</td>
                    <td>{c.issued_date ? new Date(c.issued_date).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span className="badge" style={{
                        backgroundColor: c.status === 'Issued' ? '#22c55e' : c.status === 'Pending' ? '#f59e0b' : '#ef4444',
                        color: '#fff', fontSize: '11px',
                      }}>{c.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {c.status === 'Issued' && (
                          <button className="btn-ghost" onClick={() => handleRevoke(c.id)}
                            style={{ fontSize: '12px', padding: '4px 8px', color: 'var(--danger)' }}>
                            Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {certificates.length === 0 && <div className="empty-state">No certificates found.</div>}
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

      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Bulk Issue Certificates</h2>
              <button className="modal-close" onClick={() => setShowBulkModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Training *</label>
                <select className="form-control" value={selectedTraining}
                  onChange={e => setSelectedTraining(e.target.value)} required>
                  <option value="">Select Training</option>
                  {trainings.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Issue Date</label>
                <input type="date" className="form-control" value={issuedDate}
                  onChange={e => setIssuedDate(e.target.value)} />
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Certificates will be issued to all employees who completed this training.
              </p>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowBulkModal(false)}>Cancel</button>
                <button type="button" className="btn-primary" onClick={handleBulkIssue}>
                  Issue Certificates
                </button>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Certificates;
