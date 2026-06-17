import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { getRelevantContext } from './ragService.js';
import Project from '../models/Project.js';
import { fetchRepoDetails, compareBranches, fetchRepoStats, fetchRepoCollaborators, getGithubClient } from './githubService.js';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Models list to cycle/fallback to if a model experiences high-demand or rate-limiting (503/429)
const BASE_FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-pro-latest'];

// Retry logic wrapper with exponential backoff and model shifting fallbacks
const generateContentWithRetry = async (params, retries = 5, delay = 2000) => {
    const modelsList = [...BASE_FALLBACK_MODELS];
    const initialModel = params.model || 'gemini-2.5-flash';
    let modelIndex = modelsList.indexOf(initialModel);
    if (modelIndex === -1) {
        modelsList.unshift(initialModel);
        modelIndex = 0;
    }

    for (let i = 0; i < retries; i++) {
        const currentModel = modelsList[modelIndex];
        const currentParams = { ...params, model: currentModel };
        
        try {
            return await ai.models.generateContent(currentParams);
        } catch (error) {
            const isTransient = 
                error.status === 429 || 
                error.status === 503 || 
                error.status === 500 || 
                error.message?.includes('demand') || 
                error.message?.includes('Spikes') || 
                error.message?.includes('quota') || 
                error.message?.includes('fetch failed') ||
                error.code === 'UND_ERR_HEADERS_TIMEOUT' ||
                error.cause?.code === 'UND_ERR_HEADERS_TIMEOUT' ||
                error.message?.includes('Timeout');
            
            if (isTransient) {
                const nextModelIndex = (modelIndex + 1) % modelsList.length;
                const nextModel = modelsList[nextModelIndex];
                
                console.warn(`[AI Service] Model "${currentModel}" failed (${error.message || error.status || error.code}). Shifting to "${nextModel}" for next attempt...`);
                modelIndex = nextModelIndex;
                
                if (i < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 1.5;
                    continue;
                }
            }
            throw error;
        }
    }
};

/**
 * Feeds the raw git patch (containing merge conflict markers or diffs) to Gemini
 * and returns a cleanly resolved file string.
 * @param {string} filename - The name of the file being resolved
 * @param {string} patch - The diff data for the file
 */
export const resolveConflictWithAI = async (filename, patch, projectId = null) => {
    try {
        let contextText = '';
        if (projectId) {
            try {
                const chunks = await getRelevantContext(projectId, `File: ${filename}\nConflict:\n${patch.substring(0, 500)}`, 3);
                if (chunks && chunks.length > 0) {
                    contextText = `\n\nReference Context from Codebase (to help resolve imports, APIs, and conventions correctly):\n${chunks.map(c => `[File: ${c.metadata.filename}]\n${c.pageContent}`).join('\n---\n')}`;
                }
            } catch (ragError) {
                console.error("RAG retrieval failed for resolveConflictWithAI, falling back to standard prompt:", ragError.message);
            }
        }

        const prompt = `You are an autonomous Principal Full-Stack Engineer working on CommitStream.
Your task is to cleanly resolve the git diff provided below.
The file being modified is: ${filename}

Here is the raw git diff / patch containing the conflicts:
\`\`\`diff
${patch}
\`\`\`
${contextText}

Analyze the changes. Your objective is to merge these changes intelligently, preserving the intent of both branches while fixing any structural collisions.
IMPORTANT: Return ONLY the final, clean, and resolved code for the entire file. DO NOT wrap your response in markdown formatting block quotes (e.g., \`\`\`javascript).
DO NOT include any explanations or conversational text. Output ONLY the raw functional code.`;

        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        // Strip any residual markdown blocks if the LLM ignores instructions
        let code = response.text || '';
        if (code.startsWith('\`\`\`')) {
            const firstNewline = code.indexOf('\n');
            const lastTripleR = code.lastIndexOf('\`\`\`');
            if (firstNewline !== -1 && lastTripleR !== -1 && lastTripleR > firstNewline) {
                code = code.substring(firstNewline + 1, lastTripleR);
            }
        }

        return code;
    } catch (error) {
        console.error("AI Resolution Service Failed:", error);
        throw new Error('Failed to generate AI resolution');
    }
};

/**
 * Scans a given git diff with Gemini to find vulnerabilities, code smells, and optimizations.
 * @param {string} diffText - The raw git diff containing changes
 * @returns {Promise<Array>} - Array of found issues
 */
export const auditCodeWithAI = async (diffText, projectId = null) => {
    try {
        let contextText = '';
        if (projectId) {
            try {
                const chunks = await getRelevantContext(projectId, `Audit diff code style standards: ${diffText.substring(0, 500)}`, 3);
                if (chunks && chunks.length > 0) {
                    contextText = `\n\nReference Context from Codebase (for code standards / api reference):\n${chunks.map(c => `[File: ${c.metadata.filename}]\n${c.pageContent}`).join('\n---\n')}`;
                }
            } catch (ragError) {
                console.error("RAG retrieval failed for auditCodeWithAI, falling back to standard prompt:", ragError.message);
            }
        }

        const prompt = `You are a Principal Application Security Engineer and Senior Staff Software Engineer reviewing a pull request diff.
Your task is to analyze the following git diff and identify any security vulnerabilities, code smells, logical errors, or major optimization opportunities.

Here is the diff:
\`\`\`diff
${diffText.substring(0, 30000)}
\`\`\`
${contextText}

Analyze the changes. Return a strict JSON array containing objects with the following schema:
[
  {
    "type": "VULNERABILITY" | "CODE_SMELL" | "OPTIMIZATION" | "LOGIC_FLAW",
    "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO",
    "file": "filename (if discernible from diff)",
    "line": "approximate line number or context",
    "message": "A concise description of the issue",
    "suggestion": "How to fix or improve the code"
  }
]

IMPORTANT: 
- Return ONLY the raw JSON array.
- Do not wrap it in markdown formatting blocks like \`\`\`json.
- If no significant issues are found, return an empty array [].
- Be highly critical but pragmatic. Do not flag trivial style issues unless they are severe.`;

        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        let jsonText = response.text || '[]';
        if (jsonText.startsWith('\`\`\`')) {
            const firstNewline = jsonText.indexOf('\n');
            const lastTripleR = jsonText.lastIndexOf('\`\`\`');
            if (firstNewline !== -1 && lastTripleR !== -1 && lastTripleR > firstNewline) {
                jsonText = jsonText.substring(firstNewline + 1, lastTripleR);
            }
        }
        
        try {
            return JSON.parse(jsonText.trim());
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", jsonText);
            return [];
        }
    } catch (error) {
        console.error("AI Audit Service Failed:", error);
        throw new Error('Failed to run AI Security Audit');
    }
};

/**
 * Provides a highly concise, technical explanation of a highlighted collision block.
 * @param {string} selectedCode - The explicit highlighted lines from the editor
 * @param {string} contextCode - The surrounding file syntax for LLM context
 * @param {string} branchName - The identifier of the branch owning the selection
 * @returns {Promise<string>} - A 3-4 sentence explanation
 */
export const explainSnippetWithAI = async (selectedCode, contextCode, branchName, projectId = null) => {
    try {
        let contextText = '';
        if (projectId) {
            try {
                const chunks = await getRelevantContext(projectId, `Code snippet explain context:\n${selectedCode}`, 3);
                if (chunks && chunks.length > 0) {
                    contextText = `\n\nReference Context from Codebase:\n${chunks.map(c => `[File: ${c.metadata.filename}]\n${c.pageContent}`).join('\n---\n')}`;
                }
            } catch (ragError) {
                console.error("RAG retrieval failed for explainSnippetWithAI, falling back to standard prompt:", ragError.message);
            }
        }

        const prompt = `You are a Principal Software Engineer explaining a Git merge conflict to another developer.
The user highlighted the following conflicting code block from branch '${branchName}':
\`\`\`
${selectedCode}
\`\`\`

Here is the surrounding file context for reference (Do not explain the entire file, ONLY the highlighted block):
\`\`\`
${contextCode}
\`\`\`
${contextText}

Explain technically why this specific block is colliding or what changed here.
Constraints:
- Respond in maximum 3-4 concise sentences.
- Explain the precise Git collision mechanics (e.g., "Branch A bumped the dependency version to 1.3, but Main changed it to 1.4").
- Do NOT use conversational fluff. Be highly technical, direct, and deterministic.
- Do NOT output markdown code blocks. Just the raw text explanation.`;

        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text?.trim() || "No explanation generated.";
    } catch (error) {
        console.error("AI Explanation Service Failed:", error);
        throw new Error('Failed to generate AI explanation');
    }
};

// Rewrite scraped tech news into an SEO-optimized blog post using Gemini
export const generateBlogWithAI = async (scrapedTitle, scrapedSummary, categoryName) => {
    try {
        const prompt = `You are a Principal Tech Journalist, SEO expert, and Technical Blogger.
Your task is to rewrite, expand, and customize the following scraped tech news article into an extremely engaging, search-engine-optimized, and premium blog post for the CommitStream platform.

Here are the details of the scraped article:
- Scraped Title: ${scrapedTitle}
- Scraped Summary/Content: ${scrapedSummary}
- Target Category: ${categoryName}

Your blog post must meet these strict criteria:
1. TITLE: Create an optimized, catchy, and click-worthy title related to the article. It should be highly search-engine optimized (contains relevant keywords).
2. CONTENT: Write a comprehensive, high-quality, and deeply insightful blog article (approx 400-600 words) in valid Markdown.
   - It should discuss technical implications, impact on developer workflow, industry context, or future outlook.
   - Use beautiful Markdown formatting: headers (H2, H3), bold text, lists, and code snippets if applicable.
   - Integrate relevant search keywords naturally within the text.
3. SEO SUMMARY / META DESCRIPTION: A compelling, action-oriented description under 155 characters that will make search engine users click.
4. METRICS / KEYWORDS: Create a comma-separated list of 5-8 SEO keywords for search indexers.
5. TAGS: Choose 3-4 relevant tags (e.g. ["GitHub", "AI", "React", "Next.js", "Web Dev", "Careers", "Machine Learning"]).
6. HIGH IMPACT IDENTIFICATION: Identify if the news is highly important, such as a major layoff/job cutting event, a revolutionary tech breakthrough (e.g., AGI, GPT-5, superconductor), or a major GitHub/developer update.
   - If yes, set "isHighImpact" to true, and "impactLabel" to a short text (e.g. "Layoffs", "Revolutionary Tech", "Major Update").
   - If no, set "isHighImpact" to false, and "impactLabel" to "".

You MUST respond with a strict JSON object with this exact structure:
{
  "title": "Optimized and Engaging Headline",
  "content": "Full markdown-formatted blog post body...",
  "summary": "Catchy 1-2 sentence hook...",
  "metaTitle": "SEO optimized title tag (under 60 characters)",
  "metaDescription": "Highly compelling search snippet (under 155 characters)",
  "keywords": "keyword1, keyword2, keyword3, ...",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "category": "GitHub" | "AI Industry" | "Job Market" | "General Tech",
  "isHighImpact": true | false,
  "impactLabel": "Layoffs" | "Revolutionary Tech" | "Major Update" | ""
}

Ensure the "category" is EXACTLY one of the four options: "GitHub", "AI Industry", "Job Market", "General Tech".
IMPORTANT: Return ONLY the raw JSON object. Do not wrap it in markdown code block formatting (like \`\`\`json). Do not add any extra text or conversational explanations.`;

        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        let jsonText = response.text || '';
        if (jsonText.startsWith('\`\`\`')) {
            const firstNewline = jsonText.indexOf('\n');
            const lastTripleR = jsonText.lastIndexOf('\`\`\`');
            if (firstNewline !== -1 && lastTripleR !== -1 && lastTripleR > firstNewline) {
                jsonText = jsonText.substring(firstNewline + 1, lastTripleR);
            }
        }

        try {
            return JSON.parse(jsonText.trim());
        } catch (e) {
            console.error("Failed to parse Gemini blog JSON, raw response:", jsonText);
            // Fallback object in case JSON parsing fails
            return {
                title: scrapedTitle,
                content: `### ${scrapedTitle}\n\n${scrapedSummary}\n\n*Note: This article was generated as a fallback due to processing constraints.*`,
                summary: scrapedSummary.substring(0, 150) + "...",
                metaTitle: scrapedTitle.substring(0, 60),
                metaDescription: scrapedSummary.substring(0, 150),
                keywords: "tech, github, ai, developers",
                tags: ["Tech"],
                category: categoryName,
                isHighImpact: false,
                impactLabel: ""
            };
        }
    } catch (error) {
        console.error("AI Blog Generator Service Failed:", error);
        throw new Error('Failed to generate AI blog post');
    }
};

/**
 * Chat with the codebase assistant using RAG context retrieval and branch diff analysis.
 * Supports three modes: general (no context), codebase (RAG on default branch), and branch (RAG + branch diff).
 */
export const chatWithRepositoryAI = async (projectId, query, history = [], options = {}) => {
    try {
        const { mode = 'codebase', branch: branchName = null, pat = null } = options;
        
        let contextText = '';
        let branchDiffContext = '';
        let repoMetadata = null;

        // 1. Fetch Codebase RAG context (always query to ground any mode if relevant documents exist)
        try {
            const chunks = await getRelevantContext(projectId, query, 5);
            if (chunks && chunks.length > 0) {
                contextText = chunks.map((c, idx) => `[Snippet #${idx + 1} - File: ${c.metadata.filename}]\n${c.pageContent}`).join('\n---\n');
            } else if (mode === 'codebase' || mode === 'branch') {
                contextText = 'No specific code snippets found for this query in the vector store.';
            }
        } catch (ragError) {
            console.error("[AI Service] RAG retrieval failed for chat:", ragError.message);
            if (mode === 'codebase' || mode === 'branch') {
                contextText = 'RAG search was unavailable due to an error.';
            }
        }

        // 2. Fetch active branch diff if in branch mode
        if (mode === 'branch' && branchName) {
            try {
                const project = await Project.findById(projectId);
                if (project && project.githubRepo) {
                    const repo = project.githubRepo;
                    let defaultBranch = 'main';
                    try {
                        const repoDetails = await fetchRepoDetails(repo, pat);
                        defaultBranch = repoDetails.default_branch || 'main';
                    } catch (e) {
                        console.warn("[AI Service] Failed to fetch repo details, defaulting to 'main':", e.message);
                    }
                    
                    console.log(`[AI Chat] Comparing default branch "${defaultBranch}" with HEAD branch "${branchName}" for repo "${repo}"...`);
                    const compareData = await compareBranches(repo, defaultBranch, branchName, pat);
                    
                    if (compareData && compareData.files && compareData.files.length > 0) {
                        const filesList = compareData.files.map(f => `- ${f.filename} (${f.status})`).join('\n');
                        
                        let diffPatches = '';
                        let patchCount = 0;
                        for (const file of compareData.files) {
                            if (file.patch && patchCount < 3) {
                                diffPatches += `\n--- a/${file.filename}\n+++ b/${file.filename}\n${file.patch.substring(0, 3000)}\n`;
                                patchCount++;
                            }
                        }
                        
                        branchDiffContext = `Active Focus Branch: "${branchName}"\nFiles Modified in this branch (compared to "${defaultBranch}"):\n${filesList}\n\nKey Code Differences in this branch:\n${diffPatches || 'No text-based code diffs available.'}`;
                    } else {
                        branchDiffContext = `Active Focus Branch: "${branchName}"\nNo file differences found compared to the default branch "${defaultBranch}".`;
                    }
                }
            } catch (err) {
                console.error("[AI Service] Branch comparison failed for chat:", err.message);
                branchDiffContext = `Active Focus Branch: "${branchName}"\nCould not retrieve branch differences: ${err.message}`;
            }
        }

        // 3. Fetch general repo metadata (stars, commits count, forks, open issues, contributors, etc.)
        try {
            const project = await Project.findById(projectId);
            if (project && project.githubRepo) {
                const repo = project.githubRepo;
                const client = getGithubClient(pat);
                const [detailsRes, stats, contributors] = await Promise.all([
                    fetchRepoDetails(repo, pat).catch(() => null),
                    fetchRepoStats(repo, pat).catch(() => null),
                    fetchRepoCollaborators(repo, pat).catch(() => null)
                ]);
                
                // Fetch total commits count resiliently
                let totalCommits = 0;
                try {
                    const commitsCountRes = await client.get(`/repos/${repo}/commits?per_page=1`);
                    const linkHeader = commitsCountRes.headers.link;
                    if (linkHeader) {
                        const match = linkHeader.match(/&page=(\d+)>;\s*rel="last"/);
                        if (match) {
                            totalCommits = parseInt(match[1], 10);
                        } else {
                            totalCommits = commitsCountRes.data.length;
                        }
                    } else {
                        totalCommits = commitsCountRes.data.length;
                    }
                } catch (err) {
                    console.warn("[AI Service] Failed to fetch total commits count:", err.message);
                }

                repoMetadata = {
                    name: repo,
                    description: detailsRes?.description || 'No description provided.',
                    stars: detailsRes?.stargazers_count || 0,
                    forks: detailsRes?.forks_count || 0,
                    openIssues: detailsRes?.open_issues_count || 0,
                    defaultBranch: detailsRes?.default_branch || 'main',
                    activeBranchesCount: stats?.activeBranches || 0,
                    openPRsCount: stats?.openPRs || 0,
                    totalCommits,
                    recentCommits: stats?.recentCommits || [],
                    topContributors: contributors?.map(c => `${c.username} (${c.contributions} commits)`) || []
                };
            }
        } catch (metadataErr) {
            console.error("[AI Service] Failed to compile repo metadata for chat:", metadataErr.message);
        }

        // 4. Construct System Prompt grounding the AI
        const systemPrompt = `You are "CommitStream AI Assistant", an advanced, friendly, and expert software engineer assistant.
Your goal is to help developers understand, query, debug, and navigate the project codebase.
You are currently in ${mode === 'codebase' ? 'Codebase RAG' : mode === 'branch' ? 'Branch Focus' : 'General AI'} mode.

=== CRITICAL RESPONSE GUIDELINES ===
1. **Be extremely concise, direct, and focused**: Answer the user's question directly. Do not include verbose filler, greetings, or conversational preambles (like "Sure, I can help you with that!"). Get straight to the point.
2. **"Just enough" length**: Keep answers short, clear, and relevant. Provide only the exact code snippets, configuration, or explanations needed to answer the question.
3. **Exact answers**: Focus on rendering the exact code snippet or config details requested. Do not explain standard library concepts or basic theory unless explicitly asked.
4. **Context-Grounded**: Use the provided codebase context and repository metadata to give clear, grounded answers.
====================================

${repoMetadata ? `=== REPOSITORY METADATA ===
- Repository: ${repoMetadata.name}
- Description: ${repoMetadata.description}
- Default Branch: ${repoMetadata.defaultBranch}
- Stars: ${repoMetadata.stars} | Forks: ${repoMetadata.forks}
- Total Commits: ${repoMetadata.totalCommits}
- Open Issues: ${repoMetadata.openIssues} | Open Pull Requests: ${repoMetadata.openPRsCount}
- Active Branches Count: ${repoMetadata.activeBranchesCount}
- Top Contributors: ${repoMetadata.topContributors.join(', ')}
- Recent Commits:
${repoMetadata.recentCommits.map(c => `  * [${c.hash}] ${c.message} - by ${c.author} (${new Date(c.time).toLocaleDateString()})`).join('\n')}
===========================` : ''}

${contextText ? `=== CODEBASE CONTEXT (from default branch) ===\n${contextText}\n==============================================` : ''}
${branchDiffContext ? `\n=== BRANCH DIFF CONTEXT ===\n${branchDiffContext}\n===========================` : ''}

Using the codebase context, repository stats/metadata, and branch changes provided above, reply to the user's message following the CRITICAL RESPONSE GUIDELINES.`;

        // 5. Incorporate history
        let formattedPrompt = `${systemPrompt}\n\n`;
        if (history && history.length > 0) {
            formattedPrompt += `Conversation History:\n${history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n')}\n`;
        }
        formattedPrompt += `User: ${query}\nAssistant:`;

        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash',
            contents: formattedPrompt,
        });

        return response.text || "I was unable to compile an answer at this time.";
    } catch (error) {
        console.error("AI Repository Chatbot Failed:", error);
        
        // Return a friendly fallback explanation if Gemini is rate limited or experiencing a high-demand 503 spike
        const isTransient = error.status === 429 || error.status === 503 || error.message?.includes('demand') || error.message?.includes('Spikes');
        if (isTransient) {
            return `⚠️ **The AI Model is currently experiencing a high volume of requests (HTTP 503/429).**\n\nI was unable to retrieve a live reply from Gemini, but I can confirm that your codebase is **indexed successfully** (or the branch comparison is active).\n\n**Suggestions to try:**\n1. Wait 5-10 seconds for the Gemini API load spike to subside, then try re-submitting your query.\n2. Verify that your \`GEMINI_API_KEY\` quota limits are not exceeded inside your Google AI Studio console.\n3. If you selected a branch, ensure it has active commits pushed to GitHub.`;
        }
        throw error;
    }
};
