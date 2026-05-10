import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getAllUsers, updateUserRole, deleteUser } from "../controllers/userController.js";

const router = express.Router();

// Get all users (team members) - protected, admin only
router.get("/", protect, adminOnly, getAllUsers);

// Update user role - protected, admin only
router.put("/role", protect, adminOnly, updateUserRole);

// Delete user - protected, admin only
router.delete("/:userId", protect, adminOnly, deleteUser);

export default router;
