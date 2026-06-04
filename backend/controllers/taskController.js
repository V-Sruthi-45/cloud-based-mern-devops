// =============================================================
// controllers/taskController.js - Task CRUD Logic
// =============================================================

const Task = require("../models/Task");
const Project = require("../models/Project");

// ---- Helper: verify project ownership ----
const verifyProjectOwnership = async (projectId, userId) => {
  const project = await Project.findOne({ _id: projectId, owner: userId });
  return !!project;
};

// @desc    Create a new task under a project
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, project, dueDate, tags } = req.body;

    // Ensure the project belongs to the current user
    const isOwner = await verifyProjectOwnership(project, req.user.id);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to add tasks to this project.",
      });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      project,
      dueDate,
      tags,
      owner: req.user.id,
    });

    const populatedTask = await Task.findById(task._id).populate("project", "title color");
    console.log(`✅ [Task] Created: "${task.title}" by ${req.user.email}`);
    res.status(201).json({ success: true, task: populatedTask });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks (optionally filtered by project, status, priority)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const { project, status, priority, search, page = 1, limit = 50 } = req.query;

    const filter = { owner: req.user.id };
    if (project) filter.project = project;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate("project", "title color status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate("project", "title color");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    console.log(`✅ [Task] Updated: "${task.title}" → ${task.status}`);
    res.status(200).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    console.log(`🗑️  [Task] Deleted: "${task.title}" by ${req.user.email}`);
    res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics for current user
// @route   GET /api/tasks/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [projectCount, taskStats] = await Promise.all([
      Project.countDocuments({ owner: userId }),
      Task.aggregate([
        { $match: { owner: require("mongoose").Types.ObjectId.createFromHexString(userId.toString()) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Reshape task stats into a flat object
    const tasksByStatus = { todo: 0, "in-progress": 0, review: 0, completed: 0 };
    taskStats.forEach((s) => {
      tasksByStatus[s._id] = s.count;
    });
    const totalTasks = Object.values(tasksByStatus).reduce((a, b) => a + b, 0);

    res.status(200).json({
      success: true,
      stats: {
        totalProjects: projectCount,
        totalTasks,
        tasksByStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};
