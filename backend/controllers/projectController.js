import mongoose from "mongoose";
import { Project, User } from "../config/db.js";

const canAccessProject = async (projectId, user) => {
  if (user.role === "Admin") return true;

  const project = await Project.findById(projectId);
  if (!project) return false;

  return project.Members.some(m => m.user_id.toString() === user.id.toString());
};

export const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Project title is required" });
    }

    const project = await Project.create({
      title,
      description,
      created_by: req.user.id,
      Members: [{ user_id: req.user.id }],
    });

    const populated = await project.populate([
      { path: "created_by", select: "id name email" },
      { path: "Members.user_id", select: "id name email role" },
    ]);

    return res.status(201).json({
      id: populated._id,
      title: populated.title,
      description: populated.description,
      created_by: populated.created_by._id,
      creator: populated.created_by,
      Members: populated.Members,
      created_at: populated.created_at,
      updated_at: populated.updated_at,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create project" });
  }
};

export const addProjectMember = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid project or user ID" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const MemberExists = project.Members.some(m => m.user_id.toString() === userId.toString());
    if (MemberExists) {
      return res.status(400).json({ message: "User is already a Member" });
    }

    project.Members.push({ user_id: new mongoose.Types.ObjectId(userId) });
    await project.save();

    const updated = await project.populate({ path: "Members.user_id", select: "id name email role" });

    return res.status(201).json({
      user_id: userId,
      joined_at: updated.Members.find(m => m.user_id._id.toString() === userId.toString()).joined_at,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add project Member" });
  }
};

export const getProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === "Admin") {
      projects = await Project.find()
        .populate("created_by", "id name email")
        .populate("Members.user_id", "id name email role")
        .sort({ created_at: -1 })
        .lean();
    } else {
      projects = await Project.find({
        "Members.user_id": req.user.id,
      })
        .populate("created_by", "id name email")
        .populate("Members.user_id", "id name email role")
        .sort({ created_at: -1 })
        .lean();
    }

    const formatted = projects.map(p => ({
      id: p._id,
      title: p.title,
      description: p.description,
      created_by: p.created_by._id,
      creator: p.created_by,
      Members: p.Members,
      tasks: [],
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch projects" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await Project.findById(projectId)
      .populate("created_by", "id name email")
      .populate("Members.user_id", "id name email role")
      .lean();

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const canAccess = await canAccessProject(projectId, req.user);
    if (!canAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json({
      id: project._id,
      title: project.title,
      description: project.description,
      created_by: project.created_by._id,
      creator: project.created_by,
      Members: project.Members,
      tasks: [],
      created_at: project.created_at,
      updated_at: project.updated_at,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch project" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { title, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (title) project.title = title;
    if (description !== undefined) project.description = description;

    await project.save();

    return res.json({
      id: project._id,
      title: project.title,
      description: project.description,
      created_at: project.created_at,
      updated_at: project.updated_at,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update project" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await Project.deleteOne({ _id: projectId });

    return res.json({ message: "Project deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete project" });
  }
};
