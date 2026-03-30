import { useState } from 'react';
import { Users, Github, User, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const TeamPulsePanel = ({ project, collaborators = [], setActiveProject }) => {
    const [activeTab, setActiveTab] = useState('team'); // 'team' or 'github'
    const { user, token } = useAuth();

    const isOwner = project?.owner?._id === (user?._id || user?.id);

    const handleRemoveMember = async (memberId) => {
        if (!confirm('Are you sure you want to remove this member from the workspace?')) return;

        try {
            const res = await fetch(`${API_BASE}/projects/${project._id}/members/${memberId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok && setActiveProject) {
                const updatedProject = await res.json();
                setActiveProject(updatedProject);
            }
        } catch (error) {
            console.error('Failed to remove member:', error);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-5 h-full overflow-hidden flex flex-col">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center justify-between shrink-0">
                <span className="flex items-center gap-2">
                    {activeTab === 'team' ? <Users className="w-4 h-4 text-slate-500" /> : <Github className="w-4 h-4 text-slate-500" />}
                    Team Roster
                </span>
                {(collaborators.length > 0 || project?.members?.length > 0) && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
            </h3>

            <div className="flex bg-slate-50 dark:bg-slate-950/50 rounded-lg p-1 mb-4 shrink-0">
                <button
                    onClick={() => setActiveTab('team')}
                    className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${activeTab === 'team' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}
                >
                    Workspace
                </button>
                <button
                    onClick={() => setActiveTab('github')}
                    className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${activeTab === 'github' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-300'}`}
                >
                    GitHub
                </button>
            </div>

            <div className="space-y-4 overflow-auto flex-1 pr-2">
                {activeTab === 'team' ? (
                    // Workspace Members View
                    (() => {
                        const uniqueMembers = project?.members?.filter((v, i, a) => a.findIndex(t => t._id === v._id) === i) || [];
                        return uniqueMembers.length === 0 ? (
                            <div className="text-sm text-slate-500 text-center py-4">No team members yet</div>
                        ) : (
                            uniqueMembers.map(member => (
                                <div key={member._id} className="flex items-start gap-3 group">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mt-1 shrink-0 text-slate-900 dark:text-slate-100"
                                        style={{ backgroundColor: member.avatarColor || '#6366f1' }}
                                    >
                                        {member.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate pr-2">{member.username}</div>
                                            {project.owner?._id === member._id ? (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Owner</span>
                                            ) : isOwner ? (
                                                <button
                                                    onClick={() => handleRemoveMember(member._id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                                                    title="Remove User"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            ) : null}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                            <User className="w-3 h-3" /> Workspace Member
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                    })()
                ) : (
                    // GitHub Collaborators View
                    collaborators.length === 0 ? (
                        <div className="text-sm text-slate-500 text-center py-4">No GitHub contributors found</div>
                    ) : (
                        collaborators.map(member => (
                            <div key={member.id} className="flex items-start gap-3 group">
                                {member.avatar_url ? (
                                    <img src={member.avatar_url} alt={member.username} className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700/50 mt-1 shadow-sm shrink-0" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm font-medium border border-blue-500/20 mt-1 shrink-0">
                                        {member.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate pr-2">{member.username}</div>
                                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                        <Github className="w-3 h-3" /> {member.contributions} commits
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    );
};

export default TeamPulsePanel;
