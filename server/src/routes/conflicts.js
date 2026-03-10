import express from 'express';
import Project from '../models/Project.js';
import User from '../models/User.js';
import ConflictReport from '../models/ConflictReport.js';
import { compareBranches, compareBranchesExact } from '../utils/githubService.js';
import { authMiddleware } from '../middleware/auth.js';
import { resolveConflictWithAI } from '../utils/aiService.js';

const router = express.Router();

/**
 * @swagger
 * /api/conflicts/predict:
 *   post:
 *     summary: Run conflict prediction between two branches
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               branchIdA:
 *                 type: string
 *               branchIdB:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conflict prediction report
 */
router.post('/predict', authMiddleware, async (req, res) => {
    try {
        const { branchIdA, branchIdB, projectId } = req.body;

        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        const project = await Project.findById(projectId);
        if (!project || !project.githubRepo) {
            return res.status(404).json({ message: 'Project or GitHub repository not found' });
        }

        const user = await User.findById(req.user._id);
        const pat = user?.githubPat || null;

        let compareHead, compareBase, exactDiff;
        try {
            [compareHead, compareBase, exactDiff] = await Promise.all([
                compareBranches(project.githubRepo, branchIdA, branchIdB, pat),
                compareBranches(project.githubRepo, branchIdB, branchIdA, pat),
                compareBranchesExact(project.githubRepo, branchIdA, branchIdB, pat)
            ]);
        } catch (compareError) {
            console.error("GitHub compare failed:", compareError.message);
            if (compareError.response && compareError.response.status === 404) {
                return res.status(400).json({
                    message: "Cannot compare these branches. They may not share a common history or one of them might not exist."
                });
            }
            throw compareError;
        }

        const filesHead = compareHead.files ? compareHead.files.map(f => f.filename) : [];
        const filesBase = compareBase.files ? compareBase.files.map(f => f.filename) : [];
        const diffAtTips = exactDiff.files ? exactDiff.files.map(f => f.filename) : [];

        // A file is only a conflict if it was modified in BOTH branches and still differs at their tips
        const conflictingFiles = filesHead
            .filter(file => filesBase.includes(file))
            .filter(file => diffAtTips.includes(file));

        let severity = 'LOW';
        let autoResolved = [];

        if (conflictingFiles.length > 0) {
            if (conflictingFiles.some(f => f.endsWith('package-lock.json') || f.endsWith('yarn.lock'))) {
                severity = 'LOCKFILE_CONFLICT';
                autoResolved.push({
                    file: conflictingFiles.find(f => f.endsWith('lock.json') || f.endsWith('yarn.lock')),
                    resolutionStrategy: 'Accept theirs, regenerate lockfile'
                });
            } else if (conflictingFiles.some(f => f.endsWith('.tsx') || f.endsWith('.jsx'))) {
                severity = 'COMPONENT_CONFLICT';
            } else {
                severity = conflictingFiles.length > 3 ? 'HIGH' : 'MED';
            }
        }

        const report = await ConflictReport.create({
            branchA: branchIdA,
            branchB: branchIdB,
            conflictingFiles,
            autoResolved,
            severity
        });

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/conflicts/resolve:
 *   post:
 *     summary: Auto-resolve detected conflicts (Simulation)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reportId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resolution result
 */
router.post('/resolve', async (req, res) => {
    try {
        const { reportId } = req.body;
        const report = await ConflictReport.findById(reportId);

        if (!report) return res.status(404).json({ message: 'Report not found' });

        res.json({
            message: 'Conflicts resolved successfully using AI policies',
            resolvedFiles: report.autoResolved,
            report
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/conflicts/resolve-file:
 *   post:
 *     summary: Request AI resolution for a specific conflicting file
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
 *               branchIdA:
 *                 type: string
 *               branchIdB:
 *                 type: string
 *               filename:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI-resolved code content
 */
router.post('/resolve-file', authMiddleware, async (req, res) => {
    try {
        const { projectId, branchIdA, branchIdB, filename } = req.body;

        if (!projectId || !filename) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        const project = await Project.findById(projectId);
        if (!project || !project.githubRepo) {
            return res.status(404).json({ message: 'Project or GitHub repository not found' });
        }

        const user = await User.findById(req.user._id);
        const pat = user?.githubPat || null;

        // Fetch the raw diff from GitHub API
        const compareData = await compareBranches(project.githubRepo, branchIdA, branchIdB, pat);

        // Find the specific file patch
        const fileDiff = compareData.files?.find(f => f.filename === filename);
        if (!fileDiff || !fileDiff.patch) {
            return res.status(404).json({ message: 'File diff not found in the comparison' });
        }

        // Call the Gemini service
        const resolvedCode = await resolveConflictWithAI(filename, fileDiff.patch);

        res.json({
            filename,
            resolvedCode
        });

    } catch (error) {
        console.error('Error resolving file via AI:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
