const mongoose = require("mongoose");
const { getAdminConnection } = require("../config/db");

const operatorLogSchema = new mongoose.Schema(
  {
    machineId: {
      type: String,
      required: true,
    },
    machineName: {
      type: String,
      required: true,
    },
    assetId: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["issue", "note", "fixed"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
    },
    createdBy: {
      type: String,
      default: "Operator",
    },
  },
  { timestamps: true }
);

module.exports = () => {
  const conn = getAdminConnection();
  return (
    conn.models.OperatorLog ||
    conn.model("OperatorLog", operatorLogSchema, "operator_logs")
  );
};