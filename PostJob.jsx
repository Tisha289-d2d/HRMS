
import { useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

function PostJob() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    job_type: "",
    salary: "",
    vacancies: 1,
    deadline: "",
    description: "",
    status: "Open",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/recruitments", formData);

      alert("Job Posted Successfully");

      navigate("/admin/recruitment");
    } catch (err) {
      console.log(err);
      alert("Error posting job");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header">
          <h3>Post New Job</h3>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <label>Job Title</label>

              <input
                type="text"
                className="form-control"
                name="title"
                placeholder="Frontend Developer"
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label>Department</label>

              <input
                type="text"
                className="form-control"
                name="department"
                placeholder="IT Department"
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label>Location</label>

              <input
                type="text"
                className="form-control"
                name="location"
                placeholder="Surat"
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label>Job Type</label>

              <select
                className="form-control"
                name="job_type"
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div className="mb-3">
              <label>Salary</label>
              <input
                type="number"
                className="form-control"
                name="salary"
                placeholder="50000"
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label>Number of Vacancies</label>
              <input
                type="number"
                className="form-control"
                name="vacancies"
                value={formData.vacancies}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label>Application Deadline</label>

              <input
                type="date"
                className="form-control"
                name="deadline"
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label>Job Description</label>

              <textarea
                className="form-control"
                rows="5"
                name="description"
                placeholder="Enter job description..."
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button className="btn btn-success">
              Submit Job
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default PostJob;