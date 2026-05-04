// src/api/adminApi.js
import { apiFetch } from "./apiClient";

// ===== USERS =====
export async function getUsersApi() {
  const res = await apiFetch("/admin/users");
  return res.ok ? res.data : { ok: false, error: res.error };
}

export async function createUserApi(payload) {
  const res = await apiFetch("/admin/users", { method: "POST", body: payload });
  return res.ok ? res.data : { ok: false, error: res.error };
}

export async function updateUserApi(id, patch) {
  const res = await apiFetch(`/admin/users/${id}`, { method: "PATCH", body: patch });
  return res.ok ? res.data : { ok: false, error: res.error };
}

export async function deleteUserApi(id) {
  const res = await apiFetch(`/admin/users/${id}`, { method: "DELETE" });
  return res.ok ? res.data : { ok: false, error: res.error };
}

export async function toggleMachineAccessApi(userId, machineId) {
  const res = await apiFetch(`/admin/users/${userId}/machines/${machineId}/toggle`, {
    method: "POST",
  });
  return res.ok ? res.data : { ok: false, error: res.error };
}

// ===== MAINTENANCE =====
export async function getMaintenanceLogsApi() {
  const res = await apiFetch("/admin/maintenance");
  return res.ok ? res.data : { ok: false, error: res.error };
}

export async function createMaintenanceLogApi(payload) {
  const res = await apiFetch("/admin/maintenance", { method: "POST", body: payload });
  return res.ok ? res.data : { ok: false, error: res.error };
}

export async function updateMaintenanceLogApi(id, patch) {
  const res = await apiFetch(`/admin/maintenance/${id}`, { method: "PATCH", body: patch });
  return res.ok ? res.data : { ok: false, error: res.error };
}

export async function deleteMaintenanceLogApi(id) {
  const res = await apiFetch(`/admin/maintenance/${id}`, { method: "DELETE" });
  return res.ok ? res.data : { ok: false, error: res.error };
}

// ===== MACHINES =====
export async function getMachinesApi() {
  const res = await apiFetch("/machines");
  return res.ok ? res.data : { ok: false, error: res.error };
}