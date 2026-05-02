import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import { signup } from "../services/auth";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { token, setToken } = useContext(AuthContext);

  const [selectedRole, setSelectedRole] = useState("member");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
  }, [token, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setServerError("");

    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Name is required";
    if (!email.trim()) nextErrors.email = "Email is required";
    else if (!isValidEmail(email.trim())) nextErrors.email = "Invalid email";
    if (!password) nextErrors.password = "Password is required";
    else if (password.length < 6)
      nextErrors.password = "Password must be at least 6 characters";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const data = await signup({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (!data?.token) throw new Error("Missing token in response");

      setToken(data.token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Signup failed";
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
          <p className="auth-subtitle">Create your account</p>
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
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Enter your full name"
            />
            {errors.name ? (
              <div className="form-error">{errors.name}</div>
            ) : null}
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
              autoComplete="new-password"
              placeholder="Create a password (min 6 characters)"
            />
            {errors.password ? (
              <div className="form-error">{errors.password}</div>
            ) : null}
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>

        <div className="role-note">
          <p>Note: New accounts are created as <strong>{selectedRole === "admin" ? "Admin" : "Member"}</strong> by default. Contact your administrator to change roles.</p>
        </div>
      </div>
    </div>
  );
}
