const getSensorReadingModel = require("../models/SensorReading");

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function mapReading(doc) {
  const row = doc?.toObject ? doc.toObject() : doc;

  return {
    timestamp: row["Timestamp"] ? new Date(row["Timestamp"]) : null,

    machineAgeDays: toNum(row["Machine Age (days)"]),
    assetId: row["Asset ID"],
    lineId: row["Line ID"],

    pressure: toNum(row["Tank Pressure"]),
    tankLevel: toNum(row["Tank Level"]),
    productTemp: toNum(row["Product Temp"]),
    fillLevel: toNum(row["Fill Level"]),

    snift1Throttle: toNum(row["Snift-1 Throttle"]),
    snift1Time: toNum(row["Snift-1 Time"]),
    snift2Throttle: toNum(row["Snift-2 Throttle"]),
    snift2Time: toNum(row["Snift-2 Time"]),

    cycleRate: toNum(row["Cycle Rate"]),
    vibration: toNum(row["Vibration"]),
    sealingForce: toNum(row["Sealing Force"]),
    seamIntegrity: toNum(row["Seam Integrity"]),
    seamThickness: toNum(row["Seam Thickness"]),

    oxygenContent: toNum(row["Oxygen Content"]),
    co2Content: toNum(row["CO2 Content"]),

    status: row["Status"],
    failSensor: row["Fail Sensor"],
    specificProblem: row["Specific Problem"],
    cause: row["Cause"],
    correctiveAction: row["Corrective Action"],

    downtime: toNum(row["Downtime"]),
    throughput: toNum(row["Throughput"]),
    reject: toNum(row["Reject"]),
    oee: toNum(row["OEE_sec"]),
    rul: toNum(row["RUL"]),
    failureIn30Min: toNum(row["Failure_in_30min"]),
    hasFutureFailure: toNum(row["Has_Future_Failure"]),
  };
}

function computeQualityStatus(drivers) {
  const { co2Content, oxygenContent, vibration, pressure } = drivers;

  let score = 0;

  if (co2Content != null) {
    if (co2Content < 4 || co2Content > 6) score += 1;
    if (co2Content < 2 || co2Content > 8) score += 2;
  }

  if (oxygenContent != null) {
    if (oxygenContent > 0.8) score += 1;
    if (oxygenContent > 3.0) score += 2;
  }

  if (vibration != null) {
    if (vibration > 2.5) score += 1;
    if (vibration > 6.0) score += 2;
  }

  if (pressure != null) {
    if (pressure < 2.0 || pressure > 3.0) score += 1;
    if (pressure < 1.0 || pressure > 4.5) score += 2;
  }

  if (score >= 4) return "Poor";
  if (score >= 2) return "Warning";
  return "Normal";
}

function computeDefectRate(latest, recentRows) {
  if (latest.defectRate != null) return latest.defectRate;

  let score = 0;

  if (latest.co2Content != null && (latest.co2Content < 4 || latest.co2Content > 6)) score += 0.6;
  if (latest.oxygenContent != null && latest.oxygenContent > 0.8) score += 0.5;
  if (latest.vibration != null && latest.vibration > 2.5) score += 0.5;
  if (latest.pressure != null && (latest.pressure < 2 || latest.pressure > 3)) score += 0.4;

  const avgPenalty =
    recentRows.length > 0
      ? recentRows.reduce((sum, r) => {
          let p = 0;
          if (r.co2Content != null && (r.co2Content < 4 || r.co2Content > 6)) p += 0.1;
          if (r.oxygenContent != null && r.oxygenContent > 0.8) p += 0.1;
          if (r.vibration != null && r.vibration > 2.5) p += 0.1;
          return sum + p;
        }, 0) / recentRows.length
      : 0;

  return Number((score + avgPenalty).toFixed(2));
}

async function fetchAlertsFromSensorReadings(assetId, sensorLineId) {
  const SensorReading = getSensorReadingModel();
  
  if (!assetId || !sensorLineId) {
    return [];
  }

  try {
    // Query SensorReading for Warning and Critical status using both Asset ID and Line ID
    const alertDocs = await SensorReading.find({
      "Asset ID": assetId,
      "Line ID": sensorLineId,
      Status: { $in: ["Warning", "Fail"] },
    })
      .sort({ Timestamp: -1 })
      .limit(10)
      .lean();

    // Map to alert format expected by frontend
    const alerts = alertDocs.map((row) => ({
      id: row._id.toString(),
      timestamp: row.Timestamp,
      assetId: row["Asset ID"],
      lineId: row["Line ID"],
      status: row.Status,
      severity: row.Status === "Fail" ? "critical" : "warning",
      failSensor: row["Fail Sensor"] || "None",
      specificProblem: row["Specific Problem"] || "None",
      cause: row.Cause || "None",
      correctiveAction: row["Corrective Action"] || "None",
      message:
        row["Specific Problem"] && row["Specific Problem"] !== "None"
          ? row["Specific Problem"]
          : `${row.Status} detected on ${row["Asset ID"]}`,
    }));

    console.log(`[fetchAlertsFromSensorReadings] Found ${alerts.length} alerts for assetId: ${assetId}, lineId: ${sensorLineId}`);
    return alerts;
  } catch (error) {
    console.error("[fetchAlertsFromSensorReadings] Error fetching alerts:", error);
    return [];
  }
}

function buildLegacyAlerts(latest) {
  const alerts = [];

  if (latest.vibration != null && latest.vibration > 2.5) {
    alerts.push({
      id: 1,
      severity: latest.vibration > 6 ? "critical" : "warning",
      feature: "vibration",
      value: latest.vibration,
      unit: "mm/s",
      message: "Vibration exceeded threshold.",
      machineName: "Filling Machine #A1",
      lineName: "Filling Machine A",
      timestamp: new Date().toISOString(),
      action: "Inspect bearings, motor alignment, and mounting.",
    });
  }

  if (latest.co2Content != null && (latest.co2Content < 4 || latest.co2Content > 6)) {
    alerts.push({
      id: 2,
      severity: latest.co2Content < 2 || latest.co2Content > 8 ? "critical" : "warning",
      feature: "co2Content",
      value: latest.co2Content,
      unit: "%",
      message: "CO₂ level is outside expected range.",
      machineName: "Filling Machine #A1",
      lineName: "Filling Machine A",
      timestamp: new Date().toISOString(),
      action: "Check carbonation control and QA readings.",
    });
  }

  if (latest.pressure != null && (latest.pressure < 2 || latest.pressure > 3)) {
    alerts.push({
      id: 3,
      severity: latest.pressure < 1 || latest.pressure > 4.5 ? "critical" : "warning",
      feature: "tankPressure",
      value: latest.pressure,
      unit: "bar",
      message: "Tank pressure is outside expected range.",
      machineName: "Filling Machine #A1",
      lineName: "Filling Machine A",
      timestamp: new Date().toISOString(),
      action: "Check pressure regulator and tank conditions.",
    });
  }

  return alerts;
}

async function getAdminDashboard(lineId, machineId, assetId, sensorLineId) {
  const SensorReading = getSensorReadingModel();

  // Debug logging
  console.log("=== BACKEND getAdminDashboard ===");
  console.log("Received assetId:", assetId);
  console.log("Received sensorLineId:", sensorLineId);
  console.log("Received lineId:", lineId);
  console.log("Received machineId:", machineId);

  if (!assetId || !sensorLineId) {
    console.log("No assetId or sensorLineId provided, returning empty response");
    return {
      selected: {
        lineId,
        machineId,
        machineName: "Unassigned Machine",
        machineStatus: "normal",
      },
      quality: null,
      alerts: [],
    };
  }

  // ✅ Updated query to use both Asset ID and Line ID
  const docs = await SensorReading.find({ 
    "Asset ID": assetId,
    "Line ID": sensorLineId
  })
    .sort({ Timestamp: -1, _id: -1 })
    .limit(20);

  console.log(`Found ${docs.length} documents for assetId: ${assetId}, lineId: ${sensorLineId}`);

  if (docs.length > 0) {
    console.log("Latest timestamp from DB:", docs[0]?.Timestamp);
    console.log("Latest OEE_sec value:", docs[0]?.OEE_sec);
    console.log("Latest RUL value:", docs[0]?.RUL);
    console.log("Latest Throughput value:", docs[0]?.Throughput);
    console.log("Latest Reject value:", docs[0]?.Reject);
    console.log("Latest Failure_in_30min value:", docs[0]?.Failure_in_30min);
  }

  const readings = docs.map(mapReading);
  const latest = readings[0] || {
    timestamp: null,
    machineAgeDays: null,
    assetId: null,
    lineId: null,

    co2Content: null,
    oxygenContent: null,
    vibration: null,
    pressure: null,
    productTemp: null,
    tankLevel: null,
    fillLevel: null,

    snift1Throttle: null,
    snift1Time: null,
    snift2Throttle: null,
    snift2Time: null,

    cycleRate: null,
    sealingForce: null,
    seamIntegrity: null,
    seamThickness: null,

    status: null,
    failSensor: null,
    specificProblem: null,
    cause: null,
    correctiveAction: null,

    downtime: null,
    throughput: null,
    reject: null,
    oee: null,
    rul: null,
    failureIn30Min: null,
    hasFutureFailure: null,
  };

  if (!latest.timestamp) {
    console.log("No timestamp found for assetId:", assetId);
    return {
      selected: {
        lineId,
        machineId,
        machineName: assetId,
        machineStatus: "normal",
      },
      quality: null,
      alerts: [],
    };
  }

  const co2History = readings
    .map((r) => r.co2Content)
    .filter((v) => v != null)
    .reverse();

  const defectRate = computeDefectRate(latest, readings);
  
  const prevRow = readings[1] || null;
  const prevDefectRate = prevRow
    ? computeDefectRate(prevRow, readings.slice(1))
    : defectRate;

  const trend = Number((defectRate - prevDefectRate).toFixed(2));

  // Drivers object with all KPI fields
  const drivers = {
    // Process parameters
    tankPressure: latest.pressure,
    tankLevel: latest.tankLevel,
    productTemp: latest.productTemp,
    fillLevel: latest.fillLevel,
    snift1Throttle: latest.snift1Throttle,
    snift1Time: latest.snift1Time,
    snift2Throttle: latest.snift2Throttle,
    snift2Time: latest.snift2Time,
    cycleRate: latest.cycleRate,
    vibration: latest.vibration,
    sealingForce: latest.sealingForce,
    seamIntegrity: latest.seamIntegrity,
    oxygenContent: latest.oxygenContent,
    co2Content: latest.co2Content,
    seamThickness: latest.seamThickness,
    
    // Status fields
    status: latest.status,
    failSensor: latest.failSensor,
    specificProblem: latest.specificProblem,
    cause: latest.cause,
    correctiveAction: latest.correctiveAction,
    
    // CRITICAL KPI FIELDS for Manager Insights
    downtime: latest.downtime,
    throughput: latest.throughput,
    reject: latest.reject,
    oee: latest.oee,
    rul: latest.rul,
    failureIn30Min: latest.failureIn30Min,
    hasFutureFailure: latest.hasFutureFailure,
    
    // Timestamp for last update display
    timestamp: latest.timestamp ? latest.timestamp.toISOString() : new Date().toISOString(),
  };

  console.log("=== DRIVERS OBJECT BEING RETURNED ===");
  console.log("oee:", drivers.oee);
  console.log("rul:", drivers.rul);
  console.log("throughput:", drivers.throughput);
  console.log("reject:", drivers.reject);
  console.log("failureIn30Min:", drivers.failureIn30Min);
  console.log("timestamp:", drivers.timestamp);

  // Fetch alerts from SensorReading model using both assetId and sensorLineId
  const alerts = await fetchAlertsFromSensorReadings(assetId, sensorLineId);

  return {
    selected: {
      lineId,
      machineId,
      machineName: "Filling Machine #A1",
      machineStatus:
        latest.vibration != null && latest.vibration > 2.5 ? "warning" : "normal",
    },
    quality: {
      qualityStatus: computeQualityStatus(latest),
      defectRate,
      trend,
      drivers: drivers,
      co2History: co2History.length ? co2History : [0, 0, 0, 0, 0],
    },
    alerts: alerts,
  };
}

async function getUserDashboard(lineId, machineId, assetId, sensorLineId) {
  const SensorReading = getSensorReadingModel();

  if (!assetId || !sensorLineId) {
    return {
      selected: {
        lineId,
        machineId,
        machineName: "Unassigned Machine",
        machineStatus: "normal",
      },
      signals: null,
      charts: null,
      alerts: [],
    };
  }

  // ✅ Updated query to use both Asset ID and Line ID
  const docs = await SensorReading.find({ 
    "Asset ID": assetId,
    "Line ID": sensorLineId
  })
    .sort({ Timestamp: -1, _id: -1 })
    .limit(7);

  if (docs.length > 0) {
    console.log("[getUserDashboard] Latest timestamp from DB:", docs[0]?.Timestamp);
  }

  const readingsDesc = docs.map(mapReading);
  const latest = readingsDesc[0] || {
    timestamp: null,
    machineAgeDays: null,
    assetId: null,
    lineId: null,

    co2Content: null,
    oxygenContent: null,
    vibration: null,
    pressure: null,
    productTemp: null,
    tankLevel: null,
    fillLevel: null,

    snift1Throttle: null,
    snift1Time: null,
    snift2Throttle: null,
    snift2Time: null,

    cycleRate: null,
    sealingForce: null,
    seamIntegrity: null,
    seamThickness: null,

    status: null,
    failSensor: null,
    specificProblem: null,
    cause: null,
    correctiveAction: null,

    downtime: null,
    throughput: null,
    reject: null,
    oee: null,
    rul: null,
    failureIn30Min: null,
    hasFutureFailure: null,
  };

  if (!latest.timestamp) {
    return {
      selected: {
        lineId,
        machineId,
        machineName: assetId,
        machineStatus: "normal",
      },
      signals: null,
      charts: null,
      alerts: [],
    };
  }

  const readings = [...readingsDesc].reverse();

  // Fetch alerts from SensorReading model using both assetId and sensorLineId
  const alerts = await fetchAlertsFromSensorReadings(assetId, sensorLineId);

  return {
    selected: {
      lineId,
      machineId,
      machineName: "Filling Machine #A1",
      machineStatus:
        latest.vibration != null && latest.vibration > 2.5 ? "warning" : "normal",
    },
    signals: {
      tankPressure: {
        value: latest.pressure ?? 0,
        unit: "bar",
        label: "Tank Pressure",
      },
      tankLevel: {
        value: latest.tankLevel ?? 0,
        unit: "",
        label: "Tank Level",
      },
      productTemp: {
        value: latest.productTemp ?? 0,
        unit: "°C",
        label: "Product Temp",
      },
      fillLevel: {
        value: latest.fillLevel ?? 0,
        unit: "ml",
        label: "Fill Level",
      },
      snift1Throttle: {
        value: latest.snift1Throttle ?? 0,
        unit: "",
        label: "Snift-1 Throttle",
      },
      snift1Time: {
        value: latest.snift1Time ?? 0,
        unit: "s",
        label: "Snift-1 Time",
      },
      snift2Throttle: {
        value: latest.snift2Throttle ?? 0,
        unit: "",
        label: "Snift-2 Throttle",
      },
      snift2Time: {
        value: latest.snift2Time ?? 0,
        unit: "s",
        label: "Snift-2 Time",
      },
      cycleRate: {
        value: latest.cycleRate ?? 0,
        unit: "",
        label: "Cycle Rate",
      },
      vibration: {
        value: latest.vibration ?? 0,
        unit: "mm/s",
        label: "Vibration",
      },
      sealingForce: {
        value: latest.sealingForce ?? 0,
        unit: "N",
        label: "Sealing Force",
      },
      seamIntegrity: {
        value: latest.seamIntegrity ?? 0,
        unit: "%",
        label: "Seam Integrity",
      },
      oxygenContent: {
        value: latest.oxygenContent ?? 0,
        unit: "%",
        label: "O₂ Content",
      },
      co2Content: {
        value: latest.co2Content ?? 0,
        unit: "%",
        label: "CO₂ Content",
      },
      seamThickness: {
        value: latest.seamThickness ?? 0,
        unit: "mm",
        label: "Seam Thickness",
      },
    },
    charts: {
      temperatureSeries: readings.map((r) => r.productTemp ?? 0),
      vibrationAxes: [
        latest.vibration ?? 0,
        latest.vibration ?? 0,
        latest.vibration ?? 0,
      ],
    },
    alerts: alerts,
  };
}

module.exports = {
  getAdminDashboard,
  getUserDashboard,
};