import { useEffect, useState } from "react";
import API from "../../api/api";

function Attendance() {
  const [attendance, setAttendance]   = useState([]);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [editingId, setEditingId]     = useState(null);
  const [editData, setEditData]       = useState({ check_in: "", check_out: "", status: "" });
  const [filterDate, setFilterDate]   = useState("");
  const [filterName, setFilterName]   = useState("");
  const [autoLoading, setAutoLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load stats (today's summary)
      const statsRes = await API.get("/attendance/stats");
      setStats(statsRes.data);

      // Load attendance logs
      const attRes = await API.get("/reports/attendance");
      const data = attRes.data?.data || attRes.data || [];
      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Attendance load error:", err);
      try {
        const res2 = await API.get("/attendance");
        const d = res2.data?.data || res2.data || [];
        setAttendance(Array.isArray(d) ? d : []);
      } catch (e) {
        setAttendance([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (record) => {
    setEditingId(record.id);
    setEditData({
      check_in:  record.check_in  || "",
      check_out: record.check_out || "",
      status:    record.status    || "Present",
    });
  };

  const handleSave = async (id) => {
    try {
      await API.put(`/attendance/${id}`, editData);
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error("Failed to update:", err);
      alert("Failed to update attendance record.");
    }
  };

  const handleAutoMark = async () => {
    if (!window.confirm("Auto-mark today's attendance for all employees without a record? (Working days → Absent, Holidays → Holiday)")) return;
    setAutoLoading(true);
    try {
      const res = await API.post("/attendance/auto-mark");
      alert(res.data.message || "Auto-mark complete.");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Auto-mark failed.");
    } finally {
      setAutoLoading(false);
    }
  };

  const handleAutoCheckout = async () => {
    if (!window.confirm("Auto-checkout all employees who are still clocked in? (Sets checkout = check-in + 9 hours)")) return;
    setAutoLoading(true);
    try {
      const res = await API.post("/attendance/auto-checkout");
      alert(res.data.message || "Auto-checkout complete.");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Auto-checkout failed.");
    } finally {
      setAutoLoading(false);
    }
  };

  // Filtered records
  const filtered = attendance.filter((a) => {
    const nameMatch = !filterName || (a.employee_name || a.employee?.user?.name || "").toLowerCase().includes(filterName.toLowerCase());
    const dateMatch = !filterDate || a.date === filterDate;
    return nameMatch && dateMatch;
  });

  const statusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "present")  return "badge-success";
    if (s === "late")     return "badge-warning";
    if (s === "absent")   return "badge-danger";
    if (s === "holiday")  return "badge-info";
    if (s === "weekend")  return "badge-secondary";
    return "badge-secondary";
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Attendance Management</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "4px", fontSize: "14px" }}>
            Monitor daily check-ins, check-outs, and attendance status
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleAutoMark}
            disabled={autoLoading}
            className="btn-outline"
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            📋 Auto Mark Absent
          </button>
          <button
            onClick={handleAutoCheckout}
            disabled={autoLoading}
            className="btn-primary"
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            🕐 Auto Checkout (9hr)
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <h3>{stats?.total_present_today ?? attendance.filter(a => ['present','late'].includes(a.status?.toLowerCase())).length}</h3>
            <p>Present Today</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⏰</div>
          <div className="stat-info">
            <h3>{stats?.late_check_in_today ?? attendance.filter(a => a.status?.toLowerCase() === 'late' || (a.check_in && a.check_in > '09:15:00')).length}</h3>
            <p>Late Check-in</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red" style={{ background: "var(--danger-light, #fee2e2)", color: "var(--danger)" }}>❌</div>
          <div className="stat-info">
            <h3>{stats?.total_absent_today ?? attendance.filter(a => a.status?.toLowerCase() === 'absent').length}</h3>
            <p>Absent Today</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">👥</div>
          <div className="stat-info">
            <h3>{stats?.total_employees ?? "—"}</h3>
            <p>Total Employees</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="hrms-card">
        <div className="card-header">
          <h2>Daily Attendance Logs</h2>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <input
              type="date"
              className="form-control"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{ width: "160px", padding: "6px 10px", fontSize: "13px" }}
            />
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Filter by name..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="hrms-table-wrap">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Work Hours</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center" style={{ padding: "40px" }}>Loading logs...</td></tr>
                ) : filtered.length > 0 ? (
                  filtered.map((a) => {
                    const empName = a.employee_name || a.employee?.user?.name || "Unknown";
                    return (
                      <tr key={a.id}>
                        <td>
                          <div className="emp-name">
                            <div className="emp-avatar">{empName.charAt(0).toUpperCase()}</div>
                            {empName}
                          </div>
                        </td>
                        <td>{a.date}</td>
                        <td>
                          {editingId === a.id ? (
                            <input
                              type="time"
                              className="form-control"
                              value={editData.check_in}
                              onChange={(e) => setEditData({ ...editData, check_in: e.target.value })}
                              style={{ padding: "4px", fontSize: "12px", width: "110px" }}
                            />
                          ) : (
                            <span style={{ color: "var(--success)", fontWeight: "600" }}>
                              {a.check_in || "—"}
                            </span>
                          )}
                        </td>
                        <td>
                          {editingId === a.id ? (
                            <input
                              type="time"
                              className="form-control"
                              value={editData.check_out}
                              onChange={(e) => setEditData({ ...editData, check_out: e.target.value })}
                              style={{ padding: "4px", fontSize: "12px", width: "110px" }}
                            />
                          ) : (
                            <span style={{ color: "var(--text-secondary)" }}>
                              {a.check_out || "—"}
                            </span>
                          )}
                        </td>
                        <td>
                          {a.work_hours != null ? (
                            <span style={{ fontWeight: "600", color: a.work_hours >= 8 ? "var(--success)" : "var(--warning)" }}>
                              {a.work_hours}h
                            </span>
                          ) : "—"}
                        </td>
                        <td>
                          {editingId === a.id ? (
                            <select
                              className="form-control"
                              value={editData.status}
                              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                              style={{ padding: "4px", fontSize: "12px", width: "110px" }}
                            >
                              {["Present", "Late", "Absent", "Holiday", "Weekend"].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`badge ${statusBadge(a.status)}`}>
                              {a.status || "Present"}
                            </span>
                          )}
                        </td>
                        <td>
                          {editingId === a.id ? (
                            <div style={{ display: "flex", gap: "4px" }}>
                              <button onClick={() => handleSave(a.id)} className="btn-success" style={{ padding: "4px 8px", fontSize: "12px" }}>Save</button>
                              <button onClick={() => setEditingId(null)} className="btn-ghost" style={{ padding: "4px 8px", fontSize: "12px" }}>Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => handleEditClick(a)} className="btn-outline" style={{ padding: "4px 8px", fontSize: "12px" }}>
                              ✏️ Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      <div style={{ fontSize: "32px", marginBottom: "12px" }}>🕒</div>
                      <h3>No attendance records found</h3>
                      <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Try clearing filters or use Auto Mark Absent above.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Attendance;