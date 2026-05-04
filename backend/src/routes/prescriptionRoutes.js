const express = require("express");
const router = express.Router();
const c = require("../controllers/prescriptionController");
const { authMiddleware, checkRole } = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/medical-record/:recordId", checkRole("admin", "doctor", "nurse"), c.getByRecord);
router.get("/patient/:patientId",       checkRole("admin", "doctor", "nurse"), c.getPatientPrescriptions);
router.get("/:id",                      checkRole("admin", "doctor", "nurse"), c.get);
router.post("/",                        checkRole("admin", "doctor"), c.create);
router.put("/:id",                      checkRole("admin", "doctor"), c.update);
router.patch("/:id/dispense",           checkRole("admin", "nurse"), c.dispense);
router.delete("/:id",                   checkRole("admin"), c.remove);

module.exports = router;
