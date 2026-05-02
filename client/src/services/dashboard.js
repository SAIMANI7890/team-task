import api from "./api";

export async function fetchDashboard() {
  const res = await api.get("/dashboard");
  return res.data;
}
