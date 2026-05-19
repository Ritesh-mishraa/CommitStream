import { motion } from 'framer-motion';

const CTASection = ({ navigate }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="mt-40 mb-20 max-w-5xl mx-auto w-full bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-12 text-center relative overflow-hidden shadow-2xl z-10"
        >
            {/* Decorative elements - toned down for modern look */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Ready to streamline your workflow?</h2>
                <p className="text-slate-300 mb-10 max-w-2xl mx-auto text-lg">Join thousands of developers resolving conflicts faster and building better software together.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                        onClick={() => navigate('/auth')}
                        className="px-8 py-4 rounded-lg bg-white text-slate-900 font-bold hover:bg-slate-100 transition-colors shadow-lg w-full sm:w-auto"
                    >
                        Get Started for Free
                    </button>
                    <button 
                        onClick={() => navigate('/about')}
                        className="px-8 py-4 rounded-lg bg-transparent border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto"
                    >
                        Learn About Us
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default CTASection;
