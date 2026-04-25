# Adaptive Resource Allocation System

This is a complete MERN stack application designed for an intelligent urban issue management system.

## Features

- **Users:** Report issues with types, severity, descriptions, locations, and images.
- **System:** Automatically calculates priority scores and assigns the best-suited resource team based on zone, specialization, and current workloads.
- **Escalation Cron:** Every 10 minutes, the backend recalculates priorities and attempts to re-assign issues that have been pending for a long time.
- **Map View:** Live map (Leaflet) showing reported issues color-coded by their statuses (Pending, Assigned, Resolved, In Progress).
- **Notifications:** Real-time (simulated via polling/sync on load) notification alerts for issue updates.

---

## Folder Structure

The project is split into two directories:
- `/backend`: Node.js, Express, MongoDB, Node-Cron, Multer (Cloudinary)
- `/frontend`: React, Vite, Redux Toolkit, React-Leaflet, Tailwind CSS (Dark Theme)

---

## Prerequisites

Before you start, make sure you have:
1. Node.js installed (v16+)
2. MongoDB running locally or a MongoDB URI
3. Cloudinary Account (for image uploads)

---

## Setup & Run Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file (you can copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
4. Fill in the `.env` file with your credentials:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
5. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file (you can copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

### 3. Access the Project

Open your browser and navigate to the frontend URL (usually `http://localhost:5173`). Have fun exploring the system!