const express = require("express");
const router = express.Router();
const c = require("../controllers/invoiceController");
const { authMiddleware, checkRole } = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", checkRole("admin", "receptionist", "doctor"), c.list);
router.get("/patient/:patientId", checkRole("admin", "receptionist", "doctor"), c.getByPatient);
router.get("/:id", checkRole("admin", "receptionist", "doctor"), c.get);
router.post("/", checkRole("admin", "receptionist"), c.create);
router.put("/:id/payment", checkRole("admin", "receptionist"), c.payment);
router.patch("/:id/cancel", checkRole("admin"), c.cancel);

module.exports = router;
