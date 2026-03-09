import { CheckCircle2, CircleDashed, Play } from 'lucide-react';

const ActiveTasksBoard = () => {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-sm font-medium text-zinc-300">Active Board</h3>
                <span className="text-xs text-zinc-500">Sprint 14</span>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-zinc-800 text-zinc-500">
                            <th className="px-4 py-3 font-normal">Task</th>
                            <th className="px-4 py-3 font-normal">Assignee</th>
                            <th className="px-4 py-3 font-normal">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                        <tr className="hover:bg-zinc-800/30 transition-colors">
                            <td className="px-4 py-3">Implement WebRTC signaling over Socket.io</td>
                            <td className="px-4 py-3"><span className="text-indigo-400 text-xs bg-indigo-500/10 px-2 py-1 rounded-full">@alice</span></td>
                            <td className="px-4 py-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                        </tr>
                        <tr className="hover:bg-zinc-800/30 transition-colors">
                            <td className="px-4 py-3">Build smart conflict predictor logic</td>
                            <td className="px-4 py-3"><span className="text-teal-400 text-xs bg-teal-500/10 px-2 py-1 rounded-full">@bob</span></td>
                            <td className="px-4 py-3"><Play className="w-4 h-4 text-indigo-400 fill-indigo-400/20" /></td>
                        </tr>
                        <tr className="hover:bg-zinc-800/30 transition-colors">
                            <td className="px-4 py-3">Dockerize PostgreSQL and Express</td>
                            <td className="px-4 py-3"><span className="text-zinc-400 text-xs bg-zinc-800 px-2 py-1 rounded-full">Unassigned</span></td>
                            <td className="px-4 py-3"><CircleDashed className="w-4 h-4 text-zinc-600" /></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ActiveTasksBoard;
