import { useState, useEffect } from "react";
import API from "../../../api/api";
import { toast } from "react-toastify";

function AttendanceSettings() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get("/settings/attendance");
      setForm(res.data?.data || res.data || {});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put("/settings/attendance", form);
      toast.success("Attendance settings saved");
    } catch (err) { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex-center" style={{ padding: "60px 0" }}>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="form-group">
          <label className="form-label">Office Start Time</label>
          <input name="office_start_time" type="time" className="form-control" value={form.office_start_time || "09:00"} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Office End Time</label>
          <input name="office_end_time" type="time" className="form-control" value={form.office_end_time || "18:00"} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Grace Period (minutes)</label>
          <input name="grace_period" type="number" className="form-control" value={form.grace_period ?? 15} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Late Mark After</label>
          <input name="late_mark_after" type="time" className="form-control" value={form.late_mark_after || "09:15"} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Half Day After</label>
          <input name="half_day_after" type="time" className="form-control" value={form.half_day_after || "13:00"} onChange={handleChange} />
        </div>
        <div className="form-group" style={{ display: "flex", alignItems: "flex-end", paddingBottom: "12px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <input name="overtime_enabled" type="checkbox" checked={form.overtime_enabled ?? false} onChange={handleChange} style={{ width: "18px", height: "18px" }} />
            <span style={{ fontWeight: "600" }}>Enable Overtime</span>
          </label>
        </div>
      </div>

      <div style={{ marginTop: "28px", display: "flex", gap: "12px" }}>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
        <button type="button" className="btn-outline" onClick={load}>Reset</button>
      </div>
    </form>
  );
}

export default AttendanceSettings;
