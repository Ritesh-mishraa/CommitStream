import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import session from 'express-session';
import passport from 'passport';
import configurePassport from './config/passport.js';
import path from 'path';
import { fileURLToPath } from 'url';

import roomsRouter from './routes/rooms.js';
import branchesRouter from './routes/branches.js';
import conflictsRouter from './routes/conflicts.js';
import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import tasksRouter from './routes/tasks.js';
import auditsRouter from './routes/audits.js';
import insightsRouter from './routes/insights.js';
import messagesRouter from './routes/messages.js';
import { setupSwagger } from './config/swagger.js';

dotenv.config();

// Initialize DB Connection
connectDB();

const app = express();
const server = createServer(app);

// Socket.io setup
export const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' 
            ? process.env.RENDER_EXTERNAL_URL 
            : "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

app.use(session({
    secret: process.env.JWT_SECRET || 'fallback_session_secret_for_dev',
    resave: false,
    saveUninitialized: false
}));

configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Swagger Docs
setupSwagger(app);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/branches', branchesRouter);
app.use('/api/conflicts', conflictsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/audits', auditsRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/messages', messagesRouter);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../client/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../../client/dist', 'index.html'));
    });
}

// Setup socket events
import('./socket/index.js');

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
