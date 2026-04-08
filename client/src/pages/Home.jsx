import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GitBranch, GitMerge, FileCode2, Users, ArrowRight, BookOpen, X, CheckCircle2, Zap, Target, Video, CheckSquare, Github, LayoutDashboard, KeyRound, ShieldCheck, Activity } from 'lucide-react';
import SEO from '../components/SEO';

const UserGuideModal = ({ isOpen, onClose, navigate }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md"
                onClick={onClose}
            >
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col font-sans"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
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
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-900/50">
                        
                        {/* 0. Authentication */}
                        <section>
                            <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4 flex items-center gap-2">
                                <KeyRound className="w-3.5 h-3.5" /> Getting Started
                            </h3>
                            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden shadow-sm p-5 flex gap-4 items-start">
                                <div className="mt-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
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
                            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-sm relative overflow-hidden pl-5 pr-5 py-5">
                                {/* Vertical Line */}
                                <div className="absolute left-[39px] top-8 bottom-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                                
                                <div className="relative z-10 flex gap-4 items-start mb-6">
                                    <div className="bg-blue-100 dark:bg-blue-500/20 ring-4 ring-white dark:ring-slate-800 text-blue-600 dark:text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</div>
                                    <div className="pt-1.5">
                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Select Branches</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Navigate to the Predictor tab. Pick a <strong>Base branch</strong> and a <strong>Target branch</strong> from your mapped repository.</p>
                                    </div>
                                </div>
                                <div className="relative z-10 flex gap-4 items-start mb-6">
                                    <div className="bg-blue-100 dark:bg-blue-500/20 ring-4 ring-white dark:ring-slate-800 text-blue-600 dark:text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</div>
                                    <div className="pt-1.5">
                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Run AI Predictor</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Click "Predict". The isolated engine simulates a merge and instantly highlights deep file collisions and lockfile errors safely without touching your code.</p>
                                    </div>
                                </div>
                                <div className="relative z-10 flex gap-4 items-start mb-6">
                                    <div className="bg-blue-100 dark:bg-blue-500/20 ring-4 ring-white dark:ring-slate-800 text-blue-600 dark:text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</div>
                                    <div className="pt-1.5">
                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Resolve visually or with AI</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                            For each flagged file, click <span className="font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">Resolve AI</span> to let Gemini instantly generate safe, context-aware merged code. Or click <span className="font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">Manual Edit</span> to visually merge base and incoming changes in our dual-pane Monaco editor.
                                        </p>
                                    </div>
                                </div>
                                <div className="relative z-10 flex gap-4 items-start">
                                    <div className="bg-emerald-100 dark:bg-emerald-500/20 ring-4 ring-white dark:ring-slate-800 text-emerald-600 dark:text-emerald-400 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
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
                                <div className="p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl hover:border-slate-300 transition-colors shadow-sm">
                                    <CheckSquare className="w-4 h-4 text-emerald-500 mb-2" />
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Kanban Boards</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Drag-and-drop task tracking intimately synced with your project velocity.</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl hover:border-slate-300 transition-colors shadow-sm">
                                    <Activity className="w-4 h-4 text-purple-500 mb-2" />
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Repo Insights</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Interactive data visuals analyzing commit heatmaps and developer activity.</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl hover:border-slate-300 transition-colors shadow-sm">
                                    <ShieldCheck className="w-4 h-4 text-orange-500 mb-2" />
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">AI Code Reviews</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Let Gemini audit your entire branch for vulnerabilities before PRs.</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl hover:border-slate-300 transition-colors shadow-sm">
                                    <Users className="w-4 h-4 text-blue-500 mb-2" />
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
                            className="px-5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Close
                        </button>
                        <button 
                            onClick={() => { onClose(); navigate('/auth'); }}
                            className="px-5 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                        >
                            Open Dashboard <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const Home = () => {
    const navigate = useNavigate();
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const features = [
        {
            icon: <GitMerge className="w-6 h-6 text-blue-400 dark:text-blue-500" />,
            title: "Smart Merge Predictors",
            description: "Automatically detect, interpret, and resolve potential merge conflicts using AI before they bottleneck integrations."
        },
        {
            icon: <LayoutDashboard className="w-6 h-6 text-emerald-400 dark:text-emerald-500" />,
            title: "Advanced DevOps Telemetry",
            description: "Scale with native Kanban grids tracking priority flows backed seamlessly by SVG rendered analytic dashboards."
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-purple-400 dark:text-purple-500" />,
            title: "Automated Security Audits",
            description: "Inject Static Analysis scans safely mapping active branch vulnerabilities through precise LLM parsing tools."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans overflow-x-hidden transition-colors selection:bg-blue-500/30">
            <SEO 
                title="Home"
                description="CommitStream: The ultimate collaboration hub that predicts, manages, and resolves GitHub merge conflicts before they turn into blockers."
                keywords="merge conflict, kanban, project management, team collaboration, predict merge conflicts, devops, git workflow"
            />
            
            <UserGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} navigate={navigate} />

            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 dark:bg-blue-600/20 blur-[120px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-emerald-600/10 dark:bg-emerald-600/20 blur-[120px]" />
                <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-purple-600/10 dark:bg-purple-600/20 blur-[120px]" />
            </div>

            <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-6 z-10">
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="max-w-4xl mx-auto text-center"
                >
                    <motion.div 
                        variants={fadeIn}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 shadow-sm mb-8"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse"></span>
                        <span className="text-sm font-medium">CommitStream v1.0 is live</span>
                    </motion.div>

                    <motion.h1 
                        variants={fadeIn}
                        className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white tracking-tight mb-8"
                    >
                        Master your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400">Git workflow</span><br />
                        without the chaos
                    </motion.h1>

                    <motion.p 
                        variants={fadeIn}
                        className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        The ultimate collaboration hub that predicts, manages, and resolves merge conflicts before they turn into blockers. Built for modern engineering teams.
                    </motion.p>

                    <motion.div 
                        variants={fadeIn}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button 
                            onClick={() => navigate('/auth')}
                            className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group"
                        >
                            Start for free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        
                        {/* New User Guide Button */}
                        <button 
                            onClick={() => setIsGuideOpen(true)}
                            className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 font-medium transition-all flex items-center justify-center gap-2"
                        >
                            <BookOpen className="w-5 h-5" />
                            How it Works
                        </button>

                        <button 
                            onClick={() => navigate('/about')}
                            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-all border border-slate-300 dark:border-slate-700"
                        >
                            Learn more
                        </button>
                    </motion.div>
                </motion.div>

                {/* Features Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7 }}
                    className="mt-32 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
                >
                    {features.map((feature, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors group shadow-sm hover:shadow-md">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-700/50 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">{feature.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </motion.div>
            </main>
        </div>
    );
};

export default Home;
