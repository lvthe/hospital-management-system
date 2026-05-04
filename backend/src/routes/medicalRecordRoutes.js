const express = require("express");
const router = express.Router();
const c = require("../controllers/medicalRecordController");
const { authMiddleware, checkRole } = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", checkRole("admin", "doctor", "nurse"), c.list);
router.get("/patient/:patientId", checkRole("admin", "doctor", "nurse"), c.getByPatient);
router.get("/:id", checkRole("admin", "doctor", "nurse"), c.get);
router.post("/", checkRole("admin", "doctor"), c.create);
router.put("/:id", checkRole("admin", "doctor"), c.update);
router.delete("/:id", checkRole("admin"), c.remove);

module.exports = router;
