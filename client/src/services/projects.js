import api from "./api";

export async function fetchProjects() {
  const res = await api.get("/api/projects");
  return res.data;
}

export async function createProject(data) {
  const res = await api.post("/api/projects", data);
  return res.data;
}

export async function updateProject(projectId, data) {
  const res = await api.put(`/api/projects/${projectId}`, data);
  return res.data;
}

export async function deleteProject(projectId) {
  const res = await api.delete(`/api/projects/${projectId}`);
  return res.data;
}
