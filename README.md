# CraftSure AI

An AI-assisted regional handicraft visual-matching, provenance verification, and direct-to-artisan discovery platform for Uttar Pradesh, strictly aligned with the One District One Product (ODOP) initiative and Geographical Indications (GI) Registry of India.

---

## 🏛️ Monorepo Architecture

```
CraftSure-AI/
├── apps/
│   ├── web/                    # Next.js 16 App Router Frontend
│   │   ├── app/                # Route definitions & SSG layouts
│   │   ├── components/         # Reusable presentation components (ui/, layout/)
│   │   ├── features/           # Domain feature slices (auth, crafts, artisans, products, orders, admin)
│   │   └── lib/                # Shared utilities, API client, data catalogues, stores
│   ├── api/                    # Express + TypeScript + Drizzle ORM Backend
│   │   ├── src/
│   │   │   ├── modules/        # Domain backend modules (auth, crafts, districts, products, artisans, orders, admin, ai)
│   │   │   ├── database/       # Unified database access layer & re-exports
│   │   │   ├── db/             # Drizzle schemas, migrations, seed catalogue
│   │   │   └── middleware/     # Auth, RBAC, error handling, rate limiting
│   └── ai-service/             # FastAPI Python Microservice
│       ├── routes/             # REST endpoints (health, pilot-crafts, predict)
│       ├── services/           # Visual search & craft matching engine
│       ├── models/             # Pydantic schemas and contracts
│       └── tests/              # Pytest test suite
├── packages/
│   └── shared-types/           # Shared TypeScript domain models & API contracts
└── docs/
    ├── architecture.md         # Comprehensive engineering blueprint & GI provenance rules
    ├── setup.md                # Local development & onboarding guide
    └── deployment.md           # Production deployment & infrastructure topology
```

---

## 🛠️ Technology Stack

| Layer | Technology | Key Capabilities |
|---|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript | Static Site Generation (SSG), CSS Modules, Accessible UI |
| **Backend** | Express 4, Node.js 20+, TypeScript, Drizzle ORM | Database-backed RBAC, integer paise transactions, offline resilience |
| **AI Service** | FastAPI, Python 3.10+, Pillow, NumPy | Out-of-distribution detection, calibrated visual similarity |
| **Database** | PostgreSQL (Supabase / Self-hosted) | Normalized craft schemas, atomic ledger, statutory GI audit trail |
| **Monorepo** | pnpm workspaces + Turborepo | Parallel build caching, zero-overhead type sharing |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: ≥ 20.x
- **pnpm**: ≥ 9.x
- **Python**: ≥ 3.10 (for `apps/ai-service`)

### 1. Installation
```bash
git clone https://github.com/Utkarsh2118/CraftSure-AI.git
cd CraftSure-AI
pnpm install
```

### 2. Configure Environment Files
```bash
# Frontend
cp apps/web/.env.example apps/web/.env.local

# Backend API
cp apps/api/.env.example apps/api/.env
```

Key environment variables:
- `NEXT_PUBLIC_API_URL`: Backend API base URL (`http://localhost:4000/api`)
- `DATABASE_URL`: PostgreSQL connection string (Supabase pooled or direct session)
- `JWT_SECRET`: Secret or Supabase JWT public key for token verification
- `AI_SERVICE_URL`: AI microservice URL (`http://localhost:8000`)

### 3. Run Development Servers
```bash
# Run all services concurrently via Turborepo:
pnpm dev

# Or run individual workspaces:
pnpm --filter @craftsure/api dev     # Port 4000
pnpm --filter @craftsure/web dev     # Port 3000
python apps/ai-service/main.py       # Port 8000
```

---

## 🧪 Verification & Testing

Every commit and pull request must satisfy the verification matrix:

```bash
# Typecheck all TypeScript workspaces
pnpm -r typecheck

# Lint all TypeScript workspaces
pnpm -r lint

# Run all automated tests (67 backend tests, 55 frontend tests, 4 AI tests)
pnpm -r test
python apps/ai-service/test_ai_service.py

# Production build test
pnpm -r build
```

---

## ⚖️ Non-Negotiable Core Engineering Principles

1. **Integer Paise Commercials**: All monetary quantities (`priceInPaise`, `totalInPaise`, `deliveryInPaise`) are strictly represented and calculated as positive integers. Floats are prohibited in financial logic.
2. **Statutory GI Verification vs AI Similarity**: Visual similarity evaluates stylistic aesthetic proximity only. Authenticity and GI Authorized User claims require verified pehchan registration and official documentation.
3. **Decoupled Verification State Machines**: Platform account approval (`approvalStatus`) is independent from craft masterhood (`verificationTier`) and legal GI registry status (`giAuthorizationStatus`).
4. **Resilient Data Access**: API routes utilize PostgreSQL with transactions and automatically degrade gracefully with offline-capable fallback ledgers during temporary database connection interrupts.
