import React, { useEffect, useState } from "react";
import API from "../../api/api";
import Loader from "../../components/loaders/Loader";

const Report = () => {
  const [loading, setLoading]     = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData]           = useState(null);

  useEffect(() => { fetchReport(activeTab); }, [activeTab]);

  const fetchReport = async (type) => {
    setLoading(true);
    try {
      const response = await API.get(`/reports/${type}`);
      setData(response.data);
    } catch (error) {
      console.error(`Error fetching ${type} report:`, error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  /* ─── DASHBOARD ─── */
  const renderDashboardReport = () => {
    if (!data) return <p>No data available.</p>;
    return (
      <div className="grid-2">
        <div className="hrms-card">
          <div className="card-header"><h3>👥 Employees</h3></div>
          <div className="card-body">
            <p><strong>Total Employees:</strong> {data.employees?.total_employees ?? "—"}</p>
            <p><strong>Active:</strong> {data.employees?.active_employees ?? "—"}</p>
          </div>
        </div>
        <div className="hrms-card">
          <div className="card-header"><h3>🏢 Departments</h3></div>
          <div className="card-body">
            <p><strong>Total Departments:</strong> {data.departments?.total_departments ?? "—"}</p>
            {data.departments?.department_wise_employees?.map(d => (
              <p key={d.id} style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                {d.name}: <strong>{d.employees_count}</strong> employees
              </p>
            ))}
          </div>
        </div>
        <div className="hrms-card">
          <div className="card-header"><h3>🕐 Attendance (Today)</h3></div>
          <div className="card-body">
            <p><strong>Present Today:</strong> <span style={{ color: "var(--success)", fontWeight: 700 }}>{data.attendance?.today_present ?? data.attendance?.present_count ?? "—"}</span></p>
            <p><strong>Absent Today:</strong> <span style={{ color: "var(--danger)", fontWeight: 700 }}>{data.attendance?.today_absent ?? data.attendance?.absent_count ?? "—"}</span></p>
            <p><strong>Late Today:</strong> <span style={{ color: "var(--warning)", fontWeight: 700 }}>{data.attendance?.today_late ?? "—"}</span></p>
            <p><strong>Total Records:</strong> {data.attendance?.total_attendance ?? "—"}</p>
          </div>
        </div>
        <div className="hrms-card">
          <div className="card-header"><h3>💰 Payroll Summary</h3></div>
          <div className="card-body">
            <p><strong>Total Payroll:</strong> Rs {Number(data.payroll?.total_payroll ?? 0).toLocaleString()}</p>
            <p><strong>Average Salary:</strong> Rs {Number(data.payroll?.average_salary ?? 0).toFixed(0)}</p>
            <p><strong>Highest:</strong> Rs {Number(data.payroll?.highest_salary ?? 0).toLocaleString()}</p>
            <p><strong>Lowest:</strong> Rs {Number(data.payroll?.lowest_salary ?? 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="hrms-card">
          <div className="card-header"><h3>📅 Leaves Summary</h3></div>
          <div className="card-body">
            <p><strong>Total Leaves:</strong> {data.leaves?.total_leaves ?? "—"}</p>
            <p><strong>Pending:</strong> <span style={{ color: "var(--warning)" }}>{data.leaves?.pending_leaves ?? "—"}</span></p>
            <p><strong>Approved:</strong> <span style={{ color: "var(--success)" }}>{data.leaves?.approved_leaves ?? "—"}</span></p>
            <p><strong>Rejected:</strong> <span style={{ color: "var(--danger)" }}>{data.leaves?.rejected_leaves ?? "—"}</span></p>
          </div>
        </div>
      </div>
    );
  };

  /* ─── ATTENDANCE TAB ─── */
  const renderAttendanceReport = () => {
    const rows = Array.isArray(data) ? data : [];
    if (rows.length === 0) return <div className="empty-state"><h3>No attendance records found.</h3></div>;
    return (
      <div className="hrms-table-wrap">
        <table className="hrms-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Work Hours</th>
              <th>Late?</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td>
                  <div className="emp-name">
                    <div className="emp-avatar">{(row.employee_name || "U").charAt(0)}</div>
                    {row.employee_name || "Unknown"}
                  </div>
                </td>
                <td>{row.date}</td>
                <td><span style={{ color: "var(--success)", fontWeight: 600 }}>{row.check_in || "—"}</span></td>
                <td><span style={{ color: "var(--text-secondary)" }}>{row.check_out || "—"}</span></td>
                <td>
                  {row.work_hours != null ? (
                    <strong style={{ color: row.work_hours >= 8 ? "var(--success)" : "var(--warning)" }}>
                      {row.work_hours}h
                    </strong>
                  ) : "—"}
                </td>
                <td>
                  {row.is_late ? <span className="badge badge-warning">Late</span> : <span className="badge badge-success">On Time</span>}
                </td>
                <td>
                  <span className={`badge ${
                    row.status?.toLowerCase() === "present" ? "badge-success" :
                    row.status?.toLowerCase() === "late"    ? "badge-warning" :
                    row.status?.toLowerCase() === "absent"  ? "badge-danger"  : "badge-secondary"
                  }`}>{row.status || "—"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  /* ─── LEAVE TAB ─── */
  const renderLeaveReport = () => {
    const rows = Array.isArray(data) ? data : [];
    if (rows.length === 0) return <div className="empty-state"><h3>No leave records found.</h3></div>;
    return (
      <div className="hrms-table-wrap">
        <table className="hrms-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Category</th>
              <th>From</th>
              <th>To</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td>
                  <div className="emp-name">
                    <div className="emp-avatar">{(row.employee_name || "U").charAt(0)}</div>
                    {row.employee_name || "Unknown"}
                  </div>
                </td>
                <td>{row.leave_type || "—"}</td>
                <td>
                  <span className={`badge ${
                    row.type_category === "Paid"   ? "badge-success" :
                    row.type_category === "Sick"   ? "badge-info"    :
                    row.type_category === "Unpaid" ? "badge-danger"  : "badge-secondary"
                  }`}>{row.type_category || "—"}</span>
                </td>
                <td>{row.from_date || "—"}</td>
                <td>{row.to_date || "—"}</td>
                <td><strong>{row.days ?? "—"}</strong></td>
                <td style={{ maxWidth: "180px", fontSize: "12px", color: "var(--text-secondary)" }}>{row.reason || "—"}</td>
                <td>
                  <span className={`badge ${
                    row.status === "approved"  ? "badge-success" :
                    row.status === "rejected"  ? "badge-danger"  :
                    row.status === "forwarded" ? "badge-info"    : "badge-warning"
                  }`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  /* ─── PAYROLL TAB ─── */
  const renderPayrollReport = () => {
    const rows = Array.isArray(data) ? data : [];
    if (rows.length === 0) return <div className="empty-state"><h3>No payroll records found.</h3></div>;
    return (
      <div className="hrms-table-wrap">
        <table className="hrms-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Month/Year</th>
              <th>Basic Salary</th>
              <th>Bonus</th>
              <th>Deduction</th>
              <th>Paid Leaves</th>
              <th>Sick Leaves</th>
              <th>Unpaid Leaves</th>
              <th>Holidays</th>
              <th>Leave Deduction</th>
              <th>Net Salary</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td>
                  <div className="emp-name">
                    <div className="emp-avatar">{(row.employee_name || "U").charAt(0)}</div>
                    <div>
                      <div>{row.employee_name || "Unknown"}</div>
                      {row.designation && <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.designation}</div>}
                    </div>
                  </div>
                </td>
                <td>{row.month} {row.year}</td>
                <td>Rs {Number(row.basic_salary || 0).toLocaleString()}</td>
                <td style={{ color: "var(--success)" }}>Rs {Number(row.bonus || 0).toLocaleString()}</td>
                <td style={{ color: "var(--danger)" }}>Rs {Number(row.deduction || 0).toLocaleString()}</td>
                <td><span className="badge badge-success">{row.paid_leaves_count ?? 0}</span></td>
                <td><span className="badge badge-info">{row.sick_leaves_count ?? 0}</span></td>
                <td><span className="badge badge-danger">{row.unpaid_leaves_count ?? 0}</span></td>
                <td><span className="badge badge-purple">{row.holiday_days ?? 0}</span></td>
                <td style={{ color: "var(--danger)", fontWeight: 600 }}>Rs {Number(row.leave_deduction || 0).toLocaleString()}</td>
                <td><strong>Rs {Number(row.net_salary || 0).toLocaleString()}</strong></td>
                <td>
                  <span className={`badge ${row.status === "Paid" ? "badge-success" : "badge-warning"}`}>
                    {row.status || "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  /* ─── EMPLOYEES TAB ─── */
  const renderEmployeeReport = () => {
    const rows = Array.isArray(data) ? data : [];
    if (rows.length === 0) return <div className="empty-state"><h3>No employee records found.</h3></div>;
    return (
      <div className="hrms-table-wrap">
        <table className="hrms-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Gender</th>
              <th>DOB</th>
              <th>Joining Date</th>
              <th>Department</th>
              <th>Salary</th>
              <th>Present Days</th>
              <th>Late Days</th>
              <th>Absent Days</th>
              <th>Paid L.</th>
              <th>Sick L.</th>
              <th>Unpaid L.</th>
              <th>Holidays</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td>
                  <div className="emp-name">
                    <div className="emp-avatar">{(row.employee_name || "U").charAt(0)}</div>
                    <div>
                      <div>{row.employee_name || "Unknown"}</div>
                      {row.designation && <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{row.designation}</div>}
                    </div>
                  </div>
                </td>
                <td>{row.gender || "—"}</td>
                <td style={{ fontSize: "12px" }}>{row.dob || "—"}</td>
                <td style={{ fontSize: "12px" }}>{row.joining_date || "—"}</td>
                <td style={{ fontSize: "12px" }}>{row.departments || "—"}</td>
                <td>Rs {Number(row.salary || 0).toLocaleString()}</td>
                <td><span style={{ color: "var(--success)", fontWeight: 600 }}>{row.total_present_days ?? 0}</span></td>
                <td><span style={{ color: "var(--warning)", fontWeight: 600 }}>{row.total_late_days ?? 0}</span></td>
                <td><span style={{ color: "var(--danger)", fontWeight: 600 }}>{row.total_absent_days ?? 0}</span></td>
                <td><span className="badge badge-success">{row.paid_leaves_count ?? 0}</span></td>
                <td><span className="badge badge-info">{row.sick_leaves_count ?? 0}</span></td>
                <td><span className="badge badge-danger">{row.unpaid_leaves_count ?? 0}</span></td>
                <td><span className="badge badge-purple">{row.holiday_days ?? 0}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const tabIcons = { dashboard: "📊", attendance: "🕐", leaves: "📅", payroll: "💰", employees: "👥" };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Reports Center</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px", fontSize: "14px" }}>
            View and analyze comprehensive company reports
          </p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="hrms-card" style={{ padding: 0, overflow: "hidden", marginBottom: "24px" }}>
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--bg-main)" }}>
          {["dashboard", "attendance", "leaves", "payroll", "employees"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: "14px 8px",
                border: "none",
                background: activeTab === tab ? "#fff" : "transparent",
                borderBottom: activeTab === tab ? "2px solid var(--primary)" : "2px solid transparent",
                color: activeTab === tab ? "var(--primary)" : "var(--text-muted)",
                fontWeight: activeTab === tab ? "700" : "400",
                cursor: "pointer",
                textTransform: "capitalize",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s",
              }}
            >
              {tabIcons[tab]} {tab} Report
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="hrms-card">
          <div className="card-header">
            <h2>{tabIcons[activeTab]} {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report</h2>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {activeTab === "dashboard"  && renderDashboardReport()}
            {activeTab === "attendance" && renderAttendanceReport()}
            {activeTab === "leaves"     && renderLeaveReport()}
            {activeTab === "payroll"    && renderPayrollReport()}
            {activeTab === "employees"  && renderEmployeeReport()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
