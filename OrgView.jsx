import React, { useState, useEffect } from 'react';
import API from '../../api/api';
import Loader from '../../components/loaders/Loader';

const EmployeeOrgView = () => {
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('departments');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, desigRes, branchRes] = await Promise.all([
        API.get('/departments'),
        API.get('/designations'),
        API.get('/branches')
      ]);
      setDepartments(deptRes.data.data || deptRes.data);
      setDesignations(desigRes.data.data || desigRes.data);
      setBranches(branchRes.data.data || branchRes.data);
    } catch (err) {
      console.error('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Organization</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Company structure overview</p>
        </div>
      </div>

      <div className="hrms-card" style={{ padding: 0, marginBottom: '24px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
          {['departments', 'designations', 'branches'].map(tab => (
            <button key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '14px', border: 'none', background: activeTab === tab ? '#fff' : 'transparent',
                borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === tab ? '700' : '400', cursor: 'pointer', textTransform: 'capitalize'
              }}
            >{tab}</button>
          ))}
        </div>
      </div>

      <div className="hrms-card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? <Loader /> : activeTab === 'departments' && (
            <div className="hrms-table-wrap">
              <table className="hrms-table">
                <thead><tr><th>Department</th><th>Description</th></tr></thead>
                <tbody>
                  {departments.map(d => (
                    <tr key={d.id}><td><strong>{d.name}</strong></td><td>{d.description || '-'}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'designations' && (
            <div className="hrms-table-wrap">
              <table className="hrms-table">
                <thead><tr><th>Designation</th><th>Department</th><th>Description</th></tr></thead>
                <tbody>
                  {designations.map(d => (
                    <tr key={d.id}>
                      <td><strong>{d.name}</strong></td>
                      <td><span className="badge badge-info">{d.department?.name || 'All'}</span></td>
                      <td>{d.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'branches' && (
            <div className="grid-2" style={{ padding: '20px' }}>
              {branches.map(b => (
                <div key={b.id} className="hrms-card" style={{ background: b.is_head_office ? '#f8fafc' : '#fff', border: b.is_head_office ? '1px solid var(--primary)' : '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>🏢 {b.name}</h3>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeOrgView;
