import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link as LinkIcon, X, Copy, Check, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000/api';

const InviteModal = ({ isOpen, onClose, project }) => {
    const { token } = useAuth();
    const [inviteLink, setInviteLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && project) {
            generateInvite();
        } else {
            setInviteLink('');
            setError(null);
            setCopied(false);
        }
    }, [isOpen, project]);

    const generateInvite = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/projects/${project._id}/invite`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (res.ok) {
                // Construct full frontend URL for the invite
                const baseUrl = window.location.origin;
                setInviteLink(`${baseUrl}/join/${data.inviteToken}`);
            } else {
                setError(data.error || 'Failed to generate invite');
            }
        } catch (err) {
            setError('Network error preventing invite generation.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-900">
                    <div className="flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Invite Team Members</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Share this link with your team. Anyone with this link will be added to the <strong>{project?.name}</strong> workspace. Valid for 7 days.
                    </p>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2 relative">
                        <input
                            type="text"
                            readOnly
                            value={isLoading ? 'Generating secure link...' : inviteLink}
                            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 rounded px-3 py-2 pr-10 focus:outline-none focus:border-blue-500 font-mono"
                        />
                        <button
                            onClick={handleCopy}
                            disabled={isLoading || !inviteLink}
                            className={`p-2 rounded border flex items-center justify-center transition-colors min-w-[40px]
                            ${copied
                                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500'
                                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-700 hover:text-slate-900 dark:text-slate-100 disabled:opacity-50'
                                }`}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />)}
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                    <button onClick={onClose} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteModal;
