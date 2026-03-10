import { GitBranch, Clock, AlertCircle } from 'lucide-react';

const RepoStatusPanel = ({ project, stats }) => {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 h-full flex flex-col justify-between">
            <div>
                <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-zinc-500" /> Repository Log
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Active Branches</span>
                        <span className="text-zinc-200 font-mono bg-zinc-800 px-2 py-0.5 rounded">
                            {stats ? stats.activeBranches : '-'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">Open PRs</span>
                        <span className="text-zinc-200 font-mono bg-zinc-800 px-2 py-0.5 rounded">
                            {stats ? stats.openPRs : '-'}
                        </span>
                    </div>

                    <div className="h-px bg-zinc-800 w-full my-4"></div>

                    <div className="space-y-2">
                        <div className="text-xs text-zinc-500">Last Commit (main)</div>
                        {stats && stats.lastCommit ? (
                            <>
                                <div className="text-sm text-zinc-300 font-mono truncate">
                                    <span className="text-indigo-400 mr-2">{stats.lastCommit.hash}</span>
                                    {stats.lastCommit.message}
                                </div>
                                <div className="text-xs text-zinc-600 flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" /> {stats.lastCommit.time} by @{stats.lastCommit.author}
                                </div>
                            </>
                        ) : (
                            <div className="text-xs flex items-center gap-1 text-zinc-600">
                                <AlertCircle className="w-3 h-3" /> No commits found
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RepoStatusPanel;
