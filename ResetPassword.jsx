import { useState } from "react";
import API from "../api/api";
import { Link, useNavigate } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    password: "",
    password_confirmation: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const email = localStorage.getItem("reset_email");
      const otp = localStorage.getItem("reset_otp");

      await API.post("/reset-password", {
        email,
        otp,
        ...form,
      });

      alert("Password Reset Success");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Password reset failed");
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

      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-brand">
            <div className="login-brand-icon">H</div>
          </div>
          <h2 className="login-title">Reset Password</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">🔒</span>
                <input
                  type="password"
                  className="login-input"
                  placeholder="••••••••"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">🔒</span>
                <input
                  type="password"
                  className="login-input"
                  placeholder="••••••••"
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                  required
                />
              </div>
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <p style={{ marginTop: "24px", textAlign: "center", fontSize: "14px" }}>
            <Link to="/" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;