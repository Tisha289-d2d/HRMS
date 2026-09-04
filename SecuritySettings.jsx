import { useState, useEffect } from "react";
import API from "../../../api/api";
import { toast } from "react-toastify";

function SecuritySettings() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get("/settings/security");
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
      await API.put("/settings/security", form);
      toast.success("Security settings saved");
    } catch (err) { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex-center" style={{ padding: "60px 0" }}>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="form-group">
          <label className="form-label">Minimum Password Length</label>
          <input name="min_password_length" type="number" min="4" className="form-control" value={form.min_password_length ?? 8} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Password Expiry (days)</label>
          <input name="password_expiry_days" type="number" min="0" className="form-control" value={form.password_expiry_days ?? 90} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Session Timeout (minutes)</label>
          <input name="session_timeout" type="number" min="1" className="form-control" value={form.session_timeout ?? 30} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Max Login Attempts</label>
          <input name="max_login_attempts" type="number" min="1" className="form-control" value={form.max_login_attempts ?? 5} onChange={handleChange} />
        </div>
        <div className="form-group" style={{ display: "flex", alignItems: "flex-end", paddingBottom: "12px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <input name="enable_2fa" type="checkbox" checked={form.enable_2fa ?? false} onChange={handleChange} style={{ width: "18px", height: "18px" }} />
            <span style={{ fontWeight: "600" }}>Enable Two-Factor Authentication</span>
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

export default SecuritySettings;
