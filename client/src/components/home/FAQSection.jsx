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
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="mt-40 max-w-3xl mx-auto w-full relative z-10"
        >
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            </div>
            
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
        </motion.div>
    );
};

export default FAQSection;
