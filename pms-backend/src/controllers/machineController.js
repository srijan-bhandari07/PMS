const machineService = require("../services/machineService");

async function getMachines(req, res) {
  try {
    console.log("[getMachines] Request received");
    const data = await machineService.getAllMachinesGrouped();
    console.log("[getMachines] Success, returning data with", data?.length || 0, "lines");
    res.json({ ok: true, data });
  } catch (error) {
    console.error("[getMachines] ERROR:", error);
    console.error("[getMachines] Stack trace:", error.stack);
    res.status(500).json({ ok: false, error: error.message });
  }
}

async function createMachine(req, res) {
  try {
    console.log("[createMachine] Request body:", req.body);
    const machine = await machineService.createMachine(req.body || {});
    console.log("[createMachine] Success, created machine:", machine?._id);
    res.json({ ok: true, data: machine });
  } catch (error) {
    console.error("[createMachine] ERROR:", error);
    console.error("[createMachine] Stack trace:", error.stack);
    res.status(500).json({ ok: false, error: error.message });
  }
}

async function updateMachine(req, res) {
  try {
    console.log("[updateMachine] ID:", req.params.id);
    console.log("[updateMachine] Update data:", req.body);
    const machine = await machineService.updateMachine(req.params.id, req.body || {});
    if (!machine) {
      console.warn("[updateMachine] Machine not found:", req.params.id);
      return res.status(404).json({ ok: false, error: "Machine not found" });
    }
    console.log("[updateMachine] Success, updated machine:", machine._id);
    res.json({ ok: true, data: machine });
  } catch (error) {
    console.error("[updateMachine] ERROR:", error);
    console.error("[updateMachine] Stack trace:", error.stack);
    res.status(500).json({ ok: false, error: error.message });
  }
}

async function deleteMachine(req, res) {
  try {
    console.log("[deleteMachine] ID:", req.params.id);
    const deleted = await machineService.deleteMachine(req.params.id);
    if (!deleted) {
      console.warn("[deleteMachine] Machine not found:", req.params.id);
      return res.status(404).json({ ok: false, error: "Machine not found" });
    }
    console.log("[deleteMachine] Success, deleted machine:", req.params.id);
    res.json({ ok: true });
  } catch (error) {
    console.error("[deleteMachine] ERROR:", error);
    console.error("[deleteMachine] Stack trace:", error.stack);
    res.status(500).json({ ok: false, error: error.message });
  }
}

async function getAssets(req, res) {
  try {
    console.log("[getAssets] Request received");
    const data = await machineService.getAvailableAssets();
    console.log("[getAssets] Success, found", data?.length || 0, "assets");
    res.json({ ok: true, data });
  } catch (error) {
    console.error("[getAssets] ERROR:", error);
    console.error("[getAssets] Stack trace:", error.stack);
    res.status(500).json({ ok: false, error: error.message });
  }
}

// ✅ New function to get line IDs
async function getLineIds(req, res) {
  try {
    console.log("[getLineIds] Request received, assetId:", req.query.assetId);
    const lines = await machineService.getAvailableLineIds(req.query.assetId);
    console.log("[getLineIds] Success, found", lines?.length || 0, "lines");
    res.json({ ok: true, data: lines });
  } catch (err) {
    console.error("[getLineIds] ERROR:", err);
    console.error("[getLineIds] Stack trace:", err.stack);
    res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = {
  getMachines,
  createMachine,
  updateMachine,
  deleteMachine,
  getAssets,
  getLineIds,  // ✅ Export new function
};