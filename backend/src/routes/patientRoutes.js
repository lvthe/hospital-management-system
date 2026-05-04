const express = require("express");
const router = express.Router();
const c = require("../controllers/patientController");
const { authMiddleware, checkRole } = require("../middleware/authMiddleware");

router.use(authMiddleware);

// GET /api/v1/patients/me - bệnh nhân xem hồ sơ của mình
router.get("/me", checkRole("patient"), c.getMyProfile);

// GET /api/v1/patients - danh sách (admin, doctor, nurse, receptionist)
router.get("/", checkRole("admin", "doctor", "nurse", "receptionist"), c.list);

// GET /api/v1/patients/:id
router.get("/:id", checkRole("admin", "doctor", "nurse", "receptionist"), c.get);

// POST /api/v1/patients - tạo bệnh nhân mới
router.post("/", checkRole("admin", "receptionist"), c.create);

// PUT /api/v1/patients/:id - cập nhật
router.put("/:id", checkRole("admin", "receptionist"), c.update);

// DELETE /api/v1/patients/:id - xóa (admin only)
router.delete("/:id", checkRole("admin"), c.remove);

module.exports = router;
