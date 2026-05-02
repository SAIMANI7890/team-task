const express = require("express");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const { protect } = require("../middleware/authMiddleware");
const {
  adminOnly,
  projectMemberOrAdmin,
} = require("../middleware/roleMiddleware");

const router = express.Router();

router
  .route("/")
  .post(protect, adminOnly, createProject)
  .get(protect, getProjects);

router
  .route("/:id")
  .get(protect, projectMemberOrAdmin, getProjectById)
  .put(protect, updateProject)
  .delete(protect, adminOnly, deleteProject);

module.exports = router;
