const mongoose = require("mongoose");
const Project = require("../models/Project");

function adminOnly(req, res, next) {
  if (!req.user) {
    res.status(401);
    return next(new Error("Not authorized"));
  }

  if (req.user.role !== "admin") {
    res.status(403);
    return next(new Error("Admin access required"));
  }

  return next();
}

// Allows access if:
// - user is admin, OR
// - user is project creator, OR
// - user is included in project.teamMembers
async function projectMemberOrAdmin(req, res, next) {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized");
    }

    if (req.user.role === "admin") {
      return next();
    }

    const projectId = req.params.projectId || req.params.id;
    if (!projectId) {
      res.status(400);
      throw new Error("Project id is required");
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      res.status(400);
      throw new Error("Invalid project id");
    }

    const project = await Project.findById(projectId).select(
      "createdBy teamMembers",
    );

    if (!project) {
      res.status(404);
      throw new Error("Project not found");
    }

    const userId = req.user._id;

    const isCreator = project.createdBy && project.createdBy.equals(userId);
    const isTeamMember = Array.isArray(project.teamMembers)
      ? project.teamMembers.some((memberId) => memberId.equals(userId))
      : false;

    if (!isCreator && !isTeamMember) {
      res.status(403);
      throw new Error("Not authorized to access this project");
    }

    req.project = project;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { adminOnly, projectMemberOrAdmin };
