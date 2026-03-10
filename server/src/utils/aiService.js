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
