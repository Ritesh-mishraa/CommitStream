import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Feeds the raw git patch (containing merge conflict markers or diffs) to Gemini
 * and returns a cleanly resolved file string.
 * @param {string} filename - The name of the file being resolved
 * @param {string} patch - The diff data for the file
 */
export const resolveConflictWithAI = async (filename, patch) => {
    try {
        const prompt = `You are an autonomous Principal Full-Stack Engineer working on CommitStream.
Your task is to cleanly resolve the git diff provided below.
The file being modified is: ${filename}

Here is the raw git diff / patch containing the conflicts:
\`\`\`diff
${patch}
\`\`\`

Analyze the changes. Your objective is to merge these changes intelligently, preserving the intent of both branches while fixing any structural collisions.
IMPORTANT: Return ONLY the final, clean, and resolved code for the entire file. DO NOT wrap your response in markdown formatting block quotes (e.g., \`\`\`javascript).
DO NOT include any explanations or conversational text. Output ONLY the raw functional code.`;

        const response = await ai.models.generateContent({
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
export const auditCodeWithAI = async (diffText) => {
    try {
        const prompt = `You are a Principal Application Security Engineer and Senior Staff Software Engineer reviewing a pull request diff.
Your task is to analyze the following git diff and identify any security vulnerabilities, code smells, logical errors, or major optimization opportunities.

Here is the diff:
\`\`\`diff
${diffText.substring(0, 30000)}
\`\`\`

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

        const response = await ai.models.generateContent({
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
export const explainSnippetWithAI = async (selectedCode, contextCode, branchName) => {
    try {
        const prompt = `You are a Principal Software Engineer explaining a Git merge conflict to another developer.
The user highlighted the following conflicting code block from branch '${branchName}':
\`\`\`
${selectedCode}
\`\`\`

Here is the surrounding file context for reference (Do not explain the entire file, ONLY the highlighted block):
\`\`\`
${contextCode}
\`\`\`

Explain technically why this specific block is colliding or what changed here.
Constraints:
- Respond in maximum 3-4 concise sentences.
- Explain the precise Git collision mechanics (e.g., "Branch A bumped the dependency version to 1.3, but Main changed it to 1.4").
- Do NOT use conversational fluff. Be highly technical, direct, and deterministic.
- Do NOT output markdown code blocks. Just the raw text explanation.`;

        const response = await ai.models.generateContent({
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

        const response = await ai.models.generateContent({
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
