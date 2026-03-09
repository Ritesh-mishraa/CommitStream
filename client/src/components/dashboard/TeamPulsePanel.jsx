import { Users } from 'lucide-react';

const TeamPulsePanel = () => {
    return (
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
    );
};

export default TeamPulsePanel;
