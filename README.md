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

CommitStream is a comprehensive project management and collaboration platform built specifically for modern development teams. It replaces disjointed toolchains by integrating deep repository insights, real-time communication, task tracking, and an advanced AI-powered conflict predictor—all in one unified workspace.

---

## ✨ Features at a Glance

### 🧠 AI & DevOps Tooling
- **Smart Conflict Predictor & Resolver**: Select two branches to predict and simulate merge conflicts. Get detailed context and automatic resolution paths built directly into your browser with an integrated Monaco Editor.
- **AI Code Review**: Automate code audits and get contextual, intelligent suggestions directly from Gemini's core models.
- **Repository Insights**: Deep, interactive analytics providing visibility into team velocity, commit maps, and project health over time.

### 👥 Team & Collaboration
- **Real-Time Team Chat**: A dedicated workspace chat with live messaging (via Socket.io). Discuss code where it happens.
- **Team Directory**: Easily manage and onboard project members, assign roles, and distribute responsibilities smoothly.
- **Live Notifications**: Instant updates when a project changes state, conflict arises, or a teammate tags you.

### 📋 Agile Management
- **Interactive Kanban Boards**: A fluid drag-and-drop task tracker natively integrated with your team's pull-requests and branch pipelines.
- **Project Workspaces**: Instantly switch between completely isolated project environments holding distinct datasets and GitHub settings without leaving your current view.

---

## 🛠️ Architecture

CommitStream uses a robust Monorepo architectural pattern:

| Package | Purpose | Technologies |
| --- | --- | --- |
| `client/` | The frontend application. | React, Vite, Tailwind CSS, Recharts, Framer Motion, DnD Kit |
| `server/` | The core backend service layer. | Node.js, Express, Prisma (Postgres) / Mongoose, Socket.io |
| `shared/` | Shared types, data models & utilities. | TypeScript/JavaScript |

***Note:** Authentication flows smoothly over GitHub OAuth to verify developers rapidly while maintaining high security.*

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v18+`
- **Package Manager**: `npm` or `yarn`

### 2. Installation
Clone the repository and install all workspace dependencies effortlessly simultaneously.
```bash
git clone <repository-url>
cd CommitStream
npm run install:all
```

### 3. Environment Config
Set up your `.env` variables to connect the moving parts. 
Create a `.env` in the `server/` directory:
```env
# Example Server Environment Variables
PORT=5000
DATABASE_URL="your-database-connection-string"
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-secret"
GEMINI_API_KEY="your-google-gemini-key"
```

### 4. Lift Off 🪐
Fire up the full stack natively from the root project directory:
```bash
npm run dev
```
*This command binds `nodemon` to the backend API and spins up Vite's HMR server to get you developing immediately.*

---

<div align="center">
  <sub>Built with modern web standards to keep your code streams calm.</sub>
</div>