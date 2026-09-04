import { useState } from "react";
import API from "../api/api";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/forgot-password", { email });
      localStorage.setItem("reset_email", email);
      navigate("/verify");
    } catch (error) {
      alert(error.response?.data?.message || "An error occurred");
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
          <h2 className="login-title">Forgot Password</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">✉️</span>
                <input
                  type="email"
                  className="login-input"
                  placeholder="name@company.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
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

export default ForgotPassword;