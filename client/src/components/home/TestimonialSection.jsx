import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const TestimonialSection = () => {
    const testimonials = [
        { quote: "CommitStream's AI conflict predictor has saved us countless hours of manual merge hell. It's like having a senior engineer reviewing PRs 24/7.", author: "Sarah Jenkins", role: "Lead Engineer", company: "TechFlow" },
        { quote: "The built-in Kanban boards that sync directly with branch statuses is a game changer for our agile workflow.", author: "David Chen", role: "DevOps Manager", company: "CloudScale" },
        { quote: "Finally, a tool that visualizes repo insights clearly. We cut our average PR resolution time by 40% in the first month.", author: "Elena Rodriguez", role: "CTO", company: "NextGen Start" }
    ];

    return (
        <section className="w-full mt-32 relative overflow-hidden bg-slate-900 dark:bg-slate-800/50">
            {/* Subtle line grid overlay */}
            <div
                className="absolute inset-0 z-0 opacity-10"
                style={{
                    backgroundImage: `linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                }}
            />
            {/* Radial center glow */}
            <div className="absolute inset-0 bg-radial-gradient pointer-events-none z-0"
                style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(47,129,247,0.06) 0%, transparent 70%)' }}
            />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className="relative z-10 max-w-6xl mx-auto w-full px-6 py-24"
            >
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-600 text-xs font-medium text-slate-400 mb-4 bg-slate-800/50 backdrop-blur-sm">
                        <Star className="w-3 h-3 fill-slate-400" />
                        Reviews
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Trusted by Engineering Teams</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">See how CommitStream is accelerating deployment cycles.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((test, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-2xl relative hover:bg-white/8 hover:border-white/20 transition-all">
                            <Quote className="w-8 h-8 text-slate-600 mb-4" />
                            <p className="text-slate-300 mb-8 text-sm leading-relaxed">"{test.quote}"</p>
                            <div className="flex items-center gap-3 mt-auto">
                                <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-200 font-bold text-sm">
                                    {test.author.charAt(0)}
                                </div>
                                <div>
                                    <h5 className="font-semibold text-slate-100 text-sm">{test.author}</h5>
                                    <p className="text-xs text-slate-500">{test.role}, {test.company}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
};

export default TestimonialSection;
