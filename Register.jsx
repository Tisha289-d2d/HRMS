import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    role: "employee",
    address: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await API.post("/register", form);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      alert("Registration Successful");
      navigate("/");
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(error.response?.data?.message || "Registration Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div style={{ maxWidth: "500px" }}>
          <div className="login-hero-text">
              <h2>HR Management</h2>
          </div>

       </div>
      </div>

      <div className="login-right" style={{ width: '560px' }}>
        <div className="login-form-wrap">
          <div className="login-brand">
            <div className="login-brand-icon">H</div>
            <h1>HR<span>MS</span></h1>
          </div>

          <h2 className="login-title">Create your account</h2>

          <form onSubmit={handleSubmit}>
            <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  {errors.name && <small style={{ color: 'var(--danger)', fontSize: '11px' }}>{errors.name[0]}</small>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="john@company.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && <small style={{ color: 'var(--danger)', fontSize: '11px' }}>{errors.email[0]}</small>}
                </div>
            </div>

            <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    placeholder="+1 234..."
                    value={form.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && <small style={{ color: 'var(--danger)', fontSize: '11px' }}>{errors.phone[0]}</small>}
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Role</label>
                  <select name="role" className="form-select" value={form.role} onChange={handleChange}>
                    <option value="employee">Employee</option>
                    <option value="hr">HR Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
            </div>

            <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  {errors.password && <small style={{ color: 'var(--danger)', fontSize: '11px' }}>{errors.password[0]}</small>}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    name="password_confirmation"
                    className="form-control"
                    placeholder="••••••••"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    required
                  />
                </div>
            </div>

            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <textarea
                name="address"
                className="form-control"
                placeholder="Street, City, Country"
                rows="2"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Complete Registration"}
            </button>
          </form>

          <p style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/" style={{ color: "var(--primary)", fontWeight: "700", textDecoration: "none" }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;