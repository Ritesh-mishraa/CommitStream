import { useState, useEffect } from 'react';
import { GitBranch, GitMerge, FileCode2, Package, Check, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000/api';

const ConflictPredictor = () => {
    const { token } = useAuth();
    const [branches, setBranches] = useState([]);
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [isPredicting, setIsPredicting] = useState(false);
    const [report, setReport] = useState(null);

    useEffect(() => {
        if (!token) return;
        fetch(`${API_BASE}/branches`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => setBranches(data))
            .catch(console.error);
    }, [token]);

    const toggleBranch = (id) => {
        setSelectedBranches(prev => {
            if (prev.includes(id)) return prev.filter(b => b !== id);
            if (prev.length >= 2) return [prev[1], id]; // keep max 2
            return [...prev, id];
        });
    };

    const runPrediction = async () => {
        if (selectedBranches.length !== 2) return;
        setIsPredicting(true);
        setReport(null);

        try {
            const res = await fetch(`${API_BASE}/conflicts/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    branchIdA: selectedBranches[0],
                    branchIdB: selectedBranches[1]
                })
            });
            const data = await res.json();
            setReport(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsPredicting(false);
        }
    };

    const getSeverityColor = (sev) => {
        switch (sev) {
            case 'HIGH': return 'text-red-400 bg-red-400/10 border-red-500/20';
            case 'LOCKFILE_CONFLICT': return 'text-amber-400 bg-amber-400/10 border-amber-500/20';
            case 'COMPONENT_CONFLICT': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
            case 'LOW': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-zinc-400 bg-zinc-800 border-zinc-700';
        }
    };

    return (
        <div className="space-y-6">

            {/* Header Area */}
            <div>
                <h1 className="text-xl font-semibold text-zinc-100 flex items-center gap-2 mb-1">
                    <GitMerge className="w-5 h-5 text-indigo-500" />
                    Smart Merge Assistant
                </h1>
                <p className="text-sm text-zinc-500">Select two branches to predict and simulate merge conflicts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left: Branch Selection */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 flex flex-col h-[600px]">
                    <h3 className="text-sm font-medium text-zinc-300 mb-4 flex justify-between items-center">
                        <span>Repository Branches</span>
                        <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                            Selected: {selectedBranches.length}/2
                        </span>
                    </h3>

                    <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                        {branches.map(branch => {
                            const isSelected = selectedBranches.includes(branch._id);
                            return (
                                <div
                                    key={branch._id}
                                    onClick={() => toggleBranch(branch._id)}
                                    className={`p-4 rounded-md border cursor-pointer transition-all ${isSelected
                                        ? 'bg-indigo-500/10 border-indigo-500/50 relative'
                                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <GitBranch className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-zinc-500'}`} />
                                            <span className={`font-mono text-sm ${isSelected ? 'text-indigo-300 font-semibold' : 'text-zinc-300'}`}>
                                                {branch.name}
                                            </span>
                                        </div>
                                        {isSelected && <Check className="w-4 h-4 text-indigo-500" />}
                                    </div>

                                    <div className="mt-3">
                                        <div className="text-xs text-zinc-500 mb-1">Modified Files ({branch.filesChanged.length})</div>
                                        <div className="flex flex-wrap gap-1">
                                            {branch.filesChanged.map(file => (
                                                <span key={file} className="text-[10px] bg-zinc-950 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono truncate max-w-[150px]">
                                                    {file}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button
                        onClick={runPrediction}
                        disabled={selectedBranches.length !== 2 || isPredicting}
                        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {isPredicting ? (
                            <Cpu className="w-4 h-4 animate-spin" />
                        ) : (
                            <ShieldAlert className="w-4 h-4" />
                        )}
                        Run Prediction Engine
                    </button>
                </div>

                {/* Right: Results Dashboard */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 flex flex-col h-[600px] overflow-hidden">
                    <h3 className="text-sm font-medium text-zinc-300 mb-4 border-b border-zinc-800 pb-3">Prediction Report</h3>

                    {report ? (
                        <div className="flex-1 overflow-y-auto space-y-6 animate-in fade-in duration-300">

                            {/* Summary Card */}
                            <div className={`p-4 rounded-md border ${getSeverityColor(report.severity)}`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span className="font-semibold text-sm">
                                        Severity: {report.severity.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-xs opacity-80 mt-1">
                                    Comparing branches `<span className="font-mono">{branches.find(b => b._id === report.branchA)?.name}</span>` and `<span className="font-mono">{branches.find(b => b._id === report.branchB)?.name}</span>`
                                </p>
                            </div>

                            {/* Conflicting Files */}
                            <div className="space-y-2">
                                <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-2">Caught Collisions</div>

                                {report.conflictingFiles.length === 0 ? (
                                    <div className="text-sm text-emerald-400 flex items-center gap-2 bg-emerald-500/10 p-3 rounded">
                                        <Check className="w-4 h-4" /> No merge conflicts predicted. Safe to merge.
                                    </div>
                                ) : (
                                    report.conflictingFiles.map(file => {
                                        const isLock = file.endsWith('package-lock.json') || file.endsWith('yarn.lock');
                                        const isComponent = file.endsWith('.jsx') || file.endsWith('.tsx');

                                        return (
                                            <div key={file} className="p-3 bg-zinc-900 border border-zinc-800 border-l-2 border-l-red-500 rounded flex gap-3 text-sm">
                                                <div className="mt-0.5">
                                                    {isLock ? <Package className="w-4 h-4 text-amber-500" /> : <FileCode2 className="w-4 h-4 text-indigo-400" />}
                                                </div>
                                                <div className="flex-1">
                                                    <code className="text-zinc-300 bg-zinc-950 px-1 rounded block w-fit mb-1">{file}</code>
                                                    {isLock && <p className="text-xs text-zinc-500">Lockfile conflict via dependency divergence.</p>}
                                                    {isComponent && <p className="text-xs text-zinc-500">Deep component collision detected.</p>}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Bot Auto Resolutions */}
                            {report.autoResolved && report.autoResolved.length > 0 && (
                                <div className="border-t border-zinc-800 pt-4 mt-6">
                                    <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <Cpu className="w-3.5 h-3.5" /> AI Auto-Resolution Strategy
                                    </div>
                                    <div className="space-y-2">
                                        {report.autoResolved.map(ar => (
                                            <div key={ar.file} className="bg-indigo-500/5 text-indigo-200 border border-indigo-500/20 p-3 rounded text-sm">
                                                <span className="font-mono text-xs block mb-1 text-indigo-300">{ar.file}</span>
                                                Action: {ar.resolutionStrategy}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 space-y-4">
                            <ShieldAlert className="w-12 h-12 opacity-50" />
                            <p className="text-sm">Select branches and run prediction engine.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ConflictPredictor;
