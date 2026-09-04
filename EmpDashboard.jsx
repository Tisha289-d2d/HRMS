import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../api/api";
import TodayBirthdaysCard from "../../components/Birthday/TodayBirthdaysCard";
import UpcomingBirthdaysCard from "../../components/Birthday/UpcomingBirthdaysCard";

function EmpDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({});
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
    fetchTodayAttendance();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await API.get("/dashboard");
      setDashboard(response.data);
    } catch (error) {
      console.log("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await API.get("/attendance/today");
      const data = response.data;
      setTodayAttendance(data && data.id ? data : null);
    } catch (error) {
      console.log("Attendance Fetch Error:", error);
    }
  };

  const handleClockAction = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      if (!todayAttendance) {
        // Clock In
        const response = await API.post("/attendance/clock-in");
        const data = response.data;
        setTodayAttendance(data && data.id ? data : null);
        toast.success("Successfully clocked in today! Have a great day.");
        fetchDashboard(); 
      } else if (!todayAttendance.check_out) {
        // Clock Out
        const response = await API.post("/attendance/clock-out");
        const data = response.data;
        setTodayAttendance(data && data.id ? data : null);
        toast.success("Successfully clocked out. Thanks for your hard work!");
      }
    } catch (error) {
      console.error("Clock action error:", error);
      toast.error(error.response?.data?.message || "Failed to perform clock action.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Employee Dashboard</h1>
        </div>
      </div>

      <TodayBirthdaysCard />
      <UpcomingBirthdaysCard />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">🗓️</div>
          <div className="stat-info">
            <h3>{dashboard.attendance_summary || 0}</h3>
            <p>Days Present</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⏳</div>
          <div className="stat-info">
            <h3>{dashboard.leave_summary?.total || 0}</h3>
            <p>Total Leaves</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <h3>{dashboard.leave_summary?.approved || 0}</h3>
            <p>Approved Leaves</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">💰</div>
          <div className="stat-info">
            <h3>Rs{dashboard.recent_payroll?.net_salary || 0}</h3>
            <p>Last Salary</p>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="hrms-card">
          <div className="card-header">
            <h2>Recent Payroll Details</h2>
          </div>
          <div className="card-body" style={{ padding: '0' }}>
            <div className="hrms-table-wrap">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Basic</th>
                    <th>Bonus</th>
                    <th>Net Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recent_payroll ? (
                    <tr>
                      <td>{dashboard.recent_payroll.month}</td>
                      <td>Rs{dashboard.recent_payroll.basic_salary}</td>
                      <td>Rs{dashboard.recent_payroll.bonus || 0}</td>
                      <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                        Rs{dashboard.recent_payroll.net_salary}
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan="4" className="empty-state">No payroll records yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="hrms-card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div 
                    onClick={handleClockAction}
                    style={{ 
                        padding: '20px', 
                        background: todayAttendance?.check_out 
                            ? 'var(--bg-main)' 
                            : todayAttendance 
                                ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                                : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: todayAttendance?.check_out ? 'var(--text-muted)' : '#ffffff',
                        borderRadius: 'var(--radius)', 
                        textAlign: 'center', 
                        cursor: todayAttendance?.check_out ? 'default' : 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: todayAttendance?.check_out ? 'none' : '0 4px 15px rgba(37, 99, 235, 0.2)'
                    }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                        {todayAttendance?.check_out ? '✅' : todayAttendance ? '⏳' : '🕒'}
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '13px' }}>
                        {todayAttendance?.check_out 
                            ? 'Clocked Out' 
                            : todayAttendance 
                                ? 'Clock Out' 
                                : 'Clock In'
                        }
                    </div>
                    {todayAttendance && (
                        <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>
                            In: {todayAttendance.check_in?.substring(0, 5) || '--:--'}
                            {todayAttendance.check_out && ` | Out: ${todayAttendance.check_out.substring(0, 5)}`}
                        </div>
                    )}
                </div>
                <div 
                    onClick={() => navigate("/employee/leave")}
                    style={{ padding: '20px', background: 'var(--bg-main)', borderRadius: 'var(--radius)', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📅</div>
                    <div style={{ fontWeight: '600', fontSize: '13px' }}>Apply Leave</div>
                </div>
                <div 
                    onClick={() => navigate("/employee/profile")}
                    style={{ padding: '20px', background: 'var(--bg-main)', borderRadius: 'var(--radius)', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📄</div>
                    <div style={{ fontWeight: '600', fontSize: '13px' }}>My Profile</div>
                </div>
                <div 
                    onClick={() => toast.info("No new announcements today!")}
                    style={{ padding: '20px', background: 'var(--bg-main)', borderRadius: 'var(--radius)', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📣</div>
                    <div style={{ fontWeight: '600', fontSize: '13px' }}>Announcements</div>
                </div>
                <div 
                    onClick={() => navigate("/employee/tasks")}
                    style={{ padding: '20px', background: 'var(--bg-main)', borderRadius: 'var(--radius)', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
                    <div style={{ fontWeight: '600', fontSize: '13px' }}>My Tasks</div>
                </div>
                <div 
                    onClick={() => navigate("/employee/documents")}
                    style={{ padding: '20px', background: 'var(--bg-main)', borderRadius: 'var(--radius)', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📁</div>
                    <div style={{ fontWeight: '600', fontSize: '13px' }}>My Docs</div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmpDashboard;