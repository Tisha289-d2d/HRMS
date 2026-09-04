import { useState, useEffect } from "react";
import API from "../../api/api";
import { toast } from "react-toastify";
import DocumentViewerModal from "./DocumentViewerModal";

function DocumentManagerModal({ employeeId, employeeName, onClose }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewerDoc, setViewerDoc] = useState(null);
  
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, [employeeId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/employees/${employeeId}/documents`);
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      toast.error("Please provide both title and file");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    try {
      setUploading(true);
      await API.post(`/employees/${employeeId}/documents`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Document uploaded successfully");
      setTitle("");
      setFile(null);
      fetchDocuments();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await API.delete(`/documents/${id}`);
      toast.success("Document deleted");
      fetchDocuments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete document");
    }
  };

  const handleView = async (doc) => {
    try {
      const response = await API.get(`/documents/${doc.id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' }));
      const ext = doc.file_path.split('.').pop();
      setViewerDoc({ url, title: `${doc.title}.${ext}` });
    } catch (err) {
      console.error(err);
      toast.error("Error loading document");
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="hrms-card" style={{ width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Documents: {employeeName}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖</button>
        </div>
        
        <div className="card-body">
          <form onSubmit={handleUpload} style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-main)', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Upload New Document</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Document Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ID Proof, Contract"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">File (PDF, Image)</label>
                <input 
                  type="file" 
                  className="form-control" 
                  onChange={(e) => setFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={uploading} style={{ marginTop: '12px' }}>
              {uploading ? "Uploading..." : "Upload Document"}
            </button>
          </form>

          <div>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Uploaded Documents</h3>
            {loading ? (
              <p>Loading...</p>
            ) : documents.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {documents.map(doc => (
                  <li key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <strong>{doc.title}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleView(doc)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', border: 'none', cursor: 'pointer' }}>
                        View Document
                      </button>
                      <button onClick={() => handleDelete(doc.id)} className="badge badge-danger" style={{ border: 'none', cursor: 'pointer', padding: '6px 12px' }}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No documents found for this employee.</p>
            )}
          </div>
        </div>
      </div>
      
      {viewerDoc && (
        <DocumentViewerModal
          docUrl={viewerDoc.url}
          docTitle={viewerDoc.title}
          onClose={() => setViewerDoc(null)}
        />
      )}
    </div>
  );
}

export default DocumentManagerModal;
