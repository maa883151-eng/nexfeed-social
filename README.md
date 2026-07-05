# NexFeed — AI-Powered Social Feed Platform

A full-stack social network where posts are ranked by Claude AI based on user interests and engagement.

## Tech Stack
- Backend: Node.js, Express, PostgreSQL (Supabase), Socket.io, Anthropic SDK
- Frontend: React 18, Vite, Tailwind CSS, Zustand, React Router, Axios

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY
# Run backend/src/config/schema.sql in your Supabase SQL editor
npm run dev
```
Runs on http://localhost:5000

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL if needed
npm run dev
```
Runs on http://localhost:5173

## Deployment
- Backend → Render (Web Service, root: `backend`, start: `node src/server.js`)
- Frontend → Vercel (root: `frontend`, framework: Vite)
- Set `VITE_API_URL` on Vercel to your deployed backend URL + `/api`
- Set `CLIENT_URL` on Render to your deployed frontend URL

## Verified
- Backend: all source files syntax-checked, server boots cleanly on port 5000
- Frontend: `npm run build` completes with 0 errors (134 modules, ~340KB bundle)
