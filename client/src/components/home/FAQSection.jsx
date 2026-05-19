import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl mb-4 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
            >
                <span className="font-semibold text-slate-900 dark:text-slate-100">{question}</span>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-5 text-slate-600 dark:text-slate-400 leading-relaxed text-sm"
                    >
                        {answer}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQSection = () => {
    return (
        <section className="w-full mt-32 px-6">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className="max-w-5xl mx-auto w-full relative z-10"
            >
                {/* Divider */}
                <div className="flex items-center gap-4 mb-16">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">FAQ</span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-16">
                    {/* Left: Sticky heading */}
                    <div className="md:sticky md:top-28 self-start">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Everything you need to know about CommitStream.</p>
                    </div>

                    {/* Right: Accordion */}
                    <div>
                        <FAQItem 
                            question="Does CommitStream access my source code?" 
                            answer="CommitStream requests minimal permissions necessary via the GitHub API to fetch branch data, view file differences, and commit changes when you explicitly choose to resolve a conflict. We do not permanently store your proprietary source code on our servers; data is processed ephemerally during analysis." 
                        />
                        <FAQItem 
                            question="Do I need to change my current CI/CD pipeline?" 
                            answer="Not at all! CommitStream sits alongside your existing workflow. You can continue using your standard CI/CD tools (like GitHub Actions or Jenkins). CommitStream simply ensures that the code you merge is conflict-free and secure before it triggers your automated pipelines." 
                        />
                        <FAQItem 
                            question="Is the AI conflict resolution safe?" 
                            answer="Yes. The AI suggests resolutions by analyzing the base and target branches using context-aware LLMs (Gemini). It presents the suggested fix in a diff viewer for your manual review and approval before any commit is pushed back to GitHub." 
                        />
                        <FAQItem 
                            question="Can I use this with private repositories?" 
                            answer="Yes, CommitStream fully supports private repositories. Once you authenticate with GitHub and grant the appropriate repository access, you can use all features seamlessly with your private codebases." 
                        />
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default FAQSection;
