import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB, User, Project, Task } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { protect } from "./middleware/authMiddleware.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "Ethara AI API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/api/dashboard", protect, async (req, res) => {
  try {
    const now = new Date();

    let projectFilter = {};
    let taskFilter = {};

    if (req.user.role !== "ADMIN") {
      const projects = await Project.find({ "members.user_id": req.user.id });
      const projectIds = projects.map(p => p._id);
      projectFilter = { _id: { $in: projectIds.length ? projectIds : [] } };
      taskFilter = { assigned_to: req.user.id };
    }

    const totalProjects = await Project.countDocuments(projectFilter);
    const totalTasks = await Task.countDocuments(taskFilter);
    const completedTasks = await Task.countDocuments({ ...taskFilter, status: "COMPLETED" });
    const pendingTasks = await Task.countDocuments({
      ...taskFilter,
      status: { $in: ["PENDING", "IN_PROGRESS"] },
    });
    const overdueTasks = await Task.countDocuments({
      ...taskFilter,
      due_date: { $lt: now },
      status: { $ne: "COMPLETED" },
    });

    const recentTasks = await Task.find(taskFilter)
      .populate("assigned_to", "id name email")
      .populate("project_id", "id title")
      .sort({ created_at: -1 })
      .limit(8)
      .lean();

    const formattedTasks = recentTasks.map(t => ({
      id: t._id,
      title: t.title,
      status: t.status,
      assignee: t.assigned_to,
      project: t.project_id,
    }));

    return res.json({
      stats: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
      },
      recentTasks: formattedTasks,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch dashboard" });
  }
});

// Root route for Railway backend
app.get("/", (req, res) => {
  res.json({
    message: "Ethara AI Backend Running Successfully",
  });
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || "Server error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(error => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
