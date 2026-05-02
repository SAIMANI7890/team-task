import api from "./api";

export async function signup({ name, email, password }) {
  const res = await api.post("/api/auth/signup", { name, email, password });
  return res.data;
}

export async function login({ email, password }) {
  const res = await api.post("/api/auth/login", { email, password });
  return res.data;
}
