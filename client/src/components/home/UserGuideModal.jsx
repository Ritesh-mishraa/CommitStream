import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, KeyRound, Github, Target, CheckCircle2, Zap, CheckSquare, Activity, ShieldCheck, Users, ArrowRight } from 'lucide-react';

const UserGuideModal = ({ isOpen, onClose, navigate }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col font-sans"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                <BookOpen className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Quick Guide</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Master CommitStream in minutes.</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-900">
                        
                        {/* 0. Authentication */}
                        <section>
                            <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4 flex items-center gap-2">
                                <KeyRound className="w-3.5 h-3.5" /> Getting Started
                            </h3>
                            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm p-5 flex gap-4 items-start">
                                <div className="mt-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                                    <Github className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">One-Click GitHub Authentication</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                        No separate accounts or passwords required. Simply click <strong>"Start for free"</strong> and authorize via GitHub. Your profile, repositories, and avatar will natively sync. New users will be taken through a fast onboarding flow to set their role.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 1. Conflict Predictor Workflow */}
                        <section>
                            <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4 flex items-center gap-2">
                                <Target className="w-3.5 h-3.5" /> Conflict Predictor (Detailed)
                            </h3>
                            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm relative overflow-hidden pl-5 pr-5 py-5">
                                {/* Vertical Line */}
                                <div className="absolute left-[39px] top-8 bottom-8 w-px bg-slate-200 dark:bg-slate-800"></div>
                                
                                <div className="relative z-10 flex gap-4 items-start mb-6">
                                    <div className="bg-slate-100 dark:bg-slate-800 ring-4 ring-white dark:ring-slate-900 text-slate-700 dark:text-slate-300 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border border-slate-200 dark:border-slate-700">1</div>
                                    <div className="pt-1.5">
                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Select Branches</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Navigate to the Predictor tab. Pick a <strong>Base branch</strong> and a <strong>Target branch</strong> from your mapped repository.</p>
                                    </div>
                                </div>
                                <div className="relative z-10 flex gap-4 items-start mb-6">
                                    <div className="bg-slate-100 dark:bg-slate-800 ring-4 ring-white dark:ring-slate-900 text-slate-700 dark:text-slate-300 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border border-slate-200 dark:border-slate-700">2</div>
                                    <div className="pt-1.5">
                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Run AI Predictor</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Click "Predict". The isolated engine simulates a merge and instantly highlights deep file collisions and lockfile errors safely without touching your code.</p>
                                    </div>
                                </div>
                                <div className="relative z-10 flex gap-4 items-start mb-6">
                                    <div className="bg-slate-100 dark:bg-slate-800 ring-4 ring-white dark:ring-slate-900 text-slate-700 dark:text-slate-300 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border border-slate-200 dark:border-slate-700">3</div>
                                    <div className="pt-1.5">
                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Resolve visually or with AI</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                            For each flagged file, click <span className="font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1 py-0.5 rounded">Resolve AI</span> to let Gemini instantly generate safe, context-aware merged code. Or click <span className="font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1 py-0.5 rounded">Manual Edit</span> to visually merge base and incoming changes in our dual-pane Monaco editor.
                                        </p>
                                    </div>
                                </div>
                                <div className="relative z-10 flex gap-4 items-start">
                                    <div className="bg-slate-900 dark:bg-slate-100 ring-4 ring-white dark:ring-slate-900 text-white dark:text-slate-900 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <div className="pt-1.5">
                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Commit & Push</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Once resolved, click "Commit & Push Resolution". We automatically push the unified history back to GitHub.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Platform Modules */}
                        <section>
                            <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4 flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5" /> Workspace Modules
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm group">
                                    <CheckSquare className="w-4 h-4 text-slate-500 dark:text-slate-400 mb-2 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors" />
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Kanban Boards</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Drag-and-drop task tracking intimately synced with your project velocity.</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm group">
                                    <Activity className="w-4 h-4 text-slate-500 dark:text-slate-400 mb-2 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors" />
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Repo Insights</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Interactive data visuals analyzing commit heatmaps and developer activity.</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm group">
                                    <ShieldCheck className="w-4 h-4 text-slate-500 dark:text-slate-400 mb-2 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors" />
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">AI Code Reviews</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Let Gemini audit your entire branch for vulnerabilities before PRs.</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm group">
                                    <Users className="w-4 h-4 text-slate-500 dark:text-slate-400 mb-2 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors" />
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Live Workspaces</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Chat in real-time and join built-in video huddles within the app.</p>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex justify-end gap-3 shrink-0">
                        <button 
                            onClick={onClose}
                            className="px-5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                        >
                            Close
                        </button>
                        <button 
                            onClick={() => { onClose(); navigate('/auth'); }}
                            className="px-5 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                        >
                            Open Dashboard <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default UserGuideModal;
