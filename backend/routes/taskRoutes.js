import express from "express";
import { createTask, deleteTask, getTasks, updateTask } from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", requireRole("ADMIN"), createTask);
router.get("/", getTasks);
router.put("/:id", updateTask);
router.delete("/:id", requireRole("ADMIN"), deleteTask);

export default router;
