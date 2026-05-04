import { apiFetch } from "./apiClient";

export async function getOperatorLogsApi(machineId) {
  const qs = machineId ? `?machineId=${machineId}` : "";
  const res = await apiFetch(`/operator-logs${qs}`);
  return res.ok ? res.data : { ok: false, error: res.error };
}

export async function createOperatorLogApi(payload) {
  const res = await apiFetch("/operator-logs", {
    method: "POST",
    body: payload,
  });

  return res.ok ? res.data : { ok: false, error: res.error };
}

export async function resolveOperatorLogApi(id) {
  const res = await apiFetch(`/operator-logs/${id}/resolve`, {
    method: "PATCH",
  });

  return res.ok ? res.data : { ok: false, error: res.error };
}