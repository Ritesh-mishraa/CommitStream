import express from 'express';
import Branch from '../models/Branch.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/branches:
 *   get:
 *     summary: List all active branches
 *     description: Returns a simulated list of active repository branches for the conflict predictor.
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
        const queryParams = {};
        if (req.query.projectId) {
            queryParams.project = req.query.projectId;
        }

        const branches = await Branch.find(queryParams).populate('owner');
        res.json(branches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
