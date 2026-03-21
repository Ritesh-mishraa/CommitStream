import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    githubId: {
        type: String,
        required: true,
        unique: true
    },
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
    avatarUrl: {
        type: String,
        default: ''
    },
    githubAccessToken: {
        type: String,
        default: null
    },
    socketId: {
        type: String,
        default: null
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
