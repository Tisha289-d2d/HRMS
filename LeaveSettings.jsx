import { useState, useEffect } from "react";
import API from "../../../api/api";
import { toast } from "react-toastify";

function LeaveSettings() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get("/settings/leave");
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
      await API.put("/settings/leave", form);
      toast.success("Leave settings saved");
    } catch (err) { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const fields = [
    { name: "annual_leave", label: "Annual Leave (days)" },
    { name: "sick_leave", label: "Sick Leave (days)" },
    { name: "casual_leave", label: "Casual Leave (days)" },
    { name: "maternity_leave", label: "Maternity Leave (days)" },
    { name: "paternity_leave", label: "Paternity Leave (days)" },
  ];

  if (loading) return <div className="flex-center" style={{ padding: "60px 0" }}>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {fields.map((f) => (
          <div key={f.name} className="form-group">
            <label className="form-label">{f.label}</label>
            <input name={f.name} type="number" min="0" className="form-control" value={form[f.name] ?? ""} onChange={handleChange} />
          </div>
        ))}
        <div className="form-group" style={{ display: "flex", alignItems: "flex-end", paddingBottom: "12px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <input name="carry_forward_enabled" type="checkbox" checked={form.carry_forward_enabled ?? false} onChange={handleChange} style={{ width: "18px", height: "18px" }} />
            <span style={{ fontWeight: "600" }}>Enable Carry Forward</span>
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

export default LeaveSettings;
