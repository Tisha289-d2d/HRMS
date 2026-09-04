import React, { useState, useEffect } from 'react';
import API from '../../api/api';
import { toast } from 'react-toastify';
import Loader from '../../components/loaders/Loader';

const EmployeeDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    document_number: '',
    description: '',
    issue_date: '',
    expiry_date: '',
    file: null
  });

  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/documents/employee');
      setDocuments(res.data.data || res.data);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // HR/Admin routes might be protected, but employee should be able to fetch categories.
      // Wait, is document-categories open to employees? Let's check. 
      // If not, we will use a workaround or update API.
      const res = await API.get('/document-categories');
      setCategories(res.data.data || res.data);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error('Please select a file');
      return;
    }

    const payload = new FormData();
    Object.keys(formData).forEach(key => {
        if(formData[key]) payload.append(key, formData[key]);
    });

    try {
      await API.post('/documents', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document uploaded successfully');
      setIsModalOpen(false);
      resetForm();
      fetchDocuments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    }
  };

  const handleDownload = async (id, filename) => {
    try {
      const res = await API.get(`/documents/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', category_id: '', document_number: '', description: '', issue_date: '', expiry_date: '', file: null });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return 'badge-success';
      case 'Rejected': return 'badge-danger';
      case 'Expired': return 'badge-danger';
      case 'Under Review': return 'badge-info';
      default: return 'badge-warning'; // Pending
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Documents</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Upload and manage your HR documents</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          + Upload Document
        </button>
      </div>

      <div className="hrms-card">
        <div className="card-header">
          <h2>My Documents Repository</h2>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="hrms-table-wrap">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Document Title</th>
                  <th>Category</th>
                  <th>Issue Date</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Verification Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7"><Loader /></td></tr>
                ) : documents.length === 0 ? (
                  <tr><td colSpan="7" className="empty-state">No documents uploaded yet</td></tr>
                ) : (
                  documents.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>📄</span>
                          <div>
                            <strong>{doc.title}</strong>
                            {doc.document_number && <div style={{fontSize:'12px', color:'var(--text-muted)'}}>#{doc.document_number}</div>}
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-info">{doc.category?.name}</span></td>
                      <td>{doc.issue_date ? new Date(doc.issue_date).toLocaleDateString() : '-'}</td>
                      <td>
                        <span style={{ color: doc.status === 'Expired' ? 'var(--danger)' : 'inherit' }}>
                          {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(doc.status)}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.verification_notes || '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn-outline" onClick={() => handleDownload(doc.id, doc.title)} style={{ padding: '4px 8px', fontSize: '12px' }}>
                            ⬇️ Download
                          </button>
                          {doc.status === 'Expired' && (
                            <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ padding: '4px 8px', fontSize: '12px' }}>
                              Replace
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Upload Document</h2>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="grid-2">
                    <div className="form-group">
                    <label className="form-label">Document Title *</label>
                    <input type="text" className="form-control" name="title" value={formData.title} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-control" name="category_id" value={formData.category_id} onChange={handleInputChange} required>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    </div>
                </div>
                
                <div className="grid-2">
                    <div className="form-group">
                    <label className="form-label">Document Number (Optional)</label>
                    <input type="text" className="form-control" name="document_number" value={formData.document_number} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                    <label className="form-label">Select File *</label>
                    <input type="file" className="form-control" onChange={handleFileChange} required />
                    <small className="form-help">Max size: 5MB. PDF, JPG, PNG, DOCX</small>
                    </div>
                </div>

                <div className="grid-2">
                    <div className="form-group">
                    <label className="form-label">Issue Date</label>
                    <input type="date" className="form-control" name="issue_date" value={formData.issue_date} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input type="date" className="form-control" name="expiry_date" value={formData.expiry_date} onChange={handleInputChange} />
                    </div> 
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea className="form-control" name="description" value={formData.description} onChange={handleInputChange} rows="2"></textarea>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-ghost" onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancel</button>
                  <button type="submit" className="btn-primary">Upload Document</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDocuments;
