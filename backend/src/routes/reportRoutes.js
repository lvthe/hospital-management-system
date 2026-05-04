const express = require("express");
const router = express.Router();
const c = require("../controllers/reportController");
const { authMiddleware, checkRole } = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/dashboard",     checkRole("admin", "doctor", "receptionist"), c.dashboard);
router.get("/appointments",  checkRole("admin", "doctor"), c.appointments);
router.get("/revenue",       checkRole("admin"), c.revenue);

module.exports = router;
