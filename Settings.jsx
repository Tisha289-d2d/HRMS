import { useState } from "react";
import CompanySettings from "./CompanySettings";
import GeneralSettings from "./GeneralSettings";
import EmailSettings from "./EmailSettings";
import NotificationSettings from "./NotificationSettings";
import AttendanceSettings from "./AttendanceSettings";
import LeaveSettings from "./LeaveSettings";
import PayrollSettings from "./PayrollSettings";
import SecuritySettings from "./SecuritySettings";
import AppearanceSettings from "./AppearanceSettings";
import BackupSettings from "./BackupSettings";

const tabs = [
  { key: "company", label: "Company", icon: "🏢" },
  { key: "general", label: "General", icon: "⚙️" },
  { key: "email", label: "Email", icon: "📧" },
  { key: "notification", label: "Notifications", icon: "🔔" },
  { key: "attendance", label: "Attendance", icon: "🕐" },
  { key: "leave", label: "Leave", icon: "📅" },
  { key: "payroll", label: "Payroll", icon: "💰" },
  { key: "security", label: "Security", icon: "🔒" },
  { key: "appearance", label: "Appearance", icon: "🎨" },
  { key: "backup", label: "Backup", icon: "💾" },
];

const components = {
  company: CompanySettings,
  general: GeneralSettings,
  email: EmailSettings,
  notification: NotificationSettings,
  attendance: AttendanceSettings,
  leave: LeaveSettings,
  payroll: PayrollSettings,
  security: SecuritySettings,
  appearance: AppearanceSettings,
  backup: BackupSettings,
};

function Settings() {
  const [activeTab, setActiveTab] = useState("company");
  const ActiveComponent = components[activeTab];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>System Settings</h1>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            Configure and manage your system settings
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "24px" }}>
        <div
          style={{
            width: "240px",
            flexShrink: 0,
            background: "var(--bg-card)",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            padding: "8px",
            height: "fit-content",
            position: "sticky",
            top: "100px",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: "10px 14px",
                border: "none",
                borderRadius: "var(--radius-sm)",
                background: activeTab === tab.key ? "var(--primary)" : "transparent",
                color: activeTab === tab.key ? "#fff" : "var(--text-primary)",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: activeTab === tab.key ? "600" : "400",
                textAlign: "left",
                transition: "var(--transition)",
                marginBottom: "2px",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="hrms-card">
            <div
              style={{
                padding: "28px 32px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "24px" }}>{tabs.find((t) => t.key === activeTab)?.icon}</span>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px" }}>
                  {tabs.find((t) => t.key === activeTab)?.label} Settings
                </h2>
              </div>
            </div>
            <div className="card-body" style={{ padding: "28px 32px" }}>
              <ActiveComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
