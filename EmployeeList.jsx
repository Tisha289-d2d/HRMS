import { useEffect, useState } from "react";
import API from "../../api/api";
import { Link } from "react-router-dom";

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await API.get("/employees");
      if (Array.isArray(res.data)) {
        setEmployees(res.data);
      } else if (Array.isArray(res.data.data)) {
        setEmployees(res.data.data);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.log(err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.user?.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Employee Management</h1>
          <p>View and manage all organization members</p>
        </div>
        <Link to="/admin/addemp" className="btn-primary">
          <span>+</span> Add New Employee
        </Link>
      </div>

      <div className="hrms-card">
        <div className="card-header">
          <h2>Team Members ({filteredEmployees.length})</h2>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search by name, email, role or department..." 
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
                  <th>Email</th>
                  <th>Department</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                    <tr>
                        <td colSpan="4" className="text-center" style={{ padding: '40px' }}>
                            <p style={{ color: 'var(--text-muted)' }}>Loading employees...</p>
                        </td>
                    </tr>
                ) : filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <div className="emp-name">
                          <div className="emp-avatar">
                            {emp.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '600' }}>{emp.user?.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{emp.designation}</span>
                          </div>
                        </div>
                      </td>
                      <td>{emp.user?.email}</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {emp.departments && emp.departments.length > 0 ? (
                            emp.departments.map(d => (
                              <span key={d.id} className="badge badge-gray">{d.name}</span>
                            ))
                          ) : (
                            <span className="badge badge-gray" style={{ opacity: 0.5 }}>Unassigned</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${emp.user?.role?.toLowerCase() === 'admin' ? 'badge-danger' : emp.user?.role?.toLowerCase() === 'hr' ? 'badge-purple' : 'badge-info'}`}>
                          {emp.user?.role}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-state">
                      <div style={{ fontSize: '32px', marginBottom: '12px' }}>👥</div>
                      <h3>No employees found</h3>
                      <p>Try adjusting your search or add a new employee.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeList;