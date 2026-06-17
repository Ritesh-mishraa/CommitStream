<div align="center">
  <br />
  <h1>🌊 CommitStream</h1>
  <p>
    <strong>A unified, AI-powered project workspace combining intelligence, collaboration, and git seamlessly.</strong>
  </p>
  <p>
    <img alt="React" src="https://img.shields.io/badge/-React-45b8d8?style=flat-square&logo=react&logoColor=white" />
    <img alt="Vite" src="https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white" />
    <img alt="Tailwind" src="https://img.shields.io/badge/-TailwindCSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" />
    <img alt="Node.js" src="https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white" />
    <img alt="Gemini AI" src="https://img.shields.io/badge/-Gemini_AI-4285F4?style=flat-square&logo=google&logoColor=white" />
  </p>
</div>

<br />

CommitStream is a comprehensive project management, real-time collaboration, and developer intelligence platform built specifically for modern development teams. It replaces disjointed toolchains by integrating deep repository analytics, live team communications, interactive task tracking, and advanced AI-powered tools (indexing, auditing, conflict prediction, and a contextual multi-mode assistant) in a single cohesive workspace.

---

## ✨ Features at a Glance

### 🤖 Multi-Mode Repo AI Assistant (Chatbot)
Our state-of-the-art repository chatbot assistant is grounded in your project structures, branch diffs, and live GitHub metadata.
* **Three Operational Modes**:
  1. **General AI**: Ask general programming concepts, setup guides, and patterns. Grounded in RAG codebase indexes if available.
  2. **Codebase RAG**: Performs semantic vector similarity search against your default branch codebase index chunks to answer questions directly related to authentication, directories, configuration, and code logic.
  3. **Branch Focus**: Targets active branches dynamically. Fetches modified files and diff patches from GitHub APIs to help audit, review, and analyze changes in progress before merging.
* **High Contrast & Readability**: Standardized theme configurations with high contrast text colors (`text-slate-800 dark:text-slate-200`) designed for effortless reading in both light and dark modes.
* **Premium Code Blocks & Copy**: Custom tokenized syntax highlighting that avoids double-highlighting bugs (e.g. nested class names). Renders code inside simulated macOS-style window cards with 1-click **Copy Code** button feedback.
* **Rate-Limit Resilience (503/429 Fallbacks)**: Implements auto-retry loops with exponential backoff and rotation of secondary Gemini model versions if transient errors (quota/unavailability/network timeouts) occur.

### 🧠 Smart Conflict Predictor & Resolver
* **Simulate & Preview**: Select two branches to predict and simulate merge conflicts.
* **Inline Editor**: Inspect conflict snippets inside an integrated browser Monaco Editor and select automatic resolution paths or apply manual overrides before submitting.
* **Contextual Explanations**: Ask Gemini to explain code changes inside conflict snippets to understand overlapping history.

### 📋 Agile Kanban & Task Management
* **Interactive Boards**: Fluid drag-and-drop task tracker natively integrated with your team's pull-requests and branch pipelines.
* **Isolated Workspaces**: Switch between completely isolated project environments, each configured with unique database contexts and GitHub repositories.

### 👥 Collaboration & Team Sync
* **Real-Time Team Chat**: A dedicated workspace chat with live messaging powered by Socket.io.
* **Team Directory**: Easily manage and onboard project members, assign roles, and distribute responsibilities.

---

## 🛠️ Architecture

CommitStream uses a monorepo workspace pattern:

| Workspace | Purpose | Key Technologies |
| --- | --- | --- |
| `client/` | The responsive user interface application. | React, Vite, Tailwind CSS, Recharts, Framer Motion, DnD Kit, Monaco Editor |
| `server/` | Service layer, Socket connections, and AI RAG endpoints. | Node.js, Express, Mongoose, LangChain (MongoDB/Memory), Socket.io, Passport.js |
| `shared/` | Shared models, types, and schema helpers. | JavaScript |

---

## 🚀 Quick Start

### 1. Prerequisites
* **Node.js**: `v18+`
* **MongoDB**: A running local or cloud instance.
* **GitHub Application**: For OAuth login flow and API operations.

### 2. Installation
Clone the repository and install all workspace dependencies concurrently:
```bash
git clone <repository-url>
cd CommitStream
npm run install:all
```

### 3. Environment Configuration
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
MONGO_URI="mongodb://localhost:27017/commitstream"
JWT_SECRET="your-super-secret-jwt-key"

# GitHub OAuth Application Credentials
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-secret"
GITHUB_CALLBACK_URL="http://localhost:5000/api/auth/github/callback"

# AI & Gemini API Settings
GEMINI_API_KEY="your-google-gemini-key"

# RAG Vector Ingestion Configuration
VECTOR_STORE_TYPE="memory" # Use 'memory' for local vector storage or 'mongoose' for database persistence
MONGODB_VECTOR_INDEX_NAME="vector_index"
```

### 4. Running Locally
Launch the full stack (Vite client dev server and Node API daemon) with a single command from the root directory:
```bash
npm run dev
```

---

## 📖 How to Use

### Step 1: Login & Select Repository
1. Open `http://localhost:5173` in your browser.
2. Sign in via the **GitHub OAuth** authorization flow.
3. Use the workspace dropdown in the top header to select an active repository.

### Step 2: Index your Codebase for RAG Queries
1. Navigate to the **Repo AI Assistant** tab in the sidebar.
2. If the repository is not indexed yet, you will see a badge that says **Index Codebase**.
3. Click the **Index Codebase** badge/button. The server will fetch your repository files, split them into character chunks, compute their vector embeddings, and save them. Once complete, the badge will switch to a green pulsating **Indexed** state.

### Step 3: Converse with the AI Assistant
1. Select your desired mode from the tab switcher:
   * **Codebase RAG**: Query specific files, code snippets, or configuration structures.
   * **Branch Focus**: Choose a branch from the dropdown list to audit its modified files and git diffs.
   * **General AI**: Ask general software engineering concepts, lifecycle details, or snippet creation.
2. Enter your query. The AI assistant will output a concise, relevant response.
3. Hover over the simulated code blocks and click **Copy** to instantly grab the code to your clipboard.

### Step 4: Resolve Merge Conflicts
1. Head to the **Conflict Predictor** in the sidebar.
2. Select a source branch and a target branch, then click **Predict Conflicts**.
3. The platform will analyze the Git Tree. If a collision is detected, double-click the conflicting file to open it in the Monaco Editor.
4. Click **Resolve with AI** or manually clean up conflict lines, then save the resolution.

---

<div align="center">
  <sub>Built with modern web standards to keep your code streams calm.</sub>
</div>