import React from "react";

function DocumentViewerModal({ docUrl, docTitle, onClose }) {
  // Determine if it's a PDF or an Image based on the URL or extension
  const isPdf = docUrl && docUrl.toLowerCase().includes(".pdf");
  
  // Actually, since we're using a Blob URL, we can't rely on the URL extension.
  // We'll rely on the docTitle extension.
  const isPdfFile = docTitle && docTitle.toLowerCase().endsWith(".pdf");

  return (
    <div
      className="document-viewer-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="document-viewer-modal-content hrms-card"
        style={{
          width: '100%',
          maxWidth: '800px',
          height: '80vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalFadeIn 0.3s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="card-header"
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-main)'
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📄</span> {docTitle}
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href={docUrl}
              download={docTitle}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '8px', gap: '4px', textDecoration: 'none' }}
            >
              <span>⬇️</span> Download
            </a>
            <button
              onClick={onClose}
              className="btn-ghost"
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                borderRadius: '8px',
                fontWeight: '600',
                color: 'var(--text-secondary)'
              }}
            >
              Close
            </button>
          </div>
        </div>

        <div style={{ flex: 1, backgroundColor: '#f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
          {isPdfFile ? (
            <iframe
              src={docUrl}
              title={docTitle}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
              <img
                src={docUrl}
                alt={docTitle}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentViewerModal;
