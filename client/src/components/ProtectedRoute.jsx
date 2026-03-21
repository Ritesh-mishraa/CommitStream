import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
    const { user, isLoading } = useAuth();

    // While fetching the JWT token handshake, suspend rendering the UI safely
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
                <p className="text-sm text-slate-500 mt-4 animate-pulse">Establishing Secure Context...</p>
            </div>
        );
    }

    // Handshake failed, destroy local access and redirect to the Authentication landing gate
    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    // Authorized! Hydrate and render the inner Protected Route layer
    return <Outlet />;
};

export default ProtectedRoute;
