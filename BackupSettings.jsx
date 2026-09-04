import { useState, useEffect } from "react";
import API from "../../../api/api";
import { toast } from "react-toastify";

function BackupSettings() {
  const [form, setForm] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [settingsRes, historyRes] = await Promise.all([
        API.get("/settings/backup"),
        API.get("/settings/backup/history"),
      ]);
      setForm(settingsRes.data?.data || settingsRes.data || {});
      setHistory(historyRes.data?.data || historyRes.data || []);
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
      await API.put("/settings/backup", form);
      toast.success("Backup settings saved");
    } catch (err) { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleRunBackup = async () => {
    setBackingUp(true);
    try {
      await API.post("/settings/backup/run");
      toast.success("Backup created successfully");
      load();
    } catch (err) { toast.error("Backup failed"); }
    finally { setBackingUp(false); }
  };

  const statusBadge = (status) => {
    const colors = { success: "badge-success", failed: "badge-danger", in_progress: "badge-warning" };
    return <span className={`badge ${colors[status] || "badge-gray"}`}>{status}</span>;
  };

  if (loading) return <div className="flex-center" style={{ padding: "60px 0" }}>Loading...</div>;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div className="form-group">
            <label className="form-label">Backup Frequency</label>
            <select name="backup_frequency" className="form-select" value={form.backup_frequency || "manual"} onChange={handleChange}>
              <option value="manual">Manual</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Storage Location</label>
            <input name="storage_location" className="form-control" value={form.storage_location || "local"} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Retention (days)</label>
            <input name="retention_days" type="number" min="1" className="form-control" value={form.retention_days ?? 30} onChange={handleChange} />
          </div>
          <div className="form-group" style={{ display: "flex", alignItems: "flex-end", paddingBottom: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <input name="auto_backup" type="checkbox" checked={form.auto_backup ?? false} onChange={handleChange} style={{ width: "18px", height: "18px" }} />
              <span style={{ fontWeight: "600" }}>Enable Auto Backup</span>
            </label>
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <label className="form-label">Last Backup</label>
          <p style={{ color: "var(--text-secondary)", margin: "4px 0 0" }}>
            {form.last_backup_date ? new Date(form.last_backup_date).toLocaleString() : "Never"}
          </p>
        </div>

        <div style={{ marginTop: "28px", display: "flex", gap: "12px", alignItems: "center" }}>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
          <button type="button" className="btn-success" disabled={backingUp} onClick={handleRunBackup}>
            {backingUp ? "Running..." : "Run Backup Now"}
          </button>
          <button type="button" className="btn-outline" onClick={load}>Refresh</button>
        </div>
      </form>

      <div style={{ marginTop: "32px" }}>
        <h3 style={{ margin: "0 0 16px" }}>Backup History</h3>
        {history.length === 0 ? (
          <div className="empty-state">No backups created yet</div>
        ) : (
          <div className="hrms-table-wrap">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td>{item.file_name}</td>
                    <td>{item.file_size ? (item.file_size / 1024).toFixed(2) + " KB" : "-"}</td>
                    <td>{statusBadge(item.status)}</td>
                    <td>{item.created_at ? new Date(item.created_at).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default BackupSettings;
