import express from 'express';
import Blog from '../models/Blog.js';
import { executeScraperSync } from '../utils/scheduler.js';

const router = express.Router();

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Retrieve blogs with optional filtering, search, and pagination
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (GitHub, AI Industry, Job Market, General Tech)
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Text search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A paginated list of blog posts
 * */
router.get('/', async (req, res) => {
    try {
        const { category, q, page = 1, limit = 24 } = req.query;
        
        const filter = {};
        
        // Category filtering
        if (category && category !== 'All') {
            filter.category = category;
        }

        // Text search
        if (q) {
            filter.$text = { $search: q };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        // Fetch query
        let query = Blog.find(filter);

        // If it's a search, we can sort by text score, otherwise sort by publish date descending
        if (q) {
            query = query.select({ score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } });
        } else {
            query = query.sort({ publishDate: -1, createdAt: -1 });
        }

        const total = await Blog.countDocuments(filter);
        const blogs = await query.skip(skip).limit(limitNum);

        res.json({
            blogs,
            pagination: {
                total,
                page: parseInt(page),
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error("GET /api/blogs failed:", error);
        res.status(500).json({ error: 'Server error fetching blog posts.' });
    }
});

/**
 * @swagger
 * /api/blogs/{slug}:
 *   get:
 *     summary: Get a single blog post by its SEO slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog post data
 *       404:
 *         description: Blog not found
 */
router.get('/:slug', async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug });
        if (!blog) {
            return res.status(404).json({ error: 'Blog post not found.' });
        }
        res.json(blog);
    } catch (error) {
        console.error(`GET /api/blogs/${req.params.slug} failed:`, error);
        res.status(500).json({ error: 'Server error fetching the blog post.' });
    }
});

/**
 * @swagger
 * /api/blogs/sync:
 *   post:
 *     summary: Manually trigger the scraper and AI compiler pipeline
 *     responses:
 *       200:
 *         description: Sync initiated successfully
 */
router.post('/sync', async (req, res) => {
    try {
        console.log("Manual trigger requested for scraper sync...");
        // Run sync asynchronously to not block client connection response
        executeScraperSync();
        
        res.json({ message: 'Sync process started in the background. Blogs will appear shortly.' });
    } catch (error) {
        console.error("POST /api/blogs/sync failed:", error);
        res.status(500).json({ error: 'Failed to initiate sync.' });
    }
});

export default router;
