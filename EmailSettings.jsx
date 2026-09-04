import { useState, useEffect } from "react";
import API from "../../../api/api";
import { toast } from "react-toastify";

function EmailSettings() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get("/settings/email");
      setForm(res.data?.data || res.data || {});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put("/settings/email", form);
      toast.success("Email settings saved");
    } catch (err) { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleTest = async () => {
    if (!form.sender_email) { toast.warning("Enter a sender email first"); return; }
    setTesting(true);
    try {
      await API.post("/settings/email/test", { sender_email: form.sender_email });
      toast.success("Test email sent!");
    } catch (err) { toast.error("Test failed"); }
    finally { setTesting(false); }
  };

  if (loading) return <div className="flex-center" style={{ padding: "60px 0" }}>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="form-group">
          <label className="form-label">Mail Driver</label>
          <select name="mail_driver" className="form-select" value={form.mail_driver || "smtp"} onChange={handleChange}>
            <option value="smtp">SMTP</option>
            <option value="sendmail">Sendmail</option>
            <option value="mailgun">Mailgun</option>
            <option value="log">Log</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Mail Host</label>
          <input name="mail_host" className="form-control" value={form.mail_host || ""} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Mail Port</label>
          <input name="mail_port" className="form-control" value={form.mail_port || ""} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Mail Username</label>
          <input name="mail_username" className="form-control" value={form.mail_username || ""} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Mail Password</label>
          <input name="mail_password" type="password" className="form-control" value={form.mail_password || ""} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Mail Encryption</label>
          <select name="mail_encryption" className="form-select" value={form.mail_encryption || "tls"} onChange={handleChange}>
            <option value="tls">TLS</option>
            <option value="ssl">SSL</option>
            <option value="">None</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Sender Name</label>
          <input name="sender_name" className="form-control" value={form.sender_name || ""} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Sender Email</label>
          <input name="sender_email" type="email" className="form-control" value={form.sender_email || ""} onChange={handleChange} />
        </div>
      </div>

      <div style={{ marginTop: "28px", display: "flex", gap: "12px", alignItems: "center" }}>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
        <button type="button" className="btn-success" disabled={testing} onClick={handleTest}>
          {testing ? "Sending..." : "Send Test Email"}
        </button>
        <button type="button" className="btn-outline" onClick={load}>Reset</button>
      </div>
    </form>
  );
}

export default EmailSettings;
