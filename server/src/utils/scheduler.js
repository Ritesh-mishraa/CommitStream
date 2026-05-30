import Blog from '../models/Blog.js';
import { runBlogScraperPipeline } from './scraperService.js';

let isRunning = false;

// Check if last blog post is older than 24 hours (or if DB is empty)
export const shouldRunScraper = async () => {
    try {
        const latestBlog = await Blog.findOne().sort({ createdAt: -1 });
        if (!latestBlog) {
            console.log("Scheduler: No blogs found in database. Initial run required.");
            return true;
        }

        const msSinceLastBlog = Date.now() - new Date(latestBlog.createdAt).getTime();
        const hoursSinceLastBlog = msSinceLastBlog / (1000 * 60 * 60);

        console.log(`Scheduler: Last blog was posted ${hoursSinceLastBlog.toFixed(2)} hours ago.`);
        return hoursSinceLastBlog >= 24;
    } catch (error) {
        console.error("Scheduler: Error checking database status:", error.message);
        return false;
    }
};

// Run scraper sync with a lock to prevent concurrent runs
export const executeScraperSync = async () => {
    if (isRunning) {
        console.log("Scheduler: Sync is already in progress, skipping.");
        return;
    }

    isRunning = true;
    try {
        await runBlogScraperPipeline();
    } catch (error) {
        console.error("Scheduler: Sync execution failed:", error);
    } finally {
        isRunning = false;
    }
};

// Start the scheduler: checks on boot and runs checks every hour
export const startScheduler = () => {
    console.log("Initializing Automated Blog Scheduler Daemon...");

    // Immediate startup check
    setTimeout(async () => {
        if (await shouldRunScraper()) {
            console.log("Scheduler: Running startup scraper sync...");
            await executeScraperSync();
        } else {
            console.log("Scheduler: Startup sync skipped (recent blogs exist).");
        }
    }, 5000); // Wait 5 seconds after server boot to allow database connection to stabilize

    // Check hourly
    const CHECK_INTERVAL = 1000 * 60 * 60; // 1 hour
    setInterval(async () => {
        console.log("Scheduler: Performing periodic check...");
        if (await shouldRunScraper()) {
            console.log("Scheduler: Running scheduled scraper sync...");
            await executeScraperSync();
        }
    }, CHECK_INTERVAL);
};
