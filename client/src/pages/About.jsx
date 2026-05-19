import { motion } from 'framer-motion';
import { Shield, Target, Zap, Github, Linkedin, Mail, Code2, Users, LayoutDashboard, Database, Cpu } from 'lucide-react';
import Footer from '../components/home/Footer';

const About = () => {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const team = [
        {
            name: "Ritesh Mishra",
            role: "Founder & Lead Engineer",
            bio: "Passionate about streamlining developer workflows and building intelligent robust collaboration tools.",
            socials: { github: "https://github.com/Ritesh-mishraa", linkedin: "https://www.linkedin.com/in/ritesh-kumar-mishra-a7b8b3249/" },
            avatar: "RM"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20 px-6 font-sans overflow-x-hidden transition-colors selection:bg-slate-500/30">
            {/* Subtle background element */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-slate-200/40 dark:bg-slate-900/40 blur-[120px] rounded-full opacity-50" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Hero Section */}
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    className="text-center mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium mb-6">
                        <Code2 className="w-4 h-4" /> The Story of CommitStream
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
                        Our Mission
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl mx-auto">
                        CommitStream was built from the frustration of dealing with chaotic merge conflicts and fragmented team communication. Our goal is to provide an intelligent, real-time collaboration hub that empowers developers to predict, manage, and resolve conflicts seamlessly—before they disrupt the CI/CD pipeline.
                    </p>
                </motion.div>

                {/* Core Philosophy Section */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32"
                >
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-800">
                            <Target className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Precision</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Accurately predicting conflicts with deep code intelligence saves hours of manual resolution and cognitive load.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-800">
                            <Zap className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Speed</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Real-time collaborative editing means issues are addressed instantly by the right stakeholders in the same environment.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-800">
                            <Shield className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Reliability</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Keeping your main branch pristine and ensuring every merge is secure and fully vetted through automated checks.</p>
                    </div>
                </motion.div>

                {/* What We Do (Expanded Content) */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 mb-32 shadow-sm"
                >
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Engineering Excellence</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Modern software development is highly concurrent. Teams branch off, write code, and eventually need to merge back together. Historically, discovering merge conflicts happens too late—often during the pull request phase, breaking CI builds and halting velocity.
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                <strong>CommitStream shifts this paradigm left.</strong> We continuously monitor active branches in your repository, simulating potential merges in isolated environments. When a breaking change is detected, developers are notified immediately, allowing them to resolve issues in our dual-pane Monaco editor or via Gemini AI suggestions.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <Cpu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">AI-Powered Resolution</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Leveraging advanced LLMs to safely suggest context-aware code merges.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <LayoutDashboard className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Native Project Management</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Kanban boards intrinsically linked to real-time branch statuses.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <Users className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Live Collaboration</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Built-in huddles and real-time cursor tracking for pair programming.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Team Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-12">Meet the Founder</h2>
                    
                    <div className="grid grid-cols-1 gap-12 max-w-sm mx-auto">
                        {team.map((member, idx) => (
                            <div key={idx} className="flex flex-col items-center group">
                                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-2xl font-bold text-slate-700 dark:text-slate-300 mb-6 border border-slate-300 dark:border-slate-700 group-hover:border-slate-400 dark:group-hover:border-slate-500 transition-colors shadow-lg">
                                    {member.avatar}
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{member.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{member.role}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6 leading-relaxed max-w-xs">{member.bio}</p>
                                
                                <div className="flex gap-4">
                                    <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                                        <Github className="w-4 h-4" />
                                    </a>
                                    <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                                        <Linkedin className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
            
            <div className="mt-20">
                <Footer />
            </div>
        </div>
    );
};

export default About;
