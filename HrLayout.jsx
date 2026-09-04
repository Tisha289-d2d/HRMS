import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const navItems = [
  { to: "/hr/dashboard",   icon: "📊", label: "Dashboard" },
  { to: "/hr/employees",   icon: "👥", label: "Employees" },
  { to: "/hr/attendance",  icon: "🕐", label: "Attendance" },
  { to: "/hr/leaves",      icon: "📅", label: "Leaves" },
  { to: "/hr/holidays",    icon: "🎉", label: "Holidays" },
  { to: "/hr/performance", icon: "⭐", label: "Performance" },
  { to: "/hr/projects",   icon: "🚀", label: "Projects" },
  { to: "/hr/project-tasks", icon: "✅", label: "Project Tasks" },
  { to: "/hr/tasks",       icon: "📋", label: "Tasks" },
  { to: "/hr/recruitment", icon: "🎯", label: "Recruitment" },
  { to: "/hr/announcements", icon: "📢", label: "Announcement" },
  { to: "/hr/noticeboard",   icon: "📌", label: "Notice Board" },
  { to: "/hr/organization",  icon: "🏢", label: "Organization" },
  { to: "/hr/shifts",        icon: "⏰", label: "Shift" },
  { to: "/hr/documents",     icon: "📄", label: "Document" },
  { to: "/hr/training",      icon: "🎓", label: "Training" },
  { to: "/hr/birthdays",     icon: "🎂", label: "Birthdays" },
  { to: "/hr/birthday-wishes", icon: "💌", label: "Birthday Wishes" },
  { to: "/hr/birthday-reports", icon: "📊", label: "Birthday Reports" },
];
function HrLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "HR";

  return (
    <div className="hrms-wrapper">
      <aside className="hrms-sidebar">
        <div className="sidebar-logo">
          <h2>HR<span>MS</span></h2>
          <p>HR Manager Portal</p>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">HR Tools</div>
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
            <div className="topbar-title">Welcome, {user?.name || "HR Manager"} 👋</div>
            <div className="topbar-subtitle">Manage your team effectively</div>
          </div>
          <div className="topbar-right">
            <div className="topbar-avatar">{initials}</div>
            <div>
              <div className="topbar-user">{user?.name}</div>
              <div className="topbar-role">HR Manager</div>
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
}

export default HrLayout;