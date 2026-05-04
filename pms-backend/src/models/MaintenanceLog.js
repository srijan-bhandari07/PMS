const mongoose = require("mongoose");
const { getAdminConnection } = require("../config/db");

const maintenanceLogSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      trim: true,
    },
    lineId: {
      type: Number,
      required: true,
    },
    machineId: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    technician: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["planned", "in-progress", "completed"],
      default: "planned",
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = () => {
  const conn = getAdminConnection();
  return (
    conn.models.MaintenanceLog ||
    conn.model("MaintenanceLog", maintenanceLogSchema, "maintenance_logs")
  );
};