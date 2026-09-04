import { useState } from "react";
import API from "../api/api";
import { Link, useNavigate } from "react-router-dom";

function VerifyOtp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const email = localStorage.getItem("reset_email");
      await API.post("/verify-otp", { email, otp });
      localStorage.setItem("reset_otp", otp);
      navigate("/reset");
    } catch (error) {
      alert(error.response?.data?.message || "OTP verification failed");
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
          <h2 className="login-title">Verify OTP</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">🔑</span>
                <input
                  type="text"
                  className="login-input"
                  placeholder="123456"
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
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

export default VerifyOtp;