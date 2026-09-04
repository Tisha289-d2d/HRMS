import React, { useEffect, useState } from "react";
import API from "../../api/api";
import TodayBirthdaysCard from "../../components/Birthday/TodayBirthdaysCard";
import UpcomingBirthdaysCard from "../../components/Birthday/UpcomingBirthdaysCard";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({});
  const [report, setReport] = useState({});
  const [taskStats, setTaskStats] = useState({});
  const [docStats, setDocStats] = useState({});
  const [recentTasks, setRecentTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const fetchDashboard = async () => {
    try {
      const response = await API.get("/dashboard");
      setDashboard(response.data);
      
      const reportRes = await API.get("/reports/dashboard-summary");
      setReport(reportRes.data);
      
      try {
        const taskStatsRes = await API.get("/tasks/dashboard-stats");
        setTaskStats(taskStatsRes.data);
        
        const docStatsRes = await API.get("/documents/dashboard-stats");
        setDocStats(docStatsRes.data);
        
        const tasksRes = await API.get("/tasks");
        setRecentTasks((tasksRes.data.data || tasksRes.data || []).slice(0, 4));
      } catch(err) { console.log(err); }
    } catch (error) {
      console.log("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }  
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const testEndpoints = async () => {
    setTesting(true);
    const endpoints = [
      "/payrolls", "/payroll", "/reports/payrolls", "/reports/payroll", "/payroll-records",
      "/performances", "/performance", "/reports/performances", "/reports/performance", "/reviews", "/review", "/performance-reviews",
      "/recruitments", "/recruitment", "/reports/recruitments", "/reports/recruitment", "/jobs", "/job", "/job-posts", "/vacancies"
    ];
    
    const results = [];
    for (const endpoint of endpoints) {
      try {
        await API.get(endpoint);
        results.push({ endpoint, status: "✅ Working" });
      } catch (err) {
        results.push({ endpoint, status: `❌ ${err.response?.status || "Error"}` });
      }
    }
    setTestResults(results);
    setTesting(false);
  };    

  const attendanceData =
    dashboard?.recent_attendance?.filter((item) =>
      item?.employee?.user?.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
    ) || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
        </div>
        <div>
          <button className="btn-ghost" onClick={testEndpoints} disabled={testing} style={{ height: 36 }}>
            {testing ? 'Testing...' : 'Run Diagnostics'}
          </button>
        </div>
      </div>

      {testResults.length > 0 && (
        <div className="hrms-card mb-6" style={{ background: '#f8fafc', border: '1px solid var(--primary-light)' }}>
            <div className="card-header">
                <h2>Diagnostic Results</h2>
                <button className="btn-ghost" onClick={() => setTestResults([])}>Close</button>
            </div>
            <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                {testResults.map((res, i) => (
                    <div key={i} style={{ padding: '8px', background: '#fff', borderRadius: '4px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                        <code style={{ color: 'var(--primary)' }}>{res.endpoint}</code>
                        <span style={{ fontWeight: '600' }}>{res.status}</span>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">👥</div>
          <div className="stat-info">
            <h3>{dashboard.total_employees || 0}</h3>
            <p>Total Employees</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon yellow">📋</div>
          <div className="stat-info">
            <h3>{taskStats.pending || 0}</h3>
            <p>Pending Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">⏰</div>
          <div className="stat-info">
            <h3>{taskStats.overdue || 0}</h3>
            <p>Overdue Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">📄</div>
          <div className="stat-info">
            <h3>{docStats.pending_verification || 0}</h3>
            <p>Pending Docs</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <h3>{report.present || 0}</h3>
            <p>Present Today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">🏢</div>
          <div className="stat-info">
            <h3>{dashboard.total_departments || 0}</h3>
            <p>Departments</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon yellow">💰</div>
          <div className="stat-info">
            <h3>Rs.{report.payroll || 0}</h3>
            <p>Total Payroll</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">⏳</div>
          <div className="stat-info">
            <h3>{dashboard.pending_leaves || 0}</h3>
            <p>Pending Leaves</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">❌</div>
          <div className="stat-info">
            <h3>{dashboard.leave_status_counts?.rejected || 0}</h3>
            <p>Rejected Today</p>
          </div>
        </div>
      </div>

      {/* Birthday Widgets */}
      <TodayBirthdaysCard />
      <UpcomingBirthdaysCard />

      {/* Main Content Grid */}
      <div className="grid-2">
        {/* Recent Tasks Widget */}
        <div className="hrms-card">
          <div className="card-header">
            <h2>Recent Tasks</h2>
          </div>
          <div className="card-body" style={{ padding: '0' }}>
            <div className="hrms-table-wrap">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Task</th>
                    <th>Assignee</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.length > 0 ? recentTasks.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{item.id}</td>
                      <td style={{ fontWeight: '600' }}>{item.title}</td>
                      <td>
                        <div className="emp-name">
                          {item.assignee?.user?.name || 'Unassigned'}
                        </div>
                      </td>
                      <td>{item.due_date ? new Date(item.due_date).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <span className={`badge ${item.status === 'Completed' ? 'badge-success' : item.status === 'Overdue' ? 'badge-danger' : 'badge-warning'}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="empty-state">No recent tasks</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="hrms-card">
          <div className="card-header">
            <h2>Recent Attendance</h2>
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search employees..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="card-body" style={{ padding: '0' }}>
            <div className="hrms-table-wrap">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.length > 0 ? attendanceData.slice(0, 8).map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="emp-name">
                          <div className="emp-avatar">
                            {item.employee?.user?.name?.charAt(0)}
                          </div>
                          {item.employee?.user?.name}
                        </div>
                      </td>
                      <td>{item.date}</td>
                      <td>{item.check_in}</td>
                      <td>
                        <span className={`badge ${item.status?.toLowerCase() === 'present' ? 'badge-success' : 'badge-warning'}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        <h3>No recent attendance recorded</h3>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="hrms-card">
          <div className="card-header">
            <h2>Department Distribution</h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {dashboard?.employees_by_department?.map((dept, index) => (
                    <div key={index}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                            <span style={{ fontWeight: '600' }}>{dept.name}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{dept.employees_count} Employees</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--bg-main)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ 
                                width: `${(dept.employees_count / (dashboard.total_employees || 1)) * 100}%`, 
                                height: '100%', 
                                background: index % 2 === 0 ? 'var(--primary)' : 'var(--secondary)',
                                borderRadius: '10px'
                            }}></div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '32px', padding: '16px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)' }}>
                <h4 style={{ fontSize: '14px', color: 'var(--primary)', marginBottom: '8px' }}>Leave Status Overview</h4>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: '800' }}>{dashboard.leave_status_counts?.pending || 0}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending</div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(99,102,241,0.2)' }}></div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: '800' }}>{dashboard.leave_status_counts?.approved || 0}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Approved</div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(99,102,241,0.2)' }}></div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: '800' }}>{dashboard.leave_status_counts?.rejected || 0}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rejected</div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;