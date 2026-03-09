import express from 'express';
import Room from '../models/Room.js';
import User from '../models/User.js';

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
 *     responses:
 *       201:
 *         description: Room created successfully
 */
router.post('/', async (req, res) => {
    try {
        const { name, hostUsername } = req.body;
        let user = await User.findOne({ username: hostUsername });
        if (!user) {
            user = await User.create({ username: hostUsername });
        }

        const room = await Room.create({ name, host: user._id, participants: [user._id] });
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
 *     responses:
 *       200:
 *         description: Room details
 */
router.get('/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('participants').populate('host');
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
