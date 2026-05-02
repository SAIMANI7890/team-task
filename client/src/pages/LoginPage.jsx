import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import { login } from "../services/auth";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { token, setToken } = useContext(AuthContext);

  const [selectedRole, setSelectedRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
  }, [token, navigate]);

  // Pre-fill credentials based on role selection
  useEffect(() => {
    if (selectedRole === "admin") {
      setEmail("admin@taskmanager.com");
      setPassword("Admin@123");
    } else {
      setEmail("member@taskmanager.com");
      setPassword("Member@123");
    }
  }, [selectedRole]);

  async function onSubmit(e) {
    e.preventDefault();
    setServerError("");

    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "Email is required";
    else if (!isValidEmail(email.trim())) nextErrors.email = "Invalid email";
    if (!password) nextErrors.password = "Password is required";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const data = await login({ email: email.trim(), password });
      console.log('🔐 Login response:', data);
      if (!data?.token) throw new Error("Missing token in response");

      console.log('🔐 Setting token:', data.token);
      setToken(data.token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Login failed";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Team Task Manager</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        {serverError ? (
          <div className="auth-error" role="alert">
            {serverError}
          </div>
        ) : null}

        <form onSubmit={onSubmit} noValidate className="auth-form">
          {/* Role Selection */}
          <div className="role-selector">
            <button
              type="button"
              className={`role-button ${selectedRole === "admin" ? "active" : ""}`}
              onClick={() => setSelectedRole("admin")}
            >
              <div className="role-info">
                <div className="role-title">Admin</div>
                <div className="role-desc">Create & manage projects</div>
              </div>
            </button>
            <button
              type="button"
              className={`role-button ${selectedRole === "member" ? "active" : ""}`}
              onClick={() => setSelectedRole("member")}
            >
              <div className="role-info">
                <div className="role-title">Member</div>
                <div className="role-desc">Work on assigned tasks</div>
              </div>
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              placeholder="Enter your email"
            />
            {errors.email ? (
              <div className="form-error">{errors.email}</div>
            ) : null}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
            />
            {errors.password ? (
              <div className="form-error">{errors.password}</div>
            ) : null}
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/signup" className="auth-link">Create one</Link>
          </p>
        </div>

        {/* Demo Credentials Info */}
        <div className="demo-info">
          <p className="demo-title">Demo Credentials</p>
          <div className="demo-credentials">
            <div>
              <strong>Admin:</strong> admin@taskmanager.com / Admin@123
            </div>
            <div>
              <strong>Member:</strong> member@taskmanager.com / Member@123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
