import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Ensure JWT_SECRET is available
const getSecret = () => process.env.JWT_SECRET || 'fallback_secret_for_development_do_not_use_in_prod';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Assign a random cool color
        const colors = ['#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b', '#3b82f6', '#ef4444'];
        const avatarColor = colors[Math.floor(Math.random() * colors.length)];

        // Create user
        const user = await User.create({
            username,
            email,
            passwordHash,
            avatarColor
        });

        // Generate token
        const token = jwt.sign({ userId: user._id }, getSecret(), { expiresIn: '7d' });

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatarColor: user.avatarColor
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and get token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ userId: user._id }, getSecret(), { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatarColor: user.avatarColor,
                githubUsername: user.githubUsername,
                hasGithubPat: !!user.githubPat
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/auth/github-settings:
 *   post:
 *     summary: Update GitHub configuration
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings updated
 */
router.post('/github-settings', authMiddleware, async (req, res) => {
    try {
        const { githubPat, githubUsername } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ error: 'User not found' });

        if (githubPat !== undefined) user.githubPat = githubPat;
        if (githubUsername !== undefined) user.githubUsername = githubUsername;

        await user.save();

        res.json({
            message: 'GitHub settings updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatarColor: user.avatarColor,
                githubUsername: user.githubUsername,
                hasGithubPat: !!user.githubPat
            }
        });
    } catch (error) {
        console.error('GitHub Settings Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current logged-in user details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 */
// This will be protected by middleware later, for now just basic structure
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, getSecret());

        const user = await User.findById(decoded.userId).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userObj = user.toObject();
        userObj.hasGithubPat = !!user.githubPat;
        delete userObj.githubPat; // Never send PAT to client if not needed

        res.json(userObj);
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

export default router;
