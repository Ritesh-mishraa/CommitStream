import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Share2, Twitter, Linkedin, Link2, ExternalLink, Tag, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Footer from '../components/home/Footer';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

// Custom Markdown-to-HTML compiler to avoid heavy NPM dependencies and ensure fast load times
const parseMarkdownToHTML = (markdown) => {
    if (!markdown) return '';

    let html = markdown;

    // Decode HTML entities
    html = html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Handle code blocks (```lang ... ```)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre class="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-xl my-6 overflow-x-auto text-xs font-mono border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"><code class="language-${lang}">${code.trim()}</code></pre>`;
    });

    // Handle inline code (`code`)
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-850 font-mono text-xs text-blue-600 dark:text-blue-400">$1</code>');

    // Handle Headings (H1, H2, H3, H4)
    html = html.replace(/^#### (.*?)$/gm, '<h4 class="text-md font-bold text-slate-900 dark:text-white mt-6 mb-2">$1</h4>');
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-3">$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4 border-b border-slate-150 dark:border-slate-800/60 pb-2">$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-12 mb-6">$1</h1>');

    // Handle bold and italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-950 dark:text-white">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

    // Handle Unordered Lists (- list item or * list item)
    // First group items
    html = html.replace(/(?:^[*-]\s+(.*?)(?:\n|$))+/gm, (match) => {
        const items = match
            .trim()
            .split(/\n[*-]\s+/)
            .map(item => `  <li class="pl-2 mb-2 relative before:content-['•'] before:absolute before:left-[-12px] before:text-blue-500">${item.replace(/^[*-]\s+/, '')}</li>`)
            .join('\n');
        return `<ul class="list-none pl-6 my-4 text-slate-650 dark:text-slate-350">\n${items}\n</ul>`;
    });

    // Handle Line breaks / Paragraphs
    const blocks = html.split(/\n{2,}/);
    html = blocks.map(block => {
        const trimmed = block.trim();
        // If it's already an HTML block element, return as is
        if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<li')) {
            return trimmed;
        }
        return `<p class="mb-6 leading-relaxed text-slate-650 dark:text-slate-300 text-sm sm:text-base">${trimmed.replace(/\n/g, '<br/>')}</p>`;
    }).join('\n');

    return html;
};

const BlogPost = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [relatedBlogs, setRelatedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [linkCopied, setLinkCopied] = useState(false);

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80';
    };

    useEffect(() => {
        const fetchBlogAndRelated = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch current blog
                const res = await fetch(`${API_BASE}/blogs/${slug}`);
                if (!res.ok) {
                    if (res.status === 404) throw new Error('Blog post not found.');
                    throw new Error('Server error loading blog post.');
                }
                const blogData = await res.json();
                setBlog(blogData);

                // Fetch related blogs in the same category
                try {
                    const relatedRes = await fetch(`${API_BASE}/blogs?category=${blogData.category}&limit=4`);
                    if (relatedRes.ok) {
                        const relatedData = await relatedRes.json();
                        // Filter out current blog
                        setRelatedBlogs(relatedData.blogs.filter(b => b._id !== blogData._id).slice(0, 3));
                    }
                } catch (e) {
                    console.error("Failed to load related articles:", e);
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogAndRelated();
        // Scroll to top on navigation
        window.scrollTo(0, 0);
    }, [slug]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateReadingTime = (content) => {
        if (!content) return 1;
        const words = content.split(/\s+/).length;
        return Math.max(1, Math.ceil(words / 200));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Opening article content...</p>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 mb-4">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Failed to load article</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">{error || 'Article does not exist.'}</p>
                <button 
                    onClick={() => navigate('/blog')}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full font-semibold transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Blog
                </button>
            </div>
        );
    }

    // JSON-LD Schema markup for Google Rich Snippets (TechArticle schema)
    const schemaMarkup = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": blog.title,
        "description": blog.metaDescription || blog.summary,
        "image": [blog.imageUrl],
        "datePublished": blog.publishDate || blog.createdAt,
        "dateModified": blog.updatedAt || blog.publishDate || blog.createdAt,
        "author": {
            "@type": "Person",
            "name": "CommitStream AI Intel Agent",
            "jobTitle": "Technical News Bot"
        },
        "publisher": {
            "@type": "Organization",
            "name": "CommitStream",
            "url": window.location.origin
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": window.location.href
        }
    };

    return (
        <div className="min-h-screen pt-28 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 flex flex-col">
            {/* Dynamic SEO tags */}
            <Helmet>
                <title>{blog.metaTitle ? `${blog.metaTitle} | CommitStream` : `${blog.title} | CommitStream`}</title>
                <meta name="description" content={blog.metaDescription || blog.summary} />
                <meta name="keywords" content={blog.keywords || 'tech news, github, artificial intelligence, jobs'} />
                <link rel="canonical" href={window.location.href} />
                
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="article" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:title" content={blog.title} />
                <meta property="og:description" content={blog.metaDescription || blog.summary} />
                <meta property="og:image" content={blog.imageUrl} />
                
                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content={window.location.href} />
                <meta property="twitter:title" content={blog.title} />
                <meta property="twitter:description" content={blog.metaDescription || blog.summary} />
                <meta property="twitter:image" content={blog.imageUrl} />

                {/* Structured JSON-LD Data for Google Search ranking */}
                <script type="application/ld+json">
                    {JSON.stringify(schemaMarkup)}
                </script>
            </Helmet>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 pb-16">
                {/* Back button */}
                <Link to="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-500 font-semibold text-sm mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Articles
                </Link>

                <article>
                    {/* Header Details */}
                    <div className="mb-8">
                    <div className="flex flex-wrap gap-2 mb-4 items-center">
                        <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            {blog.category}
                        </span>
                        {blog.isHighImpact && (
                            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-red-650 text-white animate-pulse shadow-sm flex gap-1 items-center font-extrabold">
                                🔥 {blog.impactLabel || 'BREAKING'}
                            </span>
                        )}
                    </div>
                        
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-6">
                            {blog.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400 pb-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/25 flex items-center justify-center font-bold text-xs text-blue-600 dark:text-blue-400">
                                    AI
                                </div>
                                <span className="font-semibold text-slate-700 dark:text-slate-350">CommitStream Compiler</span>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>
                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(blog.publishDate)}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>
                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{calculateReadingTime(blog.content)} min read</span>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="rounded-3xl overflow-hidden aspect-video relative mb-10 border border-slate-200 dark:border-slate-850 shadow-lg">
                        <img src={blog.imageUrl} alt={blog.title} onError={handleImageError} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent"></div>
                    </div>

                    {/* Content Section (Split into content and share sidebar) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Share Bar */}
                        <div className="lg:col-span-1 lg:flex lg:flex-col lg:items-center gap-4 lg:sticky lg:top-24 h-fit">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-2 lg:mb-0">Share</span>
                            <div className="flex lg:flex-col gap-3">
                                <button 
                                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:text-blue-500 bg-white dark:bg-slate-900 transition-colors shadow-sm cursor-pointer"
                                    title="Share on Twitter"
                                >
                                    <Twitter className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:text-blue-500 bg-white dark:bg-slate-900 transition-colors shadow-sm cursor-pointer"
                                    title="Share on LinkedIn"
                                >
                                    <Linkedin className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={handleCopyLink}
                                    className={`p-2.5 rounded-xl border transition-colors shadow-sm cursor-pointer ${
                                        linkCopied 
                                        ? 'border-emerald-500 text-emerald-500 bg-emerald-500/5' 
                                        : 'border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:text-blue-500 bg-white dark:bg-slate-900'
                                    }`}
                                    title={linkCopied ? "Link Copied!" : "Copy Link"}
                                >
                                    <Link2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Article Text */}
                        <div className="lg:col-span-11">
                            <div 
                                className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 font-serif"
                                dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(blog.content) }}
                            />

                            {/* Tags Section */}
                            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
                                {blog.tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-650 dark:text-slate-400">
                                        <Tag className="w-3.5 h-3.5 text-blue-500" />
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Original Source attribution for SEO integrity - elegant subtle footnote */}
                            {blog.sourceUrl && (
                                <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-right">
                                    <a 
                                        href={blog.sourceUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-500 hover:underline transition-colors"
                                    >
                                        View reference source
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </article>

                {/* Related Articles Footer */}
                {relatedBlogs.length > 0 && (
                    <div className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">
                            Related Articles
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedBlogs.map(item => (
                                <Link 
                                    key={item._id} 
                                    to={`/blog/${item.slug}`} 
                                    className="group flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/50 p-5 hover:border-blue-500/20 dark:hover:border-blue-500/20 transition-all hover:shadow-lg"
                                >
                                    <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">
                                        {item.category}
                                    </span>
                                    <h4 className="text-sm font-bold text-slate-950 dark:text-white leading-snug group-hover:text-blue-500 transition-colors line-clamp-2 mb-3">
                                        {item.title}
                                    </h4>
                                    <span className="text-[10px] text-slate-450 dark:text-slate-500 flex items-center gap-1 mt-auto font-semibold">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(item.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default BlogPost;
