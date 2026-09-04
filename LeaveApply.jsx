import { useState } from "react";
import API from "../api/api";
import { toast } from "react-toastify";

function LeaveApply({ onApplySuccess }) {
  const [form, setForm] = useState({
    leave_type: "paid",
    from_date: "",
    to_date: "",
    reason: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.from_date || !form.to_date) {
      toast.error("Please select both start and end dates");
      return;
    }
    if (new Date(form.from_date) > new Date(form.to_date)) {
      toast.error("To Date must be after or equal to From Date");
      return;
    }

    try {
      setSubmitting(false);
      const res = await API.post("/leave/apply", form);
      toast.success(res.data.message || "Leave applied successfully");
      
      // Reset form
      setForm({
        leave_type: "paid",
        from_date: "",
        to_date: "",
        reason: ""
      });

      if (onApplySuccess) {
        onApplySuccess();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Error applying leave"
      );
    }
  };

  return (
    <div className="hrms-card" style={{ height: "fit-content" }}>
      <div className="card-header">
        <h2>Apply for Leave (Paid / Unpaid)</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Leave Type</label>
            <select
              name="leave_type"
              className="form-control"
              value={form.leave_type}
              onChange={handleChange}
              required
            >
              <option value="paid">Paid Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">From Date</label>
            <input
              type="date"
              name="from_date"
              className="form-control"
              value={form.from_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">To Date</label>
            <input
              type="date"
              name="to_date"
              className="form-control"
              value={form.to_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reason</label>
            <textarea
              name="reason"
              className="form-control"
              placeholder="Reason for leave..."
              rows="4"
              value={form.reason}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div style={{ marginTop: "24px" }}>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Apply Leave"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeaveApply;
