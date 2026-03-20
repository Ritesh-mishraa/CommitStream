import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GitBranch, Edit2 } from 'lucide-react';

export const KanbanCard = ({ task, onEdit }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task._id,
        data: {
            type: 'Task',
            task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-white/50 dark:bg-slate-800/50 border-2 border-blue-500/50 border-dashed rounded-lg h-28 opacity-50 mb-2"
            />
        );
    }

    const priorityColors = {
        LOW: 'text-slate-500 bg-slate-100 dark:bg-slate-800',
        MEDIUM: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10',
        HIGH: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10',
        CRITICAL: 'text-red-500 bg-red-100 dark:bg-red-500/20 font-bold animate-pulse'
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700/50 mb-2 hover:border-blue-400 dark:hover:border-blue-500/50 transition-colors group cursor-grab active:cursor-grabbing relative"
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${priorityColors[task.priority]}`}>
                    {task.priority}
                </span>
                
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-500 transition-all p-1"
                >
                    <Edit2 className="w-3 h-3" />
                </button>
            </div>

            <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 leading-tight">
                {task.title}
            </h4>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                {task.description || 'No description provided.'}
            </p>

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-1.5 max-w-[60%]">
                    {task.branchLink && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded truncate" title={task.branchLink}>
                            <GitBranch className="w-3 h-3 shrink-0" />
                            <span className="truncate">{task.branchLink}</span>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-slate-500 font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        @{task.assignee}
                    </span>
                </div>
            </div>
        </div>
    );
};
