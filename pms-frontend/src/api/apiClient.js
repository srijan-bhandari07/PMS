// src/api/apiClient.js

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export async function apiFetch(path, { method = "GET", body, headers } = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  // Get token from localStorage (stored by AuthContext under "pms.auth")
  let token = null;
  try {
    const raw = localStorage.getItem("pms.auth");
    token = raw ? JSON.parse(raw)?.token : null;
  } catch {
    token = null;
  }

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
  const msg =
    (data && data.error) ||
    (typeof data === "string" && data) ||
    res.statusText ||
    "Request failed";

  if (res.status === 401 && !path.startsWith("/admin")) {
    localStorage.removeItem("pms.auth");
  }

  return { ok: false, status: res.status, error: msg, data };
}

  return { ok: true, status: res.status, data };
}