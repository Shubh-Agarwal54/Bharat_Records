import Todo from '../models/Todo.model.js';

// @desc    Create new todo
// @route   POST /api/todos
// @access  Private
export const createTodo = async (req, res) => {
  try {
    const { taskName, priority } = req.body;

    if (!taskName || !taskName.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Task name is required'
      });
    }

    const todo = await Todo.create({
      user: req.user._id,
      taskName: taskName.trim(),
      priority: priority || 'medium'
    });

    res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      data: { todo }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get all todos for user
// @route   GET /api/todos
// @access  Private
export const getTodos = async (req, res) => {
  try {
    const { completed, priority } = req.query;

    const query = {
      user: req.user._id,
      isDeleted: false
    };

    if (completed !== undefined) {
      query.isCompleted = completed === 'true';
    }

    if (priority) {
      query.priority = priority;
    }

    const todos = await Todo.find(query).sort({ createdAt: -1 });

    res.json({
      status: 'success',
      count: todos.length,
      data: { todos }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get todo by ID
// @route   GET /api/todos/:id
// @access  Private
export const getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });

    if (!todo) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    res.json({
      status: 'success',
      data: { todo }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update todo
// @route   PUT /api/todos/:id
// @access  Private
export const updateTodo = async (req, res) => {
  try {
    const { taskName, priority, isCompleted } = req.body;

    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });

    if (!todo) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    if (taskName !== undefined) todo.taskName = taskName.trim();
    if (priority !== undefined) todo.priority = priority;
    
    if (isCompleted !== undefined) {
      todo.isCompleted = isCompleted;
      if (isCompleted) {
        todo.completedAt = new Date();
      } else {
        todo.completedAt = null;
      }
    }

    await todo.save();

    res.json({
      status: 'success',
      message: 'Task updated successfully',
      data: { todo }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Toggle todo completion
// @route   PATCH /api/todos/:id/toggle
// @access  Private
export const toggleTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });

    if (!todo) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    todo.isCompleted = !todo.isCompleted;
    if (todo.isCompleted) {
      todo.completedAt = new Date();
    } else {
      todo.completedAt = null;
    }

    await todo.save();

    res.json({
      status: 'success',
      message: `Task marked as ${todo.isCompleted ? 'completed' : 'incomplete'}`,
      data: { todo }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete todo
// @route   DELETE /api/todos/:id
// @access  Private
export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });

    if (!todo) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    // Soft delete
    todo.isDeleted = true;
    todo.deletedAt = new Date();
    await todo.save();

    res.json({
      status: 'success',
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get todo statistics
// @route   GET /api/todos/stats/summary
// @access  Private
export const getTodoStats = async (req, res) => {
  try {
    const stats = await Todo.aggregate([
      {
        $match: {
          user: req.user._id,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: ['$isCompleted', 1, 0] }
          },
          pending: {
            $sum: { $cond: ['$isCompleted', 0, 1] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      completed: 0,
      pending: 0
    };

    res.json({
      status: 'success',
      data: { stats: result }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
