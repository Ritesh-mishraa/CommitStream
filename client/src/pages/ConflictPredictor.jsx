import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GitBranch, GitMerge, FileCode2, Package, Check, AlertTriangle, ShieldAlert, Cpu, Folder, X, History, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProjectSelector from '../components/dashboard/ProjectSelector';
import Editor, { DiffEditor } from '@monaco-editor/react';
import BranchDetailsModal from '../components/dashboard/BranchDetailsModal';
import InlineAIPopover from '../components/dashboard/InlineAIPopover';
import SEO from '../components/SEO';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const ConflictPredictor = () => {
    const { token } = useAuth();
    const location = useLocation();
    const [activeProject, setActiveProject] = useState(null);
    const [branches, setBranches] = useState([]);
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [isPredicting, setIsPredicting] = useState(false);
    const [report, setReport] = useState(null);

    const [resolvingFile, setResolvingFile] = useState(null);
    const [resolutionMode, setResolutionMode] = useState(null);
    const [resolvedCode, setResolvedCode] = useState('');
    const [originalCode, setOriginalCode] = useState('');
    const [incomingCode, setIncomingCode] = useState('');
    const [isResolving, setIsResolving] = useState(false);
    const [isCommitting, setIsCommitting] = useState(false);
    const [historyBranch, setHistoryBranch] = useState(null);
    const [popoverState, setPopoverState] = useState(null);
    const manualEditorRef = useRef(null);
    const cursorSelectionDisposables = useRef([]);

    const clearDisposables = () => {
        cursorSelectionDisposables.current.forEach(d => {
            if (d && typeof d.dispose === 'function') {
                try { d.dispose(); } catch (e) {}
            }
        });
        cursorSelectionDisposables.current = [];
    };

    // Cleanup on unmount or when resolvingFile changes
    useEffect(() => {
        return () => clearDisposables();
    }, [resolvingFile]);

    const handleEditorSelectionChange = (e, editorInstance, branchName) => {
        const selection = e.selection;
        const model = editorInstance.getModel();
        if (!model) return;

        const selectedText = model.getValueInRange(selection);
        
        // Don't pop up for tiny/empty selections
        if (!selectedText.trim() || selectedText.length < 5) {
            setPopoverState(null);
            return;
        }

        const fileContext = model.getValue();
        // Float the UI near the start of the selection block
        const pos = editorInstance.getScrolledVisiblePosition(selection.getStartPosition());
        const domNode = editorInstance.getDomNode();
        
        if (pos && domNode) {
            const rect = domNode.getBoundingClientRect();
            setPopoverState({
                position: { 
                    x: rect.left + pos.left + window.scrollX, 
                    y: rect.top + pos.top + window.scrollY 
                },
                selectedText,
                fileContext,
                branchName
            });
        }
    };

    // Fetch branches scoped to the active project
    useEffect(() => {
        if (!token || !activeProject) {
            setBranches([]);
            setSelectedBranches([]);
            setReport(null);
            return;
        }

        fetch(`${API_BASE}/branches?projectId=${activeProject._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                setBranches(data);
                
                // Smart Workflow Hook: Pre-select branch if navigated here from Kanban "Review"
                if (location.state?.branch) {
                    const matchedBranch = data.find(b => b.name === location.state.branch);
                    if (matchedBranch && !selectedBranches.includes(matchedBranch._id)) {
                        setSelectedBranches(prev => {
                            if (prev.includes(matchedBranch._id)) return prev;
                            if (prev.length >= 2) return [prev[1], matchedBranch._id]; 
                            return [...prev, matchedBranch._id];
                        });
                    }
                }
            })
            .catch(console.error);
    }, [token, activeProject, location.state]);

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
                    branchIdB: selectedBranches[1],
                    projectId: activeProject._id
                })
            });
            const data = await res.json();

            if (!res.ok) {
                alert(`Prediction failed: ${data.message || 'Unknown error'}`);
                return;
            }

            setReport(data);
        } catch (error) {
            console.error(error);
            alert('An error occurred while running the prediction.');
        } finally {
            setIsPredicting(false);
        }
    };

    const handleManualResolve = async (filename) => {
        setResolvingFile(filename);
        setResolutionMode('MANUAL');
        setIsResolving(true);
        setOriginalCode('// Fetching contents...');
        setResolvedCode('// Fetching contents...');
        try {
            const res = await fetch(`${API_BASE}/conflicts/file-content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId: activeProject._id,
                    branchIdA: selectedBranches[0],
                    branchIdB: selectedBranches[1],
                    filename
                })
            });
            const data = await res.json();
            if (res.ok) {
                setOriginalCode(data.contentA);
                setResolvedCode(data.contentB);
                setIncomingCode(data.contentB);
            } else {
                setOriginalCode(`// Failed to fetch content.\n// ${data.message || 'Unknown error'}`);
                setResolvedCode('');
            }
        } catch (err) {
            console.error(err);
            setOriginalCode('// Error occurred.');
        } finally {
            setIsResolving(false);
        }
    };

    const handleResolveWithAI = async (filename) => {
        setPopoverState(null); // Clear any floating AI popovers
        setResolvingFile(filename);
        setResolutionMode('AI');
        setIsResolving(true);
        setResolvedCode('// Requesting AI resolution from Gemini...');
        try {
            const res = await fetch(`${API_BASE}/conflicts/resolve-file`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId: activeProject._id,
                    branchIdA: selectedBranches[0],
                    branchIdB: selectedBranches[1],
                    filename
                })
            });
            const data = await res.json();
            if (res.ok) {
                setResolvedCode(data.resolvedCode);
            } else {
                setResolvedCode(`// Failed to generate AI resolution.\n// ${data.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            setResolvedCode('// AI Engine offline or error occurred.');
        } finally {
            setIsResolving(false);
        }
    };

    const handleCommitResolution = async () => {
        if (!resolvingFile || !resolvedCode) return;
        setIsCommitting(true);
        try {
            const commitPayload = (branchId) => {
                const finalContent = resolutionMode === 'MANUAL' && manualEditorRef.current
                    ? manualEditorRef.current.getValue()
                    : resolvedCode;
                return {
                    branch: branchId,
                    path: resolvingFile,
                    content: finalContent,
                    message: `Merge resolution for ${resolvingFile}`
                };
            };

            // Commit to both branches to truly resolve the divergent history
            const [resA, resB] = await Promise.all([
                fetch(`${API_BASE}/projects/${activeProject._id}/commit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(commitPayload(selectedBranches[0]))
                }),
                fetch(`${API_BASE}/projects/${activeProject._id}/commit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(commitPayload(selectedBranches[1]))
                })
            ]);

            const dataA = await resA.json();
            const dataB = await resB.json();

            if (resA.ok && resB.ok) {
                alert('Successfully committed and pushed to both branches!');
                setResolvingFile(null); // Return to report
                runPrediction(); // Refresh report
            } else {
                alert(`Commit failed: ${dataA.error || dataB.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Commit error:', error);
            alert('An error occurred during commit.');
        } finally {
            setIsCommitting(false);
        }
    };

    const getSeverityColor = (sev) => {
        switch (sev) {
            case 'HIGH': return 'text-red-400 bg-red-400/10 border-red-500/20';
            case 'LOCKFILE_CONFLICT': return 'text-amber-400 bg-amber-400/10 border-amber-500/20';
            case 'COMPONENT_CONFLICT': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'LOW': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            <SEO 
                title="Merge Conflict Predictor"
                description="Predict, manage, and resolve GitHub merge conflicts with CommitStream's smart visual assistant and AI auto-resolution."
                keywords="merge conflict, predictive merge, auto resolve conflict, git merge, git overlap, conflict predictor, devops tool, commitstream"
            />

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
                        <GitMerge className="w-5 h-5 text-blue-500" />
                        Smart Merge Assistant
                    </h1>
                    <p className="text-sm text-slate-500">Select two branches to predict and simulate merge conflicts.</p>
                </div>

                <ProjectSelector
                    activeProject={activeProject}
                    setActiveProject={setActiveProject}
                />
            </div>

            {activeProject ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Left: Branch Selection */}
                    <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col h-[600px]">
                        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 flex justify-between items-center">
                            <span className="flex items-center gap-2">
                                <Folder className="w-4 h-4 text-slate-500" />
                                Branches in {activeProject.name}
                            </span>
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                                Selected: {selectedBranches.length}/2
                            </span>
                        </h3>

                        <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                            {branches.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                                    No branches found in this project.
                                </div>
                            ) : (
                                branches.map(branch => {
                                    const isSelected = selectedBranches.includes(branch._id);
                                    return (
                                        <div
                                            key={branch._id}
                                            onClick={() => toggleBranch(branch._id)}
                                            className={`p-4 rounded-md border cursor-pointer transition-all ${isSelected
                                                ? 'bg-blue-500/10 border-blue-500/50 relative'
                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <GitBranch className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                                                    <span className={`font-mono text-sm ${isSelected ? 'text-blue-300 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {branch.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button onClick={(e) => { e.stopPropagation(); setHistoryBranch(branch.name); }} className="text-xs text-slate-600 dark:text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors">
                                                        <History className="w-3 h-3" /> History
                                                    </button>
                                                    {isSelected && <Check className="w-4 h-4 text-blue-500" />}
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <div className="text-xs text-slate-500 mb-1">Modified Files ({branch.filesChanged.length})</div>
                                                <div className="flex overflow-x-auto gap-2 pb-2 mt-2" style={{ scrollbarWidth: 'thin' }}>
                                                    {branch.filesChanged.map(file => (
                                                        <span key={file} className="text-[10px] bg-slate-50 dark:bg-slate-950/50 block border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-sm font-mono whitespace-nowrap">
                                                            {file}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <button
                            onClick={runPrediction}
                            disabled={selectedBranches.length !== 2 || isPredicting}
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-slate-100 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
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
                    <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col h-[600px]">
                        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3 flex-shrink-0">Prediction Report</h3>

                        {resolvingFile ? (
                            <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e] rounded border border-slate-300 dark:border-slate-700 overflow-hidden animate-in fade-in duration-300">
                                <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 flex justify-between items-center text-xs text-slate-700 dark:text-slate-300 font-mono z-20 flex-shrink-0">
                                    <span className="truncate flex-1 font-semibold">{resolvingFile} <span className="text-blue-400 font-normal ml-2">({resolutionMode === 'AI' ? 'AI Merge' : 'Manual Merge'})</span></span>
                                    {resolutionMode === 'MANUAL' && (
                                        <span className="hidden md:inline text-slate-600 dark:text-slate-400 mx-4">Original (Base) vs Modified (Comparison)</span>
                                    )}
                                    <button onClick={() => setResolvingFile(null)} className="hover:text-slate-900 dark:text-slate-100 px-2 py-1 bg-slate-700/50 rounded flex gap-1 items-center">
                                        <X className="w-3 h-3" /> Close
                                    </button>
                                </div>
                                <div className="flex-1 min-h-0 relative border-y border-slate-300 dark:border-slate-700">
                                    {isResolving && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-900/80 z-30 backdrop-blur-sm">
                                            <Cpu className="w-8 h-8 text-blue-500 animate-pulse mb-3" />
                                            <p className="text-sm font-medium text-blue-400">{resolutionMode === 'AI' ? 'Gemini resolving conflicts...' : 'Fetching diffs...'}</p>
                                        </div>
                                    )}
                                    {resolutionMode === 'MANUAL' ? (
                                        <DiffEditor
                                            height="100%"
                                            language="javascript"
                                            theme="vs-dark"
                                            original={originalCode}
                                            modified={resolvedCode}
                                            onMount={(editor) => {
                                                clearDisposables();
                                                manualEditorRef.current = editor.getModifiedEditor();
                                                
                                                const d1 = editor.getModifiedEditor().onDidChangeCursorSelection((e) => handleEditorSelectionChange(e, editor.getModifiedEditor(), branches.find(b => b._id === selectedBranches[1])?.name || 'Incoming'));
                                                const d2 = editor.getOriginalEditor().onDidChangeCursorSelection((e) => handleEditorSelectionChange(e, editor.getOriginalEditor(), branches.find(b => b._id === selectedBranches[0])?.name || 'Base'));
                                                
                                                cursorSelectionDisposables.current.push(d1, d2);
                                            }}
                                            options={{ minimap: { enabled: false }, fontSize: 13, renderSideBySide: true, originalEditable: false, scrollBeyondLastLine: false, wordWrap: 'on' }}
                                        />
                                    ) : (
                                        <Editor
                                            height="100%"
                                            language="javascript"
                                            theme="vs-dark"
                                            value={resolvedCode}
                                            onChange={setResolvedCode}
                                            onMount={(editor) => {
                                                clearDisposables();
                                                const d = editor.onDidChangeCursorSelection((e) => handleEditorSelectionChange(e, editor, 'AI Resolving Scope'));
                                                cursorSelectionDisposables.current.push(d);
                                            }}
                                            options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false, wordWrap: 'on' }}
                                        />
                                    )}
                                </div>
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 border-t border-slate-300 dark:border-slate-700 flex justify-between items-center gap-3 flex-shrink-0">
                                    {resolutionMode === 'MANUAL' ? (
                                        <div className="flex gap-2">
                                            <button onClick={() => { if (manualEditorRef.current) manualEditorRef.current.setValue(originalCode); }} className="text-xs bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded transition-colors font-medium" title="Accept Base branch changes">
                                                Accept Base
                                            </button>
                                            <button onClick={() => { if (manualEditorRef.current) manualEditorRef.current.setValue(incomingCode); }} className="text-xs bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded transition-colors font-medium" title="Accept Incoming branch changes">
                                                Accept Incoming
                                            </button>
                                        </div>
                                    ) : <div></div>}
                                    <button onClick={handleCommitResolution} disabled={isCommitting} className="bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-slate-100 px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isCommitting ? <Cpu className="w-4 h-4 animate-spin" /> : <GitMerge className="w-4 h-4" />}
                                        {isCommitting ? 'Committing...' : 'Commit & Push Resolution'}
                                    </button>
                                </div>
                            </div>
                        ) : report ? (
                            <div className="flex-1 overflow-y-auto space-y-6 animate-in fade-in duration-300 pr-2" style={{ scrollbarWidth: 'thin' }}>

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
                                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Caught Collisions</div>

                                    {report.conflictingFiles.length === 0 ? (
                                        <div className="text-sm text-emerald-400 flex items-center gap-2 bg-emerald-500/10 p-3 rounded">
                                            <Check className="w-4 h-4" /> No merge conflicts predicted. Safe to merge.
                                        </div>
                                    ) : (
                                        report.conflictingFiles.map(file => {
                                            const isLock = file.endsWith('package-lock.json') || file.endsWith('yarn.lock');
                                            const isComponent = file.endsWith('.jsx') || file.endsWith('.tsx');

                                            return (
                                                <div key={file} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-2 border-l-red-500 rounded flex gap-3 text-sm">
                                                    <div className="mt-0.5">
                                                        {isLock ? <Package className="w-4 h-4 text-amber-500" /> : <FileCode2 className="w-4 h-4 text-blue-400" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 w-full">
                                                            <div className="flex-1 w-full min-w-0">
                                                                <code className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded block mb-1 truncate text-xs" title={file}>{file}</code>
                                                            </div>
                                                            {!isLock && (
                                                                <div className="flex shrink-0 gap-2 w-full xl:w-auto mt-1 xl:mt-0">
                                                                    <button onClick={() => handleManualResolve(file)} className="flex-1 xl:flex-none justify-center text-[11px] sm:text-xs bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:text-slate-100 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap">
                                                                        <Edit2 className="w-3 h-3" /> Manual edit
                                                                    </button>
                                                                    <button onClick={() => handleResolveWithAI(file)} className="flex-1 xl:flex-none justify-center text-[11px] sm:text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap">
                                                                        <Cpu className="w-3 h-3" /> Resolve AI
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {isLock && <p className="text-xs text-slate-500 mt-2">Lockfile conflict via dependency divergence.</p>}
                                                        {!isLock && <p className="text-xs text-slate-500 mt-2">Deep file collision detected.</p>}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Bot Auto Resolutions */}
                                {report.autoResolved && report.autoResolved.length > 0 && (
                                    <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-6">
                                        <div className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <Cpu className="w-3.5 h-3.5" /> AI Auto-Resolution Strategy
                                        </div>
                                        <div className="space-y-2">
                                            {report.autoResolved.map(ar => (
                                                <div key={ar.file} className="bg-blue-500/5 text-blue-200 border border-blue-500/20 p-3 rounded text-sm">
                                                    <span className="font-mono text-xs block mb-1 text-blue-300">{ar.file}</span>
                                                    Action: {ar.resolutionStrategy}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 space-y-4">
                                <ShieldAlert className="w-12 h-12 opacity-50" />
                                <p className="text-sm">Select branches and run prediction engine.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-20 text-slate-500 border border-slate-200 dark:border-slate-800 border-dashed rounded-lg bg-white dark:bg-slate-900/20">
                    <Folder className="w-12 h-12 mb-4 opacity-50" />
                    <p>Select a project to view its branches for conflict prediction.</p>
                </div>
            )}
            <BranchDetailsModal
                isOpen={!!historyBranch}
                onClose={() => setHistoryBranch(null)}
                project={activeProject}
                branchName={historyBranch}
            />

            <InlineAIPopover 
                position={popoverState?.position}
                selectedText={popoverState?.selectedText}
                fileContext={popoverState?.fileContext}
                branchName={popoverState?.branchName}
                onClose={() => setPopoverState(null)}
            />
        </div>
    );
};

export default ConflictPredictor;
