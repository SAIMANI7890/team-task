import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import { fetchProjects } from "../services/projects";
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from "../services/tasks";

const STATUS_OPTIONS = ["todo", "in-progress", "done"];

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

function isValidDate(value) {
  if (!value) return true;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

export default function TasksPage() {
  const navigate = useNavigate();
  const { token, setToken } = useContext(AuthContext);

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskLoading, setTaskLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingTaskId, setSavingTaskId] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    status: "todo",
    dueDate: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate, token]);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const projectData = await fetchProjects();
        if (!mounted) return;

        setProjects(projectData);
        const initialProject = projectData?.[0]?._id || "";
        setSelectedProjectId((current) => current || initialProject);
        setForm((current) => ({
          ...current,
          project: current.project || initialProject,
        }));
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
              "Failed to load projects",
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [navigate, setToken, token]);

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedProjectId),
    [projects, selectedProjectId],
  );

  const assignedUserOptions = useMemo(() => {
    const users = [];
    
    // Handle createdBy - could be an ID string or populated object
    if (selectedProject?.createdBy) {
      if (typeof selectedProject.createdBy === 'string') {
        users.push({ id: selectedProject.createdBy, name: selectedProject.createdBy });
      } else if (selectedProject.createdBy._id) {
        users.push({ 
          id: selectedProject.createdBy._id, 
          name: selectedProject.createdBy.name || selectedProject.createdBy.email 
        });
      }
    }
    
    // Handle teamMembers - could be array of ID strings or populated objects
    (selectedProject?.teamMembers || []).forEach((member) => {
      if (typeof member === 'string') {
        users.push({ id: member, name: member });
      } else if (member._id) {
        users.push({ 
          id: member._id, 
          name: member.name || member.email 
        });
      }
    });
    
    // Remove duplicates by ID
    const uniqueUsers = users.filter((user, index, self) => 
      index === self.findIndex((u) => u.id === user.id)
    );
    
    return uniqueUsers;
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedProjectId) {
      setTasks([]);
      return;
    }

    let mounted = true;

    async function loadTasks() {
      setTaskLoading(true);
      setError("");
      try {
        const taskData = await fetchTasks({ project: selectedProjectId });
        if (mounted) setTasks(taskData);
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
              "Failed to load tasks",
          );
        }
      } finally {
        if (mounted) setTaskLoading(false);
      }
    }

    loadTasks();

    return () => {
      mounted = false;
    };
  }, [navigate, selectedProjectId, setToken, token]);

  async function refreshTasks(projectId = selectedProjectId) {
    if (!projectId) return;
    const taskData = await fetchTasks({ project: projectId });
    setTasks(taskData);
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = "Task title is required";
    if (!form.project) nextErrors.project = "Select a project";
    if (form.status && !STATUS_OPTIONS.includes(form.status)) {
      nextErrors.status = "Invalid status";
    }
    if (form.assignedTo && !assignedUserOptions.some(u => u.id === form.assignedTo)) {
      nextErrors.assignedTo =
        "Assignee must be a member of the selected project";
    }
    if (!isValidDate(form.dueDate)) {
      nextErrors.dueDate = "Invalid due date";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    setFormMessage("");

    if (!validateForm()) return;

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        project: form.project,
        status: form.status,
      };

      if (form.assignedTo) payload.assignedTo = form.assignedTo;
      if (form.dueDate) payload.dueDate = form.dueDate;

      await createTask(payload);
      setForm({
        title: "",
        description: "",
        project: form.project,
        assignedTo: "",
        status: "todo",
        dueDate: "",
      });
      setFormMessage("Task created successfully.");
      await refreshTasks(form.project);
    } catch (err) {
      setFormMessage(
        err?.response?.data?.message || err?.message || "Failed to create task",
      );
    }
  }

  async function handleStatusChange(taskId, status) {
    setSavingTaskId(taskId);
    setError("");
    try {
      const updated = await updateTask(taskId, { status });
      setTasks((current) =>
        current.map((task) => (task._id === taskId ? updated : task)),
      );
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to update task",
      );
    } finally {
      setSavingTaskId("");
    }
  }

  async function handleAssignmentChange(taskId, assignedTo) {
    setSavingTaskId(taskId);
    setError("");
    try {
      const payload = assignedTo ? { assignedTo } : { assignedTo: null };
      const updated = await updateTask(taskId, payload);
      setTasks((current) =>
        current.map((task) => (task._id === taskId ? updated : task)),
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update assignment",
      );
    } finally {
      setSavingTaskId("");
    }
  }

  async function handleDeleteTask(taskId) {
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;

    setSavingTaskId(taskId);
    setError("");
    try {
      await deleteTask(taskId);
      setTasks((current) => current.filter((task) => task._id !== taskId));
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to delete task",
      );
    } finally {
      setSavingTaskId("");
    }
  }

  if (loading) {
    return (
      <div className="dashboard-shell">
        <p className="dashboard-muted">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <header className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">Task Management</p>
          <h1>Tasks</h1>
          <p className="dashboard-muted">
            Create tasks, assign users, update status, and review tasks per
            project.
          </p>
        </div>
        <div className="dashboard-progress-card">
          <span className="dashboard-progress-label">Current Project</span>
          <strong>{selectedProject?.name || "Select a project"}</strong>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link className="counter" to="/dashboard">
              Dashboard
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

      <section
        className="dashboard-grid"
        style={{ gridTemplateColumns: "1fr 1.2fr" }}
      >
        <article className="dashboard-panel">
          <div className="dashboard-panel-head">
            <h2>Create Task</h2>
          </div>

          {formMessage ? (
            <p className="dashboard-muted">{formMessage}</p>
          ) : null}

          <form
            onSubmit={handleCreateTask}
            noValidate
            style={{ display: "grid", gap: 12 }}
          >
            <label>
              <span className="dashboard-stat-label">Title</span>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((current) => ({ ...current, title: e.target.value }))
                }
                style={{ display: "block", width: "100%" }}
              />
              {formErrors.title ? (
                <div style={{ color: "crimson" }}>{formErrors.title}</div>
              ) : null}
            </label>

            <label>
              <span className="dashboard-stat-label">Description</span>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    description: e.target.value,
                  }))
                }
                style={{ display: "block", width: "100%", minHeight: 92 }}
              />
            </label>

            <label>
              <span className="dashboard-stat-label">Project</span>
              <select
                value={form.project}
                onChange={(e) => {
                  const nextProject = e.target.value;
                  setForm((current) => ({
                    ...current,
                    project: nextProject,
                    assignedTo: "",
                  }));
                  setSelectedProjectId(nextProject);
                }}
                style={{ display: "block", width: "100%" }}
              >
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {formErrors.project ? (
                <div style={{ color: "crimson" }}>{formErrors.project}</div>
              ) : null}
            </label>

            <label>
              <span className="dashboard-stat-label">Assign User</span>
              <select
                value={form.assignedTo}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    assignedTo: e.target.value,
                  }))
                }
                style={{ display: "block", width: "100%" }}
                disabled={!selectedProjectId}
              >
                <option value="">Unassigned</option>
                {assignedUserOptions.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              {formErrors.assignedTo ? (
                <div style={{ color: "crimson" }}>{formErrors.assignedTo}</div>
              ) : null}
            </label>

            <label>
              <span className="dashboard-stat-label">Status</span>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((current) => ({ ...current, status: e.target.value }))
                }
                style={{ display: "block", width: "100%" }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {statusLabel(option)}
                  </option>
                ))}
              </select>
              {formErrors.status ? (
                <div style={{ color: "crimson" }}>{formErrors.status}</div>
              ) : null}
            </label>

            <label>
              <span className="dashboard-stat-label">Due Date</span>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    dueDate: e.target.value,
                  }))
                }
                style={{ display: "block", width: "100%" }}
              />
              {formErrors.dueDate ? (
                <div style={{ color: "crimson" }}>{formErrors.dueDate}</div>
              ) : null}
            </label>

            <button type="submit">Create Task</button>
          </form>
        </article>

        <article className="dashboard-panel dashboard-panel-soft">
          <div className="dashboard-panel-head">
            <div>
              <h2>Tasks per Project</h2>
              <p className="dashboard-muted">
                Showing tasks for the selected project.
              </p>
            </div>
          </div>

          <label style={{ display: "block", marginBottom: 16 }}>
            <span className="dashboard-stat-label">Filter Project</span>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setForm((current) => ({
                  ...current,
                  project: e.target.value,
                  assignedTo: "",
                }));
              }}
              style={{ display: "block", width: "100%" }}
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          {taskLoading ? (
            <p className="dashboard-muted">Loading project tasks...</p>
          ) : null}

          <div className="dashboard-task-list">
            {tasks.length ? (
              tasks.map((task) => (
                <div key={task._id} className="dashboard-task-item">
                  <div style={{ flex: 1 }}>
                    <h3>{task.title}</h3>
                    <p className="dashboard-muted">
                      Due {formatDate(task.dueDate)}{" "}
                      {task.assignedTo
                        ? `• Assigned: ${typeof task.assignedTo === 'string' ? task.assignedTo : (task.assignedTo.name || task.assignedTo.email)}`
                        : "• Unassigned"}
                    </p>
                  </div>

                  <div style={{ display: "grid", gap: 8, minWidth: 170 }}>
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task._id, e.target.value)
                      }
                      disabled={savingTaskId === task._id}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {statusLabel(option)}
                        </option>
                      ))}
                    </select>

                    <select
                      value={typeof task.assignedTo === 'string' ? task.assignedTo : (task.assignedTo?._id || "")}
                      onChange={(e) =>
                        handleAssignmentChange(task._id, e.target.value)
                      }
                      disabled={savingTaskId === task._id}
                    >
                      <option value="">Unassigned</option>
                      {assignedUserOptions.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="counter"
                      onClick={() => handleDeleteTask(task._id)}
                      disabled={savingTaskId === task._id}
                      style={{ justifyContent: "center", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="dashboard-empty">
                No tasks found for this project.
              </p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
