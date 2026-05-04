const dashboardService = require("../services/dashboardService");

async function getUserDashboard(req, res) {
  try {
    const lineId = Number(req.query.lineId || 1);
    const machineId = Number(req.query.machineId || 1);
    const assetId = req.query.assetId || "";
    const sensorLineId = req.query.sensorLineId || "";  // ✅ ADD THIS

    console.log("[getUserDashboard] Received params:", { lineId, machineId, assetId, sensorLineId });

    const data = await dashboardService.getUserDashboard(lineId, machineId, assetId, sensorLineId);  // ✅ PASS sensorLineId

    // Transform signals to match frontend expectations
    if (data && data.signals) {
      const latest = data.signals;
      
      // Ensure values are numbers, not objects
      const getNumberValue = (val) => {
        if (val === null || val === undefined) return null;
        // If it's an object with a value property, extract it
        if (typeof val === 'object' && val !== null && 'value' in val) {
          return val.value;
        }
        // If it's a number, return it directly
        return typeof val === 'number' ? val : null;
      };
      
      data.signals = {
        temperature: {
          value: getNumberValue(latest.productTemp),
          unit: "°C",
          label: "Temperature",
          hint: "Live sensor reading",
        },
        vibration: {
          value: getNumberValue(latest.vibration),
          unit: "mm/s",
          label: "Vibration",
          hint: "Live sensor reading",
        },
        pressure: {
          value: getNumberValue(latest.tankPressure),
          unit: "bar",
          label: "Pressure",
          hint: "Live sensor reading",
        },
      };
    }

    return res.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error("USER DASHBOARD ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: "Failed to load user dashboard",
    });
  }
}

async function getAdminDashboard(req, res) {
  try {
    const lineId = Number(req.query.lineId || 1);
    const machineId = Number(req.query.machineId || 1);
    const assetId = req.query.assetId || "";
    const sensorLineId = req.query.sensorLineId || "";  // ✅ ADD THIS

    console.log("[getAdminDashboard] Received params:", { lineId, machineId, assetId, sensorLineId });

    const data = await dashboardService.getAdminDashboard(lineId, machineId, assetId, sensorLineId);  // ✅ PASS sensorLineId

    return res.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: "Failed to load admin dashboard",
    });
  }
}

module.exports = {
  getUserDashboard,
  getAdminDashboard,
};