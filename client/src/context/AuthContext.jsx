import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = useCallback(async (currentToken) => {
        try {
            const res = await fetch(`${API_BASE}/auth/me`, {
                headers: { Authorization: `Bearer ${currentToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setToken(null);
                setUser(null);
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Failed to fetch user', error);
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            fetchUser(token);
        } else {
            localStorage.removeItem('token');
            setUser(null);
            setIsLoading(false);
        }
    }, [token, fetchUser]);

    const loginWithToken = (newToken) => {
        setToken(newToken);
        // fetchUser is triggered automatically by the useEffect
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    const updateUser = (newData) => {
        setUser(prev => ({ ...prev, ...newData }));
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, loginWithToken, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
