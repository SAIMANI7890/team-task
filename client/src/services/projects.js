import api from "./api";

export async function fetchProjects() {
  const res = await api.get("/projects");
  return res.data;
}

export async function createProject(data) {
  const res = await api.post("/projects", data);
  return res.data;
}

export async function updateProject(projectId, data) {
  const res = await api.put(`/projects/${projectId}`, data);
  return res.data;
}

export async function deleteProject(projectId) {
  const res = await api.delete(`/projects/${projectId}`);
  return res.data;
}
