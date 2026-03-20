import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GitMerge, LayoutDashboard, ShieldCheck, MessageSquare, CheckSquare, BarChart3, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const actions = [
    {
        title: 'Project Kanban & Tasks',
        description: 'Track workflow progress and dispatch HTML priority emails.',
        icon: <CheckSquare className="w-5 h-5 text-blue-500" />,
        route: '/tasks',
        bgColor: 'bg-blue-50 dark:bg-blue-500/10',
        borderColor: 'border-blue-200 dark:border-blue-500/30'
    },
    {
        title: 'Predictor & Dual Editor',
        description: 'Simulate branch merges using AI intelligence safely.',
        icon: <GitMerge className="w-5 h-5 text-purple-500" />,
        route: '/conflicts',
        bgColor: 'bg-purple-50 dark:bg-purple-500/10',
        borderColor: 'border-purple-200 dark:border-purple-500/30'
    },
    {
        title: 'Security Audits',
        description: 'Scan branches for severe vulnerabilities natively.',
        icon: <ShieldCheck className="w-5 h-5 text-red-500" />,
        route: '/audits',
        bgColor: 'bg-red-50 dark:bg-red-500/10',
        borderColor: 'border-red-200 dark:border-red-500/30'
    },
    {
        title: 'Team Network Chat',
        description: 'Communicate globally via persistent sockets.',
        icon: <MessageSquare className="w-5 h-5 text-emerald-500" />,
        route: '/chat',
        bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
        borderColor: 'border-emerald-200 dark:border-emerald-500/30'
    },
    {
        title: 'Repository Insights',
        description: 'Visual SVG analytics mapping deep code metrics.',
        icon: <BarChart3 className="w-5 h-5 text-orange-500" />,
        route: '/insights',
        bgColor: 'bg-orange-50 dark:bg-orange-500/10',
        borderColor: 'border-orange-200 dark:border-orange-500/30'
    }
];

const QuickActionsPanel = ({ project }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm h-full font-sans flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-indigo-500" />
                        Quick Access Hub
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Engage powerful DevOps tools directly targeting {project?.name}.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {actions.map((action, idx) => (
                    <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(action.route)}
                        className={`text-left p-4 rounded-xl border ${action.borderColor} ${action.bgColor} hover:shadow-md transition-all flex flex-col justify-between group h-full`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2 bg-white dark:bg-slate-800/80 rounded-lg shadow-sm border border-white/50 dark:border-slate-700/50">
                                {action.icon}
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{action.title}</h4>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-tight">{action.description}</p>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default QuickActionsPanel;
