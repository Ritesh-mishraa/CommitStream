import { motion } from 'framer-motion';

const FeaturesSection = ({ features }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="mt-32 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 w-full z-10 relative"
        >
            {features.map((feature, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors group shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{feature.description}</p>
                </div>
            ))}
        </motion.div>
    );
};

export default FeaturesSection;
