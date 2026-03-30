import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { GitMerge, Loader2, Github } from 'lucide-react';

const Auth = () => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>;
    if (user) return <Navigate to="/dashboard" replace />;

    const queryParams = new URLSearchParams(location.search);
    const errorMsg = queryParams.get('error');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 selection:bg-blue-500/30">
            {/* Ambient Background Lights */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[20%] right-[20%] w-[30%] h-[40%] rounded-full bg-blue-600/10 dark:bg-blue-600/20 blur-[120px]" />
                <div className="absolute bottom-[20%] left-[20%] w-[40%] h-[30%] rounded-full bg-indigo-600/10 dark:bg-indigo-600/20 blur-[120px]" />
            </div>

            <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-10 shadow-2xl relative z-10 font-sans">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-500/20 mb-6 shadow-sm">
                        <GitMerge className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight text-center">CommitStream</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center max-w-[250px]">Securely connect your workspace to the GitHub ecosystem.</p>
                </div>

                {errorMsg && (
                    <div className="mb-8 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm text-center font-medium">
                        Authentication Failed. Please try again.
                    </div>
                )}

                <a 
                    href={import.meta.env.PROD ? '/api/auth/github' : 'http://localhost:5000/api/auth/github'}
                    className="w-full bg-[#24292e] hover:bg-[#1b1f23] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium py-4 rounded-xl text-base transition-all shadow-lg flex justify-center items-center gap-3"
                >
                    <Github className="w-5 h-5" />
                    Continue with GitHub
                </a>

                <div className="mt-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        By continuing, you grant CommitStream read-only access to your public profile and repositories for conflict analysis.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
