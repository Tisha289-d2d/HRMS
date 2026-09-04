import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const navItems = [
  { to: "/employee/dashboard",  icon: "📊", label: "Dashboard" },
  { to: "/employee/profile",    icon: "👤", label: "My Profile" },
  { to: "/employee/leave",      icon: "📅", label: "Apply Leave" },
  { to: "/employee/holidays",   icon: "🎉", label: "Holidays" },
  { to: "/employee/payroll",    icon: "💰", label: "Payroll" },
  { to: "/employee/performance", icon: "⭐", label: "Performance" },
  { to: "/employee/my-projects", icon: "🚀", label: "My Projects" },
  { to: "/employee/my-tasks",    icon: "✅", label: "Project Tasks" },
  { to: "/employee/tasks",       icon: "📋", label: "Tasks" },
  { to: "/employee/documents",   icon: "📄", label: "Documents" },
  { to: "/employee/announcements", icon: "📢", label: "Announcement" },
  { to: "/employee/noticeboard",   icon: "📌", label: "Notice Board" },
  { to: "/employee/organization",  icon: "🏢", label: "Organization" },
  { to: "/employee/shifts",        icon: "⏰", label: "Shift" },
  { to: "/employee/my-trainings",  icon: "🎓", label: "My Trainings" },
  { to: "/employee/my-assessments", icon: "📝", label: "Assessments" },
  { to: "/employee/my-certificates", icon: "🏅", label: "Certificates" },
  { to: "/employee/birthdays",    icon: "🎂", label: "Birthdays" },
  { to: "/employee/birthday-wishes", icon: "💌", label: "Wishes" },
];

function EmployeeLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "EM";

  return (
    <div className="hrms-wrapper">
      <aside className="hrms-sidebar">
        <div className="sidebar-logo">
          <h2>HR<span>MS</span></h2>
          <p>Employee Portal</p>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">My Workspace</div>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`sidebar-link${location.pathname === item.to ? " active" : ""}`}
            >
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
            <div className="topbar-title">Hello, {user?.name || "Employee"} 👋</div>
            <div className="topbar-subtitle">Your personal HR workspace</div>
          </div>
          <div className="topbar-right">
            <div className="topbar-avatar">{initials}</div>
            <div>
              <div className="topbar-user">{user?.name}</div>
              <div className="topbar-role">Employee</div>
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

export default EmployeeLayout;