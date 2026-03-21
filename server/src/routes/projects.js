import express from 'express';
import jwt from 'jsonwebtoken';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { fetchRepoStats, fetchRepoCollaborators, updateRepoFile } from '../utils/githubService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const getSecret = () => process.env.JWT_SECRET || 'fallback_secret_for_development_do_not_use_in_prod';

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
        }).populate('owner', 'username avatarColor')
            .populate('members', 'username avatarColor')
            .sort({ createdAt: -1 });

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
        const { name, githubRepo } = req.body;
        if (!name) return res.status(400).json({ error: 'Project name required' });

        // Auto-sanitize full URLs to "owner/repo" slug
        let cleanRepo = githubRepo;
        if (cleanRepo) {
            cleanRepo = cleanRepo.replace(/^https?:\/\/(www\.)?github\.com\//i, '');
            cleanRepo = cleanRepo.replace(/\.git$/i, '').replace(/\/$/, '');
            cleanRepo = cleanRepo.trim();
        }

        const project = await Project.create({
            name,
            githubRepo: cleanRepo,
            owner: req.user._id,
            members: [req.user._id]
        });

        // Populate owner info before sending response so client avoids extra fetch
        await project.populate('owner', 'username avatarColor');
        await project.populate('members', 'username avatarColor');

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
 * /api/projects/{id}/members/{memberId}:
 *   delete:
 *     summary: Remove a member from a project (Owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Project or Member not found
 */
router.delete('/:id/members/:memberId', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Only the project owner can remove members' });
        }

        if (project.owner.toString() === req.params.memberId) {
            return res.status(400).json({ error: 'Owner cannot be removed from the project' });
        }

        project.members = project.members.filter(mId => mId.toString() !== req.params.memberId);
        await project.save();

        await project.populate('owner', 'username avatarColor');
        await project.populate('members', 'username avatarColor');

        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/projects/{id}/invite:
 *   post:
 *     summary: Generate a 7-day invite token for the project
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
 *         description: Invite token generated
 */
router.post('/:id/invite', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Only the project owner can generate invites' });
        }

        const inviteToken = jwt.sign({ projectId: project._id }, getSecret(), { expiresIn: '7d' });
        res.json({ inviteToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/projects/join/{inviteToken}:
 *   post:
 *     summary: Join a project using an invite token
 *     parameters:
 *       - in: path
 *         name: inviteToken
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully joined project
 *       400:
 *         description: Invalid or expired token
 */
router.post('/join/:inviteToken', async (req, res) => {
    try {
        const { inviteToken } = req.params;
        const decoded = jwt.verify(inviteToken, getSecret());

        const project = await Project.findById(decoded.projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        if (!project.members.includes(req.user._id)) {
            project.members.push(req.user._id);
            await project.save();
        }

        await project.populate('owner', 'username avatarColor');
        await project.populate('members', 'username avatarColor');
        res.json(project);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ error: 'Invite link has expired' });
        }
        res.status(400).json({ error: 'Invalid invite link' });
    }
});

/**
 * @swagger
 * /api/projects/{id}/status:
 *   patch:
 *     summary: Update project status
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
 *                 enum: [Planning, Active, Completed, Archived]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Planning', 'Active', 'Completed', 'Archived'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status provided' });
        }

        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        if (project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Only the project owner can update status' });
        }

        project.status = status;
        await project.save();

        // Return populated project so the frontend can replace it fully if needed
        await project.populate('owner', 'username avatarColor');
        await project.populate('members', 'username avatarColor');
        res.json(project);
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
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (!project.githubRepo) {
            return res.json({
                activeBranches: 0,
                openPRs: 0,
                lastCommit: {
                    hash: '---',
                    message: 'No GitHub repository connected',
                    time: new Date().toISOString(),
                    author: 'System'
                }
            });
        }

        const user = await User.findById(req.user._id);
        const pat = user?.githubAccessToken || user?.githubPat || null;

        try {
            const stats = await fetchRepoStats(project.githubRepo, pat);
            res.json(stats);
        } catch (githubError) {
            console.warn(`GitHub API stats failed for ${project.githubRepo}:`, githubError.message);
            res.json({
                activeBranches: 0,
                openPRs: 0,
                lastCommit: {
                    hash: 'ERROR',
                    message: 'Repo not found or access denied',
                    time: new Date().toISOString(),
                    author: 'System'
                }
            });
        }
    } catch (error) {
        console.error('Stats fetch error:', error.message);
        res.status(500).json({ error: 'Failed to fetch repository statistics from GitHub' });
    }
});

/**
 * @swagger
 * /api/projects/{id}/collaborators:
 *   get:
 *     summary: Get top contributors for the project's repository
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
 *         description: Array of contributors
 */
router.get('/:id/collaborators', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project || !project.githubRepo) {
            return res.json([]);
        }

        const user = await User.findById(req.user._id);
        const pat = user?.githubAccessToken || user?.githubPat || null;

        try {
            const collaborators = await fetchRepoCollaborators(project.githubRepo, pat);
            res.json(collaborators);
        } catch (githubError) {
            console.warn(`GitHub API collaborators failed for ${project.githubRepo}:`, githubError.message);
            res.json([]);
        }
    } catch (error) {
        console.error('Collaborators fetch error:', error.message);
        res.status(500).json({ error: 'Failed to fetch repository collaborators from GitHub' });
    }
});

/**
 * @swagger
 * /api/projects/{id}/commit:
 *   post:
 *     summary: Commit and push a file directly to the GitHub repository
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               branch:
 *                 type: string
 *               path:
 *                 type: string
 *               content:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully committed the file
 */
router.post('/:id/commit', async (req, res) => {
    try {
        const { branch, path, content, message } = req.body;

        if (!branch || !path || !content) {
            return res.status(400).json({ error: 'branch, path, and content are required' });
        }

        const project = await Project.findById(req.params.id);
        if (!project || !project.githubRepo) {
            return res.status(404).json({ error: 'Project or GitHub repository not found' });
        }

        // Must be a member or owner
        if (project.owner.toString() !== req.user._id.toString() && !project.members.some(m => m.toString() === req.user._id.toString())) {
            return res.status(403).json({ error: 'Not authorized to commit to this project' });
        }

        const user = await User.findById(req.user._id);
        const pat = user?.githubAccessToken || user?.githubPat;

        if (!pat) {
            return res.status(403).json({ error: 'GitHub PAT is missing. Please update your profile.' });
        }

        const commitMessage = message || `Resolve conflict in ${path}`;
        const commitResult = await updateRepoFile(project.githubRepo, branch, path, content, commitMessage, pat);

        res.json({ message: 'File committed successfully', commitResult });
    } catch (error) {
        console.error('Failed to commit file:', error);
        res.status(500).json({ error: error.message || 'Failed to push to GitHub' });
    }
});

export default router;
