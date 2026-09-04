import React from 'react';

const StatisticsCards = ({ stats }) => {
  return (
    <div className="grid-4" style={{ marginBottom: '24px' }}>
      <div className="hrms-card" style={{ borderLeft: '4px solid var(--primary)' }}>
        <div className="card-body">
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Branches</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats?.total_branches || 0}</div>
        </div>
      </div>
      <div className="hrms-card" style={{ borderLeft: '4px solid var(--success)' }}>
        <div className="card-body">
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Departments</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats?.total_departments || 0}</div>
        </div>
      </div>
      <div className="hrms-card" style={{ borderLeft: '4px solid var(--warning)' }}>
        <div className="card-body">
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Designations</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats?.total_designations || 0}</div>
        </div>
      </div>
      <div className="hrms-card" style={{ borderLeft: '4px solid var(--info)' }}>
        <div className="card-body">
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Employees</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats?.total_employees || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCards;
