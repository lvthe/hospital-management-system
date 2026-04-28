const express = require("express");
const router = express.Router();
const c = require("../controllers/doctorController");
const { authMiddleware, checkRole } = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/me", checkRole("doctor"), c.getMyProfile);
router.get("/", c.list); // tất cả role đều xem được
router.get("/:id", c.get);
router.post("/", checkRole("admin"), c.create);
router.put("/:id", checkRole("admin"), c.update);

module.exports = router;
