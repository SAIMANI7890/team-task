import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import { fetchDashboard } from "../services/dashboard";

// Helper to decode JWT and get user info
function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

function formatDate(value) {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No due date";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function statusLabel(status) {
  if (status === "done") return "Completed";
  if (status === "in-progress") return "In Progress";
  return "Pending";
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { token, setToken } = useContext(AuthContext);

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get user role from token
  const userRole = useMemo(() => {
    if (!token) return null;
    const decoded = decodeToken(token);
    console.log('🔍 Decoded token:', decoded);
    console.log('🔍 User role:', decoded?.role);
    return decoded?.role || null;
  }, [token]);

  const isAdmin = userRole === "admin";
  console.log('🔍 Is Admin:', isAdmin, 'User Role:', userRole);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    let mounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchDashboard();
        if (mounted) setDashboard(data);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) {
          setToken("");
          navigate("/login", { replace: true });
          return;
        }

        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load dashboard",
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [navigate, setToken, token]);

  const stats = useMemo(() => {
    const totalTasks = dashboard?.totalTasks || 0;
    const completed = dashboard?.tasksByStatus?.done || 0;
    const pending =
      (dashboard?.tasksByStatus?.todo || 0) +
      (dashboard?.tasksByStatus?.["in-progress"] || 0);
    const overdue = dashboard?.overdueTasks?.length || 0;

    return [
      { label: "Total Tasks", value: totalTasks, accent: "#4f46e5" },
      { label: "Completed", value: completed, accent: "#059669" },
      { label: "Pending", value: pending, accent: "#d97706" },
      { label: "Overdue", value: overdue, accent: "#dc2626" },
    ];
  }, [dashboard]);

  const completionRate = useMemo(() => {
    const total = dashboard?.totalTasks || 0;
    const completed = dashboard?.tasksByStatus?.done || 0;
    if (!total) return 0;
    return Math.round((completed / total) * 100);
  }, [dashboard]);

  if (loading) {
    return (
      <div className="dashboard-shell">
        <p className="dashboard-muted">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <header className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">Team Task Manager</p>
          <h1>Dashboard</h1>
          <p className="dashboard-muted">
            Track task progress, overdue items, and your assigned work in one
            view.
          </p>
        </div>
        <div className="dashboard-progress-card">
          <span className="dashboard-progress-label">Completion</span>
          <strong>{completionRate}%</strong>
          <div className="dashboard-progress-bar" aria-hidden="true">
            <span style={{ width: `${completionRate}%` }} />
          </div>
          {/* Debug info - remove after testing */}
          <div style={{ fontSize: '12px', color: '#888', marginTop: 8 }}>
            Role: {userRole || 'none'} | Admin: {isAdmin ? 'YES' : 'NO'}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {isAdmin && (
              <Link className="counter" to="/projects">
                Projects
              </Link>
            )}
            <Link className="counter" to="/tasks">
              Tasks
            </Link>
            <button
              className="counter"
              type="button"
              onClick={() => setToken("")}
              style={{ cursor: "pointer" }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {error ? (
        <div className="dashboard-alert" role="alert">
          {error}
        </div>
      ) : null}

      <section className="dashboard-stats" aria-label="Task statistics">
        {stats.map((item) => (
          <article key={item.label} className="dashboard-stat-card">
            <span className="dashboard-stat-label">{item.label}</span>
            <strong style={{ color: item.accent }}>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <div className="dashboard-panel-head">
            <h2>Assigned Tasks</h2>
            <span className="dashboard-muted">
              {dashboard?.myTasks?.length || 0} task(s)
            </span>
          </div>

          <div className="dashboard-task-list">
            {(dashboard?.myTasks || []).length ? (
              dashboard.myTasks.map((task) => (
                <div key={task._id} className="dashboard-task-item">
                  <div>
                    <h3>{task.title}</h3>
                    <p className="dashboard-muted">
                      Due {formatDate(task.dueDate)}
                    </p>
                  </div>
                  <span
                    className={`dashboard-badge dashboard-badge-${task.status}`}
                  >
                    {statusLabel(task.status)}
                  </span>
                </div>
              ))
            ) : (
              <p className="dashboard-empty">No assigned tasks yet.</p>
            )}
          </div>
        </article>

        <article className="dashboard-panel dashboard-panel-soft">
          <div className="dashboard-panel-head">
            <h2>Overview</h2>
          </div>

          <div className="dashboard-overview-row">
            <span>Tasks completed</span>
            <strong>{dashboard?.tasksByStatus?.done || 0}</strong>
          </div>
          <div className="dashboard-overview-row">
            <span>Tasks pending</span>
            <strong>
              {(dashboard?.tasksByStatus?.todo || 0) +
                (dashboard?.tasksByStatus?.["in-progress"] || 0)}
            </strong>
          </div>
          <div className="dashboard-overview-row">
            <span>Overdue tasks</span>
            <strong>{dashboard?.overdueTasks?.length || 0}</strong>
          </div>
        </article>
      </section>
    </div>
  );
}
