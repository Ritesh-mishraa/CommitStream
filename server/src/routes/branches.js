import express from 'express';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { fetchRepoBranches, fetchRepoDetails, compareBranches, fetchBranchCommits, fetchCommitDetails } from '../utils/githubService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/branches:
 *   get:
 *     summary: List all active branches for a project
 *     description: Fetches live branches from GitHub using the project's repository and user's PAT.
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
        const { projectId } = req.query;
        if (!projectId) {
            return res.json([]);
        }

        const project = await Project.findById(projectId);
        if (!project || !project.githubRepo) {
            return res.json([]);
        }

        const user = await User.findById(req.user._id);
        const pat = user?.githubAccessToken || user?.githubPat || null;

        try {
            // Fetch branches and repo details (for default branch) in parallel
            const [githubBranches, repoDetails] = await Promise.all([
                fetchRepoBranches(project.githubRepo, pat),
                fetchRepoDetails(project.githubRepo, pat)
            ]);

            const defaultBranch = repoDetails.default_branch || 'main';

            // We will fetch file changes for each branch compared to the default branch
            // Limit to max 20 branches to prevent excessive GitHub API calls
            const branchesToProcess = githubBranches.slice(0, 20);

            const formattedBranches = await Promise.all(
                branchesToProcess.map(async (branch) => {
                    let filesChanged = [];

                    // Don't compare the default branch to itself
                    if (branch.name !== defaultBranch) {
                        try {
                            const compareData = await compareBranches(project.githubRepo, defaultBranch, branch.name, pat);
                            filesChanged = compareData.files ? compareData.files.map(f => f.filename) : [];
                        } catch (compareErr) {
                            console.warn(`Could not fetch diff for ${branch.name}:`, compareErr.message);
                        }
                    }

                    return {
                        _id: branch.name,
                        name: branch.name,
                        isDefault: branch.name === defaultBranch,
                        project: projectId,
                        filesChanged
                    };
                })
            );

            res.json(formattedBranches);
        } catch (githubError) {
            console.warn(`GitHub API failed for ${project.githubRepo}:`, githubError.message);
            res.json([]); // Graceful fallback
        }
    } catch (error) {
        console.error("Fetch branches error:", error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/branches/commits:
 *   get:
 *     summary: List commits for a specific branch along with file modifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: branch
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of commits with modified files
 */
router.get('/commits', authMiddleware, async (req, res) => {
    try {
        const { projectId, branch } = req.query;
        if (!projectId || !branch) {
            return res.status(400).json({ message: 'Missing projectId or branch' });
        }

        const project = await Project.findById(projectId);
        if (!project || !project.githubRepo) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const user = await User.findById(req.user._id);
        const pat = user?.githubAccessToken || user?.githubPat || null;

        // Fetch the raw commit list from GitHub
        const rawCommits = await fetchBranchCommits(project.githubRepo, branch, pat);

        // Enhance commits with details about files changed (since /commits endpoint might not include files for list)
        // To avoid rate limits, only fetch file details for the 10 most recent commits if there are a lot
        const recentCommits = rawCommits.slice(0, 10);

        const enhancedCommits = await Promise.all(
            recentCommits.map(async (commitItem) => {
                let files = [];
                try {
                    const commitDetail = await fetchCommitDetails(project.githubRepo, commitItem.sha, pat);
                    files = commitDetail.files ? commitDetail.files.map(f => ({
                        filename: f.filename,
                        status: f.status, // added, modified, removed
                        additions: f.additions,
                        deletions: f.deletions
                    })) : [];
                } catch (err) {
                    console.warn(`Could not fetch details for commit ${commitItem.sha}`, err.message);
                }

                return {
                    sha: commitItem.sha,
                    message: commitItem.commit.message,
                    authorName: commitItem.commit.author.name,
                    authorEmail: commitItem.commit.author.email,
                    date: commitItem.commit.author.date,
                    avatarUrl: commitItem.author?.avatar_url,
                    files
                };
            })
        );

        res.json(enhancedCommits);
    } catch (error) {
        console.error("Fetch branch commits error:", error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
