import { useState, useEffect } from "react";
import API from "../../../api/api";
import { toast } from "react-toastify";

function CompanySettings() {
  const [form, setForm] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await API.get("/settings/company");
      setForm(res.data?.data || res.data || {});
      if (res.data?.company_logo) setLogoPreview(res.data.company_logo);
      if (res.data?.company_favicon) setFaviconPreview(res.data.company_favicon);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, [field]: file });
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (field === "company_logo") setLogoPreview(ev.target.result);
      if (field === "company_favicon") setFaviconPreview(ev.target.result);
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
      await API.post("/settings/company", fd);
      toast.success("Company settings saved");
      loadSettings();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex-center" style={{ padding: "60px 0" }}>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="form-group">
          <label className="form-label">Company Name</label>
          <input name="company_name" className="form-control" value={form.company_name || ""} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Company Code</label>
          <input name="company_code" className="form-control" value={form.company_code || ""} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Company Email</label>
          <input name="company_email" type="email" className="form-control" value={form.company_email || ""} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Company Phone</label>
          <input name="company_phone" className="form-control" value={form.company_phone || ""} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Website</label>
          <input name="company_website" className="form-control" value={form.company_website || ""} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Tax Number</label>
          <input name="tax_number" className="form-control" value={form.tax_number || ""} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Registration Number</label>
          <input name="registration_number" className="form-control" value={form.registration_number || ""} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Zip Code</label>
          <input name="company_zipcode" className="form-control" value={form.company_zipcode || ""} onChange={handleChange} />
        </div>
      </div>

      <div className="form-group" style={{ marginTop: "20px" }}>
        <label className="form-label">Address</label>
        <textarea name="company_address" className="form-control" rows="3" value={form.company_address || ""} onChange={handleChange} />
      </div>

      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginTop: "20px" }}>
        <div className="form-group">
          <label className="form-label">City</label>
          <input name="company_city" className="form-control" value={form.company_city || ""} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">State</label>
          <input name="company_state" className="form-control" value={form.company_state || ""} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Country</label>
          <input name="company_country" className="form-control" value={form.company_country || ""} onChange={handleChange} />
        </div>
      </div>

      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
        <div className="form-group">
          <label className="form-label">Company Logo</label>
          <input type="file" accept="image/*" className="form-control" onChange={(e) => handleFile(e, "company_logo")} />
          {logoPreview && (
            <div style={{ marginTop: "8px" }}>
              <img src={logoPreview} alt="Logo" style={{ maxHeight: "60px", borderRadius: "var(--radius-sm)" }} />
            </div>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Favicon</label>
          <input type="file" accept="image/*" className="form-control" onChange={(e) => handleFile(e, "company_favicon")} />
          {faviconPreview && (
            <div style={{ marginTop: "8px" }}>
              <img src={faviconPreview} alt="Favicon" style={{ maxHeight: "40px", borderRadius: "var(--radius-sm)" }} />
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: "28px", display: "flex", gap: "12px" }}>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button type="button" className="btn-outline" onClick={loadSettings}>Reset</button>
      </div>
    </form>
  );
}

export default CompanySettings;
