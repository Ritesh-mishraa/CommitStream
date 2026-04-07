import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { io } from 'socket.io-client';
import { Users, PhoneCall, Mail, Github, Folder, UserCheck, UserMinus } from 'lucide-react';
import SEO from '../components/SEO';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD ? '/' : 'http://localhost:5000');

const TeamDirectory = () => {
    const { user, token } = useAuth();
    const { activeProject } = useProject();
    const navigate = useNavigate();

    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    // Initialize Global Presence Socket
    useEffect(() => {
        if (!token || !activeProject) return;

        const newSocket = io(SOCKET_URL, {
            auth: { token }
        });

        newSocket.on('connect', () => {
            newSocket.emit('join-project', { projectId: activeProject._id, user });
        });

        newSocket.on('presence-update', (usersArray) => {
            // Deduplicate by userId so a user logged in twice isn't shown twice
            const uniqueUsers = Array.from(new Map(usersArray.map(u => [u.userId, u])).values());
            setOnlineUsers(uniqueUsers);
        });

        setSocket(newSocket);

        return () => {
            newSocket.emit('leave-project', { projectId: activeProject._id });
            newSocket.disconnect();
        };
    }, [token, activeProject, user]);

    const handleCallUser = (collaborator) => {
        // Generate a random 6-character room ID for a private session
        const privateRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        navigate(`/room/${privateRoomId}`);
        navigator.clipboard.writeText(privateRoomId);
        alert(`Created Private Room: ${privateRoomId}.\n\nRoom Code copied to clipboard. Send it to ${collaborator.username} to dynamically launch a WebRTC connection!`);
    };

    if (!activeProject) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-slate-500 border border-slate-200 dark:border-slate-800 border-dashed rounded-lg bg-white dark:bg-slate-900/20">
                <Folder className="w-12 h-12 mb-4 opacity-50" />
                <p>Select a project from the topbar to view the Team Directory.</p>
            </div>
        );
    }

    const members = activeProject.members || [];
    const onlineUserIds = onlineUsers.map(u => u.userId);

    return (
        <div className="space-y-6">
            <SEO 
                title="Team Directory"
                description="Connect with your development team. View live presence, GitHub profiles, and launch WebRTC video pair-programming calls."
                keywords="team directory, team collaboration, live presence, pair programming, webrtc video call, developer network"
            />
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-500" />
                    Team Directory
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Live presence monitoring for the <span className="font-semibold">{activeProject.name}</span> project.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {members.map(member => {
                    const isOnline = onlineUserIds.includes(member._id);
                    const isMe = member._id === user._id;

                    return (
                        <div key={member._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative group overflow-hidden flex flex-col h-48">
                            {/* Header / Online Status */}
                            <div className="flex justify-between items-start mb-4 relative z-10 shrink-0">
                                <div 
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg border-2 border-white dark:border-slate-800 shadow-sm"
                                    style={{ backgroundColor: member.avatarColor || '#3b82f6' }}
                                >
                                    {member.username.charAt(0).toUpperCase()}
                                </div>
                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isOnline ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
                                    {isOnline ? (
                                        <><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online</>
                                    ) : (
                                        <><div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Offline</>
                                    )}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="relative z-10 flex-1 min-h-0">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg flex items-center gap-2 truncate">
                                    <span className="truncate">{member.username}</span> 
                                    {isMe && <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded uppercase font-semibold border border-blue-500/20 shrink-0">You</span>}
                                </h3>
                                
                                <div className="mt-3 space-y-1.5">
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                        <Mail className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate text-xs">{member.email}</span>
                                    </div>
                                    {member.githubUsername && (
                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                            <Github className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate text-xs">{member.githubUsername}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions Overlay */}
                            {!isMe && (
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 py-3 px-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 flex justify-center">
                                    <button 
                                        onClick={() => handleCallUser(member)}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                                    >
                                        <PhoneCall className="w-4 h-4" />
                                        Start Video Call
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {members.length === 0 && (
                <div className="flex flex-col items-center justify-center p-16 text-slate-500">
                    <UserMinus className="w-12 h-12 mb-4 opacity-50" />
                    <p>No collaborators found in this workspace.</p>
                </div>
            )}
        </div>
    );
};

export default TeamDirectory;
