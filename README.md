# Fullstack File Management App

This is a file management application with a backend API built using Node.js/Express, PostgreSQL, and MinIO (S3-compatible storage), and a frontend built using Next.js and Tailwind CSS.

## 1. Setup Instructions

### Prerequisites
- Node.js (v18+)
- Docker and Docker Compose

### Running Locally

1. **Start Services (Postgres and MinIO)**
   ```bash
   docker-compose up -d
   ```
   This will start PostgreSQL on port 5434 and MinIO on ports 9000 and 9001. Then visit http://localhost:9001 to create the bucket "filemanager"

2. **Backend Setup**
   ```bash
   cd backend
   pnpm install
   npm run dev
   ```
   The backend will start on `http://localhost:4000`. Environment variables are defaulted to connect to local Postgres and MinIO, so no `.env` file is strictly required for local development.

3. **Frontend Setup**
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```
   The frontend will be accessible at `http://localhost:3000`.

## 2. Architecture Decisions

- **Backend Stack**: Express + Sequelize (PostgreSQL). I chose Sequelize because it maps cleanly to relational databases while allowing for rapid iteration with automatic syncing and built-in soft-delete functionality.
- **Storage**: MinIO handles S3 compatibility locally. I implemented a **Direct-to-S3 Upload** flow. The backend never receives file bytes. Instead, it generates a presigned URL, and the client pushes directly to MinIO. The client then confirms completion, and the backend verifies the file exists in storage via `HeadObject`.
- **Data Model**:
  - `Users` have many `Folders` and `Files`.
  - `Folders` are self-referencing (have a `parentId` pointing to another `Folder`) allowing infinite nesting.
  - Soft deletes on a Folder recursively propagate to all child folders and files to ensure they don't appear in read queries.

## 3. Frontend Decisions

- **Framework**: Next.js App Router for a robust foundation.
- **Styling**: Tailwind CSS for highly polished, rapid UI development with dynamic hover states and animations.
- **State Management**: I use React Context for Auth state, and standard React hooks (`useState`, `useEffect`) combined with SWR/Custom hooks for data fetching.


## 4. What I'd do differently with more time (What I cut and why)

- **Background Jobs**: The recursive soft-delete logic is executed synchronously in the request handler. For deeply nested folders with thousands of files, this could timeout. I would move this to a background queue (like BullMQ).



