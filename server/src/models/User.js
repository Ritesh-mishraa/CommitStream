import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    avatarColor: {
        type: String,
        default: '#4f46e5' // Indigo-600
    },
    socketId: {
        type: String,
        default: null
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
