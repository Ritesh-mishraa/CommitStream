import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { CircleDashed, Plus, Hash, Link as LinkIcon, Folder, Settings, Github, Users } from 'lucide-react';
import RepoStatusPanel from '../components/dashboard/RepoStatusPanel';
import QuickActionsPanel from '../components/dashboard/QuickActionsPanel';
import TeamPulsePanel from '../components/dashboard/TeamPulsePanel';
import InviteModal from '../components/dashboard/InviteModal';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const { activeProject, setActiveProject } = useProject();
    const [repoStats, setRepoStats] = useState(null);
    const [collaborators, setCollaborators] = useState([]);
    const [roomName, setRoomName] = useState('');
    const [joinRoomId, setJoinRoomId] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    useEffect(() => {
        const fetchProjectData = async () => {
            if (!activeProject || !token) return;

            try {
                // Fetch Stats
                const statsRes = await fetch(`http://localhost:5000/api/projects/${activeProject._id}/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Fetch Collaborators
                const collabRes = await fetch(`http://localhost:5000/api/projects/${activeProject._id}/collaborators`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });


                if (statsRes.ok) {
                    setRepoStats(await statsRes.json());
                }
                if (collabRes.ok) {
                    setCollaborators(await collabRes.json());
                }
            } catch (error) {
                console.error("Failed to fetch project dynamic data:", error);
            }
        };

        fetchProjectData();
    }, [activeProject, token]);

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!roomName.trim() || !activeProject) return;

        setIsCreating(true);
        try {
            const res = await fetch('http://localhost:5000/api/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                // Pass active project ID to scope the room
                body: JSON.stringify({ name: roomName, hostUsername: user.username, projectId: activeProject._id })
            });

            const data = await res.json();
            navigate(`/room/${data._id}`, { state: { username: user.username } });
        } catch (error) {
            console.error("Failed to create room", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoinRoom = (e) => {
        e.preventDefault();
        let targetId = joinRoomId.trim();
        if (!targetId) return;

        if (targetId.includes('/room/')) {
            targetId = targetId.split('/room/').pop();
        }

        navigate(`/room/${targetId}`);
    };

    return (
        <div className="space-y-6">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 overflow-x-auto">
                
                <div className="flex items-center gap-6 pb-2 md:pb-0">
                    {/* Join Room CTA (Globally Available) */}
                    <form onSubmit={handleJoinRoom} className="flex items-center gap-2">
                        <div className="relative">
                            <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Paste Room ID or URL"
                                value={joinRoomId}
                                onChange={(e) => setJoinRoomId(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 rounded-md pl-9 pr-3 py-1.5 focus:outline-none focus:border-blue-500 transition-colors w-56"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium px-4 py-1.5 rounded-md flex items-center gap-2 transition-colors"
                        >
                            Join
                        </button>
                    </form>

                    {/* Actions (Only show if a project is selected) */}
                    {activeProject && (
                        <>
                            <div className="w-px h-6 bg-slate-100 dark:bg-slate-800"></div>

                            {/* Invite Team CTA */}
                            <button
                                type="button"
                                onClick={() => setIsInviteOpen(true)}
                                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium px-4 py-1.5 rounded-md flex items-center gap-2 transition-colors"
                            >
                                <Users className="w-4 h-4" />
                                Invite
                            </button>

                            {/* Create Room CTA */}
                            <form onSubmit={handleCreateRoom} className="flex items-center gap-2">
                                <div className="relative">
                                    <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="New Room Name"
                                        value={roomName}
                                        onChange={(e) => setRoomName(e.target.value)}
                                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 rounded-md pl-9 pr-3 py-1.5 focus:outline-none focus:border-blue-500 transition-colors w-48"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-slate-100 text-sm font-medium px-4 py-1.5 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {isCreating ? <CircleDashed className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Create
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>

            {/* Dashboard Content (Only render if a project is selected) */}
            {activeProject ? (
                <div className="grid grid-cols-12 gap-6 pb-10">
                    <div className="col-span-12 lg:col-span-3 space-y-4">
                        <RepoStatusPanel
                            project={activeProject}
                            stats={repoStats}
                            setActiveProject={setActiveProject}
                        />
                    </div>
                    <div className="col-span-12 lg:col-span-6 h-full">
                        <QuickActionsPanel project={activeProject} />
                    </div>
                    <div className="col-span-12 lg:col-span-3">
                        <TeamPulsePanel
                            project={activeProject}
                            collaborators={collaborators}
                            setActiveProject={setActiveProject}
                        />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-20 text-slate-500 border border-slate-200 dark:border-slate-800 border-dashed rounded-lg bg-white dark:bg-slate-900/20">
                    <Folder className="w-12 h-12 mb-4 opacity-50" />
                    <p>Select or create a project to load the dashboard.</p>
                </div>
            )}

            <InviteModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                project={activeProject}
            />
        </div>
    );
};

export default Dashboard;
