import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Github, Linkedin, User, Briefcase, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Onboarding = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        role: 'student',
        fullName: '',
        gender: '',
        github: '',
        linkedin: '',
        avatarUrl: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarUpload = (e) => {
        // Mock file upload: Just creating a local object URL to preview
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setFormData({ ...formData, avatarUrl: url });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Mock saving data to backend/context
        // In reality, this would be an API call to update the user's profile
        localStorage.setItem('commitstream_user_profile', JSON.stringify(formData));
        
        setTimeout(() => {
            setIsSubmitting(false);
            navigate('/dashboard');
        }, 1500); // simulate API delay
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome aboard!</h1>
                    <p className="text-slate-400">Let's set up your profile to personalize your experience.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3">I am a...</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, role: 'student'})}
                                className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${formData.role === 'student' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'}`}
                            >
                                <GraduationCap className="w-8 h-8 mb-2" />
                                <span className="font-medium">Student</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, role: 'professional'})}
                                className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${formData.role === 'professional' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'}`}
                            >
                                <Briefcase className="w-8 h-8 mb-2" />
                                <span className="font-medium">Professional</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center justify-center md:col-span-2 py-4">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-600 bg-slate-800 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-blue-400">
                                    {formData.avatarUrl ? (
                                        <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 text-slate-500 group-hover:text-blue-400 transition-colors" />
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors border-2 border-slate-900">
                                    <Camera className="w-4 h-4" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                </label>
                            </div>
                            <span className="text-xs text-slate-500 mt-3">Upload a profile picture</span>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                            <input
                                required
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Jimi Hendrix"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Gender</label>
                            <select 
                                required
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-all appearance-none"
                            >
                                <option value="" disabled className="text-slate-600">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="non-binary">Non-binary</option>
                                <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                        </div>

                         {/* Github */}
                         <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                                <Github className="w-4 h-4 text-slate-400" />
                                GitHub Username
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">github.com/</span>
                                <input
                                    name="github"
                                    value={formData.github}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-24 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    placeholder="username"
                                />
                            </div>
                        </div>

                        {/* LinkedIn */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                                <Linkedin className="w-4 h-4 text-blue-500" />
                                LinkedIn Profile
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">linkedin.com/in/</span>
                                <input
                                    name="linkedin"
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-28 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    placeholder="username"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Complete Setup
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </motion.div>
        </div>
    );
};

export default Onboarding;
