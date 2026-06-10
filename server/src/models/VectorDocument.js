import mongoose from 'mongoose';

const vectorDocumentSchema = new mongoose.Schema({
    projectId: {
        type: String,
        required: true,
        index: true
    },
    filename: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    embedding: {
        type: [Number],
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

// Create a compound index for fast queries by projectId and filename
vectorDocumentSchema.index({ projectId: 1, filename: 1 });

export default mongoose.models.VectorDocument || mongoose.model('VectorDocument', vectorDocumentSchema);
