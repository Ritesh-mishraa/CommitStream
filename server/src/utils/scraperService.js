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
        '1542831371-29b0f74f9713', '1517694712202-14dd9538aa97',
        '1526374965328-7f61d4dc18c5', '1531403009284-440f080d1e12',
        '1580894732444-8febeb78657f', '1552664730-d307ca884978'
    ],
    'AI Industry': [
        '1677442136019-21780ecad995', '1618005182384-a83a8bd57fbe', 
        '1581091226825-a6a2a5aee158', '1526374965328-7f61d4dc18c5', 
        '1684369175833-2a8d11c79808', '1507146426996-ef05306b995a',
        '1485827404703-89b55fcc595e', '1620712943543-bcc4688e7485',
        '1617791160536-598cf32026fb', '1531747118685-ca8fa6e08806'
    ],
    'Job Market': [
        '1486406146926-c627a92ad1ab', '1507679799987-c73779587ccf', 
        '1434030216411-0b793f4b4173', '1521791136368-1a9b79758550', 
        '1427504494785-3a9ca7044f45', '1497366216548-37526070297c',
        '1522071820081-009f0129c71c', '1454165804606-c3d57bc86b40',
        '1519389950473-47ba0277781c', '1552581230-c115979f5086'
    ],
    'General Tech': [
        '1518770660439-4636190af475', '1451187580459-43490279c0fa', 
        '1519389950473-47ba0277781c', '1498050108023-c5249f4df085', 
        '1550751827-4bd374c3f58b', '1588702547919-2a08b310721f',
        '1531297484001-80022131f5a1', '1562408590-e32931084e23',
        '1535378917042-10a22c95931a', '1607604276583-eef5d076aa5f'
    ],
    'Layoffs': [
        '1507679799987-c73779587ccf', '1542744173-05336fcc7ad4', 
        '1522071820081-009f0129c71c', '1515378791036-0648a3ef77b2',
        '1421996522046-2603e43a99f7', '1507207611509-ec012433ff52',
        '1479064555547-f7227ff52144', '1584438784854-087e5679d86c'
    ]
};

// Returns a deterministic image from the pool based on a hash of the blog title
const getRandomImage = (category, impactLabel, title = '') => {
    let pool = IMAGE_POOLS[category] || IMAGE_POOLS['General Tech'];
    if (impactLabel && impactLabel.toLowerCase().includes('layoff')) {
        pool = IMAGE_POOLS['Layoffs'];
    }
    
    // Hash function to map title/slug to a stable index in the pool
    let hash = 0;
    const str = title || category || '';
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % pool.length;
    const photoId = pool[index];
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
                imageUrl: getRandomImage(aiBlog.category || source.category, aiBlog.impactLabel, aiBlog.title || selectedItem.title),
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

// Update existing blog posts in DB to have diverse, deterministic images
export const migrateOldBlogImages = async () => {
    try {
        const blogs = await Blog.find();
        console.log(`Database Migration: Distributing unique images for all ${blogs.length} blogs...`);
        let updatedCount = 0;

        for (const blog of blogs) {
            // Assign deterministic unique image based on title/category
            const targetImage = getRandomImage(blog.category, blog.impactLabel, blog.title);

            if (blog.imageUrl !== targetImage) {
                blog.imageUrl = targetImage;
                await blog.save();
                updatedCount++;
            }
        }

        console.log(`Database Migration: Completed. Updated ${updatedCount} blog image URLs.`);
    } catch (error) {
        console.error("Database Migration Failed:", error.message);
    }
};
