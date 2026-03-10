import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    avatarColor: {
        type: String,
        default: '#4f46e5' // Indigo-600
    },
    socketId: {
        type: String,
        default: null
    },
    githubPat: {
        type: String,
        default: null
    },
    githubUsername: {
        type: String,
        default: null
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
