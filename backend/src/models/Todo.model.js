import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  taskName: {
    type: String,
    required: true,
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for faster queries
todoSchema.index({ user: 1, isDeleted: 1, isCompleted: 1 });
todoSchema.index({ user: 1, createdAt: -1 });

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;
