const express = require("express");
const router = express.Router();
const c = require("../controllers/appointmentController");
const { authMiddleware, checkRole } = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/",    checkRole("admin", "doctor", "nurse", "receptionist"), c.list);
router.get("/:id", checkRole("admin", "doctor", "nurse", "receptionist"), c.get);
router.post("/",   checkRole("admin", "receptionist", "patient"), c.create);
router.put("/:id", checkRole("admin", "doctor", "nurse", "receptionist"), c.update);
router.patch("/:id/cancel", checkRole("admin", "doctor", "nurse", "receptionist"), c.cancel);

module.exports = router;
