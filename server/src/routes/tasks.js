import express from 'express';
import Task from '../models/Task.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get tasks for a specific project
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) return res.status(400).json({ message: 'projectId is required' });

        const tasks = await Task.find({ project: projectId }).sort('-updatedAt');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               projectId:
 *                 type: string
 *               assignee:
 *                 type: string
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Task created
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, projectId, assignee, status, priority } = req.body;

        const task = await Task.create({
            title,
            project: projectId,
            assignee: assignee || req.user.username,
            status,
            priority
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   patch:
 *     summary: Update task status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task status updated
 */
router.patch('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        let task = await Task.findById(req.params.id).populate('project');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if user is either the project owner or the task assignee
        const isOwner = req.user._id.toString() === task.project.owner.toString();
        const isAssignee = req.user.username === task.assignee;

        if (!isOwner && !isAssignee) {
            return res.status(403).json({ message: 'Only the project owner or assigned user can update this task' });
        }

        task.status = status;
        await task.save();

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
