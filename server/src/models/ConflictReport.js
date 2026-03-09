import mongoose from 'mongoose';

const conflictReportSchema = new mongoose.Schema({
    branchA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    branchB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
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
