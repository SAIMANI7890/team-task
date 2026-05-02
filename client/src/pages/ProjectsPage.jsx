import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import { fetchProjects, createProject } from "../services/projects";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { token, setToken } = useContext(AuthContext);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    loadProjects();
  }, [navigate, token]);

  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setToken("");
        navigate("/login", { replace: true });
        return;
      }
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load projects"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    setFormMessage("");
    setFormErrors({});

    // Validation
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Project name is required";
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setCreating(true);
    try {
      await createProject({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      setFormMessage("Project created successfully!");
      setFormData({ name: "", description: "" });
      setShowCreateForm(false);
      await loadProjects();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create project";
      setFormMessage(message);
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-shell">
        <p className="dashboard-muted">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <header className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">Project Management</p>
          <h1>Projects</h1>
          <p className="dashboard-muted">
            Create and manage your team projects
          </p>
        </div>
        <div className="dashboard-progress-card">
          <span className="dashboard-progress-label">Total Projects</span>
          <strong>{projects.length}</strong>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <Link className="counter" to="/dashboard">
              Dashboard
            </Link>
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

      {formMessage ? (
        <div className={`dashboard-alert ${formMessage.includes("success") ? "success" : ""}`} role="alert">
          {formMessage}
        </div>
      ) : null}

      {/* Create Project Button */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="create-project-button"
        >
          {showCreateForm ? "✕ Cancel" : "+ Create New Project"}
        </button>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <div className="dashboard-panel" style={{ marginBottom: 24 }}>
          <div className="dashboard-panel-head">
            <h2>Create New Project</h2>
          </div>

          <form onSubmit={handleCreateProject} style={{ display: "grid", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input
                className="form-input"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter project name"
              />
              {formErrors.name && (
                <div className="form-error">{formErrors.name}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter project description"
                rows="4"
                style={{ resize: "vertical" }}
              />
            </div>

            <button type="submit" disabled={creating} className="auth-button">
              {creating ? "Creating..." : "Create Project"}
            </button>
          </form>
        </div>
      )}

      {/* Projects List */}
      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="dashboard-panel">
            <div className="dashboard-empty">
              <p style={{ fontSize: "48px", margin: "0 0 16px 0" }}>📁</p>
              <h3 style={{ margin: "0 0 8px 0" }}>No projects yet</h3>
              <p>Create your first project to get started!</p>
            </div>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project._id} className="project-card">
              <div className="project-header">
                <h3>{project.name}</h3>
                <span className="project-badge">
                  {project.teamMembers?.length || 0} members
                </span>
              </div>
              <p className="project-description">
                {project.description || "No description"}
              </p>
              <div className="project-footer">
                <span className="project-date">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
                <Link to="/tasks" className="project-link">
                  View Tasks →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
