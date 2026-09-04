import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/login", form);
      const user = res.data.user;
      const token = res.data.token || res.data.access_token;

      login(user, token);

      const userRole = user?.role?.toLowerCase() || "";

      if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else if (userRole === "hr") {
        navigate("/hr/dashboard");
      } else if (userRole === "employee") {
        navigate("/employee/dashboard");
      } else {
        alert("Invalid Role");
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Login Failed");
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


          <h2 className="login-title">Sign in to your account</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">✉️</span>
                <input
                  type="email"
                  className="login-input"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">🔒</span>
                <input
                  type="password"
                  className="login-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <Link to="/forgot" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                    Forgot Password?
                </Link>
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <p style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "var(--text-muted)" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--primary)", fontWeight: "700", textDecoration: "none" }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;