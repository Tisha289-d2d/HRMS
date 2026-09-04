import { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate, useLocation } from "react-router-dom";

function AddReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHr = location.pathname.startsWith("/hr");
  const basePath = isHr ? "/hr" : "/admin";

  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    employee_id: "",
    review_date: "",
    rating: "",
    feedback: "",
    goals: "",
    status: "",
  });

  useEffect(() => {loadEmployees();}, []);

  const loadEmployees = async () => {
    try {
      const res = await API.get("/employees");

      if (Array.isArray(res.data)) {
        setEmployees(res.data);
      } else if (Array.isArray(res.data.data)) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const reviewText = `Feedback: ${formData.feedback}\nGoals: ${formData.goals}\nStatus: ${formData.status}`;
      
      const payload = {
        employee_id: formData.employee_id,
        rating: formData.rating,
        review: reviewText
      };

      await API.post("/performances", payload);

      alert("Performance Review Added Successfully");

      navigate(`${basePath}/performance`);
    } catch (err) {
      console.log(err);
      alert("Error adding review");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header">
          <h3>Add Performance Review</h3>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <label>Employee</label>

              <select
                className="form-control"
                name="employee_id"
                onChange={handleChange}
                required
              >
                <option value="">Select Employee</option>

                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.user?.name} (ID: {emp.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label>Review Date</label>

              <input
                type="date"
                className="form-control"
                name="review_date"
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label>Rating</label>

              <select
                className="form-control"
                name="rating"
                onChange={handleChange}
                required
              >
                <option value="">Select Rating</option>
                <option value="1">1 Star</option>
                <option value="2">2 Star</option>
                <option value="3">3 Star</option>
                <option value="4">4 Star</option>
                <option value="5">5 Star</option>
              </select>
            </div>

            <div className="mb-3">
              <label>Feedback</label>

              <textarea
                className="form-control"
                rows="4"
                name="feedback"
                placeholder="Enter feedback..."
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label>Goals / Improvements</label>

              <textarea
                className="form-control"
                rows="4"
                name="goals"
                placeholder="Enter goals..."
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="mb-3">
              <label>Status</label>

              <select
                className="form-control"
                name="status"
                onChange={handleChange}
                required
              >
                <option value="">Select Status</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Average">Average</option>
                <option value="Needs Improvement">
                  Needs Improvement
                </option>
              </select>
            </div>

            <button className="btn btn-success">
              Submit Review
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddReview;