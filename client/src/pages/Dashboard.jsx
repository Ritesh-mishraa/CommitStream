import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircleDashed, Plus, Hash, Link as LinkIcon, Folder } from 'lucide-react';
import ProjectSelector from '../components/dashboard/ProjectSelector';
import RepoStatusPanel from '../components/dashboard/RepoStatusPanel';
import ActiveTasksBoard from '../components/dashboard/ActiveTasksBoard';
import TeamPulsePanel from '../components/dashboard/TeamPulsePanel';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [activeProject, setActiveProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [repoStats, setRepoStats] = useState(null);
    const [roomName, setRoomName] = useState('');
    const [joinRoomId, setJoinRoomId] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const fetchProjectData = async () => {
            if (!activeProject || !token) return;

            try {
                // Fetch Tasks
                const tasksRes = await fetch(`http://localhost:5000/api/tasks?projectId=${activeProject._id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Fetch Stats
                const statsRes = await fetch(`http://localhost:5000/api/projects/${activeProject._id}/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (tasksRes.ok) {
                    setTasks(await tasksRes.json());
                }
                if (statsRes.ok) {
                    setRepoStats(await statsRes.json());
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                {/* Dynamic Project Selector */}
                <ProjectSelector
                    activeProject={activeProject}
                    setActiveProject={setActiveProject}
                />

                <div className="flex items-center gap-6">
                    {/* Join Room CTA (Globally Available) */}
                    <form onSubmit={handleJoinRoom} className="flex items-center gap-2">
                        <div className="relative">
                            <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Paste Room ID or URL"
                                value={joinRoomId}
                                onChange={(e) => setJoinRoomId(e.target.value)}
                                className="bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 rounded-md pl-9 pr-3 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors w-56"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium px-4 py-1.5 rounded-md flex items-center gap-2 transition-colors"
                        >
                            Join
                        </button>
                    </form>

                    {/* Actions (Only show if a project is selected) */}
                    {activeProject && (
                        <>
                            <div className="w-px h-6 bg-zinc-800"></div>

                            {/* Create Room CTA */}
                            <form onSubmit={handleCreateRoom} className="flex items-center gap-2">
                                <div className="relative">
                                    <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        type="text"
                                        placeholder="New Room Name"
                                        value={roomName}
                                        onChange={(e) => setRoomName(e.target.value)}
                                        className="bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 rounded-md pl-9 pr-3 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors w-48"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-1.5 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
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
                        <RepoStatusPanel project={activeProject} stats={repoStats} />
                    </div>
                    <div className="col-span-12 lg:col-span-6">
                        <ActiveTasksBoard project={activeProject} tasks={tasks} />
                    </div>
                    <div className="col-span-12 lg:col-span-3">
                        <TeamPulsePanel project={activeProject} />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-20 text-zinc-500 border border-zinc-800 border-dashed rounded-lg bg-zinc-900/20">
                    <Folder className="w-12 h-12 mb-4 opacity-50" />
                    <p>Select or create a project to load the dashboard.</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
