import { io } from '../index.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getSecret = () => process.env.JWT_SECRET || 'fallback_secret_for_development_do_not_use_in_prod';

// Storage for presence tracking
const onlineUsersByProject = new Map(); // projectId -> Array of { userId, username, socketId, avatarColor }

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

    socket.on('webrtc:screen-share-id', ({ streamId }) => {
        if (socket.roomId) {
            socket.to(socket.roomId).emit('webrtc:screen-share-id', {
                from: socket.id,
                streamId
            });
        }
    });

    socket.on('webrtc:screen-share-stopped', ({ streamId }) => {
        if (socket.roomId) {
            socket.to(socket.roomId).emit('webrtc:screen-share-stopped', {
                from: socket.id,
                streamId
            });
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        if (socket.roomId) {
            socket.to(socket.roomId).emit('user-left', { socketId: socket.id, username: socket.username });
        }
        
        // Handle global project presence departure
        if (socket.activeProjectId) {
            let users = onlineUsersByProject.get(socket.activeProjectId) || [];
            users = users.filter(u => u.socketId !== socket.id);
            onlineUsersByProject.set(socket.activeProjectId, users);
            io.to(`project-${socket.activeProjectId}`).emit('presence-update', users);
        }
    });

    // --- Global Presence System ---

    socket.on('join-project', ({ projectId, user }) => {
        if (!projectId || !user) return;
        
        socket.join(`project-${projectId}`);
        socket.activeProjectId = projectId;
        
        let users = onlineUsersByProject.get(projectId) || [];
        // Optional: Filter out duplicate sessions for the same user if desired, 
        // but keeping it simple: just add this socket connection to the pool.
        // We will deduplicate on the frontend by userId.
        users = users.filter(u => u.socketId !== socket.id); // safety
        users.push({ userId: user._id.toString(), username: user.username, socketId: socket.id, avatarColor: user.avatarColor });
        
        onlineUsersByProject.set(projectId, users);
        
        io.to(`project-${projectId}`).emit('presence-update', users);
    });

    socket.on('leave-project', ({ projectId }) => {
        if (!projectId) return;
        socket.leave(`project-${projectId}`);
        socket.activeProjectId = null;
        
        let users = onlineUsersByProject.get(projectId) || [];
        users = users.filter(u => u.socketId !== socket.id);
        onlineUsersByProject.set(projectId, users);
        
        io.to(`project-${projectId}`).emit('presence-update', users);
    });
};

io.on('connection', handleSocketConnection);
