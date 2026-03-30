import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Loader2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const JoinProject = () => {
    const { inviteToken } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [status, setStatus] = useState('loading'); // loading, success, error
    const [project, setProject] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const joinProject = async () => {
            if (!token) {
                // Should be caught by ProtectedRoute, but double check
                navigate('/login', { state: { returnUrl: `/join/${inviteToken}` } });
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/projects/join/${inviteToken}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await res.json();

                if (res.ok) {
                    setProject(data);
                    setStatus('success');
                } else {
                    setErrorMessage(data.error || 'Failed to join project. Link may be invalid or expired.');
                    setStatus('error');
                }
            } catch (error) {
                setErrorMessage('Network error while joining project.');
                setStatus('error');
            }
        };

        joinProject();
    }, [inviteToken, token, navigate]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 selection:bg-blue-500/30">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden text-center p-8 space-y-6">

                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Joining Workspace...</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Validating your invite link securely.</p>
                    </div>
                )}

                {status === 'success' && project && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Successfully Joined!</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-8">
                            You are now a member of the <strong className="text-slate-800 dark:text-slate-200">{project.name}</strong> workspace.
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-slate-100 w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            Go to Dashboard <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Invite Invalid</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 bg-black/20 p-3 rounded-lg border border-red-500/10 inline-block">
                            {errorMessage}
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-slate-100 w-full py-2.5 rounded-lg text-sm font-medium transition-colors"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default JoinProject;
