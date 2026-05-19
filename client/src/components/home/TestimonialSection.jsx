import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const TestimonialSection = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="mt-40 max-w-6xl mx-auto w-full relative z-10"
        >
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Trusted by Engineering Teams</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">See how CommitStream is accelerating deployment cycles.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { quote: "CommitStream's AI conflict predictor has saved us countless hours of manual merge hell. It’s like having a senior engineer reviewing PRs 24/7.", author: "Sarah Jenkins", role: "Lead Engineer", company: "TechFlow" },
                    { quote: "The built-in Kanban boards that sync directly with branch statuses is a game changer for our agile workflow.", author: "David Chen", role: "DevOps Manager", company: "CloudScale" },
                    { quote: "Finally, a tool that visualizes repo insights clearly. We cut our average PR resolution time by 40% in the first month.", author: "Elena Rodriguez", role: "CTO", company: "NextGen Start" }
                ].map((test, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm relative hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                        <div className="flex gap-1 mb-6">
                            {[...Array(5)].map((_, idx) => <Star key={idx} className="w-4 h-4 text-slate-700 dark:text-slate-300 fill-current" />)}
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 mb-8 text-sm leading-relaxed">"{test.quote}"</p>
                        <div className="flex items-center gap-3 mt-auto">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-sm">
                                {test.author.charAt(0)}
                            </div>
                            <div>
                                <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{test.author}</h5>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{test.role}, {test.company}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default TestimonialSection;
