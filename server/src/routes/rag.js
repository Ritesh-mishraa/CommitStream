import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';
import VectorDocument from '../models/VectorDocument.js';
import { indexProjectCodebase } from '../utils/ragService.js';
import { chatWithRepositoryAI } from '../utils/aiService.js';

const router = express.Router();

/**
 * @swagger
 * /api/rag/index:
 *   post:
 *     summary: Trigger indexing of a project's codebase into the vector store
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Indexing completed successfully
 */
router.post('/index', authMiddleware, async (req, res) => {
    try {
        const { projectId } = req.body;
        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        // Get user GitHub PAT
        const user = await User.findById(req.user._id);
        const pat = user?.githubAccessToken || user?.githubPat || null;

        const result = await indexProjectCodebase(projectId, pat);
        res.json({
            message: 'Codebase indexed successfully',
            ...result
        });
    } catch (error) {
        console.error('[RAG Route] Indexing failed:', error);
        res.status(500).json({ message: error.message || 'Failed to index codebase' });
    }
});

/**
 * @swagger
 * /api/rag/status:
 *   get:
 *     summary: Check codebase vector index status for a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status of the project index
 */
router.get('/status', authMiddleware, async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        const count = await VectorDocument.countDocuments({ projectId });
        res.json({
            projectId,
            indexed: count > 0,
            chunkCount: count
        });
    } catch (error) {
        console.error('[RAG Route] Status check failed:', error);
        res.status(500).json({ message: error.message || 'Failed to check index status' });
    }
});

/**
 * @swagger
 * /api/rag/chat:
 *   post:
 *     summary: Interact with the Repository AI Chatbot Assistant
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: string
 *               message:
 *                 type: string
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *               mode:
 *                 type: string
 *               branch:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat reply generated successfully
 */
router.post('/chat', authMiddleware, async (req, res) => {
    try {
        const { projectId, message, history, mode = 'codebase', branch } = req.body;
        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }
        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        const user = await User.findById(req.user._id);
        const pat = user?.githubAccessToken || user?.githubPat || null;

        const reply = await chatWithRepositoryAI(projectId, message.trim(), history || [], {
            mode,
            branch,
            pat
        });

        res.json({ reply });
    } catch (error) {
        console.error('[RAG Chat Route] Assistant failure:', error);
        res.status(500).json({ message: error.message || 'Failed to get reply from repository assistant' });
    }
});

export default router;
