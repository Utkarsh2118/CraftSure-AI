# CraftSure AI

An AI-assisted regional handicraft visual-matching, provenance and discovery platform across Uttar Pradesh, aligned with the One District One Product (ODOP) initiative and Geographical Indications (GI) Registry.

## Architecture

| Layer    | Technology                                        |
| -------- | ------------------------------------------------- |
| Frontend | Next.js 14+ (App Router), TypeScript, CSS Modules |
| Backend  | Express + TypeScript, Drizzle ORM                 |
| Database | PostgreSQL (Supabase)                             |
| Auth     | Supabase Auth                                     |
| Monorepo | Turborepo + pnpm workspaces                       |

See the full architecture plan and official UP references in the [engineering document](./docs/architecture.md).

## Getting Started

### Prerequisites

- Node.js ≥ 20
- npm / pnpm

### Installation

```bash
pnpm install
# or npm install across apps/api, apps/web, packages/shared-types
```

### Environment Setup

```bash
# Web app
cp apps/web/.env.example apps/web/.env.local

# API
cp apps/api/.env.example apps/api/.env
```

### Development

```bash
# Web only (port 3000)
cd apps/web && npm run dev

# API only (port 4000)
cd apps/api && npm run dev
```

### Testing

```bash
# Web unit tests
cd apps/web && npm test

# API integration tests
cd apps/api && npm test
```

### Type checking

```bash
# Web
cd apps/web && npx tsc --noEmit

# API
cd apps/api && npx tsc --noEmit
```

## Project Structure

```
craftsure-ai/
├── apps/
│   ├── web/     # Next.js frontend (Districts, Crafts, Catalog, Auth)
│   └── api/     # Express backend (Districts, Crafts, Products, Auth)
├── packages/
│   └── shared-types/   # Shared TypeScript types and API contracts
└── docs/
    └── architecture.md # UP-wide technical blueprint & ODOP provenance
```

## Implementation Phases

| Phase | Scope                                                                             | Status         |
| ----- | --------------------------------------------------------------------------------- | -------------- |
| 1     | Foundation: UP district & craft catalogue, artisan profiles, auth, discovery      | 🚧 In progress |
| 2     | Transact: payment, orders, delivered reviews, statutory GI verification           | ⏳ Planned     |
| 3     | AI Discovery: calibrated visual similarity search & out-of-distribution rejection | ⏳ Planned     |

## Engineering Principles

- All prices stored as integer paise (never floats)
- Craft origin, district, craft type, technique, and materials are stored as separate normalized fields
- GI authenticity badges strictly require official authorized user certificates audited by administrators
- Visual similarity in AI discovery measures stylistic likeness only and never equates to statutory authenticity
- Non-craft ODOP products (agricultural commodities, processed foods) are strictly excluded
- Reviews are only allowed after order delivery
