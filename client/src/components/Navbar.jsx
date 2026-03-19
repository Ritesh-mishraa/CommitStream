import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { TerminalSquare, Menu, X, ArrowRight, Sun, Moon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
    ];

    return (
        <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 font-sans ${isScrolled ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-3' : 'bg-transparent py-5'}`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-lg group">
                    <div className="bg-blue-500/10 p-1.5 rounded-lg border border-blue-500/20 group-hover:border-blue-500/50 transition-colors">
                        <TerminalSquare className="w-5 h-5 text-blue-500" />
                    </div>
                    <span>CommitStream</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                        >
                            {link.name}
                        </NavLink>
                    ))}

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
                    
                    <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                        title="Toggle dark mode"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-600" />}
                    </button>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-5 py-2 rounded-full text-sm font-medium transition-colors border border-slate-300 dark:border-slate-700 flex items-center gap-2 group"
                            >
                                Dashboard
                            </button>
                            <button 
                                onClick={() => { logout(); window.location.href = '/'; }}
                                title="Sign out"
                                className="p-2 border border-slate-200 dark:border-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => navigate('/auth')}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 group shadow-lg shadow-blue-500/20"
                        >
                            Get Started
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </div>

                {/* Mobile Menu Toggle & Theme Toggle for Mobile */}
                <div className="md:hidden flex items-center gap-4">
                    <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-600" />}
                    </button>
                    <button 
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 focus:outline-none"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 shadow-xl"
                    >
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => `text-base font-medium py-2 border-b border-slate-200 dark:border-slate-800 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                            <div className="pt-4 flex flex-col gap-3">
                                {user ? (
                                    <>
                                        <button 
                                            onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
                                            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-3 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2"
                                        >
                                            Dashboard
                                        </button>
                                        <button 
                                            onClick={() => { logout(); window.location.href = '/'; setMobileMenuOpen(false); }}
                                            className="w-full bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 px-5 py-3 rounded-xl text-sm font-medium border border-red-200 dark:border-red-500/30 flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-colors"
                                    >
                                        Get Started
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
