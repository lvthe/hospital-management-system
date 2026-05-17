const express = require("express");
const router = express.Router();
const c = require("../controllers/appointmentController");
const { authMiddleware, checkRole } = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/availability", checkRole("admin", "doctor", "nurse", "receptionist", "patient"), c.getAvailability);
router.get("/",             checkRole("admin", "doctor", "nurse", "receptionist", "patient"), c.list);
router.get("/:id",          checkRole("admin", "doctor", "nurse", "receptionist"), c.get);
router.post("/",            checkRole("admin", "receptionist", "patient"), c.create);
router.put("/:id/status",   checkRole("admin", "doctor", "nurse", "receptionist"), c.updateStatus);
router.put("/:id",          checkRole("admin", "doctor", "nurse", "receptionist"), c.update);
router.patch("/:id/cancel", checkRole("admin", "doctor", "nurse", "receptionist"), c.cancel);

module.exports = router;
