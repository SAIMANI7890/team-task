const mongoose = require("mongoose");

const Project = require("../models/Project");
const Task = require("../models/Task");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function getProjectIfMemberOrAdmin(user, projectId) {
  if (!isValidObjectId(projectId)) {
    const err = new Error("Invalid project id");
    err.statusCode = 400;
    throw err;
  }

  const project = await Project.findById(projectId).select(
    "createdBy teamMembers",
  );
  if (!project) {
    const err = new Error("Project not found");
    err.statusCode = 404;
    throw err;
  }

  if (user.role === "admin") return project;

  const isCreator = project.createdBy && project.createdBy.equals(user._id);
  const isTeamMember = Array.isArray(project.teamMembers)
    ? project.teamMembers.some((memberId) => memberId.equals(user._id))
    : false;

  if (!isCreator && !isTeamMember) {
    const err = new Error("Not authorized to access this project");
    err.statusCode = 403;
    throw err;
  }

  return project;
}

// POST /tasks
async function createTask(req, res, next) {
  try {
    const { title, description, project, assignedTo, status, dueDate } =
      req.body || {};

    if (!title || !String(title).trim()) {
      res.status(400);
      throw new Error("Task title is required");
    }

    if (!project) {
      res.status(400);
      throw new Error("project is required");
    }

    const projectDoc = await getProjectIfMemberOrAdmin(req.user, project);

    if (status !== undefined) {
      const allowed = ["todo", "in-progress", "done"];
      if (!allowed.includes(status)) {
        res.status(400);
        throw new Error("Invalid status");
      }
    }

    let assignedToId;
    if (assignedTo !== undefined && assignedTo !== null && assignedTo !== "") {
      if (!isValidObjectId(assignedTo)) {
        res.status(400);
        throw new Error("Invalid assignedTo user id");
      }

      // If requester is not admin, keep assignment within the project team/creator
      if (req.user.role !== "admin") {
        const isAssigneeCreator =
          projectDoc.createdBy && projectDoc.createdBy.equals(assignedTo);
        const isAssigneeTeamMember = Array.isArray(projectDoc.teamMembers)
          ? projectDoc.teamMembers.some((memberId) =>
              memberId.equals(assignedTo),
            )
          : false;

        if (!isAssigneeCreator && !isAssigneeTeamMember) {
          res.status(400);
          throw new Error("assignedTo must be a member of the project");
        }
      }

      assignedToId = assignedTo;
    }

    let dueDateValue;
    if (dueDate !== undefined && dueDate !== null && dueDate !== "") {
      const parsed = new Date(dueDate);
      if (Number.isNaN(parsed.getTime())) {
        res.status(400);
        throw new Error("Invalid dueDate");
      }
      dueDateValue = parsed;
    }

    const task = await Task.create({
      title: String(title).trim(),
      description: description ? String(description) : "",
      project: projectDoc._id,
      assignedTo: assignedToId,
      status: status || "todo",
      dueDate: dueDateValue,
    });

    res.status(201).json(task);
  } catch (err) {
    if (err && err.statusCode) {
      res.status(err.statusCode);
    }
    return next(err);
  }
}

// GET /tasks?project=<id>&user=<id>
async function getTasks(req, res, next) {
  try {
    const { project, user } = req.query || {};

    const filter = {};

    if (project) {
      const projectDoc = await getProjectIfMemberOrAdmin(req.user, project);
      filter.project = projectDoc._id;
    } else if (req.user.role !== "admin") {
      // Without project filter, restrict to projects the user is part of
      const projects = await Project.find({
        $or: [{ createdBy: req.user._id }, { teamMembers: req.user._id }],
      }).select("_id");

      const projectIds = projects.map((p) => p._id);
      filter.project = { $in: projectIds };
    }

    if (user !== undefined) {
      if (!user) {
        // allow empty to mean "no filter"
      } else {
        if (!isValidObjectId(user)) {
          res.status(400);
          throw new Error("Invalid user id");
        }
        filter.assignedTo = user;
      }
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    if (err && err.statusCode) {
      res.status(err.statusCode);
    }
    return next(err);
  }
}

// PUT /tasks/:id (update status, assignment)
async function updateTask(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid task id");
    }

    const task = await Task.findById(id);
    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }

    if (!task.project) {
      res.status(400);
      throw new Error("Task is missing project association");
    }

    const projectDoc = await getProjectIfMemberOrAdmin(req.user, task.project);

    const { status, assignedTo } = req.body || {};

    if (status !== undefined) {
      const allowed = ["todo", "in-progress", "done"];
      if (!allowed.includes(status)) {
        res.status(400);
        throw new Error("Invalid status");
      }
      task.status = status;
    }

    if (assignedTo !== undefined) {
      if (assignedTo === null || assignedTo === "") {
        task.assignedTo = undefined;
      } else {
        if (!isValidObjectId(assignedTo)) {
          res.status(400);
          throw new Error("Invalid assignedTo user id");
        }

        if (req.user.role !== "admin") {
          const isAssigneeCreator =
            projectDoc.createdBy && projectDoc.createdBy.equals(assignedTo);
          const isAssigneeTeamMember = Array.isArray(projectDoc.teamMembers)
            ? projectDoc.teamMembers.some((memberId) =>
                memberId.equals(assignedTo),
              )
            : false;

          if (!isAssigneeCreator && !isAssigneeTeamMember) {
            res.status(400);
            throw new Error("assignedTo must be a member of the project");
          }
        }

        task.assignedTo = assignedTo;
      }
    }

    const updated = await task.save();
    res.json(updated);
  } catch (err) {
    if (err && err.statusCode) {
      res.status(err.statusCode);
    }
    return next(err);
  }
}

// DELETE /tasks/:id
async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid task id");
    }

    const task = await Task.findById(id);
    if (!task) {
      res.status(404);
      throw new Error("Task not found");
    }

    if (!task.project) {
      res.status(400);
      throw new Error("Task is missing project association");
    }

    await getProjectIfMemberOrAdmin(req.user, task.project);

    await task.deleteOne();

    res.json({ message: "Task deleted" });
  } catch (err) {
    if (err && err.statusCode) {
      res.status(err.statusCode);
    }
    return next(err);
  }
}

module.exports = { createTask, getTasks, updateTask, deleteTask };
