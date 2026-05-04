const express = require("express");
const cors = require("cors");
const { CLIENT_ORIGIN } = require("./config/env");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const healthRoutes = require("./routes/healthRoutes");
const machineRoutes = require("./routes/machineRoutes");

const app = express();

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/machines", machineRoutes);
app.use("/api/operator-logs", require("./routes/operatorLogRoutes"));

module.exports = app;