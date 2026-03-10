import mongoose from 'mongoose';

const conflictReportSchema = new mongoose.Schema({
    branchA: {
        type: String,
        required: true
    },
    branchB: {
        type: String,
        required: true
    },
    conflictingFiles: [{
        type: String
    }],
    autoResolved: [{
        file: String,
        resolutionStrategy: String
    }],
    severity: {
        type: String,
        enum: ['LOW', 'MED', 'HIGH', 'LOCKFILE_CONFLICT', 'COMPONENT_CONFLICT'],
        default: 'LOW'
    }
}, { timestamps: true });

export default mongoose.model('ConflictReport', conflictReportSchema);
