// src/api/machineApi.js
import { apiFetch } from "./apiClient";

export async function getMachinesApi() {
  const res = await apiFetch("/machines");
  return res.ok
    ? { ok: true, data: res.data?.data || [] }
    : { ok: false, error: res.error };
}

export async function getAssetsApi() {
  const res = await apiFetch("/machines/assets");
  return res.ok
    ? { ok: true, data: res.data?.data || [] }
    : { ok: false, error: res.error };
}

export async function createMachineApi(payload) {
  const res = await apiFetch("/machines", {
    method: "POST",
    body: payload,  // ✅ Remove JSON.stringify - apiFetch handles it
  });
  return res.ok
    ? { ok: true, data: res.data?.data || null }
    : { ok: false, error: res.error };
}

export async function updateMachineApi(id, patch) {
  const res = await apiFetch(`/machines/${id}`, {
    method: "PATCH",
    body: patch,  // ✅ Remove JSON.stringify - apiFetch handles it
  });
  return res.ok
    ? { ok: true, data: res.data?.data || null }
    : { ok: false, error: res.error };
}

export async function deleteMachineApi(id) {
  const res = await apiFetch(`/machines/${id}`, {
    method: "DELETE",
  });
  return res.ok
    ? { ok: true, data: res.data?.data || null }
    : { ok: false, error: res.error };
}

export async function getLineIdsApi(assetId) {
  const qs = assetId ? `?assetId=${encodeURIComponent(assetId)}` : "";
  const res = await apiFetch(`/machines/line-ids${qs}`);
  return res.ok
    ? { ok: true, data: res.data?.data || [] }
    : { ok: false, error: res.error };
}