require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 8080,
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "2h",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  MONGO_SENSOR_URI: process.env.MONGO_SENSOR_URI || "",
  MONGO_ADMIN_URI: process.env.MONGO_ADMIN_URI || "",
};