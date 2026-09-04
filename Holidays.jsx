import { useEffect, useState } from "react";
import API from "../../api/api";
import { toast } from "react-toastify";
import Loader from "../../components/loaders/loader";
import HolidayCalendar from "../../components/holidays/HolidayCalendar";

const TYPE_BADGE = {
  public: "badge-info",
  company: "badge-purple",
  optional: "badge-warning",
  festival: "badge-success",
  restricted: "badge-danger",
};

function EmployeeHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [showOptionalOnly, setShowOptionalOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");

  useEffect(() => {
    loadHolidays();
  }, [filterType, showOptionalOnly]);

  const loadHolidays = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (showOptionalOnly) params.is_optional = true;

      const [listRes, upcomingRes] = await Promise.all([
        API.get("/holidays", { params }),
        API.get("/holidays/upcoming", { params: { limit: 8 } }),
      ]);

      const list = listRes.data?.data || listRes.data || [];
      setHolidays(Array.isArray(list) ? list : []);
      setUpcoming(upcomingRes.data?.data || upcomingRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load holidays");
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    const headers = ["Title", "Date", "Type", "Description"];
    const rows = holidays.map((h) => [
      h.title,
      h.holiday_date,
      h.type,
      (h.description || "").replace(/,/g, ";"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "company-holidays.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Company Holidays</h1>
          <p>View calendar, upcoming days off, and optional holidays</p>
        </div>
        <button type="button" className="btn-outline" onClick={exportCsv}>
          Download list
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">🎉</div>
          <div className="stat-info">
            <h3>{holidays.length}</h3>
            <p>Visible holidays</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📅</div>
          <div className="stat-info">
            <h3>{upcoming.length}</h3>
            <p>Coming up soon</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⭐</div>
          <div className="stat-info">
            <h3>{holidays.filter((h) => h.is_optional).length}</h3>
            <p>Optional holidays</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button type="button" className={activeTab === "calendar" ? "btn-primary" : "btn-ghost"} onClick={() => setActiveTab("calendar")}>
          Calendar
        </button>
        <button type="button" className={activeTab === "list" ? "btn-primary" : "btn-ghost"} onClick={() => setActiveTab("list")}>
          List
        </button>
      </div>

      <div className="hrms-card mb-4">
        <div className="card-body flex gap-3" style={{ flexWrap: "wrap", alignItems: "center" }}>
          <select className="form-control" value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ maxWidth: 160 }}>
            <option value="">All types</option>
            {["public", "company", "optional", "festival", "restricted"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <label className="flex gap-2" style={{ alignItems: "center" }}>
            <input type="checkbox" checked={showOptionalOnly} onChange={(e) => setShowOptionalOnly(e.target.checked)} />
            Optional only
          </label>
        </div>
      </div>

      {activeTab === "calendar" ? (
        <div className="hrms-card">
          <div className="card-header"><h2>Holiday Calendar</h2></div>
          <div className="card-body">
            <HolidayCalendar />
          </div>
        </div>
      ) : (
        <div className="hrms-card">
          <div className="card-header"><h2>Holiday List</h2></div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="hrms-table-wrap">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Holiday</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.length > 0 ? (
                    holidays.map((h) => (
                      <tr key={h.id}>
                        <td style={{ fontWeight: 600 }}>{h.title}</td>
                        <td>{h.holiday_date}</td>
                        <td><span className={`badge ${TYPE_BADGE[h.type] || "badge-gray"}`}>{h.type}</span></td>
                        <td>{h.description || "—"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="empty-state">No holidays match your filters</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="hrms-card mt-4">
          <div className="card-header"><h2>Upcoming</h2></div>
          <div className="card-body">
            <div className="grid-2">
              {upcoming.map((h) => (
                <div key={h.id} className="stat-card" style={{ margin: 0 }}>
                  <div className="stat-icon green">📌</div>
                  <div className="stat-info">
                    <h3 style={{ fontSize: "1rem" }}>{h.title}</h3>
                    <p>{h.holiday_date} · {h.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeHolidays;
