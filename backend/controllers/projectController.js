// =============================================================
// controllers/projectController.js - Project CRUD Logic
// =============================================================

const Project = require("../models/Project");
const Task = require("../models/Task");

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, tags, color } = req.body;

    const project = await Project.create({
      title,
      description,
      status,
      priority,
      dueDate,
      tags,
      color,
      owner: req.user.id,
    });

    console.log(`✅ [Project] Created: "${project.title}" by ${req.user.email}`);
    res.status(201).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects for current user (with optional search)
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    const { search, status, priority, page = 1, limit = 20 } = req.query;

    const filter = { owner: req.user.id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Project.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: projects.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Include task count for this project
    const taskStats = await Task.aggregate([
      { $match: { project: project._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({ success: true, project, taskStats });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    console.log(`✅ [Project] Updated: "${project.title}" by ${req.user.email}`);
    res.status(200).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a project (and all its tasks)
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Cascade delete all tasks under this project
    const deletedTasks = await Task.deleteMany({ project: req.params.id });
    console.log(
      `🗑️  [Project] Deleted: "${project.title}" and ${deletedTasks.deletedCount} tasks by ${req.user.email}`
    );

    res.status(200).json({
      success: true,
      message: `Project and ${deletedTasks.deletedCount} associated tasks deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};
