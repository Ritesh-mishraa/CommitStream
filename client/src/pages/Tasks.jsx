import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { 
    DndContext, closestCorners, KeyboardSensor, PointerSensor, 
    useSensor, useSensors, DragOverlay 
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from '../components/kanban/KanbanColumn';
import { KanbanCard } from '../components/kanban/KanbanCard';
import { Folder, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000/api';

const COLUMNS = [
    { id: 'TODO', title: 'To Do', color: 'border-t-slate-500' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-t-blue-500' },
    { id: 'IN_REVIEW', title: 'Review', color: 'border-t-amber-500' },
    { id: 'DONE', title: 'Done', color: 'border-t-emerald-500' },
];

const Tasks = () => {
    const { user, token } = useAuth();
    const { activeProject } = useProject();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [modalColId, setModalColId] = useState('TODO');

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        if (!activeProject || !token) return;
        const fetchTasks = async () => {
            const res = await fetch(`${API_BASE}/tasks?projectId=${activeProject._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setTasks(await res.json());
        };
        fetchTasks();
    }, [activeProject, token]);

    const handleDragStart = (event) => setActiveId(event.active.id);

    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === 'Task';
        const isOverTask = over.data.current?.type === 'Task';
        const isOverColumn = over.data.current?.type === 'Column';

        if (!isActiveTask) return;

        setTasks((prev) => {
            const oldIndex = prev.findIndex((t) => t._id === activeId);
            const activeTask = prev[oldIndex];
            if (!activeTask) return prev; 

            if (isOverTask) {
                const newIndex = prev.findIndex((t) => t._id === overId);
                const overTask = prev[newIndex];
                if (!overTask) return prev;
                
                if (activeTask.status !== overTask.status) {
                    return prev.map(t => t._id === activeId ? { ...t, status: overTask.status } : t);
                }
                return arrayMove(prev, oldIndex, newIndex);
            }

            if (isOverColumn) {
                const newStatus = overId;
                if (activeTask.status !== newStatus) {
                    return prev.map(t => t._id === activeId ? { ...t, status: newStatus } : t);
                }
            }

            return prev;
        });
    };

    const handleDragEnd = async (event) => {
        setActiveId(null);
        const { active, over } = event;
        if (!over) return;

        const taskId = active.id;
        const activeTask = tasks.find(t => t._id === taskId);
        if (!activeTask) return;

        let newStatus = activeTask.status;

        // If dropped over a column
        if (over.data.current?.type === 'Column') newStatus = over.id;
        // If dropped over another task
        if (over.data.current?.type === 'Task') {
            const overTask = tasks.find(t => t._id === over.id);
            if (overTask) newStatus = overTask.status;
        }

        if (newStatus === 'IN_REVIEW' && activeTask.branchLink) {
            // THE TWIST
            if (window.confirm(`Task moved to Review!\nWould you like to run the Conflict Predictor on branch '${activeTask.branchLink}' before merging?`)) {
                // Short timeout to allow CSS dragging to finish cleanly
                setTimeout(() => navigate('/conflicts', { state: { branch: activeTask.branchLink } }), 100);
            }
        }

        try {
            await fetch(`${API_BASE}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (e) {
            console.error('Failed to update status', e);
        }
    };

    const openCreateTask = (colId) => {
        setEditingTask(null);
        setModalColId(colId);
        setIsTaskModalOpen(true);
    };

    const openEditTask = (task) => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
    };

    if (!activeProject) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-slate-500 border border-slate-200 dark:border-slate-800 border-dashed rounded-lg bg-white dark:bg-slate-900/20">
                <Folder className="w-12 h-12 mb-4 opacity-50" />
                <p>Select a project from the topbar to view Tasks.</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-4 shrink-0">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Tasks Board</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Manage tasks and track branch progress for {activeProject.name}.</p>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex gap-6 h-full pb-4">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        {COLUMNS.map(col => (
                            <KanbanColumn 
                                key={col.id} 
                                column={col} 
                                tasks={tasks.filter(t => t.status === col.id)} 
                                onAddTask={openCreateTask}
                                onEditTask={openEditTask}
                            />
                        ))}
                        
                        <DragOverlay>
                            {activeId ? <KanbanCard task={tasks.find(t => t._id === activeId)} onEdit={() => {}} /> : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>

            {isTaskModalOpen && (
                <TaskModal 
                    isOpen={isTaskModalOpen} 
                    onClose={() => setIsTaskModalOpen(false)} 
                    editingTask={editingTask} 
                    projectId={activeProject._id} 
                    colId={modalColId}
                    setTasks={setTasks}
                    token={token}
                    collaborators={activeProject?.members || []}
                    user={user}
                />
            )}
        </div>
    );
};

const TaskModal = ({ isOpen, onClose, editingTask, projectId, colId, setTasks, token, collaborators, user }) => {
    const [title, setTitle] = useState(editingTask?.title || '');
    const [description, setDescription] = useState(editingTask?.description || '');
    const [assignee, setAssignee] = useState(editingTask?.assignee || user?.username);
    const [priority, setPriority] = useState(editingTask?.priority || 'MEDIUM');
    const [branchLink, setBranchLink] = useState(editingTask?.branchLink || '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTask) {
                const res = await fetch(`${API_BASE}/tasks/${editingTask._id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ title, description, assignee, priority, branchLink })
                });
                if (res.ok) {
                    const updated = await res.json();
                    setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
                }
            } else {
                const res = await fetch(`${API_BASE}/tasks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ title, description, assignee, priority, branchLink, status: colId, projectId })
                });
                if (res.ok) {
                    const created = await res.json();
                    setTasks(prev => [...prev, created]);
                }
            }
            onClose();
        } catch (error) {
            console.error('Failed to save task', error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this task?")) return;
        try {
            await fetch(`${API_BASE}/tasks/${editingTask._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTasks(prev => prev.filter(t => t._id !== editingTask._id));
            onClose();
        } catch (error) {
            console.error('Failed to delete', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        {editingTask ? 'Edit Task' : 'New Task'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Title</label>
                        <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none text-slate-800 dark:text-slate-200" />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none text-slate-800 dark:text-slate-200 resize-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Assignee (Email or Username)</label>
                            <input 
                                type="text" 
                                list="assignee-list"
                                required
                                placeholder="Enter external email..."
                                value={assignee} 
                                onChange={e => setAssignee(e.target.value)} 
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none text-slate-800 dark:text-slate-200"
                            />
                            <datalist id="assignee-list">
                                <option value={user?.username} />
                                <option value={user?.email} />
                                {collaborators.map(c => c.username !== user?.username && (
                                    <React.Fragment key={c._id}>
                                        <option value={c.email} />
                                        <option value={c.username} />
                                    </React.Fragment>
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Priority</label>
                            <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none text-slate-800 dark:text-slate-200 appearance-none">
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">GitHub Branch Link (Optional)</label>
                        <input type="text" placeholder="e.g., feature/authentication" value={branchLink} onChange={e => setBranchLink(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none text-slate-800 dark:text-slate-200 font-mono" />
                    </div>

                    <div className="flex justify-between pt-4">
                        {editingTask ? (
                            <button type="button" onClick={handleDelete} className="text-red-500 text-sm font-medium hover:underline px-2">Delete Task</button>
                        ) : <div></div>}
                        
                        <div className="flex gap-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">Cancel</button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md shadow-sm">Save Task</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Tasks;
