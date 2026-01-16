import express from 'express';
import {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  toggleTodo,
  deleteTodo,
  getTodoStats
} from '../controllers/todo.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.post('/', createTodo);
router.get('/', getTodos);
router.get('/stats/summary', getTodoStats);
router.get('/:id', getTodoById);
router.put('/:id', updateTodo);
router.patch('/:id/toggle', toggleTodo);
router.delete('/:id', deleteTodo);

export default router;
