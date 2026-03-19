import { useState, useEffect } from 'react';
import { X, GitCommit, FileCode2, Clock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000/api';

const BranchDetailsModal = ({ isOpen, onClose, project, branchName }) => {
    const { token } = useAuth();
    const [commits, setCommits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !project || !branchName) return;

        const fetchCommits = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${API_BASE}/branches/commits?projectId=${project._id}&branch=${encodeURIComponent(branchName)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setCommits(data);
                }
            } catch (err) {
                console.error("Failed to fetch branch commits", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCommits();
    }, [isOpen, project, branchName, token]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <GitCommit className="w-5 h-5 text-blue-400" />
                            History for <code className="text-sm bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded text-blue-300">{branchName}</code>
                        </h2>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Recent modifications and authors</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                            <div className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-blue-500 animate-spin"></div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Loading commit history...</p>
                        </div>
                    ) : commits.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 text-sm">
                            <GitCommit className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            No commits found for this branch.
                        </div>
                    ) : (
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                            {commits.map((commit, idx) => (
                                <div key={commit.sha} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    {/* Icon */}
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-sm">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    </div>
                                    {/* Content */}
                                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-4 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {commit.avatarUrl ? (
                                                    <img src={commit.avatarUrl} alt="avatar" className="w-6 h-6 rounded-full" />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                        <UserIcon className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                                                    </div>
                                                )}
                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{commit.authorName}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(commit.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-800 dark:text-slate-200 mb-2 whitespace-pre-wrap">{commit.message}</p>

                                        {/* Modifed Files */}
                                        {commit.files && commit.files.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
                                                <div className="text-[10px] uppercase text-slate-500 tracking-wider mb-2 font-semibold">Modified Files</div>
                                                {commit.files.map(f => (
                                                    <div key={f.filename} className="text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 pb-1 pt-1 px-2 rounded font-mono truncate">
                                                        <FileCode2 className={`shrink-0 w-3 h-3 ${f.status === 'added' ? 'text-emerald-400' : f.status === 'removed' ? 'text-red-400' : 'text-blue-400'}`} />
                                                        <span className="truncate">{f.filename}</span>
                                                        <span className="ml-auto flex gap-2 text-[10px]">
                                                            {f.additions > 0 && <span className="text-emerald-400">+{f.additions}</span>}
                                                            {f.deletions > 0 && <span className="text-red-400">-{f.deletions}</span>}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BranchDetailsModal;
