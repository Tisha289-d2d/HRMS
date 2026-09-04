import { useEffect, useState } from "react";
import API from "../api/api";

function LeaveCounts({ refreshTrigger }) {
  const [counts, setCounts] = useState({
    paid_leave: 0,
    unpaid_leave: 0
  });

  useEffect(() => {
    loadCounts();
  }, [refreshTrigger]);

  const loadCounts = async () => {
    try {
      const res = await API.get("/leave/counts");
      setCounts(res.data || { paid_leave: 0, unpaid_leave: 0 });
    } catch (err) {
      console.error("Error loading leave counts:", err);
    }
  };

  return (
    <div className="hrms-card" style={{ marginBottom: "24px" }}>
      <div className="card-header">
        <h2>Monthly Leave Balance</h2>
      </div>
      <div className="card-body">
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "0" }}>
          <div className="stat-card" style={{ padding: "16px" }}>
            <div className="stat-icon blue">💵</div>
            <div className="stat-info">
              <h3>{counts.paid_leave} / 2</h3>
              <p>Paid Leaves Taken</p>
            </div>
          </div>
          <div className="stat-card" style={{ padding: "16px" }}>
            <div className="stat-icon yellow">🚫</div>
            <div className="stat-info">
              <h3>{counts.unpaid_leave}</h3>
              <p>Unpaid Leaves Taken</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaveCounts;
