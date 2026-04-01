import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link as LinkIcon, X, Copy, Check, Loader2, Mail, Hash, Send } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const InviteModal = ({ isOpen, onClose, project }) => {
    const { token } = useAuth();
    
    // UI State
    const [activeTab, setActiveTab] = useState('link'); // 'link', 'email', 'code'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    
    // Link State
    const [inviteLink, setInviteLink] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    
    // Email State
    const [emailOrUsername, setEmailOrUsername] = useState('');
    
    // Code State
    const [joinCode, setJoinCode] = useState(project?.joinCode || '');
    const [codeCopied, setCodeCopied] = useState(false);

    useEffect(() => {
        if (isOpen && project) {
            if (activeTab === 'link' && !inviteLink) {
                generateInviteLink();
            }
            if (project.joinCode) {
                setJoinCode(project.joinCode);
            }
        } else {
            // Reset state on close
            setInviteLink('');
            setError(null);
            setSuccessMsg('');
            setLinkCopied(false);
            setCodeCopied(false);
            setEmailOrUsername('');
            setActiveTab('link');
        }
    }, [isOpen, project, activeTab]);

    const generateInviteLink = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/projects/${project._id}/invite`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (res.ok) {
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

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };
    
    const handleCopyCode = () => {
        navigator.clipboard.writeText(joinCode);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        if (!emailOrUsername.trim()) return;
        
        setIsLoading(true);
        setError(null);
        setSuccessMsg('');
        
        try {
            const res = await fetch(`${API_BASE}/projects/${project._id}/invite-email`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ emailOrUsername })
            });

            const data = await res.json();
            if (res.ok) {
                setSuccessMsg('Invitation email sent successfully!');
                setEmailOrUsername('');
            } else {
                setError(data.error || 'Failed to send invite email');
            }
        } catch (err) {
            setError('Network error preventing email dispatch.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateCode = async () => {
        setIsLoading(true);
        setError(null);
        setSuccessMsg('');
        
        try {
            const res = await fetch(`${API_BASE}/projects/${project._id}/join-code`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (res.ok) {
                setJoinCode(data.joinCode);
                
                // Also update the project object conceptually for the frontend session
                if(project) project.joinCode = data.joinCode;
                
                setSuccessMsg('New join code generated!');
            } else {
                setError(data.error || 'Failed to generate join code');
            }
        } catch (err) {
            setError('Network error preventing code generation.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Invite Team Members</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <button 
                        onClick={() => setActiveTab('link')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center gap-2 transition-colors ${activeTab === 'link' ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900/50' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
                    >
                        <LinkIcon className="w-4 h-4" /> Link
                    </button>
                    <button 
                         onClick={() => setActiveTab('email')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center gap-2 transition-colors ${activeTab === 'email' ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900/50' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
                    >
                        <Mail className="w-4 h-4" /> Email
                    </button>
                    <button 
                         onClick={() => setActiveTab('code')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center gap-2 transition-colors ${activeTab === 'code' ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900/50' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
                    >
                        <Hash className="w-4 h-4" /> Code
                    </button>
                </div>

                <div className="p-5 space-y-4 overflow-y-auto">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
                            {error}
                        </div>
                    )}
                    
                    {successMsg && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm rounded-lg flex items-center gap-2">
                            <Check className="w-4 h-4" /> {successMsg}
                        </div>
                    )}

                    {/* Link Tab */}
                    {activeTab === 'link' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Share this link with your team. Anyone with this link will be added to the <strong>{project?.name}</strong> workspace. Valid for 7 days.
                            </p>
                            <div className="flex gap-2 relative">
                                <input
                                    type="text"
                                    readOnly
                                    value={isLoading ? 'Generating secure link...' : inviteLink}
                                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:border-blue-500 font-mono transition-colors"
                                />
                                <button
                                    onClick={handleCopyLink}
                                    disabled={isLoading || !inviteLink}
                                    className={`p-2.5 rounded-lg border flex items-center justify-center transition-colors min-w-[44px]
                                    ${linkCopied
                                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50'
                                        }`}
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />)}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Email Tab */}
                    {activeTab === 'email' && (
                         <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Send an invitation link directly to a colleague's email or via their registered username.
                            </p>
                            <form onSubmit={handleSendEmail} className="flex gap-2 relative">
                                <input
                                    type="text"
                                    placeholder="Email address or username"
                                    value={emailOrUsername}
                                    onChange={(e) => setEmailOrUsername(e.target.value)}
                                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !emailOrUsername.trim()}
                                    className="px-4 py-2.5 rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-500 flex items-center justify-center gap-2 transition-colors min-w-[100px] disabled:opacity-50 font-medium text-sm shadow-sm"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send</>}
                                </button>
                            </form>
                        </div>
                    )}
                    
                    {/* Code Tab */}
                    {activeTab === 'code' && (
                         <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Generate a short, permanent 6-character code. Members can join by entering this code in their dashboard.
                            </p>
                            
                            {joinCode ? (
                                <div className="space-y-4">
                                     <div className="flex gap-2 relative">
                                        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center rounded-lg px-3 py-4 focus:outline-none focus:border-blue-500 font-mono text-2xl tracking-[0.2em] font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center transition-colors">
                                            {joinCode}
                                        </div>
                                        <button
                                            onClick={handleCopyCode}
                                            className={`p-2.5 rounded-lg border flex items-center justify-center transition-colors px-6
                                            ${codeCopied
                                                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {codeCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <button 
                                        onClick={handleGenerateCode}
                                        disabled={isLoading}
                                        className="w-full py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate New Code'}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <button 
                                        onClick={handleGenerateCode}
                                        disabled={isLoading}
                                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 mx-auto shadow-sm"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Join Code'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
                    <button onClick={onClose} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteModal;
