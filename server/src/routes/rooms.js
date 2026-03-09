import express from 'express';
import Room from '../models/Room.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Create a new room
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               hostUsername:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Room created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, projectId } = req.body;

        const roomPayload = {
            name,
            host: req.user._id,
            participants: [req.user._id]
        };

        if (projectId) {
            roomPayload.project = projectId;
        }

        const room = await Room.create(roomPayload);
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     summary: Get room details
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
 *         description: Room details
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('participants').populate('host');
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
