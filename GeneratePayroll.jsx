import { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

function GeneratePayroll() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [existingPayroll, setExistingPayroll] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);

  const [formData, setFormData] = useState({
    employee_id: "",
    basic_salary: "",
    bonus: "0",
    deduction: "0",
    month: "",
    year: new Date().getFullYear().toString(),
  });

  const [leaveCounts, setLeaveCounts] = useState({
    paid_leave: 0,
    sick_leave: 0,
    unpaid_leave: 0
  });

  useEffect(() => {
    loadEmployees();
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentMonth = months[new Date().getMonth()];
    const currentYear = new Date().getFullYear().toString();
    setFormData((prev) => ({
      ...prev,
      month: currentMonth,
      year: currentYear,
    }));
  }, []);

  const fetchLeaveCounts = async (employeeId, month, year) => {
    if (!employeeId || !month || !year) return;
    try {
      const res = await API.get(`/leave/counts?employee_id=${employeeId}&month=${month}&year=${year}&status=approved`);
      const counts = res.data || { paid_leave: 0, sick_leave: 0, unpaid_leave: 0 };
      setLeaveCounts(counts);
    } catch (err) {
      console.error("Error fetching leave counts for payroll preview:", err);
    }
  };

  useEffect(() => {
    if (formData.employee_id && formData.month && formData.year) {
      fetchLeaveCounts(formData.employee_id, formData.month, formData.year);
    } else {
      setLeaveCounts({ paid_leave: 0, sick_leave: 0, unpaid_leave: 0 });
    }
  }, [formData.employee_id, formData.month, formData.year]);

  const loadEmployees = async () => {
    try {
      const res = await API.get("/employees");

      if (Array.isArray(res.data)) {
        setEmployees(res.data);
      } else if (Array.isArray(res.data.data)) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const checkExistingPayroll = async (employeeId, month, year) => {
    if (!employeeId || !month || !year) return;
    try {
      const res = await API.get(`/payrolls?employee_id=${employeeId}&month=${month}&year=${year}`);
      const data = res.data.data || res.data;
      if (Array.isArray(data) && data.length > 0) {
        setExistingPayroll(data[0]);
        setIsEditMode(true);
        setFormData(prev => ({
          ...prev,
          basic_salary: data[0].basic_salary?.toString() || prev.basic_salary,
          bonus: data[0].bonus?.toString() || prev.bonus || "0",
          deduction: data[0].deduction?.toString() || prev.deduction || "0",
        }));
      } else {
        setExistingPayroll(null);
        setIsEditMode(false);
      }
    } catch (err) {
      console.error("Error checking existing payroll:", err);
      setExistingPayroll(null);
      setIsEditMode(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if ((name === "month" || name === "year") && formData.employee_id) {
      const newMonth = name === "month" ? value : formData.month;
      const newYear = name === "year" ? value : formData.year;
      if (newMonth && newYear) {
        checkExistingPayroll(formData.employee_id, newMonth, newYear);
      }
    }
  };

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    const selectedEmp = employees.find((emp) => String(emp.id) === String(empId));
    
    setFormData({
      ...formData,
      employee_id: empId,
      basic_salary: selectedEmp ? selectedEmp.salary.toString() : "",
    });
    
    if (empId && formData.month && formData.year) {
      checkExistingPayroll(empId, formData.month, formData.year);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employee_id) {
      alert("Please select an employee");
      return;
    }

    try {
      const payload = {
        employee_id: formData.employee_id,
        basic_salary: Number(formData.basic_salary),
        bonus: Number(formData.bonus || 0),
        deduction: Number(formData.deduction || 0),
        month: formData.month,
        year: Number(formData.year),
      };

      if (isEditMode && existingPayroll) {
        await API.put(`/payrolls/${existingPayroll.id}`, payload);
        alert("Payroll Updated Successfully");
      } else {
        await API.post("/payrolls", payload);
        alert("Payroll Generated Successfully");
      }

      navigate("/admin/payroll");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Error processing payroll");
    }
  };

  const handleGenerateAll = async () => {
    if (!window.confirm(`Generate payroll for all employees for ${formData.month} ${formData.year}?`)) return;
    setGeneratingAll(true);
    try {
      const res = await API.post("/payrolls/generate-monthly", {
        month: formData.month,
        year: Number(formData.year),
      });
      alert(`Payroll generated: ${res.data.created} created, ${res.data.updated} updated`);
      navigate("/admin/payroll");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Error generating monthly payroll");
    } finally {
      setGeneratingAll(false);
    }
  };

  const resetForm = () => {
    setIsEditMode(false);
    setExistingPayroll(null);
    setFormData({
      employee_id: "",
      basic_salary: "",
      bonus: "0",
      deduction: "0",
      month: formData.month,
      year: formData.year,
    });
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">
            {isEditMode ? "Update Payroll" : "Generate Payroll"}
            {isEditMode && existingPayroll && (
              <button 
                type="button" 
                className="btn btn-sm btn-outline-light float-end"
                onClick={resetForm}
              >
                Create New
              </button>
            )}
          </h3>
        </div>

<div className="card-body">
           {isEditMode && existingPayroll && (
             <div className="alert alert-info mb-3">
               <strong>Existing Payroll Found:</strong> Editing payroll for {existingPayroll.employee?.user?.name || 'this employee'}. 
               Status: <span className="badge badge-warning">{existingPayroll.status}</span>
             </div>
           )}
          
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Generate Payroll for {formData.month} {formData.year}</h5>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGenerateAll}
              disabled={generatingAll}
            >
              {generatingAll ? "Generating..." : "Generate for All Employees"}
            </button>
          </div>
          
          <hr className="my-4" />
          
          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <label className="form-label fw-bold">Employee</label>

              <select
                className="form-control"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleEmployeeChange}
                required>
                <option value="">Select Employee</option>

                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.user?.name || emp.name || `Employee #${emp.id}`} {emp.designation ? `(${emp.designation})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Basic Salary</label>

              <input
                type="number"
                className="form-control"
                name="basic_salary"
                value={formData.basic_salary}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Bonus</label>

              <input
                type="number"
                className="form-control"
                name="bonus"
                value={formData.bonus}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Deduction</label>

              <input
                type="number"
                className="form-control"
                name="deduction"
                value={formData.deduction}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Month</label>

              <input
                type="text"
                className="form-control"
                name="month"
                placeholder="April"
                value={formData.month}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Year</label>

              <input
                type="number"
                className="form-control"
                name="year"
                placeholder="2026"
                value={formData.year}
                onChange={handleChange}
                required
              />
            </div>

            {formData.employee_id && (
              <div className="card bg-light border-info mb-4" style={{ backgroundColor: "#f0fdf4", borderColor: "#86efac", borderRadius: "8px", border: "1px solid #86efac", padding: "16px" }}>
                <div className="card-body" style={{ padding: "0" }}>
                  <h5 className="card-title mb-3" style={{ color: "#166534", fontWeight: "600", fontSize: "15px" }}>Approved Leaves Preview ({formData.month} {formData.year})</h5>
                  <div className="row" style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                    <div className="col" style={{ flex: "1", minWidth: "120px" }}>
                      <strong style={{ color: "var(--text-primary)" }}>Paid Leaves:</strong> <span style={{ color: "#15803d", fontWeight: "600" }}>{leaveCounts.paid_leave} / 2</span>
                    </div>
                    <div className="col" style={{ flex: "1", minWidth: "120px" }}>
                      <strong style={{ color: "var(--text-primary)" }}>Sick Leaves:</strong> <span style={{ color: "#15803d", fontWeight: "600" }}>{leaveCounts.sick_leave} / 5</span>
                    </div>
                    <div className="col" style={{ flex: "1", minWidth: "120px" }}>
                      <strong style={{ color: "var(--text-primary)" }}>Unpaid Leaves:</strong> <span style={{ color: "#b91c1c", fontWeight: "600" }}>{leaveCounts.unpaid_leave}</span>
                    </div>
                    <div className="col" style={{ flex: "1", minWidth: "180px" }}>
                      <strong style={{ color: "var(--text-primary)" }}>Auto Unpaid Deduction:</strong> <span style={{ color: "#b91c1c", fontWeight: "700" }}>${((Number(formData.basic_salary || 0) / 30) * (leaveCounts.unpaid_leave || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                  <small style={{ color: "var(--text-muted)", display: "block", marginTop: "12px", fontSize: "12px" }}>
                    The unpaid leave deduction is calculated automatically on submission as: (Basic Salary / 30) * Unpaid Leave Days.
                  </small>
                </div>
              </div>
            )}

            <button className="btn btn-success w-100 py-2">
              {isEditMode ? "Update Payroll" : "Generate Payroll"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default GeneratePayroll;