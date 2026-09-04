import { useState, useEffect } from "react";
import API from "../../api/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function AddEmployee() {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    joining_date: new Date().toISOString().split('T')[0],
    salary: "",
    role: "employee",
    department_ids: [],
    gender: "",
    dob: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    branch_name: "",
  });

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await API.get("/departments");
      const data = res.data.data || res.data;
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch departments", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await API.get("/employees");
      const data = res.data.data || res.data;
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };

  const handleEdit = (emp) => {
    setEditingId(emp.id);
    setForm({
      name: emp.user?.name || "",
      email: emp.user?.email || "",
      phone: emp.user?.phone || "",
      designation: emp.designation || "",
      joining_date: emp.joining_date || new Date().toISOString().split('T')[0],
      salary: emp.salary || "",
      role: emp.user?.role || "employee",
      department_ids: emp.departments ? emp.departments.map(d => d.id) : [],
      gender: emp.gender || "",
      dob: emp.dob || "",
      bank_name: emp.bank_name || "",
      account_number: emp.account_number || "",
      ifsc_code: emp.ifsc_code || "",
      branch_name: emp.branch_name || "",
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await API.delete(`/employees/${id}`);
      toast.success("Employee deleted successfully");
      fetchEmployees();
    } catch (err) {
      toast.error("Failed to delete employee");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await API.put(`/employees/${editingId}`, form);
        toast.success("Employee updated successfully!");
      } else {
        await API.post("/employees", form);
        toast.success("Employee created successfully!");
      }
      fetchEmployees();
      resetForm();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.errors || {})[0]?.[0] ||
        "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      designation: "",
      joining_date: new Date().toISOString().split('T')[0],
      salary: "",
      role: "employee",
      department_ids: [],
      gender: "",
      dob: "",
      bank_name: "",
      account_number: "",
      ifsc_code: "",
      branch_name: "",
    });
  };

  const handleMultiSelectChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setForm({ ...form, department_ids: value });
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1>{editingId ? "Update Member" : "Add New Member"}</h1>
          <p>{editingId ? "Modify existing organizational member details" : "Register a new user and assign roles within the organization"}</p>
        </div>
        <Link to="/admin/employees" className="btn-outline">
          Back to Directory
        </Link>
      </div>

      <div className="hrms-card">
        <div className="card-header">
          <h2>{editingId ? "Edit Details" : "Onboarding Form"}</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-control"
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="e.g. john@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">System Role</label>
                <select 
                  className="form-control"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="employee">Employee (Staff)</option>
                  <option value="hr">HR Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Departments (Hold Ctrl to select multiple)</label>
                <select 
                  multiple
                  className="form-control"
                  style={{ height: '120px' }}
                  value={form.department_ids}
                  onChange={handleMultiSelectChange}
                >
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                <p className="form-help" style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Selected: {form.department_ids.length} departments
                </p>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Designation / Position</label>
                <input
                  className="form-control"
                  placeholder="e.g. Senior Software Engineer"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Salary (Rs)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 50000"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Joining Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.joining_date}
                  onChange={(e) => setForm({ ...form, joining_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (Optional)</label>
                <input
                  className="form-control"
                  placeholder="e.g. +1 234..."
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select 
                  className="form-control"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  required
                />
              </div>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid var(--border)', margin: '32px 0 24px' }} />
            
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--primary)' }}>Bank Account Details</h3>
            
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Bank Name</label>
                <input
                  className="form-control"
                  placeholder="e.g. State Bank of India"
                  value={form.bank_name}
                  onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Number</label>
                <input
                  className="form-control"
                  placeholder="e.g. 1234567890"
                  value={form.account_number}
                  onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">IFSC Code / Routing Number</label>
                <input
                  className="form-control"
                  placeholder="e.g. SBIN0001234"
                  value={form.ifsc_code}
                  onChange={(e) => setForm({ ...form, ifsc_code: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Branch Name</label>
                <input
                  className="form-control"
                  placeholder="e.g. Main Branch"
                  value={form.branch_name}
                  onChange={(e) => setForm({ ...form, branch_name: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn-ghost" onClick={resetForm}>
                {editingId ? "Cancel Edit" : "Clear Fields"}
              </button>
              <button className="btn-primary" disabled={loading} style={{ minWidth: '180px', justifyContent: 'center' }}>
                {loading ? "Processing..." : (editingId ? "Save Changes" : "Register Member")}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="hrms-card" style={{ marginTop: '32px' }}>
        <div className="card-header">
          <h2>Member Directory</h2>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Filter by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="card-body" style={{ padding: '0' }}>
          <div className="hrms-table-wrap">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Departments</th>
                  <th>Salary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.filter(e => e.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div className="emp-name">
                        <div className="emp-avatar">{emp.user?.name?.charAt(0)}</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600' }}>{emp.user?.name}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{emp.designation}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${emp.user?.role === 'admin' ? 'badge-danger' : emp.user?.role === 'hr' ? 'badge-purple' : 'badge-info'}`}>
                        {emp.user?.role}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {emp.departments?.map(d => (
                          <span key={d.id} className="badge badge-gray">{d.name}</span>
                        )) || <span className="text-muted small">None</span>}
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', fontWeight: '600' }}>₹{emp.salary}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleEdit(emp)}
                          className="btn-ghost" 
                          style={{ color: 'var(--primary)', padding: '4px 8px' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(emp.id)}
                          className="btn-ghost" 
                          style={{ color: 'var(--danger)', padding: '4px 8px' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddEmployee;