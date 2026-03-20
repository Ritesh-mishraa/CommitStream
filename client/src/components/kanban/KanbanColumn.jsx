import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { KanbanCard } from './KanbanCard';
import { Plus } from 'lucide-react';

export const KanbanColumn = ({ column, tasks, onAddTask, onEditTask }) => {
    const { setNodeRef } = useDroppable({
        id: column.id,
        data: {
            type: 'Column',
            column,
        },
    });

    const taskIds = tasks.map(t => t._id);

    return (
        <div className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col rounded-xl w-[320px] shrink-0 h-full max-h-full overflow-hidden">
            {/* Column Header */}
            <div className={`p-3 border-b-2 flex items-center justify-between bg-white dark:bg-slate-800/80 ${column.color}`}>
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200">{column.title}</h3>
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full font-medium">
                        {tasks.length}
                    </span>
                </div>
                <button 
                    onClick={() => onAddTask(column.id)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Droppable Area */}
            <div ref={setNodeRef} className="flex-1 overflow-y-auto p-2 min-h-[150px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    {tasks.map(task => (
                        <KanbanCard key={task._id} task={task} onEdit={onEditTask} />
                    ))}
                </SortableContext>
                
                {tasks.length === 0 && (
                    <div className="h-full flex items-center justify-center p-4">
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg w-full py-8 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
                            Drop tasks here
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
