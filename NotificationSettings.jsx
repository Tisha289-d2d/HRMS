import { useState, useEffect } from "react";
import API from "../../../api/api";
import { toast } from "react-toastify";

function NotificationSettings() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get("/settings/notification");
      setForm(res.data?.data || res.data || {});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleToggle = (name) => {
    setForm({ ...form, [name]: !form[name] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put("/settings/notification", form);
      toast.success("Notification settings saved");
    } catch (err) { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const toggles = [
    { key: "enable_email_notifications", label: "Email Notifications", desc: "Send notifications via email" },
    { key: "enable_push_notifications", label: "Push Notifications", desc: "Send in-app push notifications" },
    { key: "enable_leave_notifications", label: "Leave Notifications", desc: "Notify on leave requests and updates" },
    { key: "enable_attendance_notifications", label: "Attendance Notifications", desc: "Notify on attendance events" },
    { key: "enable_payroll_notifications", label: "Payroll Notifications", desc: "Notify on payroll generation" },
    { key: "enable_announcement_notifications", label: "Announcement Notifications", desc: "Notify when announcements are published" },
  ];

  if (loading) return <div className="flex-center" style={{ padding: "60px 0" }}>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {toggles.map((t) => (
          <div
            key={t.key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              background: "var(--bg-main)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
            }}
          >
            <div>
              <div style={{ fontWeight: "600", marginBottom: "4px" }}>{t.label}</div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{t.desc}</div>
            </div>
            <label style={{ position: "relative", display: "inline-block", width: "48px", height: "26px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form[t.key] ?? false}
                onChange={() => handleToggle(t.key)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: form[t.key] ? "var(--primary)" : "#ccc",
                  borderRadius: "26px",
                  transition: "var(--transition)",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    height: "20px", width: "20px",
                    left: form[t.key] ? "26px" : "3px",
                    bottom: "3px",
                    background: "#fff",
                    borderRadius: "50%",
                    transition: "var(--transition)",
                  }}
                />
              </span>
            </label>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "28px", display: "flex", gap: "12px" }}>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
        <button type="button" className="btn-outline" onClick={load}>Reset</button>
      </div>
    </form>
  );
}

export default NotificationSettings;
