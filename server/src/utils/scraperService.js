import axios from 'axios';
import Blog from '../models/Blog.js';
import { generateBlogWithAI } from './aiService.js';

// Helper to sanitize text and decode basic XML/HTML entities
const decodeHTMLEntities = (text) => {
    if (!text) return '';
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#8217;/g, "'")
        .replace(/&#8216;/g, "'")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&#8211;/g, '-')
        .replace(/&#8212;/g, '--')
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        .trim();
};

// Helper to create clean URL slugs
export const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
};

// Parse RSS XML text into structured items
const parseRSS = (xmlText) => {
    const items = [];
    const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
    
    for (const itemXml of itemMatches) {
        const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
        const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
        const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);
        const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
        
        if (titleMatch && linkMatch) {
            items.push({
                title: decodeHTMLEntities(titleMatch[1]),
                link: decodeHTMLEntities(linkMatch[1]),
                description: descMatch ? decodeHTMLEntities(descMatch[1]) : '',
                pubDate: dateMatch ? decodeHTMLEntities(dateMatch[1]) : ''
            });
        }
    }
    return items;
};

// List of RSS sources and their target blog categories
const RSS_SOURCES = [
    {
        url: 'https://github.blog/feed/',
        sourceName: 'GitHub Blog',
        category: 'GitHub'
    },
    {
        url: 'https://news.google.com/rss/search?q=artificial+intelligence+news+when:7d&hl=en-US&gl=US&ceid=US:en',
        sourceName: 'Google News AI',
        category: 'AI Industry'
    },
    {
        url: 'https://news.google.com/rss/search?q=tech+job+market+when:7d&hl=en-US&gl=US&ceid=US:en',
        sourceName: 'Google News Jobs',
        category: 'Job Market'
    },
    {
        url: 'https://news.google.com/rss/search?q=technology+software+development+when:7d&hl=en-US&gl=US&ceid=US:en',
        sourceName: 'Google News Tech',
        category: 'General Tech'
    }
];

// Curated Unsplash photo pools to avoid repeating identical images
const IMAGE_POOLS = {
    'GitHub': [
        '1618401471353-b98afee0b2eb', '1607799279861-4dd421887fb3', 
        '1555066931-4365d14bab8c', '1629654297299-c8506221ca97', 
        '1542831371-29b0f74f9713'
    ],
    'AI Industry': [
        '1677442136019-21780ecad995', '1618005182384-a83a8bd57fbe', 
        '1581091226825-a6a2a5aee158', '1526374965328-7f61d4dc18c5', 
        '1684369175833-2a8d11c79808'
    ],
    'Job Market': [
        '1486406146926-c627a92ad1ab', '1507679799987-c73779587ccf', 
        '1434030216411-0b793f4b4173', '1521791136368-1a9b79758550', 
        '1427504494785-3a9ca7044f45'
    ],
    'General Tech': [
        '1518770660439-4636190af475', '1451187580459-43490279c0fa', 
        '1519389950473-47ba0277781c', '1498050108023-c5249f4df085', 
        '1550751827-4bd374c3f58b'
    ],
    'Layoffs': [
        '1507679799987-c73779587ccf', '1542744173-05336fcc7ad4', 
        '1522071820081-009f0129c71c', '1515378791036-0648a3ef77b2'
    ]
};

const getRandomImage = (category, impactLabel) => {
    let pool = IMAGE_POOLS[category] || IMAGE_POOLS['General Tech'];
    if (impactLabel && impactLabel.toLowerCase().includes('layoff')) {
        pool = IMAGE_POOLS['Layoffs'];
    }
    const randomIndex = Math.floor(Math.random() * pool.length);
    const photoId = pool[randomIndex];
    return `https://images.unsplash.com/photo-${photoId}?w=800&auto=format&fit=crop&q=80`;
};

// Scrape feeds, rewrite one new article per category, and save to DB
export const runBlogScraperPipeline = async () => {
    console.log("Starting automated blog scraper and generator pipeline...");
    const createdBlogs = [];

    for (const source of RSS_SOURCES) {
        try {
            console.log(`Fetching feed: ${source.sourceName} (${source.url})`);
            const response = await axios.get(source.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 10000
            });

            const feedItems = parseRSS(response.data);
            console.log(`Found ${feedItems.length} items in feed.`);

            // Find the first item we don't already have in the database
            let selectedItem = null;
            for (const item of feedItems) {
                // Check if the original article was already processed (either sourceUrl or title similarity)
                const existing = await Blog.findOne({
                    $or: [
                        { sourceUrl: item.link },
                        { title: item.title }
                    ]
                });

                if (!existing) {
                    selectedItem = item;
                    break; // Pick the latest new article from this category
                }
            }

            if (!selectedItem) {
                console.log(`No new articles to process for category: ${source.category}`);
                continue;
            }

            console.log(`Processing new article: "${selectedItem.title}"`);
            
            // Clean description of HTML tags for LLM readability
            const cleanDescription = selectedItem.description.replace(/<[^>]*>?/gm, '').substring(0, 1500);

            // Call Gemini to customize the blog content
            const aiBlog = await generateBlogWithAI(selectedItem.title, cleanDescription, source.category);
            
            // Generate clean slug
            let baseSlug = slugify(aiBlog.title || selectedItem.title);
            let uniqueSlug = baseSlug;
            let counter = 1;
            
            // Double check slug uniqueness
            while (await Blog.findOne({ slug: uniqueSlug })) {
                uniqueSlug = `${baseSlug}-${counter}`;
                counter++;
            }

            // Save to database
            const blog = new Blog({
                title: aiBlog.title || selectedItem.title,
                slug: uniqueSlug,
                content: aiBlog.content,
                summary: aiBlog.summary || selectedItem.description.substring(0, 150),
                category: aiBlog.category || source.category,
                tags: aiBlog.tags || [source.category],
                sourceUrl: selectedItem.link,
                sourceName: source.sourceName,
                imageUrl: getRandomImage(aiBlog.category || source.category, aiBlog.impactLabel),
                publishDate: selectedItem.pubDate ? new Date(selectedItem.pubDate) : new Date(),
                metaTitle: aiBlog.metaTitle || aiBlog.title,
                metaDescription: aiBlog.metaDescription || aiBlog.summary,
                keywords: aiBlog.keywords || 'tech news, developers, software engineering',
                isHighImpact: aiBlog.isHighImpact || false,
                impactLabel: aiBlog.impactLabel || ''
            });

            await blog.save();
            console.log(`Successfully created and saved blog: "${blog.title}" with slug: "${blog.slug}"`);
            createdBlogs.push(blog);

        } catch (error) {
            console.error(`Error processing feed ${source.sourceName}:`, error.message);
        }
    }

    return createdBlogs;
};

// Update existing blog posts in DB that have legacy/duplicate images
export const migrateOldBlogImages = async () => {
    try {
        const blogs = await Blog.find();
        console.log(`Database Migration: Checking ${blogs.length} blogs for legacy/broken image URLs...`);
        let updatedCount = 0;

        for (const blog of blogs) {
            const isLegacy = !blog.imageUrl || 
                             blog.imageUrl.includes('1618401471353-b98aedd07871') || 
                             blog.imageUrl.includes('1677442136019-21780efad99a') ||
                             blog.imageUrl.includes('undefined');

            if (isLegacy) {
                blog.imageUrl = getRandomImage(blog.category, blog.impactLabel);
                await blog.save();
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            console.log(`Database Migration: Successfully migrated ${updatedCount} legacy blog images to diverse and active URLs.`);
        } else {
            console.log("Database Migration: All blog image URLs are up to date.");
        }
    } catch (error) {
        console.error("Database Migration Failed:", error.message);
    }
};
