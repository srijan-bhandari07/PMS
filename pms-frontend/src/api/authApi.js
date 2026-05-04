// src/api/authApi.js
import { apiFetch } from "./apiClient";

// Login -> POST /api/auth/login
export async function loginApi({ email, password }) {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  // Backend returns: { ok:true, data:{ token, user } } on success
  if (!res.ok) return { ok: false, error: res.error };

  // res.data is the backend payload
  // We keep frontend shape consistent with your AuthContext:
  // { ok:true, data:{ token, user } }
  return res.data;
}

// Logout -> POST /api/auth/logout
export async function logoutApi() {
  const res = await apiFetch("/auth/logout", { method: "POST" });
  if (!res.ok) return { ok: false, error: res.error };
  return res.data;
}