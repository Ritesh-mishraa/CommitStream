import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
    const { loginWithToken } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');

        if (token) {
            loginWithToken(token);
            navigate('/dashboard', { replace: true });
        } else {
            navigate('/auth?error=oauth_failed', { replace: true });
        }
    }, [location, loginWithToken, navigate]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            <Loader2 className="animate-spin text-blue-500 w-10 h-10 mb-4" />
            <h2 className="text-lg font-medium text-slate-800 dark:text-slate-200 tracking-tight">Authenticating with GitHub...</h2>
            <p className="text-sm text-slate-500 mt-2">Securing your workspace credentials.</p>
        </div>
    );
};

export default AuthCallback;
