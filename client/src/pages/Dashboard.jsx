import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    GitBranch, GitPullRequest, Clock, CheckCircle2,
    CircleDashed, Play, Plus, Users, Hash
} from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [roomName, setRoomName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!roomName.trim()) return;

        setIsCreating(true);
        try {
            // Mock user for MVP
            const username = `Dev_${Math.floor(Math.random() * 1000)}`;

            const res = await fetch('http://localhost:5000/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: roomName, hostUsername: username })
            });

            const data = await res.json();
            // Pass username in state to useSocket on the next page
            navigate(`/room/${data._id}`, { state: { username } });
        } catch (error) {
            console.error("Failed to create room", error);
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-6">

            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-100 mb-1">Project Overview</h1>
                    <p className="text-sm text-zinc-500">CommitStream Monorepo</p>
                </div>

                {/* Create Room CTA */}
                <form onSubmit={handleCreateRoom} className="flex items-center gap-2">
                    <div className="relative">
                        <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Room Name"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 rounded-md pl-9 pr-3 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors w-48"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isCreating}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-1.5 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isCreating ? <CircleDashed className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        New Live Room
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-12 gap-6">

                {/* Left Panel: Repo Status */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
                        <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2">
                            <GitBranch className="w-4 h-4 text-zinc-500" /> Repository Log
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-500">Active Branches</span>
                                <span className="text-zinc-200 font-mono bg-zinc-800 px-2 py-0.5 rounded">4</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-500">Open PRs</span>
                                <span className="text-zinc-200 font-mono bg-zinc-800 px-2 py-0.5 rounded">2</span>
                            </div>

                            <div className="h-px bg-zinc-800 w-full my-4"></div>

                            <div className="space-y-2">
                                <div className="text-xs text-zinc-500">Last Commit (main)</div>
                                <div className="text-sm text-zinc-300 font-mono truncate">
                                    <span className="text-indigo-400 mr-2">a1b2c3d</span>
                                    Merge UI overhaul
                                </div>
                                <div className="text-xs text-zinc-600 flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" /> 2 hours ago by @alice
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Panel: Task List */}
                <div className="col-span-12 lg:col-span-6">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden flex flex-col h-full">
                        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                            <h3 className="text-sm font-medium text-zinc-300">Active Board</h3>
                            <span className="text-xs text-zinc-500">Sprint 14</span>
                        </div>

                        <div className="flex-1 overflow-auto">
                            {/* High Density Table */}
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-800 text-zinc-500">
                                        <th className="px-4 py-3 font-normal">Task</th>
                                        <th className="px-4 py-3 font-normal">Assignee</th>
                                        <th className="px-4 py-3 font-normal">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                                    <tr className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-4 py-3">Implement WebRTC signaling over Socket.io</td>
                                        <td className="px-4 py-3"><span className="text-indigo-400 text-xs bg-indigo-500/10 px-2 py-1 rounded-full">@alice</span></td>
                                        <td className="px-4 py-3"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></td>
                                    </tr>
                                    <tr className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-4 py-3">Build smart conflict predictor logic</td>
                                        <td className="px-4 py-3"><span className="text-teal-400 text-xs bg-teal-500/10 px-2 py-1 rounded-full">@bob</span></td>
                                        <td className="px-4 py-3"><Play className="w-4 h-4 text-indigo-400 fill-indigo-400/20" /></td>
                                    </tr>
                                    <tr className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-4 py-3">Dockerize PostgreSQL and Express</td>
                                        <td className="px-4 py-3"><span className="text-zinc-400 text-xs bg-zinc-800 px-2 py-1 rounded-full">Unassigned</span></td>
                                        <td className="px-4 py-3"><CircleDashed className="w-4 h-4 text-zinc-600" /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Active Presence */}
                <div className="col-span-12 lg:col-span-3">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 h-full">
                        <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center justify-between">
                            <span className="flex items-center gap-2"><Users className="w-4 h-4 text-zinc-500" /> Team Pulse</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center text-sm font-medium border border-pink-500/20 mt-1">A</div>
                                <div>
                                    <div className="text-sm text-zinc-200">Alice</div>
                                    <div className="text-xs text-zinc-500 font-mono mt-0.5 truncate">Viewing src/hooks/useAuth.js</div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center text-sm font-medium border border-teal-500/20 mt-1">B</div>
                                <div>
                                    <div className="text-sm text-zinc-200">Bob</div>
                                    <div className="text-xs text-zinc-500 font-mono mt-0.5 truncate">Editing components/UserCard</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
