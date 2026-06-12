import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { Bot, Sparkles, Send, RefreshCw, Globe, FolderSearch, GitBranch, ArrowRight, Terminal, AlertTriangle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

// Lightweight syntax highlighter for code snippets
const highlightCode = (code, lang = '') => {
    if (!code) return '';
    
    // We already have code with escaped &lt;, &gt;, &amp; from parseMarkdownToHTML
    let escaped = code;
    
    // Store comments and strings to protect them from keyword highlighting
    const tokens = [];
    let tokenIdx = 0;
    const addToken = (html) => {
        const placeholder = `___TOKEN_HL_${tokenIdx}___`;
        tokens.push({ placeholder, html });
        tokenIdx++;
        return placeholder;
    };

    // Alternation regex: matches JS/TS/Py strings and comments safely
    // Match double quoted strings, single quoted strings, backtick strings, single line comments (// or #), and block comments (/* */)
    const stringAndCommentRegex = /("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`|\/\/.*|\/\*[\s\S]*?\*\/|#.*)/g;
    
    escaped = escaped.replace(stringAndCommentRegex, (match) => {
        if (match.startsWith('//') || match.startsWith('/*') || match.startsWith('#')) {
            return addToken(`<span class="text-slate-450 dark:text-slate-500 italic">${match}</span>`);
        } else {
            return addToken(`<span class="text-emerald-600 dark:text-emerald-450 font-medium">${match}</span>`);
        }
    });

    // 1. Keywords
    const keywords = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|import|export|from|default|async|await|try|catch|finally|throw|new|this|typeof|instanceof|yield|def|elif|as|in|is|not|and|or|pass|lambda|except|raise|with|assert|global|nonlocal|null|undefined|true|false|void|public|private|protected|static|readonly|interface|type|extends|implements|any|string|number|boolean|unknown|never|set|get|constructor)\b/g;
    escaped = escaped.replace(keywords, '<span class="text-pink-500 dark:text-pink-400 font-semibold">$1</span>');

    // 2. Constants/Booleans/Built-ins
    const constants = /\b(true|false|null|undefined|NaN|Object|Array|Promise|String|Number|Boolean|Function|Symbol|Error|RegExp|Map|Set|Date|JSON|Math|console|window|document|process|global)\b/g;
    escaped = escaped.replace(constants, '<span class="text-violet-500 dark:text-violet-400 font-medium">$1</span>');

    // 3. Numbers
    const numbers = /\b(\d+(\.\d+)?)\b/g;
    escaped = escaped.replace(numbers, '<span class="text-amber-500 dark:text-amber-400">$1</span>');

    // 4. Functions (word followed by paren)
    const functions = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g;
    escaped = escaped.replace(functions, '<span class="text-blue-500 dark:text-blue-400">$1</span>');

    // Restore comments and strings
    for (let i = tokens.length - 1; i >= 0; i--) {
        escaped = escaped.replace(tokens[i].placeholder, tokens[i].html);
    }

    return escaped;
};

// Custom Markdown-to-HTML parser for codebase replies
const parseMarkdownToHTML = (markdown) => {
    if (!markdown) return '';
    let html = markdown;

    // Decode HTML entities
    html = html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Code blocks (```lang ... ```)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        const highlighted = highlightCode(code.trim(), lang);
        const languageLabel = lang ? lang.toUpperCase() : 'CODE';
        return `<div class="my-5 rounded-xl border border-slate-800 dark:border-slate-850 overflow-hidden shadow-md bg-slate-950 dark:bg-slate-950/80 font-mono text-xs">
            <div class="flex items-center justify-between px-4 py-2.5 bg-slate-900 dark:bg-slate-900/90 border-b border-slate-800/80 select-none">
                <div class="flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-rose-500/90"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-500/90"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/90"></span>
                </div>
                <span class="text-[10px] font-bold text-slate-450 dark:text-slate-400 tracking-wider">${languageLabel}</span>
            </div>
            <pre class="p-4 overflow-x-auto text-slate-100 dark:text-slate-200 leading-relaxed"><code class="language-${lang}">${highlighted}</code></pre>
        </div>`;
    });

    // Inline code (`code`)
    html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-150 dark:bg-slate-800/80 font-mono text-[11px] font-semibold text-pink-650 dark:text-pink-400 border border-slate-200/60 dark:border-slate-700/50">$1</code>');

    // Headings
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-sm font-bold text-slate-900 dark:text-white mt-4 mb-1.5">$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-base font-bold text-slate-900 dark:text-white mt-6 mb-2.5">$1</h2>');

    // Bold & Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-950 dark:text-white">$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

    // Ordered lists
    html = html.replace(/(?:^\d+\.\s+(.*?)(?:\n|$))+/gm, (match) => {
        const items = match
            .trim()
            .split(/\n\d+\.\s+/)
            .map(item => `<li class="mb-1.5">${item.replace(/^\d+\.\s+/, '')}</li>`)
            .join('\n');
        return `<ol class="list-decimal pl-5 my-3 text-slate-650 dark:text-slate-350 text-sm">\n${items}\n</ol>`;
    });

    // Unordered lists
    html = html.replace(/(?:^[*-]\s+(.*?)(?:\n|$))+/gm, (match) => {
        const items = match
            .trim()
            .split(/\n[*-]\s+/)
            .map(item => `  <li class="pl-2 mb-1.5 relative before:content-['•'] before:absolute before:left-[-10px] before:text-blue-500">${item.replace(/^[*-]\s+/, '')}</li>`)
            .join('\n');
        return `<ul class="list-none pl-5 my-3 text-slate-650 dark:text-slate-350 text-sm">\n${items}\n</ul>`;
    });

    // Paragraphs
    const blocks = html.split(/\n{2,}/);
    html = blocks.map(block => {
        const trimmed = block.trim();
        if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<li') || trimmed.startsWith('<div')) {
            return trimmed;
        }
        return `<p class="mb-4 leading-relaxed text-slate-700 dark:text-slate-350 text-sm">${trimmed.replace(/\n/g, '<br/>')}</p>`;
    }).join('\n');

    return html;
};

const RepoChat = () => {
    const { user, token } = useAuth();
    const { activeProject } = useProject();

    // App state
    const [mode, setMode] = useState('codebase'); // 'general' | 'codebase' | 'branch'
    const [selectedBranch, setSelectedBranch] = useState('');
    const [branches, setBranches] = useState([]);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    
    // Status states
    const [isIndexed, setIsIndexed] = useState(false);
    const [chunkCount, setChunkCount] = useState(0);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [indexing, setIndexing] = useState(false);
    const [sending, setSending] = useState(false);
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, sending]);

    // Check codebase index status and fetch branches
    const checkIndexStatus = async () => {
        if (!token || !activeProject) return;
        setCheckingStatus(true);
        try {
            const res = await fetch(`${API_BASE}/rag/status?projectId=${activeProject._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setIsIndexed(data.indexed);
                setChunkCount(data.chunkCount);
            }
        } catch (err) {
            console.error("Index status check failed:", err);
        } finally {
            setCheckingStatus(false);
        }
    };

    const fetchBranches = async () => {
        if (!token || !activeProject) return;
        try {
            const res = await fetch(`${API_BASE}/branches?projectId=${activeProject._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBranches(data);
                const defaultB = data.find(b => b.isDefault);
                if (defaultB) {
                    setSelectedBranch(defaultB.name);
                } else if (data.length > 0) {
                    setSelectedBranch(data[0].name);
                }
            }
        } catch (err) {
            console.error("Failed to load branches:", err);
        }
    };

    // Load initial context on project change
    useEffect(() => {
        if (!activeProject) return;
        checkIndexStatus();
        fetchBranches();
        
        // Reset message log with standard greetings
        setMessages([
            {
                id: 'welcome',
                role: 'model',
                text: `Hello! I am **CommitStream AI Assistant** for the **${activeProject.name}** repository.\n\nChoose an operational mode and ask me anything about the codebase, branch structures, or general engineering setups. How can I help you collaborate today?`,
                createdAt: new Date().toISOString()
            }
        ]);
    }, [activeProject, token]);

    // Handle index codebase action
    const handleIndexCodebase = async () => {
        if (!token || !activeProject) return;
        setIndexing(true);
        try {
            const res = await fetch(`${API_BASE}/rag/index`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ projectId: activeProject._id })
            });
            if (res.ok) {
                await checkIndexStatus();
            } else {
                const errData = await res.json();
                alert(`Indexing failed: ${errData.message || 'Server error'}`);
            }
        } catch (err) {
            console.error("Indexing trigger failed:", err);
            alert("Network error starting index.");
        } finally {
            setIndexing(false);
        }
    };

    // Send chat message payload
    const handleSendMessage = async (e, textToSend = null) => {
        if (e) e.preventDefault();
        const text = textToSend || inputText;
        if (!text.trim() || sending || !activeProject) return;

        // User message
        const userMsg = {
            id: `user-${Date.now()}`,
            role: 'user',
            text: text.trim(),
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        if (!textToSend) setInputText('');
        setSending(true);

        try {
            // Compile prompt turns to send history
            const history = messages
                .filter(m => m.id !== 'welcome')
                .map(m => ({ role: m.role, text: m.text }));

            const res = await fetch(`${API_BASE}/rag/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId: activeProject._id,
                    message: text.trim(),
                    history,
                    mode,
                    branch: mode === 'branch' ? selectedBranch : undefined
                })
            });

            if (res.ok) {
                const data = await res.json();
                const aiMsg = {
                    id: `ai-${Date.now()}`,
                    role: 'model',
                    text: data.reply,
                    createdAt: new Date().toISOString()
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to generate answer.');
            }
        } catch (err) {
            console.error("Assistant reply failed:", err);
            setMessages(prev => [...prev, {
                id: `error-${Date.now()}`,
                role: 'model',
                text: `⚠️ **Error generating response:** ${err.message}. Please check your credentials or try again later.`,
                createdAt: new Date().toISOString()
            }]);
        } finally {
            setSending(false);
        }
    };

    // Predefined quick questions
    const quickPrompts = {
        general: [
            "What is the difference between SQL and NoSQL?",
            "Explain JWT token lifecycle in client-server architecture",
            "Write a clean JavaScript debounce wrapper"
        ],
        codebase: [
            "Explain the directory structure of this repository",
            "How does user authentication work in the codebase?",
            "What libraries are configured inside the package.json?"
        ],
        branch: [
            "What files were modified in this branch?",
            "Summarize the key changes made in the code",
            "Are there any structural collisions compared to main?"
        ]
    };

    const handleQuickPromptClick = (promptText) => {
        handleSendMessage(null, promptText);
    };

    const handleClearChat = () => {
        setMessages([
            {
                id: 'welcome',
                role: 'model',
                text: `Welcome back to the repository chat workspace. Ask me anything about the **${activeProject.name}** files, active branches, or conceptual software setups!`,
                createdAt: new Date().toISOString()
            }
        ]);
    };

    if (!activeProject) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-slate-500 border border-slate-200 dark:border-slate-800 border-dashed rounded-lg bg-white dark:bg-slate-900/20">
                <Bot className="w-12 h-12 mb-4 opacity-50 text-blue-500 animate-bounce" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Select a Workspace Project</p>
                <p className="text-xs text-slate-400 mt-1">Select an active repository from the top header selector to interact with the Repo Assistant.</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm rounded-xl">
                   {/* Header / Mode Bar Selection */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shrink-0 flex flex-col sm:flex-row gap-4 items-center justify-between z-10 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex flex-wrap items-center gap-2">
                        <Bot className="w-5 h-5 text-blue-500" />
                        Repo AI Assistant
                        
                        {/* Status / Index Codebase trigger */}
                        {checkingStatus ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 select-none">
                                <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Checking...
                            </span>
                        ) : isIndexed ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20 shadow-sm select-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Indexed
                            </span>
                        ) : (
                            <button
                                onClick={handleIndexCodebase}
                                disabled={indexing}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/35 transition-all cursor-pointer disabled:opacity-50 shadow-sm shrink-0"
                            >
                                {indexing ? (
                                    <>
                                        <RefreshCw className="w-2.5 h-2.5 animate-spin text-amber-600 dark:text-amber-400" />
                                        Indexing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                                        Index Codebase
                                    </>
                                )}
                            </button>
                        )}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Chat with repository files, active branch diffs, or standard concepts.</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                    <button
                        onClick={() => setMode('codebase')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                            mode === 'codebase'
                                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-slate-655 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                        <FolderSearch className="w-3.5 h-3.5" />
                        Codebase RAG
                    </button>
                    <button
                        onClick={() => setMode('branch')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                            mode === 'branch'
                                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-slate-655 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                        <GitBranch className="w-3.5 h-3.5" />
                        Branch Focus
                    </button>
                    <button
                        onClick={() => setMode('general')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                            mode === 'general'
                                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-slate-655 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                        <Globe className="w-3.5 h-3.5" />
                        General AI
                    </button>
                </div>
            </div>

            {/* Sub-Header Context Area (Indexing warnings or Branch Selector) */}
            <AnimatePresence mode="wait">
                {mode === 'branch' && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 py-3 shrink-0 flex items-center justify-between gap-4 overflow-hidden"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Select Focus Branch:</span>
                            {branches.length === 0 ? (
                                <span className="text-xs text-slate-400 italic">No active branch diffs found</span>
                            ) : (
                                <select
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 cursor-pointer"
                                >
                                    {branches.map(b => (
                                        <option key={b.name} value={b.name}>
                                            {b.name} {b.isDefault ? '(default)' : `(${b.filesChanged?.length || 0} modified)`}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        {isIndexed && (
                            <span className="text-[10px] text-slate-450 dark:text-slate-500 font-mono">CODEBASE CHUNKS: {chunkCount}</span>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Body messages list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/20 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-350 dark:scrollbar-thumb-slate-700 relative">
                
                {/* Clear chat float */}
                {messages.length > 1 && (
                    <button 
                        onClick={handleClearChat}
                        title="Clear conversation"
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-500/20 text-slate-450 hover:text-red-500 shadow-sm transition-all hover:bg-red-500/5 cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}

                <div className="space-y-6">
                    {messages.map((msg) => {
                        const isUser = msg.role === 'user';
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex max-w-[85%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar icon */}
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                                        isUser 
                                        ? 'bg-blue-600 text-white border-blue-700' 
                                        : 'bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                                    }`}>
                                        {isUser ? (
                                            <span className="text-xs font-bold font-mono">{user?.username?.charAt(0).toUpperCase()}</span>
                                        ) : (
                                            <Bot className="w-5 h-5 text-blue-500" />
                                        )}
                                    </div>

                                    {/* Chat Text Bubble */}
                                    <div className="flex flex-col">
                                        <div className={`px-5 py-4 rounded-2xl shadow-sm text-sm border ${
                                            isUser 
                                                ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40 text-blue-900 dark:text-blue-200 rounded-tr-none' 
                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-tl-none relative overflow-hidden pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-blue-500 before:to-indigo-650 text-slate-800 dark:text-slate-200'
                                        }`}>
                                            {isUser ? (
                                                <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.text}</p>
                                            ) : (
                                                <div 
                                                    className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-350"
                                                    dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(msg.text) }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Generation Typing Loader state */}
                    {sending && (
                        <div className="flex w-full justify-start">
                            <div className="flex gap-4">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                    <Bot className="w-5 h-5 text-blue-500 animate-pulse" />
                                </div>
                                <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Empty State Template Cards */}
                {messages.length === 1 && (
                    <div className="pt-8 max-w-2xl mx-auto space-y-6">
                        <div className="text-center">
                            <Terminal className="w-8 h-8 text-blue-500 mx-auto opacity-35" />
                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">Suggested Repository Queries</h4>
                            <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">Select one of these queries to explore the chatbot's focus capabilities:</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {quickPrompts[mode]?.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleQuickPromptClick(prompt)}
                                    className="flex flex-col text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/35 hover:shadow-md transition-all group cursor-pointer"
                                >
                                    <p className="text-xs text-slate-700 dark:text-slate-350 leading-normal flex-1 font-medium">{prompt}</p>
                                    <span className="text-[10px] font-bold text-blue-500 group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1 mt-3">
                                        Ask AI
                                        <ArrowRight className="w-3 h-3" />
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Submission Bar */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shrink-0 shadow-inner">
                <form onSubmit={handleSendMessage} className="flex gap-2 max-w-5xl mx-auto items-center relative">
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={
                            mode === 'codebase' 
                                ? 'Query codebase components and files...' 
                                : mode === 'branch' 
                                    ? `Ask about branch changes on "${selectedBranch}"...` 
                                    : 'Ask a general programming question...'
                        }
                        className="flex-1 bg-slate-100/70 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 outline-none rounded-full px-5 py-3 text-sm text-slate-800 dark:text-slate-200 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                    <button 
                        type="submit" 
                        disabled={!inputText.trim() || sending}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-850 disabled:scale-100 text-white p-3 rounded-full shrink-0 transition-all hover:scale-105 active:scale-95 duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-center cursor-pointer"
                    >
                        <Send className="w-5 h-5 ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RepoChat;
