import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import API from "../../api/api";

const TYPE_COLORS = {
  public: "#3b82f6",
  company: "#8b5cf6",
  optional: "#f59e0b",
  festival: "#ec4899",
  restricted: "#ef4444",
};

function HolidayCalendar({ onEventClick, editable = false, refreshKey = 0 }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadEvents();
  }, [refreshKey]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await API.get("/holidays/calendar");
      const data = res.data?.data || res.data || [];
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Calendar load error:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (info) => {
    const holiday = info.event.extendedProps || {};
    setSelected(holiday);
    if (onEventClick) onEventClick(holiday);
  };

  return (
    <div>
      {loading && (
        <p style={{ textAlign: "center", padding: "12px", color: "var(--text-secondary)" }}>
          Loading calendar...
        </p>
      )}
      <div className="holiday-calendar-wrap">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          editable={editable}
          selectable={false}
          eventDisplay="block"
        />
      </div>

      <div className="holiday-legend flex gap-3 mt-4" style={{ flexWrap: "wrap" }}>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <span key={type} className="flex gap-2" style={{ alignItems: "center", fontSize: "13px" }}>
            <span style={{ width: 12, height: 12, borderRadius: 4, background: color, display: "inline-block" }} />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        ))}
      </div>

      {selected?.title && (
        <div className="hrms-card mt-4">
          <div className="card-body">
            <h3 style={{ marginBottom: 8 }}>{selected.title}</h3>
            <p style={{ margin: "4px 0", color: "var(--text-secondary)" }}>
              <strong>Date:</strong> {selected.holiday_date}
            </p>
            <p style={{ margin: "4px 0" }}>
              <span className={`badge badge-${selected.type === "public" ? "info" : "purple"}`}>
                {selected.type}
              </span>
              {selected.is_optional && <span className="badge badge-warning" style={{ marginLeft: 8 }}>Optional</span>}
              {selected.is_recurring && <span className="badge badge-success" style={{ marginLeft: 8 }}>Recurring</span>}
            </p>
            {selected.description && <p style={{ marginTop: 8 }}>{selected.description}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default HolidayCalendar;
