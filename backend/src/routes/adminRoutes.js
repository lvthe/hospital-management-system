const express = require("express");
const router = express.Router();
const c = require("../controllers/adminController");
const { authMiddleware, checkRole } = require("../middleware/authMiddleware");

router.use(authMiddleware);
router.use(checkRole("admin"));

router.get("/users",                  c.listUsers);
router.get("/users/:id",              c.getUser);
router.put("/users/:id/role",         c.changeRole);
router.patch("/users/:id/active",     c.setActive);
router.get("/system-settings",        c.getSettings);
router.put("/system-settings",        c.updateSettings);

module.exports = router;
