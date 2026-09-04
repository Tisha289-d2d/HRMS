import React from 'react';

const OrganizationTree = ({ data }) => {
  const renderTree = (node) => {
    if (!node) return null;

    let nodeColor = 'var(--border)';
    let bgColor = 'var(--bg-main)';
    if (node.type === 'root') { nodeColor = 'var(--primary)'; bgColor = 'rgba(79, 70, 229, 0.1)'; }
    if (node.type === 'branch') { nodeColor = 'var(--success)'; bgColor = 'rgba(16, 185, 129, 0.1)'; }
    if (node.type === 'department') { nodeColor = 'var(--warning)'; bgColor = 'rgba(245, 158, 11, 0.1)'; }
    if (node.type === 'designation') { nodeColor = 'var(--info)'; bgColor = 'rgba(59, 130, 246, 0.1)'; }

    return (
      <div className="org-tree-node" style={{ 
        padding: '12px', margin: '8px 0', border: `1px solid ${nodeColor}`, 
        borderRadius: '8px', background: bgColor, position: 'relative' 
      }}>
        <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{node.name}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{node.type}</div>
        {node.children && node.children.length > 0 && (
          <div style={{ paddingLeft: '24px', marginTop: '12px', borderLeft: `2px solid ${nodeColor}` }}>
            {node.children.map((child, idx) => (
              <div key={idx}>{renderTree(child)}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ overflowX: 'auto', padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      {renderTree(data)}
    </div>
  );
};

export default OrganizationTree;
