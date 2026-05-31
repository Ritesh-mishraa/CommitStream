import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Tag, ArrowRight, RefreshCw, AlertCircle, Clock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import Footer from '../components/home/Footer';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const CATEGORIES = ['All', 'GitHub', 'AI Industry', 'Job Market', 'General Tech'];

const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 24, pages: 1 });
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState(null);

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80';
    };

    const fetchBlogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const baseUrl = API_BASE.startsWith('http') ? API_BASE : `${window.location.origin}${API_BASE}`;
            const url = new URL(`${baseUrl}/blogs`);
            url.searchParams.append('page', currentPage.toString());
            url.searchParams.append('limit', '24');
            if (selectedCategory && selectedCategory !== 'All') {
                url.searchParams.append('category', selectedCategory);
            }
            if (searchQuery) {
                url.searchParams.append('q', searchQuery);
            }

            const res = await fetch(url.toString());
            if (!res.ok) throw new Error('Failed to load blog posts.');
            const data = await res.json();
            setBlogs(data.blogs);
            setPagination(data.pagination);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, [currentPage, selectedCategory]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchBlogs();
    };

    const triggerSync = async () => {
        if (syncing) return;
        setSyncing(true);
        try {
            const res = await fetch(`${API_BASE}/blogs/sync`, { method: 'POST' });
            if (!res.ok) throw new Error('Sync request failed');
            
            // Give the server scheduler a short time to process the first feed and reload
            setTimeout(() => {
                fetchBlogs();
                setSyncing(false);
            }, 3000);
        } catch (err) {
            alert('Could not start sync: ' + err.message);
            setSyncing(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const calculateReadingTime = (content) => {
        if (!content) return 1;
        const words = content.split(/\s+/).length;
        return Math.max(1, Math.ceil(words / 200));
    };

    // Filter out the featured post (only the very first blog in full category view)
    const featuredPost = currentPage === 1 && selectedCategory === 'All' && !searchQuery && blogs.length > 0
        ? blogs[0]
        : null;

    const listBlogs = featuredPost ? blogs.slice(1) : blogs;

    return (
        <div className="min-h-screen pt-28 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 flex flex-col">
            <SEO 
                title="Tech Insights Blog"
                description="Stay updated with the latest in technology, GitHub innovations, AI advancements, and developers job market trends compiled by our intelligence compiler."
                keywords="tech blog, github news, ai trends, software engineer jobs, technology news, commitstream insights"
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 pb-16">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-3 border border-blue-500/20">
                            <Globe className="w-3.5 h-3.5 animate-spin-slow" />
                            <span>CommitStream Intel Hub</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white bg-clip-text">
                            Tech Insights & News
                        </h1>
                        <p className="mt-3 text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
                            Daily automated, AI-curated developer updates spanning Github innovations, the AI industry, and the tech job market.
                        </p>
                    </div>

                    <button 
                        onClick={triggerSync}
                        disabled={syncing}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-md ${
                            syncing 
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 text-slate-800 dark:text-slate-200 hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer'
                        }`}
                    >
                        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                        <span>{syncing ? 'Syncing Feeds...' : 'Sync News'}</span>
                    </button>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => {
                                    setSelectedCategory(cat);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                                    selectedCategory === cat
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full py-2 pl-4 pr-10 text-sm focus:border-blue-500 outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-colors shadow-sm"
                        />
                        <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer">
                            <Search className="w-4.5 h-4.5" />
                        </button>
                    </form>
                </div>

                {/* Main Content Area */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-slate-500 dark:text-slate-400 animate-pulse text-sm">Compiling technical insights...</p>
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-3 p-4 border border-red-500/20 bg-red-500/5 rounded-xl text-red-500 my-8">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                ) : (
                    <>
                        {/* Featured Post Spotlight */}
                        {featuredPost && (
                            <motion.div 
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="mb-12"
                            >
                                <Link to={`/blog/${featuredPost.slug}`} className="group block overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/5">
                                    <div className="grid grid-cols-1 lg:grid-cols-12">
                                        <div className="lg:col-span-7 h-64 sm:h-96 lg:h-auto relative overflow-hidden">
                                            <img 
                                                src={featuredPost.imageUrl} 
                                                alt={featuredPost.title} 
                                                onError={handleImageError}
                                                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out" 
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950/70 via-transparent to-transparent"></div>
                                            <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                                                <span className="px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-600 text-white shadow-md">
                                                    FEATURED
                                                </span>
                                                <span className="px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-900/80 text-white backdrop-blur-md">
                                                    {featuredPost.category}
                                                </span>
                                                {featuredPost.isHighImpact && (
                                                    <span className="px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-red-650 text-white animate-pulse shadow-md flex items-center gap-1 font-extrabold">
                                                        🔥 {featuredPost.impactLabel || 'BREAKING'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-center">
                                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4 font-semibold">
                                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(featuredPost.publishDate)}</span>
                                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{calculateReadingTime(featuredPost.content)} min read</span>
                                            </div>

                                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-500 transition-colors">
                                                {featuredPost.title}
                                            </h2>

                                            <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">
                                                {featuredPost.summary}
                                            </p>

                                            <div className="mt-6 flex flex-wrap gap-2">
                                                {featuredPost.tags.slice(0, 3).map(tag => (
                                                    <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                        <Tag className="w-3 h-3" />
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                                                <span className="flex items-center gap-2">
                                                    Read Full Story
                                                    <ArrowRight className="w-4 h-4" />
                                                </span>
                                                {featuredPost.sourceName && (
                                                    <span className="text-xs font-normal text-slate-450 dark:text-slate-500">
                                                        via {featuredPost.sourceName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )}

                        {/* Blog Grid */}
                        {listBlogs.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-slate-900/35 border border-slate-200 dark:border-slate-850 rounded-3xl">
                                <p className="text-slate-500 dark:text-slate-400 text-lg">No articles found matching filters.</p>
                                <button 
                                    onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setCurrentPage(1); }}
                                    className="mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <AnimatePresence mode="popLayout">
                                    {listBlogs.map((blog, idx) => (
                                        <motion.div
                                            key={blog._id}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.3) }}
                                            layout
                                        >
                                            <Link to={`/blog/${blog.slug}`} className="group flex flex-col h-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5">
                                                <div className="h-48 relative overflow-hidden">
                                                    <img 
                                                        src={blog.imageUrl} 
                                                        alt={blog.title} 
                                                        onError={handleImageError}
                                                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out" 
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
                                                    <span className="absolute top-4 left-4 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-slate-900/70 text-white backdrop-blur-md">
                                                        {blog.category}
                                                    </span>
                                                    {blog.isHighImpact && (
                                                        <span className="absolute top-4 right-4 px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase bg-red-650 text-white animate-pulse shadow-sm z-10 flex items-center gap-0.5 font-extrabold">
                                                            🔥 {blog.impactLabel || 'HOT'}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="p-6 flex-1 flex flex-col">
                                                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-405 mb-3 font-semibold">
                                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(blog.publishDate)}</span>
                                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{calculateReadingTime(blog.content)} min read</span>
                                                    </div>

                                                    <h3 className="text-lg font-bold text-slate-950 dark:text-white leading-snug group-hover:text-blue-500 transition-colors line-clamp-2">
                                                        {blog.title}
                                                    </h3>

                                                    <p className="mt-3 text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3 mb-6">
                                                        {blog.summary}
                                                    </p>

                                                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-blue-600 dark:text-blue-400 font-semibold text-xs group-hover:translate-x-1 transition-transform">
                                                        <span className="flex items-center gap-1.5">
                                                            Read Article
                                                            <ArrowRight className="w-3.5 h-3.5" />
                                                        </span>
                                                        {blog.sourceName && (
                                                            <span className="text-[10px] font-normal text-slate-450 dark:text-slate-500">
                                                                via {blog.sourceName.split(' ')[0]}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all select-none cursor-pointer ${
                                        currentPage === 1
                                        ? 'text-slate-400 cursor-not-allowed'
                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-800 dark:text-slate-200'
                                    }`}
                                >
                                    Previous
                                </button>
                                
                                <div className="flex gap-1.5">
                                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p)}
                                            className={`w-9 h-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                currentPage === p
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-800 dark:text-slate-200'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                                    disabled={currentPage === pagination.pages}
                                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all select-none cursor-pointer ${
                                        currentPage === pagination.pages
                                        ? 'text-slate-400 cursor-not-allowed'
                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-800 dark:text-slate-200'
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default BlogList;
