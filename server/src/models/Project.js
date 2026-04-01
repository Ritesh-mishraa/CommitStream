import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    githubRepo: {
        type: String,
        default: null, // e.g., "facebook/react"
        trim: true
    },
    status: {
        type: String,
        enum: ['Planning', 'Active', 'Completed', 'Archived'],
        default: 'Active'
    },
    joinCode: {
        type: String,
        default: null,
        trim: true,
        sparse: true,
        unique: true
    }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
