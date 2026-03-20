import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'],
        default: 'TODO'
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    assignee: {
        type: String, // Storing username directly for MVP simplicity
        required: true
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM'
    },
    branchLink: {
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
