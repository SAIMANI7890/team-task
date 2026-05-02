const mongoose = require("mongoose");

const Project = require("../models/Project");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// POST /projects (admin only)
async function createProject(req, res, next) {
  try {
    const { name, description, teamMembers } = req.body || {};

    if (!name || !String(name).trim()) {
      res.status(400);
      throw new Error("Project name is required");
    }

    let normalizedTeamMembers = [];
    if (teamMembers !== undefined) {
      if (!Array.isArray(teamMembers)) {
        res.status(400);
        throw new Error("teamMembers must be an array of user ids");
      }

      const unique = new Set();
      for (const memberId of teamMembers) {
        if (!isValidObjectId(memberId)) {
          res.status(400);
          throw new Error("Invalid team member id");
        }
        unique.add(String(memberId));
      }

      normalizedTeamMembers = Array.from(unique);
    }

    const project = await Project.create({
      name: String(name).trim(),
      description: description ? String(description) : "",
      createdBy: req.user._id,
      teamMembers: normalizedTeamMembers,
    });

    res.status(201).json(project);
  } catch (err) {
    return next(err);
  }
}

// GET /projects (user-specific)
async function getProjects(req, res, next) {
  try {
    const query =
      req.user.role === "admin"
        ? {}
        : {
            $or: [{ createdBy: req.user._id }, { teamMembers: req.user._id }],
          };

    const projects = await Project.find(query)
      .populate('createdBy', 'name email')
      .populate('teamMembers', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    return next(err);
  }
}

// GET /projects/:id
async function getProjectById(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid project id");
    }

    const project = await Project.findById(id);
    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    res.json(project);
  } catch (err) {
    return next(err);
  }
}

// PUT /projects/:id
async function updateProject(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid project id");
    }

    const project = await Project.findById(id);
    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    const isOwner = project.createdBy && project.createdBy.equals(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isAdmin && !isOwner) {
      res.status(403);
      throw new Error("Not authorized to update this project");
    }

    const { name, description, teamMembers } = req.body || {};

    if (name !== undefined) {
      if (!String(name).trim()) {
        res.status(400);
        throw new Error("Project name cannot be empty");
      }
      project.name = String(name).trim();
    }

    if (description !== undefined) {
      project.description = description ? String(description) : "";
    }

    if (teamMembers !== undefined) {
      if (!Array.isArray(teamMembers)) {
        res.status(400);
        throw new Error("teamMembers must be an array of user ids");
      }

      const unique = new Set();
      for (const memberId of teamMembers) {
        if (!isValidObjectId(memberId)) {
          res.status(400);
          throw new Error("Invalid team member id");
        }
        unique.add(String(memberId));
      }

      project.teamMembers = Array.from(unique);
    }

    const updated = await project.save();
    res.json(updated);
  } catch (err) {
    return next(err);
  }
}

// DELETE /projects/:id (admin only)
async function deleteProject(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid project id");
    }

    const project = await Project.findById(id);
    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    await project.deleteOne();

    res.json({ message: "Project deleted" });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
