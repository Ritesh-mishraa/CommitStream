import { VectorStore } from '@langchain/core/vectorstores';
import { Document } from '@langchain/core/documents';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import VectorDocument from '../models/VectorDocument.js';
import Project from '../models/Project.js';
import { fetchRepoTreeRecursive, fetchFileContent, fetchRepoDetails } from './githubService.js';

dotenv.config();

// Helper for Cosine Similarity calculation
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Custom Mongoose-based local vector store for zero-config persistence
export class MongooseVectorStore extends VectorStore {
    constructor(embeddings, fields) {
        super(embeddings, fields);
        this.projectId = fields.projectId;
    }

    async addVectors(vectors, documents) {
        const docs = vectors.map((vector, idx) => ({
            projectId: this.projectId,
            filename: documents[idx].metadata.filename || '',
            text: documents[idx].pageContent,
            embedding: vector,
            metadata: documents[idx].metadata
        }));
        await VectorDocument.insertMany(docs);
    }

    async addDocuments(documents) {
        if (!documents || documents.length === 0) return;
        const texts = documents.map(({ pageContent }) => pageContent);
        const vectors = await this.embeddings.embedDocuments(texts);
        return this.addVectors(vectors, documents);
    }

    async similaritySearchVectorWithScore(query, k) {
        // Fetch all documents for this project
        const docs = await VectorDocument.find({ projectId: this.projectId }).lean();
        if (!docs || docs.length === 0) return [];
        
        const scoredDocs = docs.map(doc => {
            const similarity = cosineSimilarity(query, doc.embedding);
            return [
                new Document({ pageContent: doc.text, metadata: doc.metadata }),
                similarity
            ];
        });
        
        // Sort descending by similarity score
        scoredDocs.sort((a, b) => b[1] - a[1]);
        return scoredDocs.slice(0, k);
    }

    _vectorstoreType() {
        return "mongoose";
    }
}

// Custom In-Memory Vector Store to avoid external peer dependency issues
export class MemoryVectorStore extends VectorStore {
    constructor(embeddings, fields = {}) {
        super(embeddings, fields);
        this.docs = [];
    }

    async addVectors(vectors, documents) {
        vectors.forEach((vector, idx) => {
            this.docs.push({
                text: documents[idx].pageContent,
                embedding: vector,
                metadata: documents[idx].metadata
            });
        });
    }

    async addDocuments(documents) {
        if (!documents || documents.length === 0) return;
        const texts = documents.map(({ pageContent }) => pageContent);
        const vectors = await this.embeddings.embedDocuments(texts);
        return this.addVectors(vectors, documents);
    }

    async similaritySearchVectorWithScore(query, k) {
        const scoredDocs = this.docs.map(doc => {
            const similarity = cosineSimilarity(query, doc.embedding);
            return [
                new Document({ pageContent: doc.text, metadata: doc.metadata }),
                similarity
            ];
        });
        scoredDocs.sort((a, b) => b[1] - a[1]);
        return scoredDocs.slice(0, k);
    }

    _vectorstoreType() {
        return "memory";
    }
}

// Global cache for MemoryVectorStore instances
let memoryStores = {};

/**
 * Gets a configured LangChain VectorStore instance.
 * Supports 'memory' and 'mongoose' backends dynamically.
 */
export const getVectorStore = async (projectId) => {
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        modelName: "gemini-embedding-001", // Standard Gemini embedding model
    });

    const storeType = process.env.VECTOR_STORE_TYPE || 'mongoose';

    if (storeType === 'memory') {
        if (!memoryStores[projectId]) {
            memoryStores[projectId] = new MemoryVectorStore(embeddings);
        }
        return memoryStores[projectId];
    } else {
        return new MongooseVectorStore(embeddings, { projectId });
    }
};

/**
 * Indexes a project's entire codebase from GitHub.
 * Recursively fetches text-based codebase files, chunks them, embeds them, and persists them.
 */
export const indexProjectCodebase = async (projectId, pat = null) => {
    try {
        const project = await Project.findById(projectId);
        if (!project || !project.githubRepo) {
            throw new Error(`Project ${projectId} not found or has no GitHub repo configured.`);
        }

        const repo = project.githubRepo;
        
        // 1. Discover the default branch
        const repoDetails = await fetchRepoDetails(repo, pat);
        const defaultBranch = repoDetails.default_branch || 'main';

        console.log(`[RAG Service] Fetching codebase files recursively from ${repo} on branch "${defaultBranch}"...`);

        // 2. Fetch all file entries
        const fileList = await fetchRepoTreeRecursive(repo, defaultBranch, pat);
        
        // 3. Filter for text-based development files (exclude binaries, build artifacts, lockfiles, hidden directories)
        const indexableExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs', '.c', '.cpp', '.h', '.html', '.css', '.md', '.json', '.yml', '.yaml', '.txt'];
        const filteredFiles = fileList.filter(file => {
            const ext = file.path.includes('.') ? file.path.substring(file.path.lastIndexOf('.')).toLowerCase() : '';
            const isBinary = file.size > 200000; // Limit to files < 200KB to reduce noise and rate limits
            const isLockfile = file.path.endsWith('package-lock.json') || file.path.endsWith('yarn.lock') || file.path.endsWith('pnpm-lock.yaml');
            const isHidden = file.path.startsWith('.') || file.path.includes('/.');
            const isNodeModules = file.path.includes('node_modules/');

            return indexableExtensions.includes(ext) && !isBinary && !isLockfile && !isHidden && !isNodeModules;
        });

        console.log(`[RAG Service] Found ${filteredFiles.length} files to index out of ${fileList.length} total repository files.`);

        // 4. Chunk content using standard LangChain splitter
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const allDocs = [];

        // Fetch contents in small batches to prevent hitting GitHub rate limits
        const batchSize = 10;
        for (let i = 0; i < filteredFiles.length; i += batchSize) {
            const batch = filteredFiles.slice(i, i + batchSize);
            const batchPromises = batch.map(async (file) => {
                try {
                    const content = await fetchFileContent(repo, defaultBranch, file.path, pat);
                    if (content && content.trim()) {
                        const fileDocs = await splitter.createDocuments(
                            [content],
                            [{ filename: file.path, projectId }]
                        );
                        allDocs.push(...fileDocs);
                    }
                } catch (fileError) {
                    console.error(`[RAG Service] Failed to fetch content for file ${file.path}:`, fileError.message);
                }
            });
            await Promise.all(batchPromises);
        }

        console.log(`[RAG Service] Generated ${allDocs.length} total text chunks for embedding.`);

        // 5. Clean up existing indexed documents for this project
        const storeType = process.env.VECTOR_STORE_TYPE || 'mongoose';
        if (storeType === 'mongoose') {
            await VectorDocument.deleteMany({ projectId });
        } else if (storeType === 'memory') {
            delete memoryStores[projectId];
        }

        // 6. Embed and store chunks in the vector database
        if (allDocs.length > 0) {
            const vectorStore = await getVectorStore(projectId);
            await vectorStore.addDocuments(allDocs);
            console.log(`[RAG Service] Successfully indexed ${allDocs.length} chunks for project ${projectId}.`);
        }

        return {
            success: true,
            filesIndexed: filteredFiles.length,
            chunksCreated: allDocs.length
        };
    } catch (error) {
        console.error(`[RAG Service] Indexing failed:`, error);
        throw error;
    }
};

/**
 * Performs similarity search against the vector database for relevant code context.
 */
export const getRelevantContext = async (projectId, query, limit = 5) => {
    try {
        const vectorStore = await getVectorStore(projectId);
        const results = await vectorStore.similaritySearch(query, limit);
        return results;
    } catch (error) {
        console.error(`[RAG Service] Context retrieval failed for query: "${query.substring(0, 50)}..."`, error.message);
        return [];
    }
};
