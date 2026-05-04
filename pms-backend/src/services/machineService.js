const getMachineModel = require("../models/Machine");
const getSensorReadingModel = require("../models/SensorReading");

async function getAllMachinesGrouped() {
  const Machine = getMachineModel();

  const machines = await Machine.find({ isActive: true }).sort({
    lineName: 1,
    createdAt: 1,
  });

  const groupedMap = new Map();

  for (const machine of machines) {
    if (!groupedMap.has(machine.lineName)) {
      groupedMap.set(machine.lineName, {
        id: machine.lineName,
        name: machine.lineName,
        machines: [],
      });
    }

    groupedMap.get(machine.lineName).machines.push({
      id: machine._id.toString(),
      name: machine.name,
      assetId: machine.assetId,
      sensorLineId: machine.sensorLineId,
      status: machine.status,
      lineName: machine.lineName,
    });
  }

  return Array.from(groupedMap.values());
}

async function createMachine(payload) {
  const Machine = getMachineModel();

  return await Machine.create({
    name: String(payload.name || "").trim(),
    lineName: String(payload.lineName || "").trim(),
    assetId: String(payload.assetId || "").trim(),
    sensorLineId: String(payload.sensorLineId || "").trim(),
    status: payload.status || "normal",
    isActive: payload.isActive !== false,
  });
}

async function updateMachine(id, patch) {
  const Machine = getMachineModel();
  
  // Create update object with all fields that might be updated
  const updateData = {};
  
  if (patch.name !== undefined) updateData.name = String(patch.name).trim();
  if (patch.lineName !== undefined) updateData.lineName = String(patch.lineName).trim();
  if (patch.assetId !== undefined) updateData.assetId = String(patch.assetId).trim();
  if (patch.sensorLineId !== undefined) updateData.sensorLineId = String(patch.sensorLineId).trim();
  if (patch.status !== undefined) updateData.status = patch.status;
  if (patch.isActive !== undefined) updateData.isActive = patch.isActive;
  
  return await Machine.findByIdAndUpdate(id, updateData, { new: true });
}

async function deleteMachine(id) {
  const Machine = getMachineModel();
  const deleted = await Machine.findByIdAndDelete(id);
  return !!deleted;
}

async function getAvailableAssets() {
  const SensorReading = getSensorReadingModel();
  const assets = await SensorReading.distinct("Asset ID");
  return assets.filter(Boolean).sort();
}

async function getAvailableLineIds(assetId) {
  const SensorReading = getSensorReadingModel();

  const query = assetId ? { "Asset ID": assetId } : {};

  const lines = await SensorReading.distinct("Line ID", query);

  return lines.filter(Boolean).sort();
}

module.exports = {
  getAllMachinesGrouped,
  createMachine,
  updateMachine,
  deleteMachine,
  getAvailableAssets,
  getAvailableLineIds,  // ✅ Added new function
};