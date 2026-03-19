import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Github, Linkedin, Briefcase, GraduationCap, Mail, Edit3 } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        // Load mock profile data from local storage
        const savedData = localStorage.getItem('commitstream_user_profile');
        if (savedData) {
            setProfileData(JSON.parse(savedData));
        }
    }, []);

    return (
        <div className="flex flex-col gap-6 font-sans">
            <div className="flex justify-between items-end pb-6 border-b border-slate-800">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">My Profile</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your account information</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-700">
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Avatar & Basic Info */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center">
                    <div className="w-32 h-32 rounded-full border-4 border-slate-800 bg-slate-800 mb-6 overflow-hidden flex items-center justify-center">
                        {profileData?.avatarUrl ? (
                            <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div 
                                className="w-full h-full flex items-center justify-center text-5xl font-bold text-white"
                                style={{ backgroundColor: user?.avatarColor || '#333' }}
                            >
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    
                    <h2 className="text-xl font-bold text-white mb-1">
                        {profileData?.fullName || user?.username || 'Awesome Developer'}
                    </h2>
                    
                    <p className="text-sm text-slate-400 mb-6 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {user?.email || 'dev@example.com'}
                    </p>

                    <div className="w-full flex gap-3 mt-4">
                        {profileData?.github && (
                            <a href={`https://github.com/${profileData.github}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                                <Github className="w-4 h-4" />
                                GitHub
                            </a>
                        )}
                        {profileData?.linkedin && (
                            <a href={`https://linkedin.com/in/${profileData.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-blue-400 transition-colors">
                                <Linkedin className="w-4 h-4 text-blue-500" />
                                LinkedIn
                            </a>
                        )}
                    </div>
                </div>

                {/* Right Column: Detailed Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6 pb-4 border-b border-slate-800">
                            Personal Details
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Account Role</label>
                                <div className="flex items-center gap-2 text-slate-200 font-medium">
                                    {profileData?.role === 'professional' ? (
                                        <><Briefcase className="w-4 h-4 text-emerald-400" /> Working Professional</>
                                    ) : (
                                        <><GraduationCap className="w-4 h-4 text-blue-400" /> Student / Learner</>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Gender</label>
                                <p className="text-slate-200 font-medium capitalize">
                                    {profileData?.gender ? profileData.gender.replace('-', ' ') : 'Not specified'}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Username</label>
                                <p className="text-slate-200 font-medium">@{user?.username}</p>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Member Since</label>
                                <p className="text-slate-200 font-medium">March 2026</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
