const express = require("express");
const adminController = require("../controllers/adminController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get("/users", adminController.getUsers);
router.post("/users", adminController.createUser);
router.patch("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);
router.post("/users/:userId/machines/:machineId/toggle", adminController.toggleMachineAccess);

router.get("/maintenance", adminController.getMaintenanceLogs);
router.post("/maintenance", adminController.createMaintenanceLog);
router.patch("/maintenance/:id", adminController.updateMaintenanceLog);
router.delete("/maintenance/:id", adminController.deleteMaintenanceLog);

module.exports = router;