import { motion } from 'framer-motion';
import { Github, LayoutDashboard, Target, GitMerge } from 'lucide-react';

const WorkflowSection = () => {
    return (
        <section className="w-full mt-32 relative overflow-hidden">
            {/* Dot-grid background */}
            <div
                className="absolute inset-0 z-0 opacity-30 dark:opacity-20"
                style={{
                    backgroundImage: `radial-gradient(circle, #94a3b8 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                }}
            />
            {/* Top & bottom fade masks */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-slate-50 to-transparent dark:from-slate-950 z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-50 to-transparent dark:from-slate-950 z-10 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className="relative z-20 max-w-5xl mx-auto w-full px-6 py-24"
            >
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400 mb-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Step by Step
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">How CommitStream Works</h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Seamlessly integrates with your existing tools to supercharge your development pipeline.</p>
                </div>

                <div className="relative">
                    {/* Connecting Line */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-slate-300 dark:bg-slate-700 -translate-y-1/2 z-0 opacity-50"></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                        {[
                            { step: "1", title: "Connect GitHub", desc: "Link your repositories with a single click.", icon: <Github className="w-5 h-5 text-slate-600 dark:text-slate-400" /> },
                            { step: "2", title: "Track Issues", desc: "Manage tasks in native Kanban boards.", icon: <LayoutDashboard className="w-5 h-5 text-slate-600 dark:text-slate-400" /> },
                            { step: "3", title: "Predict Conflicts", desc: "AI simulates merges to find breaking code.", icon: <Target className="w-5 h-5 text-slate-600 dark:text-slate-400" /> },
                            { step: "4", title: "Resolve & Merge", desc: "One-click safe resolution back to GitHub.", icon: <GitMerge className="w-5 h-5 text-slate-600 dark:text-slate-400" /> }
                        ].map((item, i) => (
                            <div key={i} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all text-center group">
                                <div className="w-12 h-12 mx-auto bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-800 relative group-hover:scale-110 transition-transform">
                                    {item.icon}
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900">{item.step}</div>
                                </div>
                                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{item.title}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default WorkflowSection;
