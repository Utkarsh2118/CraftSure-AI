# Local Development & Setup Guide

This guide walks you through setting up CraftSure AI locally for development and testing.

---

## 1. Environment Requirements

Ensure the following runtimes and package managers are installed on your workstation:

- **Node.js**: `20.x` or later (`node -v`)
- **pnpm**: `9.x` or later (`pnpm -v`)
- **Python**: `3.10` or later (`python --version`)
- **Git**: `2.30` or later

---

## 2. Clone and Bootstrap

```bash
# Clone the repository
git clone https://github.com/Utkarsh2118/CraftSure-AI.git
cd CraftSure-AI

# Install all workspace dependencies
pnpm install
```

---

## 3. Environment Variables Configuration

### A. Frontend (`apps/web/.env.local`)
Create `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_ENABLE_DEMO_AUTH=true
```

### B. Backend API (`apps/api/.env`)
Create `apps/api/.env`:
```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# PostgreSQL Connection (Supabase or Local PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/craftsure

# Supabase Auth / JWT Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret-or-public-key

# AI Microservice URL
AI_SERVICE_URL=http://localhost:8000
```

---

## 4. Database Setup & Migrations

CraftSure AI uses **Drizzle ORM** for schema definition and migrations:

```bash
cd apps/api

# Run schema migrations against the configured DATABASE_URL
pnpm db:migrate

# Optional: Inspect database with Drizzle Studio
pnpm db:studio
```

*Note: If no PostgreSQL database is available locally, the API seamlessly operates using its built-in in-memory fallback ledger for offline development and testing.*

---

## 5. Running the Application

### Option 1: Run All Services via Turborepo
```bash
# From repository root
pnpm dev
```

### Option 2: Run Services Individually
```bash
# Terminal 1 — Backend Express API (Port 4000)
cd apps/api
pnpm dev

# Terminal 2 — Frontend Next.js (Port 3000)
cd apps/web
pnpm dev

# Terminal 3 — AI Microservice (Port 8000)
cd apps/ai-service
python main.py
```

Access the frontend at: `http://localhost:3000`  
API health check at: `http://localhost:4000/health`  
AI service health check at: `http://localhost:8000/health`

---

## 6. Running the Test Suite

```bash
# Run all tests across the monorepo
pnpm -r test

# Run AI service unit tests
python apps/ai-service/test_ai_service.py

# Typecheck and lint
pnpm -r typecheck
pnpm -r lint
```
