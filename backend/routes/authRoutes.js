import express from "express";
import { getUsers, login, register } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", protect, requireRole("Admin"), getUsers);

export default router;
