import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
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
    }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
