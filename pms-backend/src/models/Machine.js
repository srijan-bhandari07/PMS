const mongoose = require("mongoose");
const { getAdminConnection } = require("../config/db");

const machineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    lineName: {
      type: String,
      required: true,
      trim: true,
    },
    assetId: {
      type: String,
      default: "",
      trim: true,
    },
    sensorLineId: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["normal", "warning", "non-operational"],
      default: "normal",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = () => {
  const conn = getAdminConnection();
  return (
    conn.models.Machine ||
    conn.model("Machine", machineSchema, "machines")
  );
};