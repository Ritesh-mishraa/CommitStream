import { useState, useEffect } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000/api';

const InlineAIPopover = ({ position, selectedText, fileContext, branchName, onClose }) => {
    const { token } = useAuth();
    const [explanation, setExplanation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Reset UI state cleanly whenever the user highlights a brand new piece of code
    useEffect(() => {
        setIsOpen(false);
        setExplanation('');
        setIsLoading(false);
    }, [selectedText]);

    const handleExplain = async () => {
        setIsOpen(true);
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/conflicts/explain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    selectedCode: selectedText,
                    contextCode: fileContext,
                    branchName: branchName
                })
            });
            const data = await res.json();
            if (res.ok) {
                setExplanation(data.explanation);
            } else {
                setExplanation(data.message || 'Failed to generate explanation.');
            }
        } catch (err) {
            setExplanation('An error occurred connecting to the AI engine.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!position || !selectedText) return null;

    return (
        <div 
            className="absolute z-50 transition-all duration-200"
            style={{ 
                top: `${position.y}px`, 
                left: `${position.x}px`,
                transform: 'translate(-50%, -120%)'
            }}
        >
            {!isOpen ? (
                <button 
                    onClick={handleExplain}
                    className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-950 border border-slate-700 backdrop-blur-md text-slate-200 px-3 py-1.5 rounded-full shadow-2xl transition-transform hover:scale-105 group font-sans"
                    title="Explain this code piece"
                >
                    <Sparkles className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                    <span className="text-xs font-medium">Explain Syntax</span>
                </button>
            ) : (
                <div className="w-[340px] bg-slate-900/85 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl p-5 relative flex flex-col gap-3 font-sans">
                    <button 
                        onClick={onClose}
                        className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">AI Context</span>
                    </div>

                    <div className="text-sm text-slate-300 leading-relaxed min-h-[60px] font-medium font-sans selection:bg-indigo-500/30">
                        {isLoading ? (
                            <div className="flex items-center gap-2 text-indigo-400 p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-xs animate-pulse">Analyzing collision mechanics...</span>
                            </div>
                        ) : (
                            <p>{explanation}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InlineAIPopover;
