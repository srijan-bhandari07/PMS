const getUserModel = require("../models/User");
const getMaintenanceLogModel = require("../models/MaintenanceLog");
const { getMaintenanceLogs, setMaintenanceLogs } = require("../data/mockData");
function toSafeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    accessibleMachines: user.accessibleMachines || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// ===== USERS (MongoDB - admin DB) =====
async function getAllUsers() {
  const User = getUserModel();
  const users = await User.find().sort({ createdAt: -1 });
  return users.map(toSafeUser);
}  

async function createUser(payload) {
  const User = getUserModel();
  const email = String(payload.email || "").trim().toLowerCase();

  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("User with this email already exists");
  }

  const user = await User.create({
    name: String(payload.name || "").trim(),
    email,
    role: payload.role || "operator",
    active: payload.active !== false,
    password: payload.password || "123456",
    accessibleMachines: [],
  });

  return toSafeUser(user);
}

async function updateUser(id, patch) {
  const User = getUserModel();
  const update = { ...patch };

  if (update.email) {
    update.email = String(update.email).trim().toLowerCase();
  }

  const user = await User.findByIdAndUpdate(id, update, { new: true });
  if (!user) return null;

  return toSafeUser(user);
}

async function deleteUser(id) {
  const User = getUserModel();
  const deleted = await User.findByIdAndDelete(id);
  return !!deleted;
}

async function toggleMachineAccess(userId, machineId) {
  const User = getUserModel();
  const user = await User.findById(userId);
  if (!user) return null;

  const mid = Number(machineId);
  const list = Array.isArray(user.accessibleMachines) ? user.accessibleMachines : [];

  user.accessibleMachines = list.includes(mid)
    ? list.filter((id) => id !== mid)
    : [...list, mid];

  await user.save();

  return toSafeUser(user);
}

// ===== MAINTENANCE (MongoDB - admin DB) =====
async function getAllMaintenanceLogs() {
  const MaintenanceLog = getMaintenanceLogModel();
  return await MaintenanceLog.find().sort({ createdAt: -1 });
}

async function createMaintenanceLog(payload) {
  const MaintenanceLog = getMaintenanceLogModel();

  const entry = await MaintenanceLog.create({
    date: String(payload.date || "").trim(),
    lineId: Number(payload.lineId),
    machineId: Number(payload.machineId),
    title: String(payload.title || "").trim(),
    technician: String(payload.technician || "").trim(),
    status: payload.status || "planned",
    notes: String(payload.notes || "").trim(),
  });

  return entry;
}

async function updateMaintenanceLog(id, patch) {
  const MaintenanceLog = getMaintenanceLogModel();

  const update = { ...patch };

  if (update.lineId != null) update.lineId = Number(update.lineId);
  if (update.machineId != null) update.machineId = Number(update.machineId);
  if (update.date != null) update.date = String(update.date).trim();
  if (update.title != null) update.title = String(update.title).trim();
  if (update.technician != null) update.technician = String(update.technician).trim();
  if (update.notes != null) update.notes = String(update.notes).trim();

  const entry = await MaintenanceLog.findByIdAndUpdate(id, update, { new: true });
  return entry || null;
}

async function deleteMaintenanceLog(id) {
  const MaintenanceLog = getMaintenanceLogModel();
  const deleted = await MaintenanceLog.findByIdAndDelete(id);
  return !!deleted;
}

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleMachineAccess,
  getAllMaintenanceLogs,
  createMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog,
};