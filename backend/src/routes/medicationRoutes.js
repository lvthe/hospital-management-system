const express = require("express");
const router = express.Router();
const c = require("../controllers/medicationController");
const { authMiddleware, checkRole } = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", checkRole("admin", "doctor", "nurse", "receptionist"), c.list);
router.get("/:id", checkRole("admin", "doctor", "nurse", "receptionist"), c.get);
router.post("/", checkRole("admin"), c.create);
router.put("/:id", checkRole("admin"), c.update);
router.patch("/:id/stock", checkRole("admin", "nurse"), c.adjustStock);
router.delete("/:id", checkRole("admin"), c.remove);

module.exports = router;
