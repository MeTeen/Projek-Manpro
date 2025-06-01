"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.createTask = exports.getTasks = void 0;
const index_1 = require("../models/index");
// Get all tasks with pagination
const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        const { count, rows: tasks } = yield index_1.Task.findAndCountAll({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
    }
});
exports.getTasks = getTasks;
// Create a new task
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date, content } = req.body;
        const task = yield index_1.Task.create({
            date,
            content
        });
        res.status(201).json(task);
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating task', error });
    }
});
exports.createTask = createTask;
// Update a task
const updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { date, content, isCompleted } = req.body;
        const [updatedRows] = yield index_1.Task.update({ date, content, isCompleted }, { where: { id } });
        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const updatedTask = yield index_1.Task.findByPk(id);
        res.json(updatedTask);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating task', error });
    }
});
exports.updateTask = updateTask;
// Delete a task
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedRows = yield index_1.Task.destroy({
            where: { id }
        });
        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ message: 'Error deleting task', error });
    }
});
exports.deleteTask = deleteTask;
//# sourceMappingURL=taskController.js.map