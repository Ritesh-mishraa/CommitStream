import { GitBranch, Github, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 z-10 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <GitBranch className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                            <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">CommitStream</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-xs leading-relaxed">
                            The intelligent collaboration hub for modern development teams.
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Product</h4>
                        <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                            <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Integrations</a></li>
                            <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Changelog</a></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Resources</h4>
                        <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                            <li><Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">About Us</Link></li>
                            <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">API Reference</a></li>
                            <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Community</a></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Legal</h4>
                        <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                            <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Security</a></li>
                        </ul>
                    </div>
                </div>
                
                <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        © {new Date().getFullYear()} CommitStream. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-slate-400">
                        <a href="https://github.com/Ritesh-mishraa/CommitStream" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><Github className="w-5 h-5" /></a>
                        <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><Globe className="w-5 h-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
