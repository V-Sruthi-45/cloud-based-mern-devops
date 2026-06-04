// =============================================================
// routes/taskRoutes.js - Task API Routes
// =============================================================

const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require("../controllers/taskController");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const taskValidation = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ min: 3, max: 200 }),
  body("project").notEmpty().withMessage("Project ID is required").isMongoId(),
  body("status").optional().isIn(["todo", "in-progress", "review", "completed"]),
  body("priority").optional().isIn(["low", "medium", "high", "critical"]),
];

router.use(protect);

// Must be before /:id to avoid conflict
router.get("/stats", getDashboardStats);

router.route("/")
  .get(getTasks)
  .post(taskValidation, validate, createTask);

router.route("/:id")
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
