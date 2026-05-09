import express from "express";
import {
  addProjectMember,
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject,
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", requireRole("ADMIN"), createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.put("/:id", requireRole("ADMIN"), updateProject);
router.delete("/:id", requireRole("ADMIN"), deleteProject);
router.post("/:id/members", requireRole("ADMIN"), addProjectMember);

export default router;
