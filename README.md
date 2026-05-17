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

- **Backend Stack**: Express + Sequelize (PostgreSQL). I chose Sequelize because it maps cleanly to relational databases while allowing for rapid iteration with automatic syncing and built-in soft-delete functionality (`paranoid: true`).
- **Storage**: MinIO handles S3 compatibility locally. I implemented a **Direct-to-S3 Upload** flow. The backend never receives file bytes. Instead, it generates a presigned URL, and the client pushes directly to MinIO. The client then confirms completion, and the backend verifies the file exists in storage via `HeadObject`.
- **Data Model**:
  - `Users` have many `Folders` and `Files`.
  - `Folders` are self-referencing (have a `parentId` pointing to another `Folder`) allowing infinite nesting.
  - Soft deletes on a Folder recursively propagate to all child folders and files to ensure they don't appear in read queries.

## 3. Frontend Decisions

- **Framework**: Next.js App Router for a robust foundation.
- **Styling**: Tailwind CSS for highly polished, rapid UI development with dynamic hover states and animations.
- **State Management**: I use React Context for Auth state, and standard React hooks (`useState`, `useEffect`) combined with SWR/Custom hooks for data fetching.
- **Upload Progress**: Server Actions don't support XHR upload progress events naturally, so I fallback to a traditional `XMLHttpRequest` in a custom hook to provide a real-time progress bar when uploading directly to the MinIO presigned URL.

## 4. What I'd do differently with more time

- **Database Migrations**: Currently, we use `sequelize.sync({ alter: true })` for rapid prototyping. In production, I would use `umzug` or Sequelize CLI for formal up/down migrations.
- **Chunked Uploads**: For very large files, a Multipart Upload flow using S3's API would be more resilient than a single PUT request.
- **Background Jobs**: The recursive soft-delete logic is executed synchronously in the request handler. For deeply nested folders with thousands of files, this could timeout. I would move this to a background queue (like BullMQ).

## 5. What I cut and why

- **Complex Permissions**: Currently, if you have a share token, you can download the file. I cut explicit "user-to-user" sharing (e.g., granting another specific email access to a folder) to focus on a polished core experience within the time limit.
- **Thumbnail Generation**: Cut to save time and reduce backend complexity, though it could be added by hooking a Lambda-like function to S3 events or generating them upon completion.
- **Advanced Error Recovery**: While network errors are handled, I didn't implement resumable uploads since standard presigned PUT requests don't natively support resume without moving to multipart.
