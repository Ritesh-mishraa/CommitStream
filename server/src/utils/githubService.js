import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com';

/**
 * Creates an Axios instance pre-configured for GitHub API access.
 * If a PAT is provided, it attaches it to the Authorization header.
 * Includes automatic retries for resilient network requests.
 */
export const getGithubClient = (pat = null) => {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CommitStream-App'
    };

    if (pat) {
        headers['Authorization'] = `token ${pat}`;
    }

    const client = axios.create({
        baseURL: GITHUB_API_URL,
        headers
    });

    // Add a response interceptor for automatic retries
    client.interceptors.response.use(undefined, async (err) => {
        const config = err.config;
        if (!config || !config._retryCount) {
            config._retryCount = 0;
        }

        // Retry on network errors (like ECONNRESET) or 5xx server errors
        const shouldRetry = !err.response || (err.response.status >= 500 && err.response.status < 600) || err.code === 'ECONNRESET';

        if (shouldRetry && config._retryCount < 3) {
            config._retryCount += 1;
            console.log(`[GitHub API] Network issue (${err.message}). Retrying request... (${config._retryCount}/3)`);

            // Wait with exponential backoff before retrying
            const delay = Math.pow(2, config._retryCount) * 500;
            await new Promise(resolve => setTimeout(resolve, delay));

            return client(config);
        }

        return Promise.reject(err);
    });

    return client;
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
 * Fetch repository details (to get default branch)
 * @param {string} repo - Format "owner/repo"
 * @param {string} pat - Optional Personal Access Token
 */
export const fetchRepoDetails = async (repo, pat = null) => {
    try {
        const client = getGithubClient(pat);
        const res = await client.get(`/repos/${repo}`);
        return res.data;
    } catch (error) {
        console.error(`Failed to fetch repo details for ${repo}:`, error.message);
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
 * Fetch the SHA of a specific file in a branch
 */
const getFileSha = async (client, repo, branch, path) => {
    try {
        const { data } = await client.get(`/repos/${repo}/contents/${path}?ref=${branch}`);
        return data.sha;
    } catch (err) {
        if (err.response?.status === 404) return null; // File doesn't exist here
        throw err;
    }
};

/**
 * Filter a list of conflicting files to only return the ones that truly differ
 * between the two branch tips (i.e. they are not exactly the same).
 * @param {string} repo - Format "owner/repo"
 * @param {string} base - Base branch name
 * @param {string} head - Head branch name
 * @param {string[]} files - List of file paths to check
 * @param {string} pat - Optional Personal Access Token
 */
export const filterExactConflicts = async (repo, base, head, files, pat = null) => {
    const client = getGithubClient(pat);
    const trueConflicts = [];

    for (const file of files) {
        // Fetch the SHA of the file on both branch tips
        const [shaBase, shaHead] = await Promise.all([
            getFileSha(client, repo, base, file),
            getFileSha(client, repo, head, file)
        ]);

        // If the SHAs are different, they have different content, so it's a real conflict
        if (shaBase !== shaHead) {
            trueConflicts.push(file);
        }
    }

    return trueConflicts;
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
            client.get(`/repos/${repo}/commits?per_page=4`)
        ]);

        return {
            activeBranches: branchesRes.data.length,
            openPRs: pullsRes.data.length,
            recentCommits: commitsRes.data.map(commit => ({
                hash: commit.sha.substring(0, 7),
                message: commit.commit.message,
                time: commit.commit.author.date,
                author: commit.commit.author.name
            }))
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

/**
 * Fetch the raw content of a specific file in a branch
 */
export const fetchFileContent = async (repo, branch, path, pat = null) => {
    try {
        const client = getGithubClient(pat);
        const { data } = await client.get(`/repos/${repo}/contents/${path}?ref=${branch}`);
        // data.content is base64 encoded
        return Buffer.from(data.content, 'base64').toString('utf8');
    } catch (err) {
        if (err.response?.status === 404) return null; // File doesn't exist
        throw err;
    }
};

/**
 * Fetch commits for a specific branch
 */
export const fetchBranchCommits = async (repo, branch, pat = null) => {
    try {
        const client = getGithubClient(pat);
        const { data } = await client.get(`/repos/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=20`);
        return data;
    } catch (error) {
        console.error(`Failed to fetch commits for branch ${branch} in ${repo}:`, error.message);
        throw error;
    }
};

/**
 * Fetch specific commit details (including file modifications)
 */
export const fetchCommitDetails = async (repo, commitSha, pat = null) => {
    try {
        const client = getGithubClient(pat);
        const { data } = await client.get(`/repos/${repo}/commits/${commitSha}`);
        return data;
    } catch (error) {
        console.error(`Failed to fetch commit details for ${commitSha} in ${repo}:`, error.message);
        throw error;
    }
};
