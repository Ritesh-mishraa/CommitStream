import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Github, Linkedin, Briefcase, GraduationCap, Mail, Edit3, Save, X } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});

    useEffect(() => {
        const savedData = localStorage.getItem('commitstream_user_profile');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setProfileData(parsed);
            setEditData(parsed);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('commitstream_user_profile', JSON.stringify(editData));
        setProfileData(editData);
        setIsEditing(false);
    };

    const handleChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex flex-col gap-6 font-sans">
            <div className="flex justify-between items-end pb-6 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Profile</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your account information</p>
                </div>
                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-700"
                    >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => { setIsEditing(false); setEditData(profileData); }}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 text-sm font-medium rounded-lg transition-colors border border-slate-300 dark:border-slate-700"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-slate-100 text-sm font-medium rounded-lg transition-colors shadow-sm"
                        >
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                    <div className="w-32 h-32 rounded-full border-4 border-slate-100 bg-slate-100 dark:bg-slate-800 mb-6 overflow-hidden flex items-center justify-center">
                        {profileData?.avatarUrl ? (
                            <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div 
                                className="w-full h-full flex items-center justify-center text-5xl font-bold text-slate-900 dark:text-slate-100"
                                style={{ backgroundColor: user?.avatarColor || '#333' }}
                            >
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    
                    {isEditing ? (
                        <input 
                            name="fullName"
                            value={editData.fullName || ''}
                            onChange={handleChange}
                            className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1 text-center border-b border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 px-2 py-1 bg-transparent"
                            placeholder="Full Name"
                        />
                    ) : (
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                            {profileData?.fullName || user?.username || 'Awesome Developer'}
                        </h2>
                    )}
                    
                    <p className="text-sm text-slate-500 mb-6 flex items-center justify-center w-full gap-2">
                        <Mail className="w-4 h-4" />
                        {user?.email || 'dev@example.com'}
                    </p>

                    <div className="w-full flex gap-3 mt-4">
                        {isEditing ? (
                            <input 
                                name="github"
                                value={editData.github || ''}
                                onChange={handleChange}
                                className="flex-1 w-full text-sm border-b border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 px-2 py-1 text-center bg-transparent"
                                placeholder="GitHub Username"
                            />
                        ) : profileData?.github ? (
                            <a href={`https://github.com/${profileData.github}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-100 transition-colors">
                                <Github className="w-4 h-4" />
                                GitHub
                            </a>
                        ) : null}

                        {isEditing ? (
                            <input 
                                name="linkedin"
                                value={editData.linkedin || ''}
                                onChange={handleChange}
                                className="flex-1 w-full text-sm border-b border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 px-2 py-1 text-center bg-transparent"
                                placeholder="LinkedIn Username"
                            />
                        ) : profileData?.linkedin ? (
                            <a href={`https://linkedin.com/in/${profileData.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">
                                <Linkedin className="w-4 h-4 text-blue-500" />
                                LinkedIn
                            </a>
                        ) : null}
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6 pb-4 border-b border-slate-100">
                            Personal Details
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Account Role</label>
                                {isEditing ? (
                                    <select 
                                        name="role"
                                        value={editData.role || ''}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none"
                                    >
                                        <option value="student">Student / Learner</option>
                                        <option value="professional">Working Professional</option>
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                                        {profileData?.role === 'professional' ? (
                                            <><Briefcase className="w-4 h-4 text-emerald-500" /> Working Professional</>
                                        ) : (
                                            <><GraduationCap className="w-4 h-4 text-blue-500" /> Student / Learner</>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Gender</label>
                                {isEditing ? (
                                    <select 
                                        name="gender"
                                        value={editData.gender || ''}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 text-sm focus:outline-none"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="non-binary">Non-binary</option>
                                        <option value="prefer-not-to-say">Prefer not to say</option>
                                    </select>
                                ) : (
                                    <p className="text-slate-800 dark:text-slate-200 font-medium capitalize">
                                        {profileData?.gender ? profileData.gender.replace('-', ' ') : 'Not specified'}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Username</label>
                                <p className="text-slate-800 dark:text-slate-200 font-medium">@{user?.username}</p>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Member Since</label>
                                <p className="text-slate-800 dark:text-slate-200 font-medium">March 2026</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
