import express from 'express';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { compareBranches, fetchRepoDetails } from '../utils/githubService.js';
import { auditCodeWithAI } from '../utils/aiService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/audits/scan:
 *   post:
 *     summary: Run an AI Security Audit against a specific branch relative to main
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
 *               branch:
 *                 type: string
 *     responses:
 *       200:
 *         description: Array of audit findings
 */
router.post('/scan', authMiddleware, async (req, res) => {
    try {
        const { projectId, branch } = req.body;

        if (!projectId || !branch) {
            return res.status(400).json({ message: 'Project ID and target branch are required' });
        }

        const project = await Project.findById(projectId);
        if (!project || !project.githubRepo) {
            return res.status(404).json({ message: 'Project or GitHub repository not found' });
        }

        const user = await User.findById(req.user._id);
        const pat = user?.githubPat || null;

        // Fetch repo details to determine the default branch
        const repoDetails = await fetchRepoDetails(project.githubRepo, pat);
        const defaultBranch = repoDetails.default_branch || 'main';

        if (branch === defaultBranch) {
            // Nothing to diff against if they select the default branch
            return res.json([]);
        }

        // Compare the target branch against the default branch
        let compareData;
        try {
            compareData = await compareBranches(project.githubRepo, defaultBranch, branch, pat);
        } catch (compareError) {
            console.error("GitHub compare failed:", compareError.message);
            return res.status(400).json({ message: "Cannot compare branches. They may not share common history." });
        }

        if (!compareData.files || compareData.files.length === 0) {
            return res.json([]); // No changes found
        }

        // Aggregate patches into a single diff string
        let aggregatedDiff = '';
        for (const file of compareData.files) {
            if (file.patch) {
                aggregatedDiff += `\n--- a/${file.filename}\n+++ b/${file.filename}\n${file.patch}\n`;
            }
        }

        if (!aggregatedDiff) {
            return res.json([]); // Files changed but no patch available (binary files or too large)
        }

        // Submit the diff to Gemini
        const auditResults = await auditCodeWithAI(aggregatedDiff);

        res.json(auditResults);
    } catch (error) {
        console.error("Audit scan error:", error);
        res.status(500).json({ message: error.message || "Failed to scan branch" });
    }
});

export default router;
