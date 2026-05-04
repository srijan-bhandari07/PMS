const getOperatorLogModel = require("../models/OperatorLog");

async function createOperatorLog(req, res) {
  try {
    const OperatorLog = getOperatorLogModel();

    const log = await OperatorLog.create({
      machineId: req.body.machineId,
      machineName: req.body.machineName,
      assetId: req.body.assetId || "",
      type: req.body.type,
      message: req.body.message,
      status: req.body.type === "fixed" ? "resolved" : "open",
      createdBy: req.user?.name || req.user?.email || "Operator",
    });

    res.status(201).json({ ok: true, data: log });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

async function getOperatorLogs(req, res) {
  try {
    const OperatorLog = getOperatorLogModel();

    const query = {};
    if (req.query.machineId) query.machineId = req.query.machineId;

    const logs = await OperatorLog.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ ok: true, data: logs });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

async function resolveOperatorLog(req, res) {
  try {
    const OperatorLog = getOperatorLogModel();

    const log = await OperatorLog.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { new: true }
    );

    res.json({ ok: true, data: log });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}

module.exports = {
  createOperatorLog,
  getOperatorLogs,
  resolveOperatorLog,
};