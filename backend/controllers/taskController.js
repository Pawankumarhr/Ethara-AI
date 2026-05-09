import mongoose from "mongoose";
import { Task, Project } from "../config/db.js";

const canAccessTask = async (task, user) => {
  if (user.role === "Admin") return true;
  return task.assigned_to && task.assigned_to.toString() === user.id.toString();
};

export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, projectId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: "Task title and projectId are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (assignedTo) {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const MemberExists = project.Members.some(m => m.user_id.toString() === assignedTo.toString());
      if (!MemberExists) {
        return res.status(400).json({ message: "Assigned user is not in this project" });
      }
    }

    const task = await Task.create({
      title,
      description,
      status: status || "PENDING",
      priority: priority || "MEDIUM",
      due_date: dueDate ? new Date(dueDate) : null,
      assigned_to: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : null,
      project_id: new mongoose.Types.ObjectId(projectId),
    });

    const populated = await task.populate([
      { path: "assigned_to", select: "id name email role" },
      { path: "project_id", select: "id title" },
    ]);

    return res.status(201).json({
      id: populated._id,
      title: populated.title,
      description: populated.description,
      status: populated.status,
      priority: populated.priority,
      assigned_to: populated.assigned_to,
      assignee: populated.assigned_to,
      project_id: populated.project_id._id,
      project: populated.project_id,
      due_date: populated.due_date,
      dueDate: populated.due_date,
      created_at: populated.created_at,
      updated_at: populated.updated_at,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create task" });
  }
};

export const getTasks = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "Admin") {
      tasks = await Task.find()
        .populate("assigned_to", "id name email role")
        .populate("project_id", "id title")
        .sort({ created_at: -1 })
        .lean();
    } else {
      tasks = await Task.find({ assigned_to: req.user.id })
        .populate("assigned_to", "id name email role")
        .populate("project_id", "id title")
        .sort({ created_at: -1 })
        .lean();
    }

    const formatted = tasks.map(t => ({
      id: t._id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assigned_to: t.assigned_to?._id,
      assignee: t.assigned_to,
      project_id: t.project_id._id,
      project: t.project_id,
      due_date: t.due_date,
      dueDate: t.due_date,
      created_at: t.created_at,
      updated_at: t.updated_at,
    }));

    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const allowed = await canAccessTask(task, req.user);
    if (!allowed) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (req.user.role === "Admin") {
      if (req.body.title) task.title = req.body.title;
      if (req.body.description !== undefined) task.description = req.body.description;
      if (req.body.status) task.status = req.body.status;
      if (req.body.priority) task.priority = req.body.priority;
      if (req.body.dueDate !== undefined) task.due_date = req.body.dueDate ? new Date(req.body.dueDate) : task.due_date;
      if (req.body.assignedTo !== undefined) {
        task.assigned_to = req.body.assignedTo ? new mongoose.Types.ObjectId(req.body.assignedTo) : null;
      }
      if (req.body.projectId) task.project_id = new mongoose.Types.ObjectId(req.body.projectId);
    } else {
      if (req.body.status) task.status = req.body.status;
    }

    await task.save();
    const updated = await task.populate([
      { path: "assigned_to", select: "id name email role" },
      { path: "project_id", select: "id title" },
    ]);

    return res.json({
      id: updated._id,
      title: updated.title,
      description: updated.description,
      status: updated.status,
      priority: updated.priority,
      assigned_to: updated.assigned_to,
      assignee: updated.assigned_to,
      project_id: updated.project_id._id,
      project: updated.project_id,
      due_date: updated.due_date,
      dueDate: updated.due_date,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update task" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await Task.deleteOne({ _id: taskId });
    return res.json({ message: "Task deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete task" });
  }
};
