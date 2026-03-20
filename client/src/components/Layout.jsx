import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { GitMerge, Activity, LayoutDashboard, TerminalSquare, LogOut, Sun, Moon, PanelLeftClose, PanelLeftOpen, CheckSquare, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useProject } from '../context/ProjectContext';
import ProjectSelector from './dashboard/ProjectSelector';

const Layout = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { activeProject, setActiveProject } = useProject();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 overflow-hidden font-sans">

            {/* Collapsible Sidebar Container */}
            <aside 
                className={`flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 border-r' : 'w-0 border-r-0 opacity-0'}`}
            >
                <div className="w-64 h-full flex flex-col overflow-hidden">
                    <div className="p-6">
                        <NavLink to="/" className="flex items-center gap-2 mb-8 text-slate-900 dark:text-slate-100 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
                            <TerminalSquare className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                            <span>CommitStream</span>
                        </NavLink>

                        <nav className="space-y-4">
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                    ${isActive ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'}
                  `}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                <span className="text-sm">Dashboard</span>
                            </NavLink>

                            <NavLink
                                to="/conflicts"
                                className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                    ${isActive ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'}
                  `}
                            >
                                <GitMerge className="w-4 h-4" />
                                <span className="text-sm">Conflict Predictor</span>
                            </NavLink>

                            <NavLink
                                to="/tasks"
                                className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                    ${isActive ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'}
                  `}
                            >
                                <CheckSquare className="w-4 h-4" />
                                <span className="text-sm">Tasks & Kanban</span>
                            </NavLink>

                            <NavLink
                                to="/audits"
                                className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                    ${isActive ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'}
                  `}
                            >
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-sm">AI Code Review</span>
                            </NavLink>
                        </nav>
                    </div>

                    <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800/50">
                        <div className="flex items-center gap-3">
                            <NavLink to="/profile" className="flex items-center gap-3 flex-1 hover:bg-slate-100 dark:hover:bg-slate-800/70 p-2 rounded-lg transition-colors cursor-pointer group">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium group-hover:border-blue-500 transition-colors"
                                    style={{ backgroundColor: user?.avatarColor || '#333' }}
                                >
                                    <span className="text-xs">{user?.username?.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="flex flex-col flex-1 pl-1">
                                    <span className="text-sm text-slate-800 dark:text-slate-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user?.username}</span>
                                    <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{user?.email}</span>
                                </div>
                            </NavLink>
                            <button
                                onClick={() => { logout(); window.location.href = '/'; }}
                                title="Logout"
                                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden min-w-0">
                {/* Topbar */}
                <header className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 justify-between bg-white dark:bg-slate-900/20 backdrop-blur-sm z-10 sm:flex shrink-0">
                    <div className="flex items-center gap-4 text-sm">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors focus:outline-none"
                            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                        >
                            {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-xs font-mono hidden sm:inline-block">WORKSPACE</span>
                            <span className="text-slate-600 dark:text-slate-400 hidden sm:inline-block">/</span>
                            <div className="scale-90 origin-left">
                                <ProjectSelector activeProject={activeProject} setActiveProject={setActiveProject} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        <button 
                            onClick={toggleTheme}
                            className="p-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none"
                            title="Toggle dark mode"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
                        </button>

                        <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full hidden sm:flex">
                            <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">SYS_OK</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-6">
                    <div className="mx-auto max-w-6xl">
                        <Outlet />
                    </div>
                </div>
            </main>

        </div>
    );
};

export default Layout;
