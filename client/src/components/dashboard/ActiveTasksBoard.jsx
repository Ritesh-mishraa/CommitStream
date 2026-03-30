import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, CircleDashed, Play, Plus, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const ActiveTasksBoard = ({ project, tasks = [], setTasks }) => {
    const { user, token } = useAuth();
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [assignee, setAssignee] = useState('');

    const isOwner = project?.owner?._id === (user?._id || user?.id);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            const res = await fetch(`${API_BASE}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    projectId: project._id,
                    assignee: assignee.trim() || undefined,
                    status: 'TODO'
                })
            });

            if (res.ok) {
                const newTask = await res.json();
                if (setTasks) setTasks(prev => [newTask, ...prev]);
                setTitle('');
                setAssignee('');
                setIsCreating(false);
            }
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            const res = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                const updatedTask = await res.json();
                if (setTasks) {
                    setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
                }
            }
        } catch (error) {
            console.error('Failed to update task status:', error);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900/80 shrink-0">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Active Board</h3>
                {!isCreating && (
                    <button onClick={() => setIsCreating(true)} className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-md transition-colors">
                        <Plus className="w-3 h-3" /> New Task
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <form onSubmit={handleCreateTask} className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Task title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
                                autoFocus
                                required
                            />
                            <select
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                                className="w-40 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 appearance-none"
                            >
                                <option value="">Unassigned</option>
                                {project?.members?.map(member => (
                                    <option key={member._id} value={member.username}>
                                        @{member.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 mt-1">
                            <button type="button" onClick={() => setIsCreating(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-300 px-3 py-1 text-sm font-medium">
                                Cancel
                            </button>
                            <button type="submit" className="bg-blue-600 text-slate-900 dark:text-slate-100 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-500 transition-colors">
                                Add Task
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="flex-1 overflow-auto overflow-x-hidden">
                {tasks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <CircleDashed className="w-8 h-8 mb-3 opacity-20" />
                        <p className="text-sm">No active tasks in this project.</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm table-fixed">
                        <thead className="sticky top-0 bg-white dark:bg-slate-900/60 backdrop-blur-md z-10">
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                <th className="px-4 py-3 font-medium w-6/12">Task</th>
                                <th className="px-4 py-3 font-medium w-3/12">Assignee</th>
                                <th className="px-4 py-3 font-medium w-3/12 pr-6 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-slate-700 dark:text-slate-300">
                            {tasks.map(task => {
                                const canEdit = isOwner || task.assignee === user?.username;
                                return (
                                    <tr key={task._id} className="hover:bg-slate-100 dark:bg-slate-800/30 transition-colors group">
                                        <td className="px-4 py-3 truncate">{task.title}</td>
                                        <td className="px-4 py-3 truncate">
                                            <span className={`text-xs px-2 py-1 rounded-full ${task.assignee === 'Unassigned'
                                                ? 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                                                : 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                                                }`}>
                                                @{task.assignee}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 pr-6 text-right">
                                            <select
                                                value={task.status}
                                                onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                                                disabled={!canEdit}
                                                className={`appearance-none bg-slate-50 dark:bg-slate-950/50 outline-none cursor-pointer text-[10px] font-bold tracking-wide px-2 py-1 rounded border transition-colors text-center w-24
                                                ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}
                                                ${task.status === 'DONE' ? 'text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10' : ''}
                                                ${task.status === 'IN_PROGRESS' ? 'text-blue-400 border-blue-500/20 hover:bg-blue-500/10' : ''}
                                                ${task.status === 'TODO' ? 'text-slate-500 border-slate-300 dark:border-slate-700/50 hover:bg-slate-100 dark:bg-slate-800' : ''}
                                            `}
                                            >
                                                <option value="TODO" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">TODO</option>
                                                <option value="IN_PROGRESS" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">IN PROG</option>
                                                <option value="DONE" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">DONE</option>
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ActiveTasksBoard;
