import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Github, X, Loader2, CheckCircle2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000/api';

const GithubSettingsModal = ({ isOpen, onClose }) => {
    const { token, user, updateUser } = useAuth();
    const [pat, setPat] = useState('');
    const [username, setUsername] = useState(user?.githubUsername || '');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch(`${API_BASE}/auth/github-settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    githubPat: pat || null,
                    githubUsername: username || null
                })
            });

            if (res.ok) {
                const data = await res.json();
                updateUser({
                    githubUsername: data.user.githubUsername,
                    hasGithubPat: data.user.hasGithubPat
                });
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                }, 1500);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to update settings');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-900">
                    <div className="flex items-center gap-2">
                        <Github className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">GitHub Settings</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Error / Success Messages */}
                    {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">{error}</div>}
                    {success && <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-lg flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Settings saved successfully!</div>}

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">GitHub Username</label>
                        <input
                            type="text"
                            placeholder="e.g. facebook"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 text-slate-800 dark:text-slate-200 py-2 focus:outline-none focus:border-blue-500"
                        />
                        <p className="text-xs text-slate-500 mt-1">Optional. Used for tracking your commits.</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Personal Access Token (PAT)</label>
                        <input
                            type="password"
                            placeholder="ghp_****************************"
                            value={pat}
                            onChange={(e) => setPat(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 text-slate-800 dark:text-slate-200 py-2 focus:outline-none focus:border-blue-500 font-mono text-sm"
                        />
                        <p className="text-xs text-slate-500 mt-1">Required to bypass rate limits and access private repositories. Fine-grained tokens are recommended.</p>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center min-w-[100px] transition-colors disabled:opacity-50">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GithubSettingsModal;
