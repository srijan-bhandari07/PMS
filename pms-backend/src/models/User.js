const mongoose = require("mongoose");
const { getAdminConnection } = require("../config/db");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "operator", "viewer"],
      default: "operator",
    },
    active: { type: Boolean, default: true },
    accessibleMachines: { type: [Number], default: [] },
  },
  { timestamps: true }
);

module.exports = () => {
  const conn = getAdminConnection();
  return conn.models.User || conn.model("User", userSchema, "users");
};