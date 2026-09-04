import "./Sidebar.css";
import {
  FaUsers,
  FaChartBar,
  FaCog,
} from "react-icons/fa";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">HRMS</h2>
      <ul>
        <li><FaChartBar /> Dashboard</li>
        <li> <FaUsers /> Employees</li>
        <li> <FaCog /> Settings </li>
      </ul>
    </div>
  );
}

export default Sidebar;