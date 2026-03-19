import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { TerminalSquare, Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user } = useAuth();
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
        <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 font-sans ${isScrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-slate-800 py-3' : 'bg-transparent py-5'}`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 text-slate-100 font-semibold text-lg group">
                    <div className="bg-blue-500/10 p-1.5 rounded-lg border border-blue-500/20 group-hover:border-blue-500/50 transition-colors">
                        <TerminalSquare className="w-5 h-5 text-blue-500" />
                    </div>
                    <span>CommitStream</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            {link.name}
                        </NavLink>
                    ))}
                    
                    {user ? (
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors border border-slate-700 flex items-center gap-2 group"
                        >
                            Dashboard
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
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

                {/* Mobile Menu Toggle */}
                <button 
                    className="md:hidden text-slate-400 hover:text-slate-200 focus:outline-none"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden absolute top-full left-0 right-0 bg-slate-900 border-b border-slate-800 p-6 shadow-xl"
                    >
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => `text-base font-medium py-2 border-b border-slate-800 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400'}`}
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                            <div className="pt-4">
                                {user ? (
                                    <button 
                                        onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
                                        className="w-full bg-slate-800 text-white px-5 py-3 rounded-xl text-sm font-medium border border-slate-700 flex items-center justify-center gap-2"
                                    >
                                        Dashboard
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}
                                        className="w-full bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
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
