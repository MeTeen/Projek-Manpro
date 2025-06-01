import { Request, Response } from 'express';
import { Task } from '../models/index';

// Get all tasks with pagination
export const getTasks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const { count, rows: tasks } = await Task.findAndCountAll({
      order: [['date', 'ASC']],
      limit,
      offset,
      attributes: ['id', 'date', 'content', 'isCompleted', 'createdAt', 'updatedAt']
    });

    res.json({
      tasks,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
};

// Create a new task
export const createTask = async (req: Request, res: Response) => {
  try {
    const { date, content } = req.body;
    const task = await Task.create({
      date,
      content
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: 'Error creating task', error });
  }
};

// Update a task
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, content, isCompleted } = req.body;
    
    const [updatedRows] = await Task.update(
      { date, content, isCompleted },
      { where: { id } }
    );
    
    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const updatedTask = await Task.findByPk(id);
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: 'Error updating task', error });
  }
};

// Delete a task
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedRows = await Task.destroy({
      where: { id }
    });
    
    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting task', error });
  }
}; 