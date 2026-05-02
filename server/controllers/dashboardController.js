const Project = require("../models/Project");
const Task = require("../models/Task");

async function buildAccessFilter(user) {
  if (user.role === "admin") return {};

  const projects = await Project.find({
    $or: [{ createdBy: user._id }, { teamMembers: user._id }],
  }).select("_id");

  const projectIds = projects.map((p) => p._id);
  return { project: { $in: projectIds } };
}

// GET /dashboard
async function getDashboard(req, res, next) {
  try {
    const baseFilter = await buildAccessFilter(req.user);

    const now = new Date();

    const totalTasksPromise = Task.countDocuments(baseFilter);

    const tasksByStatusPromise = Task.aggregate([
      { $match: baseFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const overdueTasksPromise = Task.find({
      ...baseFilter,
      dueDate: { $lt: now },
      status: { $ne: "done" },
    })
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 })
      .lean();

    const myTasksPromise = Task.find({
      ...baseFilter,
      assignedTo: req.user._id,
    })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const [totalTasks, tasksByStatusAgg, overdueTasks, myTasks] =
      await Promise.all([
        totalTasksPromise,
        tasksByStatusPromise,
        overdueTasksPromise,
        myTasksPromise,
      ]);

    const tasksByStatus = { todo: 0, "in-progress": 0, done: 0 };
    for (const row of tasksByStatusAgg) {
      if (row && row._id && tasksByStatus[row._id] !== undefined) {
        tasksByStatus[row._id] = row.count;
      }
    }

    res.json({
      totalTasks,
      tasksByStatus,
      overdueTasks,
      myTasks,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getDashboard };
