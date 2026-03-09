import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
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
