import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const navItems = [
  { to: "/admin/dashboard",   icon: "📊", label: "Dashboard" },
  { to: "/admin/employees",   icon: "👥", label: "Employees" },
  { to: "/admin/attendance",  icon: "🕐", label: "Attendance" },
  { to: "/admin/leaves",      icon: "📅", label: "Leaves" },
  { to: "/admin/holidays",    icon: "🎉", label: "Holidays" },
  { to: "/admin/payroll",     icon: "💰", label: "Payroll" },
  { to: "/admin/performance", icon: "⭐", label: "Performance" },
  { to: "/admin/recruitment", icon: "🎯", label: "Recruitment" },
  { to: "/admin/projects",   icon: "🚀", label: "Projects" },
  { to: "/admin/tasks",       icon: "📋", label: "Tasks" },
  { to: "/admin/reports",     icon: "📈", label: "Reports" },
  { to: "/admin/announcements", icon: "📢", label: "Announcement" },
  { to: "/admin/noticeboard",   icon: "📌", label: "Notice Board" },
  { to: "/admin/organization",  icon: "🏢", label: "Organization" },
  { to: "/admin/shifts",        icon: "⏰", label: "Shift" },
  { to: "/admin/documents",     icon: "📄", label: "Document" },
  { to: "/admin/training",      icon: "🎓", label: "Training" },
  { to: "/admin/birthdays",     icon: "🎂", label: "Birthdays" },
  { to: "/admin/birthday-wishes", icon: "💌", label: "Birthday Wishes" },
  { to: "/admin/birthday-reports", icon: "📊", label: "Birthday Reports" },
  { to: "/admin/settings",       icon: "⚙️", label: "System Settings" },
];
const AdminLayout = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  const roleLabel = user?.role?.name || user?.role || "Administrator";

  return (
    <div className="hrms-wrapper">
      <aside className="hrms-sidebar">
        <div className="sidebar-logo">
          <h2>HR<span>MS</span></h2>
          <p>Admin Portal</p>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`sidebar-link${location.pathname === item.to ? " active" : ""}`}>
              <span className="link-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" style={{ width: "100%", justifyContent: "center" }} onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>
      <div className="hrms-main">
        <header className="hrms-topbar">
          <div>
            <div className="topbar-title">Welcome back, {user?.name || "Admin"} 👋</div>
            <div className="topbar-subtitle">Here's what's happening today</div>
          </div>
          <div className="topbar-right">
            <div className="topbar-avatar">{initials}</div>
            <div style={{ textAlign: 'right' }}>
              <div className="topbar-user">{user?.name}</div>
              <div className="topbar-role">{roleLabel}</div>
              <div style={{ fontSize: '12px', color: token ? 'var(--success)' : 'var(--danger)' }}>
                {token ? 'Authenticated' : 'Not authenticated'}
              </div>
            </div>
          </div>
        </header>
        <div className="hrms-content">
          <Outlet />
        </div>
        <footer className="hrms-footer">
          © 2026 HRMS · Built with ❤️ for your team
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;