import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD ? '/' : 'http://localhost:5000');

export const useSocket = (username, token) => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!username || !token) return;

        socketRef.current = io(SOCKET_URL, {
            auth: { token }
        });

        socketRef.current.on('connect', () => {
            setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
            setIsConnected(false);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [username]);

    return { socket: socketRef.current, isConnected };
};
