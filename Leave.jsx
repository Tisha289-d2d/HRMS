import { useEffect, useState } from "react";
import API from "../../api/api";
import { toast } from "react-toastify";
import Loader from "../../components/loaders/Loader";

function Leave() {
  const [employee, setEmployee] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [counts, setCounts] = useState({
    paid_leave: 0,
    sick_leave: 0,
    unpaid_leave: 0
  });

  const [formData, setFormData] = useState({
    leave_type: "Paid Leave",
    start_date: "",
    end_date: "",
    reason: "",
  });

  useEffect(() => {
    fetchEmployeeAndLeaves();
  }, []);

  const fetchEmployeeAndLeaves = async () => {
    try {
      setLoading(true);
      const empRes = await API.get("/employees/me");
      const emp = empRes.data.data || empRes.data;
      setEmployee(emp || null);

      if (emp) {
        const leavesRes = await API.get("/leaves/me");
        setLeaves(leavesRes.data || []);

        const countsRes = await API.get("/leave/counts");
        setCounts(countsRes.data || { paid_leave: 0, sick_leave: 0, unpaid_leave: 0 });
      }
    } catch (err) {
      console.error("Error fetching leave data:", err);
      toast.error("Failed to load leave records");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employee || !employee.id) {
      toast.error("No employee profile found. Please contact Admin/HR.");
      return;
    }

    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast.error("Please select valid start and end dates");
      return;
    }
    if (start > end) {
      toast.error("End date must be after or equal to start date");
      return;
    }

    try {
      setSubmitting(true);
      const postData = {
        leave_type: formData.leave_type,
        from_date: formData.start_date,
        to_date: formData.end_date,
        reason: formData.reason,
      };

      const res = await API.post("/leave/apply", postData);
      toast.success(res.data.message || "Leave applied successfully!");
      setFormData({
        leave_type: "Paid Leave",
        start_date: "",
        end_date: "",
        reason: "",
      });

      const leavesRes = await API.get("/leaves/me");
      setLeaves(leavesRes.data || []);

      const countsRes = await API.get("/leave/counts");
      setCounts(countsRes.data || { paid_leave: 0, sick_leave: 0, unpaid_leave: 0 });
    } catch (err) {
      console.error("Leave Application Error:", err);
      let errMsg = "Failed to apply for leave";
      if (err.response?.data) {
        if (err.response.data.message) {
          errMsg = err.response.data.message;
        } else if (err.response.data.error) {
          errMsg = err.response.data.error;
        } else if (err.response.data.errors) {
          const errorsObj = err.response.data.errors;
          const firstErrorKey = Object.keys(errorsObj)[0];
          if (firstErrorKey && Array.isArray(errorsObj[firstErrorKey])) {
            errMsg = errorsObj[firstErrorKey][0];
          }
        }
      }
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  const pendingLeaves = leaves.filter(
  (l) => l.status?.toLowerCase() === "pending"
).length;

const approvedLeaves = leaves.filter(
  (l) => l.status?.toLowerCase() === "approved"
).length;

const rejectedLeaves = leaves.filter(
  (l) => l.status?.toLowerCase() === "rejected"
).length;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div className="page-header">
        <div>
          <h1>Leave Management</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Submit a leave request and view your request history
          </p>
        </div>
      </div>

      {!employee ? (
        <div className="hrms-card" style={{ padding: "40px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <h3>Employee Profile Required</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
            Your account does not have an employee profile yet. Please complete your profile to apply for leaves.
          </p>
        </div>
      ) : (
        <>
          <div className="stats-grid" style={{ marginBottom: "24px" }}>
            <div className="stat-card">
              <div className="stat-icon purple">🗓️</div>
              <div className="stat-info">
                <h3>{leaves.length}</h3>
                <p>Total Applied</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">⏳</div>
              <div className="stat-info">
                <h3>{pendingLeaves}</h3>
                <p>Pending Approval</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">✅</div>
              <div className="stat-info">
                <h3>{approvedLeaves}</h3>
                <p>Approved Leaves</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon red" style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>❌</div>
              <div className="stat-info">
                <h3>{rejectedLeaves}</h3>
                <p>Rejected Leaves</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue">💵</div>
              <div className="stat-info">
                <h3>{counts.paid_leave} / 2</h3>
                <p>Monthly Paid Leave</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon pink" style={{ backgroundColor: "#fce7f3", color: "#db2777" }}>🤒</div>
              <div className="stat-info">
                <h3>{counts.sick_leave} / 5</h3>
                <p>Monthly Sick Leave</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon yellow">🚫</div>
              <div className="stat-info">
                <h3>{counts.unpaid_leave}</h3>
                <p>Monthly Unpaid Leave</p>
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
            <div className="hrms-card" style={{ height: "fit-content" }}>
              <div className="card-header">
                <h2>Apply for Leave</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Leave Type</label>
                    <select
                      name="leave_type"
                      className="form-control"
                      value={formData.leave_type}
                      onChange={handleChange}
                      required>
                      <option value="Paid Leave">Paid Leave</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Unpaid Leave">Unpaid Leave</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      className="form-control"
                      value={formData.start_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      className="form-control"
                      value={formData.end_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reason</label>
                    <textarea
                      name="reason"
                      className="form-control"
                      rows="4"
                      value={formData.reason}
                      onChange={handleChange}
                      required></textarea>
                  </div>

                  <div style={{ marginTop: "24px" }}>
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ width: "100%", justifyContent: "center" }}
                      disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Leave Application"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="hrms-card">
              <div className="card-header">
                <h2>My Leave History</h2>
              </div>
              <div className="card-body" style={{ padding: "0" }}>
                <div className="hrms-table-wrap">
                  <table className="hrms-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Dates</th>
                        <th>Reason</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaves.length > 0 ? (
                        leaves.map((l) => (
                          <tr key={l.id}>
                            <td style={{ fontWeight: "600" }}>{l.leave_type}</td>
                            <td>
                              <div style={{ fontSize: "13px" }}>
                                <strong>From:</strong> {l.start_date}
                              </div>
                              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                <strong>To:</strong> {l.end_date}
                              </div>
                            </td>
                            <td style={{ maxWidth: "250px", wordBreak: "break-word", fontSize: "13px" }}>
                              {l.reason}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  l.status === "approved"
                                    ? "badge-success"
                                    : l.status === "pending"
                                    ? "badge-warning"
                                    : "badge-danger"
                                }`}
                              >
                                {l.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="empty-state">
                            <div style={{ fontSize: "32px", marginBottom: "12px" }}>📅</div>
                            <h3>No leave requests yet</h3>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Leave;