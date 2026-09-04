import { useState, useEffect } from "react";
import API from "../../../api/api";
import { toast } from "react-toastify";

function PayrollSettings() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get("/settings/payroll");
      setForm(res.data?.data || res.data || {});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put("/settings/payroll", form);
      toast.success("Payroll settings saved");
    } catch (err) { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex-center" style={{ padding: "60px 0" }}>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="form-group">
          <label className="form-label">Salary Cycle</label>
          <select name="salary_cycle" className="form-select" value={form.salary_cycle || "monthly"} onChange={handleChange}>
            <option value="monthly">Monthly</option>
            <option value="bi-weekly">Bi-Weekly</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Payroll Generation Day</label>
          <input name="payroll_generation_day" type="number" min="1" max="31" className="form-control" value={form.payroll_generation_day ?? 1} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Tax (%)</label>
          <input name="tax_percentage" type="number" step="0.01" min="0" max="100" className="form-control" value={form.tax_percentage ?? 0} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">PF (%)</label>
          <input name="pf_percentage" type="number" step="0.01" min="0" max="100" className="form-control" value={form.pf_percentage ?? 12} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">ESI (%)</label>
          <input name="esi_percentage" type="number" step="0.01" min="0" max="100" className="form-control" value={form.esi_percentage ?? 0.75} onChange={handleChange} />
        </div>
      </div>

      <div style={{ marginTop: "28px", display: "flex", gap: "12px" }}>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
        <button type="button" className="btn-outline" onClick={load}>Reset</button>
      </div>
    </form>
  );
}

export default PayrollSettings;
