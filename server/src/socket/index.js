import { io } from '../index.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getSecret = () => process.env.JWT_SECRET || 'fallback_secret_for_development_do_not_use_in_prod';

// Socket Auth Middleware
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Authentication error: Token missing'));

        const decoded = jwt.verify(token, getSecret());
        const user = await User.findById(decoded.userId).select('-passwordHash');
        if (!user) return next(new Error('Authentication error: User not found'));

        socket.user = user;
        next();
    } catch (err) {
        return next(new Error('Authentication error: Invalid token'));
    }
});

export const handleSocketConnection = (socket) => {
    console.log(`User connected via socket: ${socket.user.username} (${socket.id})`);

    socket.on('join-room', ({ roomId, username }) => {
        socket.join(roomId);
        socket.roomId = roomId;
        socket.username = username;
        console.log(`${username} joined room ${roomId}`);
    });

    socket.on('webrtc:ready', () => {
        if (!socket.roomId) return;
        // Broadcast to others in the room ONLY when media is ready
        socket.to(socket.roomId).emit('user-joined', {
            socketId: socket.id,
            username: socket.username
        });
        console.log(`${socket.username} is WebRTC ready in ${socket.roomId}`);
    });

    socket.on('leave-room', () => {
        if (socket.roomId) {
            socket.leave(socket.roomId);
            socket.to(socket.roomId).emit('user-left', { socketId: socket.id, username: socket.username });
            socket.roomId = null;
        }
    });

    socket.on('send-message', ({ roomId, message }) => {
        // Broadcast msg to everyone except sender
        socket.to(roomId).emit('new-message', {
            socketId: socket.id,
            username: socket.username,
            text: message,
            timestamp: new Date().toISOString()
        });
    });

    socket.on('cursor-update', ({ roomId, file, line }) => {
        socket.to(roomId).emit('remote-cursor-update', {
            socketId: socket.id,
            username: socket.username,
            file,
            line
        });
    });

    // --- WebRTC Signaling ---

    socket.on('webrtc:offer', ({ to, offer }) => {
        socket.to(to).emit('webrtc:offer-received', {
            from: socket.id,
            offer
        });
    });

    socket.on('webrtc:answer', ({ to, answer }) => {
        socket.to(to).emit('webrtc:answer-received', {
            from: socket.id,
            answer
        });
    });

    socket.on('webrtc:ice', ({ to, candidate }) => {
        socket.to(to).emit('webrtc:ice-received', {
            from: socket.id,
            candidate
        });
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        if (socket.roomId) {
            socket.to(socket.roomId).emit('user-left', { socketId: socket.id, username: socket.username });
        }
    });
};

io.on('connection', handleSocketConnection);
