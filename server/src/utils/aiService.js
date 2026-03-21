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
