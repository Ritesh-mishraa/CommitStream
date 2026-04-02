import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { io } from 'socket.io-client';
import { MessageSquare, Send, Folder } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const Chat = () => {
    const { user, token } = useAuth();
    const { activeProject } = useProject();

    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch initial chat history from the persistent Database Endpoint
    useEffect(() => {
        if (!token || !activeProject) return;
        
        const fetchHistory = async () => {
            try {
                const res = await fetch(`${API_BASE}/messages?projectId=${activeProject._id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (err) {
                console.error("Failed to load persistent chat history", err);
            }
        };
        
        fetchHistory();
    }, [token, activeProject]);

    // WebSockets Real-Time Sync looping
    useEffect(() => {
        if (!token || !activeProject) return;

        const newSocket = io(SOCKET_URL, { auth: { token } });

        newSocket.on('connect', () => {
            newSocket.emit('join-project', { projectId: activeProject._id, user });
        });

        newSocket.on('new-project-message', (newMessage) => {
            // Check if we already have it to avoid duplicates during rapid dual-sync behaviors
            setMessages(prev => {
                if (prev.find(m => m._id === newMessage._id)) return prev;
                return [...prev, newMessage];
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.emit('leave-project', { projectId: activeProject._id });
            newSocket.disconnect();
        };
    }, [token, activeProject, user]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !socket || !activeProject) return;

        // Emit over socket pipeline (which concurrently writes to DB asynchronously inside the backend)
        socket.emit('project-chat-message', {
            projectId: activeProject._id,
            text: inputText.trim()
        });

        setInputText('');
    };

    if (!activeProject) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-slate-500 border border-slate-200 dark:border-slate-800 border-dashed rounded-lg bg-white dark:bg-slate-900/20">
                <Folder className="w-12 h-12 mb-4 opacity-50" />
                <p>Select a project from the topbar to access Team Chat.</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm rounded-xl">
            {/* Thread Header Context */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 shrink-0 flex items-center justify-between z-10">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        {activeProject.name} Workspace
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">End-to-end direct team communication.</p>
                </div>
            </div>

            {/* Chat Render Tree */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 relative">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 absolute inset-0">
                        <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                        <p className="font-medium text-sm">No messages yet. Start collaborating!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                        const avatar = msg.sender?.avatarColor || '#3b82f6';
                        const username = msg.sender?.username || 'Unknown';
                        const timeString = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return (
                            <div key={msg._id || idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[70%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar Block */}
                                    <div 
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1 shadow-sm border border-black/10"
                                        style={{ backgroundColor: avatar }}
                                        title={username}
                                    >
                                        {username.charAt(0).toUpperCase()}
                                    </div>
                                    
                                    {/* Message Text Block */}
                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1 px-1">
                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isMe ? 'You' : username}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">{timeString}</span>
                                        </div>
                                        <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm whitespace-pre-wrap break-words ${
                                            isMe 
                                            ? 'bg-blue-600 text-white rounded-tr-sm' 
                                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Socket Transmission Input Form */}
            <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-3 shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2 relative max-w-5xl mx-auto">
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Message your repository team..."
                        className="flex-1 bg-slate-100 dark:bg-slate-900 border border-transparent outline-none rounded-full px-5 py-3 text-sm text-slate-800 dark:text-slate-200 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                    <button 
                        type="submit" 
                        disabled={!inputText.trim()}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white p-3 rounded-full shrink-0 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-center"
                    >
                        <Send className="w-5 h-5 ml-0.5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
