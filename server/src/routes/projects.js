import express from 'express';
import Project from '../models/Project.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All project routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: List all projects the user owns or is a member of
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of projects
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.user._id;
        // Fetch projects where user is owner or in members list
        const projects = await Project.find({
            $or: [{ owner: userId }, { members: userId }]
        }).populate('owner', 'username avatarColor').sort({ createdAt: -1 });

        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created project
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Project name required' });

        const project = await Project.create({
            name,
            owner: req.user._id,
            members: [req.user._id]
        });

        // Populate owner info before sending response so client avoids extra fetch
        await project.populate('owner', 'username avatarColor');

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project (Owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not the owner)
 *       404:
 *         description: Not found
 */
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Only the project owner can delete this project' });
        }

        await project.deleteOne();
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/projects/{id}/stats:
 *   get:
 *     summary: Get repository statistics for a project
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Project statistics
 */
router.get('/:id/stats', async (req, res) => {
    try {
        // Query the Branch collection dynamically to count active branches
        const Branch = (await import('../models/Branch.js')).default;
        const branchCount = await Branch.countDocuments({ project: req.params.id });

        // Mocking PRs and last commit for MVP as those require git integrations
        res.json({
            activeBranches: branchCount,
            openPRs: Math.floor(Math.random() * 5), // Mock data
            lastCommit: {
                hash: Math.random().toString(16).substring(2, 9),
                message: 'Update dependencies',
                time: 'Just now',
                author: 'System'
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
