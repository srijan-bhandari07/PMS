const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");

const {
  createOperatorLog,
  getOperatorLogs,
  resolveOperatorLog,
} = require("../controllers/operatorLogController");

const router = express.Router();
console.log({
  requireAuth,
  getOperatorLogs,
  createOperatorLog,
  resolveOperatorLog,
});

router.get("/", requireAuth, getOperatorLogs);
router.post("/", requireAuth, createOperatorLog);
router.patch("/:id/resolve", requireAuth, resolveOperatorLog);

module.exports = router;