import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { ShieldCheck, Cpu, Folder, GitBranch, AlertTriangle, Bug, Zap, AlertCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000/api';

const Audits = () => {
    const { token } = useAuth();
    const { activeProject } = useProject();
    
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [results, setResults] = useState(null);

    useEffect(() => {
        if (!token || !activeProject) {
            setBranches([]);
            return;
        }
        fetch(`${API_BASE}/branches?projectId=${activeProject._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                setBranches(data);
                const defaultBranch = data.find(b => b.isDefault);
                if (data.length > 0 && !defaultBranch) {
                    setSelectedBranch(data[0].name);
                } else if (data.length > 1) {
                    // Pre-select a non-default branch
                    const nonDefault = data.find(b => !b.isDefault);
                    if (nonDefault) setSelectedBranch(nonDefault.name);
                }
            })
            .catch(console.error);
    }, [token, activeProject]);

    const runAudit = async () => {
        if (!selectedBranch || !activeProject) return;
        setIsScanning(true);
        setResults(null);
        try {
            const res = await fetch(`${API_BASE}/audits/scan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId: activeProject._id,
                    branch: selectedBranch
                })
            });
            
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            } else {
                const err = await res.json();
                alert(`Audit failed: ${err.message}`);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to run security audit");
        } finally {
            setIsScanning(false);
        }
    };

    const getSeverityBadge = (severity) => {
        const specs = {
            CRITICAL: 'bg-red-500/10 text-red-500 border-red-500/20',
            HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
            MEDIUM: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            LOW: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            INFO: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
        };
        const defaultStyle = 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        return specs[severity] || defaultStyle;
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'VULNERABILITY': return <Bug className="w-5 h-5 text-red-500" />;
            case 'CODE_SMELL': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'OPTIMIZATION': return <Zap className="w-5 h-5 text-emerald-500" />;
            case 'LOGIC_FLAW': return <AlertCircle className="w-5 h-5 text-orange-500" />;
            default: return <AlertCircle className="w-5 h-5 text-slate-500" />;
        }
    };

    if (!activeProject) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-slate-500 border border-slate-200 dark:border-slate-800 border-dashed rounded-lg bg-white dark:bg-slate-900/20">
                <Folder className="w-12 h-12 mb-4 opacity-50" />
                <p>Select a project from the topbar to view Security Audits.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        AI Security Scanner
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Audit pull request diffs for vulnerabilities and code smells.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden bg-white dark:bg-slate-900">
                        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex items-center">
                            <GitBranch className="w-4 h-4 text-slate-500" />
                        </div>
                        <select 
                            value={selectedBranch} 
                            onChange={e => setSelectedBranch(e.target.value)}
                            className="bg-transparent border-none outline-none px-4 py-2 text-sm text-slate-700 dark:text-slate-200 appearance-none pr-8 cursor-pointer"
                        >
                            <option value="" disabled>Select a branch</option>
                            {branches.map(b => (
                                <option key={b.name} value={b.name} disabled={b.isDefault}>
                                    {b.name} {b.isDefault ? '(Default)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <button 
                        onClick={runAudit}
                        disabled={!selectedBranch || isScanning}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isScanning ? <Cpu className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        {isScanning ? 'Scanning...' : 'Run Audit'}
                    </button>
                </div>
            </div>

            {results ? (
                results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-800/30 rounded-lg bg-emerald-50 dark:bg-emerald-500/5">
                        <ShieldCheck className="w-16 h-16 mb-4 opacity-80" />
                        <h3 className="text-lg font-semibold">Perfect Code!</h3>
                        <p className="text-sm opacity-80 mt-1">No major vulnerabilities or code smells detected in this branch.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {results.map((item, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 50}ms` }}>
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                    <div className="shrink-0 pt-1">
                                        {getTypeIcon(item.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                            <div className="flex gap-2 items-center flex-wrap">
                                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-tight">
                                                    {item.type ? item.type.replace('_', ' ') : 'NOTE'}
                                                </span>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getSeverityBadge(item.severity)}`}>
                                                    {item.severity}
                                                </span>
                                            </div>
                                            {(item.file || item.line) && (
                                                <div className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded truncate max-w-full">
                                                    {item.file} {item.line ? `:${item.line}` : ''}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-800 dark:text-slate-300 mb-3 leading-relaxed">
                                            {item.message}
                                        </p>
                                        <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded p-3 text-sm text-blue-800 dark:text-blue-300">
                                            <span className="font-semibold block mb-1">Recommendation</span>
                                            {item.suggestion}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                <div className="flex flex-col items-center justify-center p-24 text-slate-500 border border-slate-200 dark:border-slate-800 border-dashed rounded-lg bg-white/50 dark:bg-slate-900/10">
                    <Cpu className="w-12 h-12 mb-4 opacity-20" />
                    <p>Select a target branch to run the AI Security Audit.</p>
                </div>
            )}
        </div>
    );
};

export default Audits;
