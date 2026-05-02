import api from "./api";

export async function fetchDashboard() {
  const res = await api.get("/api/dashboard");
  return res.data;
}
