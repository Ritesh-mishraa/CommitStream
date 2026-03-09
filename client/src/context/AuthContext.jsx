import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            fetchUser();
        } else {
            localStorage.removeItem('token');
            setUser(null);
            setIsLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const res = await fetch(`${API_BASE}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setToken(null);
            }
        } catch (error) {
            console.error('Failed to fetch user', error);
            setToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');

        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const register = async (username, email, password) => {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');

        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
