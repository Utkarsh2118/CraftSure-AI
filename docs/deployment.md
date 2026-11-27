# Production Deployment & Infrastructure Guide

This document describes the deployment architecture, environment configuration, and operational topology for running CraftSure AI in production.

---

## 1. System Architecture

```
                    ┌─────────────────────────┐
                    │      Cloudflare CDN     │
                    └────────────┬────────────┘
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
┌───────────────────────┐                   ┌───────────────────────┐
│ Next.js Web App       │                   │ Express REST API      │
│ (Vercel / Container)  │                   │ (Container / Node.js) │
└───────────────────────┘                   └───────────┬───────────┘
                                                        │
                         ┌──────────────────────────────┴──────────────────────────────┐
                         ▼                                                             ▼
              ┌─────────────────────┐                                       ┌─────────────────────┐
              │ Managed PostgreSQL  │                                       │ Python AI Service   │
              │ (Supabase / RDS)    │                                       │ (Container / CPU)   │
              └─────────────────────┘                                       └─────────────────────┘
```

---

## 2. Workspaces & Deployment Targets

| Workspace | Artifact | Recommended Target | Port / Routing |
|---|---|---|---|
| `apps/web` | Standalone Next.js App | Vercel or Docker container | Port 3000 |
| `apps/api` | Compiled Node.js server | Fly.io, Render, AWS ECS, Cloud Run | Port 4000 |
| `apps/ai-service` | Python FastAPI ASGI app | Cloud Run, Render, Fly.io (CPU optimized) | Port 8000 |
| `packages/shared-types` | Compiled TypeScript declarations | Internal monorepo package | Built during build pipeline |

---

## 3. Database Deployment & Pooling

### Supabase Connection Modes:
- **Session Mode (`port 5432`)**: Used for Drizzle migrations (`pnpm db:migrate`) requiring a direct connection with `max: 1`.
- **Transaction Mode (`port 6543`)**: Used for web application queries routing through PgBouncer/Supavisor. Set `prepare: false` to avoid statement caching collisions.

---

## 4. Production Environment Checklist

### `apps/api`
| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Listening port | `4000` |
| `DATABASE_URL` | PostgreSQL transaction pooler URL | `postgresql://postgres.[ref]:[pass]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres` |
| `CORS_ORIGIN` | Allowed web origin | `https://craftsure.ai` |
| `JWT_SECRET` | Secret or public key for Supabase JWT verification | High-entropy string |
| `AI_SERVICE_URL` | Internal URL for AI service | `http://ai-service:8000` |

### `apps/web`
| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Public API endpoint | `https://api.craftsure.ai/api` |
| `NEXT_PUBLIC_ENABLE_DEMO_AUTH` | Disable demo login in production | `false` |

---

## 5. Zero-Downtime Deployment Steps

1. **Build Step**:
   ```bash
   pnpm install --frozen-lockfile
   pnpm -r build
   ```
2. **Apply Database Migrations**:
   ```bash
   cd apps/api
   pnpm db:migrate
   ```
3. **Deploy Backend API** and verify `/health` returns `{"ok":true,"data":{"status":"ok"}}`.
4. **Deploy AI Service** and verify `/health` returns `{"status":"ok"}`.
5. **Deploy Frontend Web Application** and verify SSG routes render.

---

## 6. Continuous Integration (CI/CD Pipeline)

Automated testing and quality checks run on every commit and pull request to `main` via GitHub Actions (`.github/workflows/ci.yml`):

1. **Monorepo Job**:
   - Environment: Ubuntu Latest, Node.js 20, pnpm 9.15.4.
   - Tasks: Frozen lockfile install, workspace typechecking (`pnpm -r typecheck`), linting (`pnpm -r lint`), integration test suite (`pnpm -r test`), and production SSG page compilation (`pnpm -r build`).
2. **AI Inference Service Job**:
   - Environment: Ubuntu Latest, Python 3.11 with pip caching.
   - Tasks: Dependency installation (`requirements.txt`), unit test suite, and OOD rejection tests (`pytest` and `test_ai_service.py`).

