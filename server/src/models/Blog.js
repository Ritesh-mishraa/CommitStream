import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    content: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['GitHub', 'AI Industry', 'Job Market', 'General Tech'],
        default: 'General Tech'
    },
    tags: {
        type: [String],
        default: []
    },
    sourceUrl: {
        type: String,
        default: ''
    },
    sourceName: {
        type: String,
        default: ''
    },
    imageUrl: {
        type: String,
        default: ''
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    // Advanced SEO fields
    metaTitle: {
        type: String,
        trim: true
    },
    metaDescription: {
        type: String,
        trim: true
    },
    keywords: {
        type: String,
        trim: true
    },
    // High impact news highlight
    isHighImpact: {
        type: Boolean,
        default: false
    },
    impactLabel: {
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true });

// Indexing for search performance
blogSchema.index({ title: 'text', content: 'text', summary: 'text', tags: 'text' });

export default mongoose.model('Blog', blogSchema);
