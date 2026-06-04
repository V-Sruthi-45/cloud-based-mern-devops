// =============================================================
// routes/projectRoutes.js - Project API Routes
// =============================================================

const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const projectValidation = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ min: 3, max: 100 }),
  body("description").optional().isLength({ max: 500 }),
  body("status").optional().isIn(["active", "on-hold", "completed", "archived"]),
  body("priority").optional().isIn(["low", "medium", "high", "critical"]),
];

// All project routes are protected
router.use(protect);

router.route("/")
  .get(getProjects)
  .post(projectValidation, validate, createProject);

router.route("/:id")
  .get(getProject)
  .put(projectValidation, validate, updateProject)
  .delete(deleteProject);

module.exports = router;
