import express from 'express';
import Branch from '../models/Branch.js';
import ConflictReport from '../models/ConflictReport.js';

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
router.post('/predict', async (req, res) => {
    try {
        const { branchIdA, branchIdB } = req.body;

        const branchA = await Branch.findById(branchIdA);
        const branchB = await Branch.findById(branchIdB);

        if (!branchA || !branchB) {
            return res.status(404).json({ message: 'One or both branches not found' });
        }

        // Intersection of files changed
        const conflictingFiles = branchA.filesChanged.filter(file => branchB.filesChanged.includes(file));

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

export default router;
