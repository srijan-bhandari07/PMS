const mongoose = require("mongoose");
const { getSensorConnection } = require("../config/db");

const sensorReadingSchema = new mongoose.Schema(
  {
    day: mongoose.Schema.Types.Mixed,
    timestampSec: mongoose.Schema.Types.Mixed,

    tankPressure: mongoose.Schema.Types.Mixed,
    tankLevel: mongoose.Schema.Types.Mixed,
    productTemp: mongoose.Schema.Types.Mixed,
    fillLevel: mongoose.Schema.Types.Mixed,

    snift1Throttle: mongoose.Schema.Types.Mixed,
    snift1Time: mongoose.Schema.Types.Mixed,
    snift2Throttle: mongoose.Schema.Types.Mixed,
    snift2Time: mongoose.Schema.Types.Mixed,

    cycleRate: mongoose.Schema.Types.Mixed,
    vibration: mongoose.Schema.Types.Mixed,
    sealingForce: mongoose.Schema.Types.Mixed,
    seamIntegrity: mongoose.Schema.Types.Mixed,

    oxygenContent: mongoose.Schema.Types.Mixed,
    co2Content: mongoose.Schema.Types.Mixed,
    seamThickness: mongoose.Schema.Types.Mixed,

    status: mongoose.Schema.Types.Mixed,
    failSensor: mongoose.Schema.Types.Mixed,
    specificProblem: mongoose.Schema.Types.Mixed,
    cause: mongoose.Schema.Types.Mixed,
    correctiveAction: mongoose.Schema.Types.Mixed,
  },
  {
    strict: false,
    timestamps: false,
  }
);

module.exports = () => {
  const conn = getSensorConnection();
  return (
    conn.models.SensorReading ||
    conn.model("SensorReading", sensorReadingSchema, "sensor_readings")
  );
};