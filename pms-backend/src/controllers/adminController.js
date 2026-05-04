const adminService = require("../services/adminService");

// ===== Users =====
async function getUsers(_req, res) {
  try {
    const users = await adminService.getAllUsers();
    return res.json({ ok: true, data: users });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return res.status(500).json({ ok: false, error: "Failed to fetch users" });
  }
}

async function createUser(req, res) {
  try {
    const user = await adminService.createUser(req.body || {});
    return res.json({ ok: true, data: user });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message });
  }
}

async function updateUser(req, res) {
  try {
    const user = await adminService.updateUser(req.params.id, req.body || {});
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }
    return res.json({ ok: true, data: user });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message });
  }
}

async function deleteUser(req, res) {
  try {
    const ok = await adminService.deleteUser(req.params.id);
    if (!ok) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "Failed to delete user" });
  }
}

async function toggleMachineAccess(req, res) {
  try {
    const user = await adminService.toggleMachineAccess(
      req.params.userId,
      req.params.machineId
    );

    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    return res.json({ ok: true, data: user });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "Failed to update machine access" });
  }
}

// ===== Maintenance =====
async function getMaintenanceLogs(_req, res) {
  try {
    const logs = await adminService.getAllMaintenanceLogs();
    return res.json({ ok: true, data: logs });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "Failed to fetch maintenance logs" });
  }
}

async function createMaintenanceLog(req, res) {
  try {
    const entry = await adminService.createMaintenanceLog(req.body || {});
    return res.json({ ok: true, data: entry });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message });
  }
}

async function updateMaintenanceLog(req, res) {
  try {
    const entry = await adminService.updateMaintenanceLog(req.params.id, req.body || {});
    if (!entry) {
      return res.status(404).json({ ok: false, error: "Log not found" });
    }
    return res.json({ ok: true, data: entry });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message });
  }
}

async function deleteMaintenanceLog(req, res) {
  try {
    const ok = await adminService.deleteMaintenanceLog(req.params.id);
    if (!ok) {
      return res.status(404).json({ ok: false, error: "Log not found" });
    }
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "Failed to delete maintenance log" });
  }
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleMachineAccess,
  getMaintenanceLogs,
  createMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog,
};