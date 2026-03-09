import { Outlet, NavLink } from 'react-router-dom';
import { GitMerge, Activity, LayoutDashboard, TerminalSquare, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const { user, logout } = useAuth();
    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-400 overflow-hidden font-sans">

            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-8 text-zinc-100 font-medium">
                        <TerminalSquare className="w-5 h-5 text-indigo-500" />
                        <span>CommitStream</span>
                    </div>

                    <nav className="space-y-1">
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-md transition-none
                ${isActive ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-zinc-800/50 hover:text-zinc-200'}
              `}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="text-sm">Dashboard</span>
                        </NavLink>

                        <NavLink
                            to="/conflicts"
                            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-md transition-none
                ${isActive ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-zinc-800/50 hover:text-zinc-200'}
              `}
                        >
                            <GitMerge className="w-4 h-4" />
                            <span className="text-sm">Conflict Predictor</span>
                        </NavLink>
                    </nav>
                </div>

                <div className="mt-auto p-4 border-t border-zinc-800/50">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center border border-zinc-700 text-white font-medium"
                            style={{ backgroundColor: user?.avatarColor || '#333' }}
                        >
                            <span className="text-xs">{user?.username?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="text-sm text-zinc-200 font-medium">{user?.username}</span>
                            <span className="text-[10px] text-zinc-500 truncate max-w-[120px]">{user?.email}</span>
                        </div>
                        <button
                            onClick={logout}
                            title="Logout"
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800/50 rounded transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Topbar */}
                <header className="h-14 border-b border-zinc-800 flex items-center px-6 justify-between bg-zinc-900/20 backdrop-blur-sm z-10 hidden sm:flex">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500 text-xs font-mono">WORKSPACE</span>
                        <span className="text-zinc-600">/</span>
                        <span className="text-zinc-200 font-medium capitalize">CommitStream MVP</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
                            <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                            <span className="text-xs text-zinc-400 font-mono">SYS_OK</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto bg-zinc-950 p-6">
                    <div className="mx-auto max-w-6xl">
                        <Outlet />
                    </div>
                </div>
            </main>

        </div>
    );
};

export default Layout;
