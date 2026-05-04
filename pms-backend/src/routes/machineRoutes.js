const express = require("express");
const machineController = require("../controllers/machineController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");

const router = express.Router();

// ✅ Public/Protected routes - place specific routes BEFORE generic ones
router.get("/", requireAuth, machineController.getMachines);
router.get("/assets", requireAuth, requireAdmin, machineController.getAssets);
router.get("/line-ids", requireAuth, machineController.getLineIds);  // ✅ New route - placed before /:id

// Generic routes with ID parameter - MUST come after specific routes
router.post("/", requireAuth, requireAdmin, machineController.createMachine);
router.patch("/:id", requireAuth, requireAdmin, machineController.updateMachine);
router.delete("/:id", requireAuth, requireAdmin, machineController.deleteMachine);

module.exports = router;