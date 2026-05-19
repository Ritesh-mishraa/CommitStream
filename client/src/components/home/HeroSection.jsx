import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';

const HeroSection = ({ navigate, setIsGuideOpen }) => {
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

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center relative z-10"
        >
            <motion.div 
                variants={fadeIn}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm mb-8"
            >
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm font-medium tracking-wide">CommitStream v1.0 is live</span>
            </motion.div>

            <motion.h1 
                variants={fadeIn}
                className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white tracking-tight mb-8"
            >
                Master your Git workflow<br />
                <span className="text-slate-500 dark:text-slate-400">without the chaos</span>
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
                    className="w-full sm:w-auto px-8 py-4 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-medium transition-all shadow-lg flex items-center justify-center gap-2 group"
                >
                    Start for free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                    onClick={() => setIsGuideOpen(true)}
                    className="w-full sm:w-auto px-8 py-4 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-all flex items-center justify-center gap-2"
                >
                    <BookOpen className="w-5 h-5" />
                    How it Works
                </button>

                <button 
                    onClick={() => navigate('/about')}
                    className="w-full sm:w-auto px-8 py-4 rounded-lg bg-transparent text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    Learn more
                </button>
            </motion.div>
        </motion.div>
    );
};

export default HeroSection;
