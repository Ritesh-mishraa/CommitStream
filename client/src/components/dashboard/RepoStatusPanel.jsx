import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { GitBranch, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const RepoStatusPanel = ({ project, stats, setActiveProject }) => {
    const { user, token } = useAuth();
    const [status, setStatus] = useState(project?.status || 'Active');
    const [isUpdating, setIsUpdating] = useState(false);
    const isOwner = project?.owner?._id === (user?._id || user?.id);

    const handleStatusChange = async (newStatus) => {
        setStatus(newStatus);
        setIsUpdating(true);
        try {
            const res = await fetch(`${API_BASE}/projects/${project._id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok && setActiveProject) {
                const updatedProject = await res.json();
                setActiveProject(updatedProject);
            }
        } catch (error) {
            console.error('Failed to update project status', error);
        } finally {
            setIsUpdating(false);
        }
    };
    return (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-5 h-full flex flex-col justify-between">
            <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-slate-500" /> Repository Log
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Active Branches</span>
                        <span className="text-slate-800 dark:text-slate-200 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {stats ? stats.activeBranches : '-'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Open PRs</span>
                        <span className="text-slate-800 dark:text-slate-200 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {stats ? stats.openPRs : '-'}
                        </span>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800 w-full my-4"></div>

                    <div className="space-y-3">
                        <div className="text-xs text-slate-500 font-medium">Recent Commits</div>
                        {stats && stats.recentCommits && stats.recentCommits.length > 0 ? (
                            <div className="space-y-3">
                                {stats.recentCommits.slice(0, 4).map((commit, index) => (
                                    <div key={commit.hash || index} className="group relative">
                                        {/* Connector line for all but the last item */}
                                        {index !== Math.min(stats.recentCommits.length, 4) - 1 && (
                                            <div className="absolute left-1.5 top-5 bottom-[-12px] w-px bg-slate-200 dark:bg-slate-800" />
                                        )}
                                        
                                        <div className="flex gap-3 relative z-10">
                                            {/* Timeline dot */}
                                            <div className="mt-1">
                                                <div className="w-3 h-3 rounded-full bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500 shadow-sm" />
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">
                                                        {commit.message}
                                                    </div>
                                                    <span className="text-xs font-mono text-blue-500 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded flex-shrink-0">
                                                        {commit.hash}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                                                    <span className="font-medium">@{commit.author}</span>
                                                    <span>•</span>
                                                    <Clock className="w-3 h-3" />
                                                    <span>{formatDistanceToNow(new Date(commit.time), { addSuffix: true })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md border border-dashed border-slate-200 dark:border-slate-700">
                                <AlertCircle className="w-4 h-4 text-amber-500" /> 
                                <span>No commits found in repository</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Project Status Updater */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Project Status</span>
                <div className="relative">
                    {isUpdating && <Loader2 className="w-3 h-3 animate-spin absolute right-8 top-1/2 -translate-y-1/2 text-slate-500" />}
                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={isUpdating || !isOwner}
                        className={`appearance-none bg-slate-50 dark:bg-slate-950 border text-xs rounded-md pl-3 pr-8 py-1.5 focus:outline-none transition-colors 
                            ${isOwner ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}
                            ${status === 'Active' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : ''}
                            ${status === 'Planning' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5' : ''}
                            ${status === 'Completed' ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' : ''}
                            ${status === 'Archived' ? 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800' : ''}
                        `}
                    >
                        <option value="Planning">Planning</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="Archived">Archived</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default RepoStatusPanel;
