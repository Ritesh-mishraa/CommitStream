# CommitStream

CommitStream is a comprehensive project management and collaboration platform built for development teams. It integrates repository insights, real-time communication, task tracking, and AI-powered conflict prediction into a single unified workspace.

## 🚀 Features

- **GitHub Integration & Insights**: Seamlessly connect with GitHub to track branches, commits, and project metrics.
- **AI-Powered Conflict Predictor**: Identify potential merge conflicts before they happen and get AI-generated context using Gemini to resolve them efficiently.
- **Task Management**: Drag-and-drop task boards for tracking progress and managing workflows.
- **Real-time Collaboration**: Live chat and dedicated rooms for team communication.
- **Audits & Activity Tracking**: Keep track of all project changes and team activities.
- **Interactive Dashboard**: Visualize project health and insights with rich charts.

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: React with Vite
- **Styling**: Tailwind CSS & Framer Motion
- **Visuals**: Recharts
- **Collaboration**: Socket.io-client
- **Code Editor**: Monaco Editor (for AI conflict resolution)
- **Features**: DnD Kit for drag-and-drop

### Backend (Server)
- **Environment**: Node.js & Express.js
- **Database**: Prisma ORM & Mongoose
- **Real-time API**: Socket.io
- **Auth**: Passport.js with GitHub OAuth
- **AI Engine**: `@google/genai`
- **Documentation**: Swagger UI

## 📂 Project Structure

This project is set up as a monorepo containing three workspaces:
- `client/`: The React frontend application.
- `server/`: The Express backend API.
- `shared/`: Shared models, types, and resources.

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd CommitStream
   ```

2. **Install dependencies**:
   Installs node modules for all workspaces simultaneously.
   ```bash
   npm run install:all
   ```

3. **Set up Environment Variables**:
   - Create a `.env` file in the `server` directory and configure the necessary keys (Database URLs, GitHub OAuth Client/Secret, Gemini AI API key, etc.).
   - Create a `.env` file in the `client` directory if required for frontend-specific variables (e.g., Vite API URL).

### Running Locally

Start both the client and server concurrently from the root directory:

```bash
npm run dev
```

This will run the Vite development server for the frontend and Nodemon for the backend.