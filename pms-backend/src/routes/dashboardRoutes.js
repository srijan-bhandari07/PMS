const express = require("express");
const {
  getUserDashboard,
  getAdminDashboard,
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/user", getUserDashboard);
router.get("/admin", getAdminDashboard);

module.exports = router;