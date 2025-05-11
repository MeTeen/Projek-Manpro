import { Router } from 'express';
import * as taskController from '../controllers/taskController';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// All task routes are protected by JWT authentication
router.use(authenticateJWT as any);

// Get all tasks
router.get('/', taskController.getTasks as any);

// Create a new task
router.post('/', taskController.createTask as any);

// Update a task
router.put('/:id', taskController.updateTask as any);

// Delete a task
router.delete('/:id', taskController.deleteTask as any);

export default router; 