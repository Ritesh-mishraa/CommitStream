import { CheckCircle2, CircleDashed, Play, Plus } from 'lucide-react';

const ActiveTasksBoard = ({ project, tasks = [] }) => {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/80 shrink-0">
                <h3 className="text-sm font-medium text-zinc-300">Active Board</h3>
                <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded">Current Sprint</span>
            </div>

            <div className="flex-1 overflow-auto overflow-x-hidden">
                {tasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                        <CircleDashed className="w-8 h-8 mb-3 opacity-20" />
                        <p className="text-sm">No active tasks in this project.</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm table-fixed">
                        <thead className="sticky top-0 bg-zinc-900/95 backdrop-blur z-10">
                            <tr className="border-b border-zinc-800 text-zinc-500">
                                <th className="px-4 py-3 font-medium w-7/12">Task</th>
                                <th className="px-4 py-3 font-medium w-3/12">Assignee</th>
                                <th className="px-4 py-3 font-medium w-2/12 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                            {tasks.map(task => (
                                <tr key={task._id} className="hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-4 py-3 truncate">{task.title}</td>
                                    <td className="px-4 py-3 truncate">
                                        <span className={`text-xs px-2 py-1 rounded-full ${task.assignee === 'Unassigned'
                                                ? 'text-zinc-400 bg-zinc-800'
                                                : 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20'
                                            }`}>
                                            @{task.assignee}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {task.status === 'DONE' && <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />}
                                        {task.status === 'IN_PROGRESS' && <Play className="w-4 h-4 text-indigo-400 fill-indigo-400/20 mx-auto" />}
                                        {task.status === 'TODO' && <CircleDashed className="w-4 h-4 text-zinc-600 mx-auto" />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ActiveTasksBoard;
