import { useEffect, useState, useContext } from "react";
import API from "../../api/api";
import { AuthContext } from "../../context/AuthContext";

function Payroll() {
  const { user } = useContext(AuthContext);

  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  const isAdminOrHR = user?.role === "admin" || user?.role === "hr";

  const numberToWords = (num) => {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convert = (n) => {
      if (n < 20) return a[n];
      const digit = n % 10;
      if (n < 100) return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
      if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
      return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
    };

    if (num === 0) return 'Zero';
    return convert(num);
  };

  useEffect(() => {
    if (isAdminOrHR) {
      fetchEmployees();
    }
    fetchPayrolls();
  }, [user, selectedEmployeeId]);

  const fetchEmployees = async () => {
    try {
      const res = await API.get("/employees");
      const data = res.data.data || res.data;
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Error fetching employees:", err);
    }
  };

  const fetchPayrolls = async () => {
    try {
      setLoading(true);

      let endpoint = isAdminOrHR
        ? selectedEmployeeId
          ? `/payrolls?employee_id=${selectedEmployeeId}`
          : "/payrolls"
        : "/payrolls/me";

      const res = await API.get(endpoint);
      const allPayrolls = res.data.data || res.data || [];
      setPayrolls(Array.isArray(allPayrolls) ? allPayrolls : []);
    } catch (err) {
      console.log(err);
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h3>Loading payroll...</h3>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="page-header">
        <div>
          <h1>{isAdminOrHR ? "Payroll Management" : "My Payroll"}</h1>
          <p>{isAdminOrHR ? "Browse and manage staff salary history" : "View your salary history"}</p>
        </div>
      </div>

      {isAdminOrHR && (
        <div className="hrms-card mb-4" style={{ marginBottom: '24px' }}>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontWeight: '600', minWidth: '140px' }}>Select Employee:</label>
              <select 
                className="form-control" 
                value={selectedEmployeeId} 
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                style={{ maxWidth: '300px' }}>
                <option value="">My Own Payroll</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.user?.name} (ID: {emp.id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="hrms-card">
        <div className="card-header">
          <h2>Salary History</h2>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="hrms-table-wrap">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Month/Year</th>
                  <th>Basic Salary</th>
                  <th>Bonus</th>
                  <th>Deduction</th>
                  <th>Leaves Taken</th>
                  <th>Net Salary</th>
                  <th>Bank Details</th>
                  <th>Status</th>
                  <th>Payslip</th>
                </tr>
              </thead>

              <tbody>
                {payrolls.length > 0 ? (
                  payrolls.map((payroll) => {
                    const bankName = payroll.bank_name || payroll.employee?.bank_name;
                    const accountNumber = payroll.account_number || payroll.employee?.account_number;
                    const ifscCode = payroll.ifsc_code || payroll.employee?.ifsc_code;
                    const branchName = payroll.branch_name || payroll.employee?.branch_name;

                    return (
                      <tr key={payroll.id}>
                        <td>
                          {payroll.month} {payroll.year}
                        </td>

                        <td>
                          Rs{" "}
                          {Number(
                            payroll.basic_salary
                          ).toLocaleString()}
                        </td>

                        <td>
                          Rs{" "}
                          {Number(
                            payroll.bonus || 0
                          ).toLocaleString()}
                        </td>

                        <td>
                          Rs{" "}
                          {Number(
                            payroll.deduction || 0
                          ).toLocaleString()}
                        </td>

                        <td style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          <div>P: {payroll.paid_leaves_count ?? payroll.paid_leaves ?? payroll.paid_leaves_this_month ?? 0}</div>
                          <div>S: {payroll.sick_leaves_count ?? payroll.sick_leaves ?? payroll.sick_leaves_this_month ?? 0}</div>
                          <div>U: {payroll.unpaid_leaves_count ?? payroll.unpaid_leaves ?? payroll.unpaid_leaves_this_month ?? 0}</div>
                        </td>

                        <td>
                          <strong>
                            Rs{" "}
                            {Number(
                              payroll.net_salary
                            ).toLocaleString()}
                          </strong>
                        </td>

                        <td>
                          {bankName ? (
                            <div>
                              <div style={{ fontWeight: "600", fontSize: "13px" }}>{bankName}</div>
                              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                A/C: {accountNumber}
                              </div>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                IFSC: {ifscCode} {branchName ? `(${branchName})` : ""}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted small" style={{ fontSize: "12px", fontStyle: "italic", color: "var(--text-muted)" }}>
                              Not Provided
                            </span>
                          )}
                        </td>

                        <td>
                          {payroll.status === "Paid" ? (
                            <span className="badge badge-success">Paid</span>
                          ) : (
                            <span className="badge badge-warning">Unpaid</span>
                          )}
                        </td>

                        <td>
                          {payroll.status === "Paid" ? (
                            <button
                              onClick={() => setSelectedPayroll(payroll)}
                              className="btn-primary"
                              style={{
                                padding: "4px 10px",
                                fontSize: "12px",
                                gap: "4px",
                                borderRadius: "6px"
                              }}
                            >
                              📄 Payslip
                            </button>
                          ) : (
                            <span className="text-muted small" style={{ fontSize: "12px", fontStyle: "italic", color: "var(--text-muted)" }}>
                              Pending Payment
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="empty-state"
                    >
                      No payroll records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedPayroll && (
        <div
          className="payslip-modal-overlay no-print"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setSelectedPayroll(null)}>
          <div
            className="payslip-modal-content hrms-card"
            style={{
              width: '100%',
              maxWidth: '800px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
              animation: 'modalFadeIn 0.3s ease'
            }}
            onClick={(e) => e.stopPropagation()}>
            <div
              className="card-header"
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-main)'
              }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📄</span> Payslip Details
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => window.print()}
                  className="btn-primary"
                  style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '8px', gap: '4px' }}>
                  <span>🖨️</span> Print Payslip
                </button>
                <button
                  onClick={() => setSelectedPayroll(null)}
                  className="btn-ghost"
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)'
                  }}>
                  Close
                </button>
              </div>
            </div>

            <div
              id="print-payslip-area"
              style={{
                padding: '40px',
                overflowY: 'auto',
                flex: 1,
                backgroundColor: '#ffffff',
                color: '#1e293b'
              }}>

              <style>{`
                @keyframes modalFadeIn {
                  from { opacity: 0; transform: scale(0.95); }
                  to { opacity: 1; transform: scale(1); }
                }
                @media print {
                  body * {
                    visibility: hidden !important;
                  }
                  #print-payslip-area, #print-payslip-area * {
                    visibility: visible !important;
                  }
                  #print-payslip-area {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    box-shadow: none !important;
                    border: none !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    background: white !important;
                  }
                }
              `}</style>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '24px' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                    PAYSLIP
                  </h1>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>HR & Payroll System</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-success" style={{ fontSize: '12px', fontWeight: '700', padding: '4px 10px', textTransform: 'uppercase' }}>
                    {selectedPayroll.status}
                  </span>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: '8px', padding: '12px 18px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Salary Month & Year</span>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '2px 0 0 0' }}>
                    {selectedPayroll.month.charAt(0).toUpperCase() + selectedPayroll.month.slice(1)} {selectedPayroll.year}
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Slip Number</span>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', margin: '2px 0 0 0' }}>
                    #PAY-{selectedPayroll.id}-{selectedPayroll.year}{selectedPayroll.month.substring(0,3).toUpperCase()}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '28px' }}>

                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                    Employee Details
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', rowGap: '6px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Name:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedPayroll.employee?.user?.name || user?.name}</strong>

                    <span style={{ color: 'var(--text-secondary)' }}>Emp ID:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{selectedPayroll.employee_id}</span>

                    <span style={{ color: 'var(--text-secondary)' }}>Designation:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{selectedPayroll.employee?.designation || 'Staff'}</span>

                    <span style={{ color: 'var(--text-secondary)' }}>Joining Date:</span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {selectedPayroll.employee?.joining_date ? new Date(selectedPayroll.employee.joining_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                    Payment Method & Bank
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', rowGap: '6px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Bank Name:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedPayroll.bank_name || selectedPayroll.employee?.bank_name || 'N/A'}</strong>

                    <span style={{ color: 'var(--text-secondary)' }}>Account No:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{selectedPayroll.account_number || selectedPayroll.employee?.account_number || 'N/A'}</span>

                    <span style={{ color: 'var(--text-secondary)' }}>IFSC Code:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{selectedPayroll.ifsc_code || selectedPayroll.employee?.ifsc_code || 'N/A'}</span>

                    <span style={{ color: 'var(--text-secondary)' }}>Branch Name:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{selectedPayroll.branch_name || selectedPayroll.employee?.branch_name || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '28px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '11px', width: '50%', borderRight: '1px solid #e2e8f0' }}>Earnings</th>
                      <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '11px', width: '50%' }}>Deductions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                      <td style={{ padding: '16px', borderRight: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span>Basic Salary</span>
                          <strong>Rs {Number(selectedPayroll.basic_salary).toLocaleString()}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Allowance / Bonus</span>
                          <strong>Rs {Number(selectedPayroll.bonus || 0).toLocaleString()}</strong>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span>General Deductions</span>
                          <strong style={{ color: 'var(--danger)' }}>Rs {Number(selectedPayroll.deduction || 0).toLocaleString()}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Leave Deduction ({(selectedPayroll.unpaid_leaves_count ?? selectedPayroll.unpaid_leaves ?? selectedPayroll.unpaid_leaves_this_month) || 0} unpaid days)</span>
                          <strong style={{ color: 'var(--danger)' }}>Rs {Number(selectedPayroll.leave_deduction || 0).toLocaleString()}</strong>
                        </div>
                      </td>
                    </tr>
                    <tr style={{ background: '#f8fafc', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px 16px', borderRight: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Total Earnings (Gross)</span>
                          <span>Rs {Number(Number(selectedPayroll.basic_salary) + Number(selectedPayroll.bonus || 0)).toLocaleString()}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Total Deductions</span>
                          <span style={{ color: 'var(--danger)' }}>Rs {Number(Number(selectedPayroll.deduction || 0) + Number(selectedPayroll.leave_deduction || 0)).toLocaleString()}</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

                <p>
                  Paid Leaves:
                  {selectedPayroll.paid_leaves_count}
                </p>

                <p>
                  Sick Leaves:
                  {selectedPayroll.sick_leaves_count}
                </p>

                <p>
                  Unpaid Leaves:
                  {selectedPayroll.unpaid_leaves_count}
                </p>

                <p>
                  Leave Deduction:
                  ₹{selectedPayroll.leave_deduction}
                </p>

                <h3>
                  Net Salary:
                  ₹{selectedPayroll.net_salary}
                </h3>

              <div style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, #e0e7ff 100%)', borderRadius: '12px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--primary-dark)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Salary Payable</span>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Rupees {numberToWords(Number(selectedPayroll.net_salary))} Only</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary-dark)', margin: 0 }}>
                    Rs {Number(selectedPayroll.net_salary).toLocaleString()}
                  </h2>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div style={{ textAlign: 'center', width: '260px' }}>
                  <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '6px', fontFamily: 'monospace, sans-serif', fontSize: '13px', color: '#0f172a', fontWeight: '600' }}>
                    {selectedPayroll.hr_signature || "Approved by HR"}
                  </div>
                  <strong style={{ display: 'block', color: 'var(--text-primary)' }}>HR Verification</strong>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Digital Signature Stamped</span>
                </div>
                <div style={{ textAlign: 'center', width: '260px' }}>
                  <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '6px', fontFamily: 'monospace, sans-serif', fontSize: '13px', color: selectedPayroll.admin_signature?.includes('Approved') ? '#10b981' : '#f59e0b', fontWeight: '600' }}>
                    {selectedPayroll.admin_signature || "Pending"}
                  </div>
                  <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Admin Final Approval</strong>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Digital Signature Stamped</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px dashed #cbd5e1', paddingTop: '15px' }}>
                This is a computer-generated payslip and does not require a physical signature.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payroll;