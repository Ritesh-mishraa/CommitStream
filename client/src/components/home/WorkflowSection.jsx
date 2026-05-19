import { motion } from 'framer-motion';
import { Github, LayoutDashboard, Target, GitMerge } from 'lucide-react';

const WorkflowSection = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="mt-40 max-w-5xl mx-auto w-full relative z-10"
        >
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">How CommitStream Works</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Seamlessly integrates with your existing tools to supercharge your development pipeline.</p>
            </div>

            <div className="relative">
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                    {[
                        { step: "1", title: "Connect GitHub", desc: "Link your repositories with a single click.", icon: <Github className="w-5 h-5 text-slate-600 dark:text-slate-400" /> },
                        { step: "2", title: "Track Issues", desc: "Manage tasks in native Kanban boards.", icon: <LayoutDashboard className="w-5 h-5 text-slate-600 dark:text-slate-400" /> },
                        { step: "3", title: "Predict Conflicts", desc: "AI simulates merges to find breaking code.", icon: <Target className="w-5 h-5 text-slate-600 dark:text-slate-400" /> },
                        { step: "4", title: "Resolve & Merge", desc: "One-click safe resolution back to GitHub.", icon: <GitMerge className="w-5 h-5 text-slate-600 dark:text-slate-400" /> }
                    ].map((item, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all text-center group">
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
    );
};

export default WorkflowSection;
