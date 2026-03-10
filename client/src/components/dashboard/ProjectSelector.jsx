import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, Plus, Folder, Trash2, Settings, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000/api';

const ProjectSelector = ({ activeProject, setActiveProject }) => {
    const { token, user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newGithubRepo, setNewGithubRepo] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${API_BASE}/projects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setProjects(data);
            if (data.length > 0 && !activeProject) {
                setActiveProject(data[0]);
            }
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchProjects();
    }, [token]);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;

        try {
            const res = await fetch(`${API_BASE}/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newProjectName,
                    githubRepo: newGithubRepo.trim() ? newGithubRepo.trim() : null
                })
            });

            if (res.ok) {
                const created = await res.json();
                setProjects(prev => [created, ...prev]);
                setActiveProject(created);
                setNewProjectName('');
                setNewGithubRepo('');
                setIsCreating(false);
                setIsDropdownOpen(false);
            }
        } catch (error) {
            console.error("Failed to create project", error);
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm("Are you sure you want to delete this project?")) return;

        try {
            const res = await fetch(`${API_BASE}/projects/${projectId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setProjects(prev => prev.filter(p => p._id !== projectId));
                if (activeProject?._id === projectId) {
                    setActiveProject(projects.find(p => p._id !== projectId) || null);
                }
            }
        } catch (error) {
            console.error("Failed to delete project", error);
        }
    };

    if (isLoading) {
        return <div className="animate-pulse h-10 w-48 bg-slate-800 rounded-md"></div>;
    }

    return (
        <div className="relative">
            {/* Active Project Trigger */}
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 hover:bg-slate-800/50 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-800"
            >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Folder className="w-5 h-5" />
                </div>
                <div className="text-left">
                    <h1 className="text-base font-semibold text-slate-100 leading-tight">
                        {activeProject ? activeProject.name : "No Projects Yet"}
                    </h1>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                        {projects.length} workspace{projects.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-slate-950 border border-slate-800 rounded-lg shadow-2xl overflow-hidden z-50">
                    <div className="p-2">
                        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold px-3 py-2">Your Projects</div>

                        <div className="max-h-60 overflow-y-auto space-y-1">
                            {projects.map(proj => (
                                <div key={proj._id} className="flex flex-col group py-1">
                                    <div className="flex items-center justify-between px-2">
                                        <button
                                            onClick={() => {
                                                setActiveProject(proj);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`flex-1 flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors text-left ${activeProject?._id === proj._id ? 'bg-blue-500/10 text-blue-300' : 'text-slate-300 hover:bg-slate-900'}`}
                                        >
                                            <Folder className="w-4 h-4 opacity-70" />
                                            <span className="truncate">{proj.name}</span>
                                        </button>

                                        {/* Show delete only if owner */}
                                        {proj.owner?._id === user?._id && (
                                            <button
                                                onClick={() => handleDeleteProject(proj._id)}
                                                className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-slate-900"
                                                title="Delete Project"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-3 bg-slate-900/50 border-t border-slate-800">
                        {isCreating ? (
                            <form onSubmit={handleCreateProject} className="flex flex-col gap-2">
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Project Name..."
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    className="bg-slate-950 border border-slate-700 text-sm text-slate-200 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="GitHub (e.g. facebook/react)"
                                    value={newGithubRepo}
                                    onChange={(e) => setNewGithubRepo(e.target.value)}
                                    className="bg-slate-950 border border-slate-700 text-sm text-slate-200 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
                                />
                                <div className="flex gap-2 mt-1">
                                    <button type="submit" className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-500 transition-colors">
                                        Save
                                    </button>
                                    <button type="button" onClick={() => setIsCreating(false)} className="flex-1 text-slate-400 bg-slate-800 hover:text-slate-200 px-3 py-1.5 rounded text-sm font-medium">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="w-full flex items-center gap-2 text-sm text-blue-400 font-medium hover:text-blue-300 px-2 py-1.5 rounded transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Create New Project
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectSelector;
