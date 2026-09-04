import { useState, useEffect } from "react";
import API from "../../../api/api";
import { toast } from "react-toastify";

const timezones = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Dubai", "Asia/Kolkata",
  "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney", "Pacific/Auckland",
];

const dateFormats = ["Y-m-d", "d/m/Y", "m/d/Y", "d-m-Y", "m.d.Y"];
const timeFormats = ["H:i", "h:i A", "h:i a", "H:i:s"];
const currencies = [
  { code: "USD", symbol: "$" }, { code: "EUR", symbol: "€" }, { code: "GBP", symbol: "£" },
  { code: "INR", symbol: "₹" }, { code: "AED", symbol: "د.إ" }, { code: "SGD", symbol: "S$" },
  { code: "JPY", symbol: "¥" }, { code: "AUD", symbol: "A$" }, { code: "CAD", symbol: "C$" },
];

function GeneralSettings() {
  const [form, setForm] = useState({
    timezone: "UTC", date_format: "Y-m-d", time_format: "H:i",
    currency: "USD", currency_symbol: "$", language: "en", week_start_day: "monday",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get("/settings/company");
      const data = res.data?.data || res.data || {};
      if (data.company_name) setForm((prev) => ({ ...prev, ...data }));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCurrencyChange = (e) => {
    const selected = currencies.find((c) => c.code === e.target.value);
    setForm({ ...form, currency: e.target.value, currency_symbol: selected?.symbol || "$" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post("/settings/company", form);
      toast.success("General settings saved");
    } catch (err) { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex-center" style={{ padding: "60px 0" }}>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="form-group">
          <label className="form-label">Timezone</label>
          <select name="timezone" className="form-select" value={form.timezone} onChange={handleChange}>
            {timezones.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date Format</label>
          <select name="date_format" className="form-select" value={form.date_format} onChange={handleChange}>
            {dateFormats.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Time Format</label>
          <select name="time_format" className="form-select" value={form.time_format} onChange={handleChange}>
            {timeFormats.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Currency</label>
          <select name="currency" className="form-select" value={form.currency} onChange={handleCurrencyChange}>
            {currencies.map((c) => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Currency Symbol</label>
          <input name="currency_symbol" className="form-control" value={form.currency_symbol} onChange={handleChange} readOnly />
        </div>
        <div className="form-group">
          <label className="form-label">Language</label>
          <select name="language" className="form-select" value={form.language} onChange={handleChange}>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ar">Arabic</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Week Start Day</label>
          <select name="week_start_day" className="form-select" value={form.week_start_day} onChange={handleChange}>
            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((d) => (
              <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: "28px", display: "flex", gap: "12px" }}>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
        <button type="button" className="btn-outline" onClick={load}>Reset</button>
      </div>
    </form>
  );
}

export default GeneralSettings;
