// src/api/dashboardApi.js
import { apiFetch } from "./apiClient";

// USER DASHBOARD
export async function getUserDashboardApi({ lineId, machineId, assetId, sensorLineId }) {
  const qs = new URLSearchParams({
    lineId: String(lineId ?? 1),
    machineId: String(machineId ?? 1),
    assetId: String(assetId || ""),
    sensorLineId: String(sensorLineId || ""),
  }).toString();

  const res = await apiFetch(`/dashboard/user?${qs}`);
  return res.ok ? res.data : { ok: false, error: res.error };
}

// ADMIN DASHBOARD
export async function getAdminDashboardApi({ lineId, machineId, assetId, sensorLineId }) {
  const qs = new URLSearchParams({
    lineId: String(lineId ?? 1),
    machineId: String(machineId ?? 1),
    assetId: String(assetId || ""),
    sensorLineId: String(sensorLineId || ""),
  }).toString();

  const res = await apiFetch(`/dashboard/admin?${qs}`);
  return res.ok ? res.data : { ok: false, error: res.error };
}