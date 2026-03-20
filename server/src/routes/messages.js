import express from 'express';
import Message from '../models/Message.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Retrieve recent messages for a specific project scope
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) return res.status(400).json({ message: 'Project ID is strictly required for Chat History.' });

        // We fetch the last 150 messages for optimal performance.
        const messages = await Message.find({ project: projectId })
            .sort({ createdAt: 1 })
            .limit(150)
            .populate('sender', 'username email avatarColor');

        res.json(messages);
    } catch (e) {
        console.error("Failed to fetch messages API route:", e);
        res.status(500).json({ message: e.message });
    }
});

export default router;
