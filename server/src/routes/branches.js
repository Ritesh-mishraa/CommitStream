import express from 'express';
import Branch from '../models/Branch.js';

const router = express.Router();

/**
 * @swagger
 * /api/branches:
 *   get:
 *     summary: List all active branches
 *     description: Returns a simulated list of active repository branches for the conflict predictor.
 *     responses:
 *       200:
 *         description: List of branches
 */
router.get('/', async (req, res) => {
    try {
        const branches = await Branch.find().populate('owner');
        res.json(branches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
