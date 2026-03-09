import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filesChanged: [{
        type: String
    }],
    lastCommit: {
        type: String
    }
}, { timestamps: true });

export default mongoose.model('Branch', branchSchema);
