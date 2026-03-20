import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GitBranch, GitMerge, FileCode2, Users, ArrowRight, BookOpen, X, CheckCircle2, Zap, Target, Video, CheckSquare, Github, LayoutDashboard, KeyRound, ShieldCheck, Activity } from 'lucide-react';

const UserGuideModal = ({ isOpen, onClose, navigate }) => {
    const [showDetailedGuide, setShowDetailedGuide] = useState(false);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col font-sans"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">CommitStream User Guide</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Everything you need to master your merge workflow.</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-12">
                        
                        {/* Section: Why CommitStream */}
                        <section>
                            <h3 className="text-sm font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase mb-6 flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Why use CommitStream?
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-5 rounded-2xl">
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                                        <X className="w-4 h-4 text-red-500" /> The Old Way
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Blindly running <code className="bg-white dark:bg-slate-950 px-1 py-0.5 rounded text-red-500 text-xs font-mono">git merge</code> leads to unexpected deep conflicts, broken builds, and hours wasted manually digging through collision markers `<span className="text-slate-400">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</span>` in your terminal.
                                    </p>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-5 rounded-2xl">
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> The CommitStream Way
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Predict collisions safely in an isolated environment <i>before</i> merging. Use Artificial Intelligence to intelligently resolve standard code overlaps, or use our interactive visual dual-pane editor for manual surgical fixes.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Section: Comprehensive Platform Guide */}
                        <section>
                            <h3 className="text-sm font-bold tracking-wider text-purple-600 dark:text-purple-400 uppercase mb-6 flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                Comprehensive Platform Guide
                            </h3>
                            
                            <div className="space-y-6">
                                {/* Getting Started */}
                                <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800/50 p-5 rounded-2xl">
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                                        <KeyRound className="w-4 h-4 text-blue-500" /> Ground Zero: Getting Started
                                    </h4>
                                    <ul className="space-y-4">
                                        <li className="flex gap-3">
                                            <div className="mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div></div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">Secure Sign Up & Profile Onboarding</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Start by clicking "Start for free" or "Get Started". After a secure authentication, you'll land on an immersive Onboarding page to build out your professional profile, assign your role (Student/Professional), and sync avatar data.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div></div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">Centralized Workspace Dashboard</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Once inside, the Dashboard acts as your central command hub. Instantly view your organization's recent repository statuses, Team Pulse, and active project environments in one clean layout.</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                {/* GitHub & Merging */}
                                <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800/50 p-5 rounded-2xl">
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                                        <GitMerge className="w-4 h-4 text-purple-500" /> Git & Code Management
                                    </h4>
                                    <ul className="space-y-4">
                                        <li className="flex gap-3">
                                            <div className="mt-0.5"><Github className="w-3.5 h-3.5 text-slate-500 mt-0.5" /></div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">Seamless GitHub Integrations</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Link your workspace directly to active GitHub repositories. Access live-branch analysis, view detailed branch histories, and manage repository collaborators seamlessly without ever leaving CommitStream.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-0.5"><Zap className="w-3.5 h-3.5 text-purple-500 mt-0.5" /></div>
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">Smart Prediction Engine</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Navigate to the Conflict Predictor dashboard, select any two active branches, and let our isolated engine simulate the exact merge outcomes. If code overlaps, use AI to intelligently autoscale the resolution or open our native VS-Code-style dual editor to inject manual fixes before automatically pushing the clean commit.</p>
                                                
                                                <button 
                                                    onClick={() => setShowDetailedGuide(!showDetailedGuide)} 
                                                    className="mt-3 py-1.5 px-3 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-xs flex items-center gap-1 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 font-medium hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors focus:outline-none"
                                                >
                                                    {showDetailedGuide ? "Hide Detailed Guide" : "Show Step-by-Step Guide"}
                                                </button>

                                                {showDetailedGuide && (
                                                    <div className="mt-4 p-5 bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-500/30 rounded-2xl shadow-sm">
                                                        <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-4">Conflict Predictor Workflow</h5>
                                                        <div className="space-y-4">
                                                            <div className="flex gap-3">
                                                                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                                                                <p className="text-xs text-slate-600 dark:text-slate-400"><strong>Select Branches:</strong> Open the Conflict Predictor and select a Base branch and a Target branch from your linked GitHub repository.</p>
                                                            </div>
                                                            <div className="flex gap-3">
                                                                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                                                                <p className="text-xs text-slate-600 dark:text-slate-400"><strong>Run Prediction Engine:</strong> Click 'Predict' to simulate a merge. The engine will instantly flag deep code collisions and lockfile conflicts.</p>
                                                            </div>
                                                            <div className="flex gap-3">
                                                                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                                                                <p className="text-xs text-slate-600 dark:text-slate-400"><strong>Resolve with AI:</strong> Use 'Resolve AI' on any flagged file to let Gemini scan the logic context and automatically rewrite the merged code block safely.</p>
                                                            </div>
                                                            <div className="flex gap-3">
                                                                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                                                                <p className="text-xs text-slate-600 dark:text-slate-400"><strong>Manual Override:</strong> Alternatively, click 'Manual Edit' to launch the dual-pane visual editor and visually accept incoming or base changes.</p>
                                                            </div>
                                                            <div className="flex gap-3">
                                                                <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[10px] font-bold shrink-0">5</span>
                                                                <p className="text-xs text-slate-600 dark:text-slate-400"><strong>Commit & Push:</strong> Click 'Commit & Push Resolution' to automatically write the unified history back to your repository!</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                {/* Team Tools */}
                                <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800/50 p-5 rounded-2xl">
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                                        <Users className="w-4 h-4 text-emerald-500" /> Built-in Team Tools
                                    </h4>
                                    <ul className="space-y-4">
                                        <li className="flex gap-3">
                                            <div className="mt-0.5"><Video className="w-3.5 h-3.5 text-emerald-500 mt-0.5" /></div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">Live Video Conferencing (WebRTC)</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Huddle rooms built natively into the platform for face-to-face pair programming and architecture planning.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-0.5"><Users className="w-3.5 h-3.5 text-emerald-500 mt-0.5" /></div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">Real-Time Unified Chat</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Instantly communicate with any collaborator active in your repository by pinging the persistent Team Chat environment powered by WebSocket architectures.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-0.5"><CheckSquare className="w-3.5 h-3.5 text-blue-400 mt-0.5" /></div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">Interactive Kanban & Email Dispatch</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Define Tasks, drag-and-drop priorities, and freely assign GitHub developers using native email integrations. HTML alerts are dispatched natively on creation!</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                {/* AI & Telemetry */}
                                <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800/50 p-5 rounded-2xl">
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                                        <LayoutDashboard className="w-4 h-4 text-orange-500" /> Advanced Telemetry & Security
                                    </h4>
                                    <ul className="space-y-4">
                                        <li className="flex gap-3">
                                            <div className="mt-0.5"><ShieldCheck className="w-3.5 h-3.5 text-orange-500 mt-0.5" /></div>
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">AI Code Reviews & Security Audits</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Select any active branch to trigger a comprehensive static analysis. The Gemini-powered AI engine maps vulnerabilities, detects severe logic flaws, and suggests code optimizations natively highlighting exact filenames.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-0.5"><Activity className="w-3.5 h-3.5 text-blue-500 mt-0.5" /></div>
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">Repository Insights Dashboard</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Measure the health of your agile workflows via Recharts-powered interactive analytics. Unpack Task priority heatmaps, weekly merge trends, and workload distribution metrics instantly.</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center sm:flex-row flex-col gap-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Ready to merge without fear?</p>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button 
                                onClick={onClose}
                                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => { onClose(); navigate('/auth'); }}
                                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-500/20 transition-colors flex items-center justify-center gap-2"
                            >
                                Get Started Now <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
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
