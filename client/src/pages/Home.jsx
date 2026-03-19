import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GitBranch, GitMerge, FileCode2, Users, ArrowRight } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

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
            icon: <GitMerge className="w-6 h-6 text-blue-400" />,
            title: "Smart Merge Resolution",
            description: "Automatically detect and predict potential merge conflicts before they happen."
        },
        {
            icon: <Users className="w-6 h-6 text-emerald-400" />,
            title: "Real-time Collaboration",
            description: "Work together with your team seamlessly in dedicated conflict resolution rooms."
        },
        {
            icon: <FileCode2 className="w-6 h-6 text-purple-400" />,
            title: "Code Intelligence",
            description: "Deep understand of your codebase to suggest the most optimal merge strategies."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col font-sans overflow-x-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-emerald-600/10 blur-[120px]" />
                <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]" />
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
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-blue-400 mb-8"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <span className="text-sm font-medium">CommitStream v1.0 is live</span>
                    </motion.div>

                    <motion.h1 
                        variants={fadeIn}
                        className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8"
                    >
                        Master your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Git workflow</span><br />
                        without the chaos
                    </motion.h1>

                    <motion.p 
                        variants={fadeIn}
                        className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        The ultimate collaboration hub that predicts, manages, and resolves merge conflicts before they turn into blockers. Built for modern engineering teams.
                    </motion.p>

                    <motion.div 
                        variants={fadeIn}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button 
                            onClick={() => navigate('/auth')}
                            className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 group"
                        >
                            Start for free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button 
                            onClick={() => navigate('/about')}
                            className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all border border-slate-700"
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
                        <div key={idx} className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-slate-700 transition-colors group">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-6 border border-slate-700 group-hover:bg-slate-800/80 transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-slate-200 mb-3">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </motion.div>
            </main>
        </div>
    );
};

export default Home;
