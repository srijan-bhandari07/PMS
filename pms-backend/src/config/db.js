const mongoose = require("mongoose");
const { MONGO_SENSOR_URI, MONGO_ADMIN_URI } = require("./env");

let sensorConnection = null;
let adminConnection = null;

async function connectDBs() {
  if (!MONGO_SENSOR_URI) {
    throw new Error("MONGO_SENSOR_URI is missing in .env");
  }

  if (!MONGO_ADMIN_URI) {
    throw new Error("MONGO_ADMIN_URI is missing in .env");
  }

  sensorConnection = await mongoose.createConnection(MONGO_SENSOR_URI).asPromise();
  console.log("✅ Sensor MongoDB connected");

  adminConnection = await mongoose.createConnection(MONGO_ADMIN_URI).asPromise();
  console.log("✅ Admin MongoDB connected");
}

function getSensorConnection() {
  if (!sensorConnection) {
    throw new Error("Sensor DB is not connected");
  }
  return sensorConnection;
}

function getAdminConnection() {
  if (!adminConnection) {
    throw new Error("Admin DB is not connected");
  }
  return adminConnection;
}

module.exports = {
  connectDBs,
  getSensorConnection,
  getAdminConnection,
};