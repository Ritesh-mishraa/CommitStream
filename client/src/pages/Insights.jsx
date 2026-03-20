import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, GitMerge, FileCode2, Users, LayoutDashboard, Database, CheckSquare, Folder } from 'lucide-react';

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000/api';

const Insights = () => {
    const { token } = useAuth();
    const { activeProject } = useProject();
    
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token || !activeProject) {
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        fetch(`${API_BASE}/insights?projectId=${activeProject._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(resData => {
                setData(resData);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [token, activeProject]);

    if (!activeProject) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-slate-500 border border-slate-200 dark:border-slate-800 border-dashed rounded-lg bg-white dark:bg-slate-900/20">
                <Folder className="w-12 h-12 mb-4 opacity-50" />
                <p>Select a project from the topbar to view Repository Insights.</p>
            </div>
        );
    }

    if (isLoading || !data) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-slate-500">
                <Activity className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                <p>Loading analytics data...</p>
            </div>
        );
    }

    // Pie chart colors
    const COLORS = ['#64748b', '#3b82f6', '#f59e0b', '#10b981'];

    return (
        <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <LayoutDashboard className="w-6 h-6 text-indigo-500" />
                    Repository Insights
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Performance analytics and team task velocity for <span className="font-semibold">{activeProject.name}</span>.
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg shrink-0">
                        <CheckSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Tasks</p>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{data.totalTasks || 0}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-lg shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Collaborators</p>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{data.collaboratorsCount || 0}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0">
                        <GitMerge className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Merge Health</p>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                            <Activity className="w-4 h-4 text-emerald-500" /> Stable
                        </h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center gap-4 shadow-sm overflow-hidden">
                    <div className="p-3 bg-slate-500/10 text-slate-500 rounded-lg shrink-0">
                        <Database className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Repository</p>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate w-full" title={data.githubRepo}>{data.githubRepo}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Line Chart */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" /> Branch Activity Trends (Week)
                    </h3>
                    <div className="h-64 w-full text-slate-800 dark:text-slate-200 text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.weeklyActivity} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" dark:stroke="#334155" opacity={0.5} />
                                <XAxis dataKey="day" stroke="currentColor" tickMargin={10} />
                                <YAxis stroke="currentColor" />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: 'var(--tw-prose-invert, #1e293b)', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Line type="monotone" dataKey="activeBranches" name="Active Branches" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="merges" name="Safe Merges" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm flex flex-col h-full">
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-blue-500" /> Task Status Distribution
                    </h3>
                    
                    {data.taskStats && data.taskStats.reduce((a, b) => a + b.value, 0) > 0 ? (
                        <div className="flex-1 flex flex-col sm:flex-row items-center justify-center">
                            <div className="h-56 w-56 text-slate-800 dark:text-slate-200 text-xs">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.taskStats}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {data.taskStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            contentStyle={{ backgroundColor: 'var(--tw-prose-invert, #1e293b)', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', padding: '8px 12px' }}
                                            itemStyle={{ color: '#e2e8f0' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-col gap-3 mt-4 sm:mt-0 sm:ml-8">
                                {data.taskStats.map((stat, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: stat.color }}></div>
                                        <span className="text-sm text-slate-600 dark:text-slate-400 w-24">{stat.name}</span>
                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm p-10">
                            No tasks have been created in the Kanban board yet.
                        </div>
                    )}
                </div>

                {/* Bar Chart (Priorities) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm lg:col-span-2">
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                        <FileCode2 className="w-5 h-5 text-orange-500" /> Task Priority Heatmap
                    </h3>
                    
                    {data.priorities && data.priorities.reduce((a, b) => a + b.value, 0) > 0 ? (
                        <div className="h-64 w-full text-slate-800 dark:text-slate-200 text-xs">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.priorities} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" dark:stroke="#334155" opacity={0.5} horizontal={true} vertical={false} />
                                    <XAxis type="number" stroke="currentColor" allowDecimals={false} />
                                    <YAxis dataKey="name" type="category" stroke="currentColor" width={60} />
                                    <RechartsTooltip 
                                        cursor={{fill: 'var(--tw-prose-invert, rgba(241, 245, 249, 0.5))'}}
                                        contentStyle={{ backgroundColor: 'var(--tw-prose-invert, #1e293b)', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                        {data.priorities.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                            Task priorities will appear here once tasks are managed.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Insights;
