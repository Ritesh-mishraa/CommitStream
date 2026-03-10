import express from 'express';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { fetchRepoBranches } from '../utils/githubService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/branches:
 *   get:
 *     summary: List all active branches for a project
 *     description: Fetches live branches from GitHub using the project's repository and user's PAT.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of branches
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) {
            return res.json([]);
        }

        const project = await Project.findById(projectId);
        if (!project || !project.githubRepo) {
            return res.json([]);
        }

        const user = await User.findById(req.user._id);
        const pat = user?.githubPat || null;

        try {
            const githubBranches = await fetchRepoBranches(project.githubRepo, pat);

            const formattedBranches = githubBranches.map(branch => ({
                _id: branch.name,
                name: branch.name,
                project: projectId,
                filesChanged: []
            }));

            res.json(formattedBranches);
        } catch (githubError) {
            console.warn(`GitHub API failed for ${project.githubRepo}:`, githubError.message);
            res.json([]); // Graceful fallback
        }
    } catch (error) {
        console.error("Fetch branches error:", error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
