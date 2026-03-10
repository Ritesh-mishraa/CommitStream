import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com';

/**
 * Creates an Axios instance pre-configured for GitHub API access.
 * If a PAT is provided, it attaches it to the Authorization header.
 */
export const getGithubClient = (pat = null) => {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CommitStream-App'
    };

    if (pat) {
        headers['Authorization'] = `token ${pat}`;
    }

    return axios.create({
        baseURL: GITHUB_API_URL,
        headers
    });
};

/**
 * Fetch branches for a specific repository
 * @param {string} repo - Format "owner/repo"
 * @param {string} pat - Optional Personal Access Token
 */
export const fetchRepoBranches = async (repo, pat = null) => {
    try {
        const client = getGithubClient(pat);
        const res = await client.get(`/repos/${repo}/branches`);
        return res.data;
    } catch (error) {
        console.error(`Failed to fetch branches from ${repo}:`, error.message);
        throw error;
    }
};

/**
 * Compare two branches to get file diffs
 * @param {string} repo - Format "owner/repo"
 * @param {string} base - Base branch name
 * @param {string} head - Head branch name
 * @param {string} pat - Optional Personal Access Token
 */
export const compareBranches = async (repo, base, head, pat = null) => {
    try {
        const client = getGithubClient(pat);
        const res = await client.get(`/repos/${repo}/compare/${base}...${head}`);
        return res.data;
    } catch (error) {
        console.error(`Failed to compare ${base} with ${head} in ${repo}:`, error.message);
        throw error;
    }
};

/**
 * Compare two branches exactly at their tips (2-dot compare)
 * @param {string} repo - Format "owner/repo"
 * @param {string} base - Base branch name
 * @param {string} head - Head branch name
 * @param {string} pat - Optional Personal Access Token
 */
export const compareBranchesExact = async (repo, base, head, pat = null) => {
    try {
        const client = getGithubClient(pat);
        const res = await client.get(`/repos/${repo}/compare/${base}..${head}`);
        return res.data;
    } catch (error) {
        console.error(`Failed to exactly compare ${base} with ${head} in ${repo}:`, error.message);
        throw error;
    }
};

/**
 * Fetch basic repo stats (branch count, open PRs, last commit)
 * @param {string} repo - Format "owner/repo"
 * @param {string} pat - Optional Personal Access Token
 */
export const fetchRepoStats = async (repo, pat = null) => {
    try {
        const client = getGithubClient(pat);

        const [branchesRes, pullsRes, commitsRes] = await Promise.all([
            client.get(`/repos/${repo}/branches?per_page=100`),
            client.get(`/repos/${repo}/pulls?state=open&per_page=100`),
            client.get(`/repos/${repo}/commits?per_page=1`)
        ]);

        return {
            activeBranches: branchesRes.data.length,
            openPRs: pullsRes.data.length,
            lastCommit: commitsRes.data[0] ? {
                hash: commitsRes.data[0].sha.substring(0, 7),
                message: commitsRes.data[0].commit.message,
                time: commitsRes.data[0].commit.author.date,
                author: commitsRes.data[0].commit.author.name
            } : null
        };
    } catch (error) {
        console.error(`Failed to fetch stats for ${repo}:`, error.message);
        throw error;
    }
};

/**
 * Fetch top contributors for a repository
 * @param {string} repo - Format "owner/repo"
 * @param {string} pat - Optional Personal Access Token
 */
export const fetchRepoCollaborators = async (repo, pat = null) => {
    try {
        const client = getGithubClient(pat);
        const res = await client.get(`/repos/${repo}/contributors?per_page=10`);
        return res.data.map(contributor => ({
            id: contributor.id,
            username: contributor.login,
            avatar_url: contributor.avatar_url,
            contributions: contributor.contributions
        }));
    } catch (error) {
        console.error(`Failed to fetch collaborators for ${repo}:`, error.message);
        throw error;
    }
};

/**
 * Pushes a committed file directly to a GitHub repository branch.
 * @param {string} repo - Format "owner/repo"
 * @param {string} branch - The branch to commit to
 * @param {string} path - The file path
 * @param {string} content - The raw string content of the file
 * @param {string} message - Commit message
 * @param {string} pat - Personal Access Token (required for writing)
 */
export const updateRepoFile = async (repo, branch, path, content, message, pat) => {
    if (!pat) throw new Error('GitHub PAT is required to commit files.');
    try {
        const client = getGithubClient(pat);

        // 1. Get the current file SHA (required by GitHub to update existing files)
        let sha = null;
        try {
            const { data } = await client.get(`/repos/${repo}/contents/${path}?ref=${branch}`);
            sha = data.sha;
        } catch (err) {
            // File might not exist yet, which is fine for creation.
            if (err.response?.status !== 404) throw err;
        }

        // 2. Base64 encode the new content
        const contentEncoded = Buffer.from(content).toString('base64');

        // 3. Commit the file
        const payload = {
            message,
            content: contentEncoded,
            branch
        };
        if (sha) payload.sha = sha;

        const res = await client.put(`/repos/${repo}/contents/${path}`, payload);
        return res.data;
    } catch (error) {
        console.error(`Failed to commit file to ${repo}:`, error.response?.data || error.message);
        throw error;
    }
};
