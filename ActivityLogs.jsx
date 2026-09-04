import { useEffect, useState } from "react";
import API from "../../api/api";

function ActivityLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {loadLogs();}, []);

  const loadLogs = async () => {
    try {
      const res = await API.get("/active");
      setLogs(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h2>Activity Logs</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Activity</th>
            <th>User</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{log.activity}</td>
              <td>{log.user}</td>
              <td>{log.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ActivityLogs;