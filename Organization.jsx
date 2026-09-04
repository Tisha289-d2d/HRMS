import React, { useState, useEffect } from 'react';
import API from '../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../components/loaders/Loader';

const Organization = () => {
  const [designations, setDesignations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('designations');

  const [isDesigModalOpen, setIsDesigModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

  const [desigForm, setDesigForm] = useState({ name: '', department_id: '', description: '' });
  const [branchForm, setBranchForm] = useState({ name: '', address: '', city: '', state: '', country: '', is_head_office: false });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [desigRes, branchRes, deptRes] = await Promise.all([
        API.get('/designations'),
        API.get('/branches'),
        API.get('/departments')
      ]);
      setDesignations(desigRes.data.data || desigRes.data);
      setBranches(branchRes.data.data || branchRes.data);
      setDepartments(deptRes.data.data || deptRes.data);
    } catch (err) {
      toast.error('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const handleDesigSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/designations', desigForm);
      toast.success('Designation added');
      setIsDesigModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to add designation');
    }
  };

  const handleBranchSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/branches', branchForm);
      toast.success('Branch added');
      setIsBranchModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to add branch');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Organization Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage designations, branches, and company structure</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-outline" onClick={() => setIsDesigModalOpen(true)}>+ Add Designation</button>
          <button className="btn-primary" onClick={() => setIsBranchModalOpen(true)}>+ Add Branch</button>
        </div>
      </div>

      <div className="hrms-card" style={{ padding: 0, marginBottom: '24px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
          <button 
            onClick={() => setActiveTab('designations')}
            style={{
              flex: 1, padding: '14px', border: 'none', background: activeTab === 'designations' ? '#fff' : 'transparent',
              borderBottom: activeTab === 'designations' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'designations' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'designations' ? '700' : '400', cursor: 'pointer'
            }}
          >
            Designations
          </button>
          <button 
            onClick={() => setActiveTab('branches')}
            style={{
              flex: 1, padding: '14px', border: 'none', background: activeTab === 'branches' ? '#fff' : 'transparent',
              borderBottom: activeTab === 'branches' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'branches' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'branches' ? '700' : '400', cursor: 'pointer'
            }}
          >
            Company Branches
          </button>
        </div>
      </div>

      <div className="hrms-card">
        {activeTab === 'designations' ? (
          <div className="card-body" style={{ padding: 0 }}>
            <div className="hrms-table-wrap">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Designation Title</th>
                    <th>Department</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? <tr><td colSpan="3"><Loader /></td></tr> : designations.map(d => (
                    <tr key={d.id}>
                      <td><strong>{d.name}</strong></td>
                      <td><span className="badge badge-info">{d.department?.name || 'All'}</span></td>
                      <td>{d.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card-body" style={{ padding: 0 }}>
            <div className="grid-2">
              {loading ? <Loader /> : branches.map(b => (
                <div key={b.id} className="hrms-card" style={{ background: b.is_head_office ? '#f8fafc' : '#fff', border: b.is_head_office ? '1px solid var(--primary)' : '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🏢 {b.name}
                    </h3>
                    {b.is_head_office && <span className="badge badge-success">Head Office</span>}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'grid', gap: '8px' }}>
                    <div>📍 {b.address}</div>
                    <div>🌆 {b.city}, {b.state}</div>
                    <div>🌍 {b.country}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isDesigModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Designation</h2>
            </div>
            <div className="modal-body">
              <form onSubmit={handleDesigSubmit}>
                <div className="form-group">
                  <label className="form-label">Designation Name</label>
                  <input type="text" className="form-control" value={desigForm.name} onChange={e => setDesigForm({...desigForm, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Department (Optional)</label>
                  <select className="form-control" value={desigForm.department_id} onChange={e => setDesigForm({...desigForm, department_id: e.target.value})}>
                    <option value="">-- Across All Departments --</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="2" value={desigForm.description} onChange={e => setDesigForm({...desigForm, description: e.target.value})}></textarea>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-ghost" onClick={() => setIsDesigModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Designation</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isBranchModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Branch Location</h2>
            </div>
            <div className="modal-body">
              <form onSubmit={handleBranchSubmit}>
                <div className="form-group">
                  <label className="form-label">Branch Name</label>
                  <input type="text" className="form-control" placeholder="e.g. New York Office" value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input type="text" className="form-control" value={branchForm.address} onChange={e => setBranchForm({...branchForm, address: e.target.value})} required />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input type="text" className="form-control" value={branchForm.city} onChange={e => setBranchForm({...branchForm, city: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State / Province</label>
                    <input type="text" className="form-control" value={branchForm.state} onChange={e => setBranchForm({...branchForm, state: e.target.value})} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input type="text" className="form-control" value={branchForm.country} onChange={e => setBranchForm({...branchForm, country: e.target.value})} required />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="is_head_office" checked={branchForm.is_head_office} onChange={e => setBranchForm({...branchForm, is_head_office: e.target.checked})} />
                  <label htmlFor="is_head_office">This is the Head Office</label>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-ghost" onClick={() => setIsBranchModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Branch</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organization;
