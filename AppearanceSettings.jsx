import { useState, useEffect } from "react";
import API from "../../../api/api";
import { toast } from "react-toastify";

function AppearanceSettings() {
  const [form, setForm] = useState({});
  const [bannerPreview, setBannerPreview] = useState(null);
  const [sidebarLogoPreview, setSidebarLogoPreview] = useState(null);
  const [loginLogoPreview, setLoginLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get("/settings/appearance");
      const data = res.data?.data || res.data || {};
      setForm(data);
      if (data.login_banner) setBannerPreview(data.login_banner);
      if (data.sidebar_logo) setSidebarLogoPreview(data.sidebar_logo);
      if (data.login_logo) setLoginLogoPreview(data.login_logo);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, [field]: file });
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (field === "login_banner") setBannerPreview(ev.target.result);
      if (field === "sidebar_logo") setSidebarLogoPreview(ev.target.result);
      if (field === "login_logo") setLoginLogoPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== undefined && val !== null) fd.append(key, val);
      });
      await API.post("/settings/appearance", fd);
      toast.success("Appearance settings saved");
      load();
    } catch (err) { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex-center" style={{ padding: "60px 0" }}>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="form-group">
          <label className="form-label">Theme Mode</label>
          <select name="theme_mode" className="form-select" value={form.theme_mode || "light"} onChange={handleChange}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Primary Color</label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input type="color" name="primary_color" value={form.primary_color || "#6366f1"} onChange={handleChange} style={{ width: "40px", height: "40px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer" }} />
            <input name="primary_color" className="form-control" value={form.primary_color || ""} onChange={handleChange} style={{ flex: 1 }} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Secondary Color</label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input type="color" name="secondary_color" value={form.secondary_color || "#8b5cf6"} onChange={handleChange} style={{ width: "40px", height: "40px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer" }} />
            <input name="secondary_color" className="form-control" value={form.secondary_color || ""} onChange={handleChange} style={{ flex: 1 }} />
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginTop: "20px" }}>
        <div className="form-group">
          <label className="form-label">Sidebar Logo</label>
          <input type="file" accept="image/*" className="form-control" onChange={(e) => handleFile(e, "sidebar_logo")} />
          {sidebarLogoPreview && (
            <div style={{ marginTop: "8px" }}><img src={sidebarLogoPreview} alt="Sidebar Logo" style={{ maxHeight: "50px", borderRadius: "var(--radius-sm)" }} /></div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Login Page Logo</label>
          <input type="file" accept="image/*" className="form-control" onChange={(e) => handleFile(e, "login_logo")} />
          {loginLogoPreview && (
            <div style={{ marginTop: "8px" }}><img src={loginLogoPreview} alt="Login Logo" style={{ maxHeight: "50px", borderRadius: "var(--radius-sm)" }} /></div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Login Banner</label>
          <input type="file" accept="image/*" className="form-control" onChange={(e) => handleFile(e, "login_banner")} />
          {bannerPreview && (
            <div style={{ marginTop: "8px" }}><img src={bannerPreview} alt="Banner" style={{ maxHeight: "60px", borderRadius: "var(--radius-sm)" }} /></div>
          )}
        </div>
      </div>

      <div style={{ marginTop: "28px", display: "flex", gap: "12px" }}>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
        <button type="button" className="btn-outline" onClick={load}>Reset</button>
      </div>
    </form>
  );
}

export default AppearanceSettings;
