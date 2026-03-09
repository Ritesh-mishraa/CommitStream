import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

import roomsRouter from './routes/rooms.js';
import branchesRouter from './routes/branches.js';
import conflictsRouter from './routes/conflicts.js';
import { setupSwagger } from './config/swagger.js';

dotenv.config();

// Initialize DB Connection
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
export const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

// Swagger Docs
setupSwagger(app);

// Routes
app.use('/api/rooms', roomsRouter);
app.use('/api/branches', branchesRouter);
app.use('/api/conflicts', conflictsRouter);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Setup socket events
import('./socket/index.js');

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
