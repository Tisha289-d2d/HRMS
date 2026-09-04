import React, { useState, useEffect } from 'react';
import API from '../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../components/loaders/Loader';

const Recruitment = () => {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs');
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  
  const [jobForm, setJobForm] = useState({
    title: '',
    department_id: '',
    location: '',
    type: 'Full-time',
    experience_level: 'Mid',
    description: '',
    requirements: '',
    is_active: true
  });

  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchJobs();
    fetchCandidates();
    fetchDepartments();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/jobs');
      setJobs(res.data.data || res.data);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await API.get('/candidates');
      setCandidates(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments');
      setDepartments(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/jobs', jobForm);
      toast.success('Job posting created');
      setIsJobModalOpen(false);
      fetchJobs();
    } catch (err) {
      toast.error('Failed to create job posting');
    }
  };

  const handleUpdateCandidateStatus = async (id, status) => {
    try {
      await API.put(`/candidates/${id}`, { status });
      toast.success(`Candidate status updated to ${status}`);
      fetchCandidates();
    } catch (err) {
      toast.error('Failed to update candidate status');
    }
  };

  const handleDeleteJob = async (id) => {
    if(!window.confirm('Delete this job posting?')) return;
    try {
      await API.delete(`/jobs/${id}`);
      toast.success('Job deleted');
      fetchJobs();
    } catch (err) {
      toast.error('Failed to delete job');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Applied': return 'badge-info';
      case 'Reviewed': return 'badge-warning';
      case 'Interviewed': return 'badge-purple';
      case 'Offered': return 'badge-success';
      case 'Hired': return 'badge-success';
      case 'Rejected': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Recruitment & Hiring</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage job postings and candidates</p>
        </div>
        <button className="btn-primary" onClick={() => setIsJobModalOpen(true)}>
          + Post Job
        </button>
      </div>

      <div className="hrms-card" style={{ padding: 0, marginBottom: '24px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
          <button 
            onClick={() => setActiveTab('jobs')}
            style={{
              flex: 1, padding: '14px', border: 'none', background: activeTab === 'jobs' ? '#fff' : 'transparent',
              borderBottom: activeTab === 'jobs' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'jobs' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'jobs' ? '700' : '400', cursor: 'pointer'
            }}
          >
            Job Postings
          </button>
          <button 
            onClick={() => setActiveTab('candidates')}
            style={{
              flex: 1, padding: '14px', border: 'none', background: activeTab === 'candidates' ? '#fff' : 'transparent',
              borderBottom: activeTab === 'candidates' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'candidates' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'candidates' ? '700' : '400', cursor: 'pointer'
            }}
          >
            Candidates ({candidates.length})
          </button>
        </div>
      </div>

      <div className="hrms-card">
        {activeTab === 'jobs' ? (
          <div className="card-body" style={{ padding: 0 }}>
            <div className="hrms-table-wrap">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Department</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Posted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? <tr><td colSpan="7"><Loader /></td></tr> : jobs.map(job => (
                    <tr key={job.id}>
                      <td><strong>{job.title}</strong></td>
                      <td>{job.department?.name || '-'}</td>
                      <td><span className="badge badge-info">{job.type}</span></td>
                      <td>{job.location}</td>
                      <td>
                        <span className={`badge ${job.is_active ? 'badge-success' : 'badge-secondary'}`}>
                          {job.is_active ? 'Active' : 'Closed'}
                        </span>
                      </td>
                      <td>{new Date(job.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="btn-ghost" onClick={() => handleDeleteJob(job.id)} style={{ color: 'var(--danger)' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card-body" style={{ padding: 0 }}>
            <div className="hrms-table-wrap">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Candidate Name</th>
                    <th>Applied For</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Resume</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(cand => (
                    <tr key={cand.id}>
                      <td><strong>{cand.first_name} {cand.last_name}</strong></td>
                      <td>{cand.job?.title || 'Unknown Job'}</td>
                      <td>{cand.email}</td>
                      <td>{cand.phone}</td>
                      <td>
                        {cand.resume_path ? (
                          <a href={`http://localhost:8000/storage/${cand.resume_path}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>
                            View Resume
                          </a>
                        ) : 'No Resume'}
                      </td>
                      <td><span className={`badge ${getStatusBadge(cand.status)}`}>{cand.status}</span></td>
                      <td>
                        <select 
                          className="form-control" 
                          style={{ padding: '4px', fontSize: '12px' }}
                          value={cand.status}
                          onChange={(e) => handleUpdateCandidateStatus(cand.id, e.target.value)}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Interviewed">Interviewed</option>
                          <option value="Offered">Offered</option>
                          <option value="Hired">Hired</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isJobModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Post a New Job</h2>
            </div>
            <div className="modal-body">
              <form onSubmit={handleJobSubmit}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input type="text" className="form-control" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-control" value={jobForm.department_id} onChange={e => setJobForm({...jobForm, department_id: e.target.value})}>
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input type="text" className="form-control" value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-control" value={jobForm.type} onChange={e => setJobForm({...jobForm, type: e.target.value})}>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experience</label>
                    <select className="form-control" value={jobForm.experience_level} onChange={e => setJobForm({...jobForm, experience_level: e.target.value})}>
                      <option value="Entry">Entry Level</option>
                      <option value="Mid">Mid Level</option>
                      <option value="Senior">Senior Level</option>
                      <option value="Lead">Lead/Manager</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Job Description</label>
                  <textarea className="form-control" rows="4" value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} required></textarea>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Requirements</label>
                  <textarea className="form-control" rows="4" value={jobForm.requirements} onChange={e => setJobForm({...jobForm, requirements: e.target.value})} required></textarea>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-ghost" onClick={() => setIsJobModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Post Job</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recruitment;