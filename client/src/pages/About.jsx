import { motion } from 'framer-motion';
import { Shield, Target, Zap, Github, Linkedin, Mail } from 'lucide-react';

const About = () => {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const team = [
        {
            name: "Ritesh Mishra",
            role: "Founder",
            bio: "Passionate about streamlining developer workflows and building intelligent robust collaboration tools.",
            socials: { github: "https://github.com/Ritesh-mishraa", linkedin: "https://www.linkedin.com/in/ritesh-kumar-mishra-a7b8b3249/" },
            avatar: "RM"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20 px-6 font-sans overflow-x-hidden">
            <div className="max-w-4xl mx-auto">
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    className="text-center mb-24"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6 tracking-tight">
                        Our Motive
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                        CommitStream was built from the frustration of dealing with chaotic merge conflicts and fragmented team communication. Our mission is to provide an intelligent, real-time collaboration hub that empowers developers to predict, manage, and resolve conflicts seamlessly-before they disrupt the CI/CD pipeline.
                    </p>
                </motion.div>

                {/* Values Section */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32"
                >
                    <div className="bg-white dark:bg-slate-900/30 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <Target className="w-8 h-8 text-blue-400 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Precision</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Accurately predicting conflicts with deep code intelligence saves hours of manual resolution.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900/30 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <Zap className="w-8 h-8 text-emerald-400 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Speed</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Real-time collaborative editing means issues are addressed instantly by the right stakeholders.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900/30 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <Shield className="w-8 h-8 text-purple-400 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Reliability</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Keeping your main branch pristine and ensuring every merge is secure and fully vetted.</p>
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
                                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-700 dark:text-slate-300 mb-6 border-2 border-slate-300 dark:border-slate-700 group-hover:border-blue-500 transition-colors shadow-xl">
                                    {member.avatar}
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{member.name}</h3>
                                <p className="text-sm text-blue-400 mb-4">{member.role}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6 leading-relaxed max-w-xs">{member.bio}</p>
                                
                                <div className="flex gap-4">
                                    <a href={member.socials.github} className="text-slate-500 hover:text-slate-900 dark:text-slate-100 transition-colors">
                                        <Github className="w-5 h-5" />
                                    </a>
                                    <a href={member.socials.linkedin} className="text-slate-500 hover:text-blue-400 transition-colors">
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                    {/* <a href="rajmi8948360380@gmail.com" className="text-slate-500 hover:text-emerald-400 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </a> */}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default About;
