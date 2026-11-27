# @craftsure/web — Frontend Application

Next.js 16 App Router frontend for CraftSure AI, showcasing regional handicrafts across 75 districts of Uttar Pradesh with authentic artisan discovery, district heritage catalogues, and verified GI credentials.

---

## 📁 Directory Structure

```
apps/web/
├── app/                        # App Router Pages & Layouts
│   ├── about/                  # About & mission
│   ├── admin/                  # Administrative verification dashboard
│   ├── artisan/                # Artisan onboarding & registry application
│   ├── auth/                   # Sign-in & session flows
│   ├── browse/                 # Multi-facet craft & district catalogue browser
│   ├── cart/                   # Shopping cart
│   ├── checkout/               # Resilient checkout with integer paise totals
│   ├── crafts/                 # Craft profile dynamic routes (/crafts/[slug])
│   ├── districts/              # District dynamic routes (/districts/[slug])
│   ├── products/               # Product detail routes (/products/[id])
│   ├── saved/                  # Saved & bookmarked crafts
│   ├── search/                 # Visual and text craft search
│   ├── layout.tsx              # Root layout with metadata and styling
│   └── page.tsx                # Homepage featuring ODOP heritage hero & crafts
├── components/                 # Reusable Presentation Components
│   ├── layout/                 # Structural UI (Header, Navigation)
│   └── ui/                     # Primitives (Badge, Button, EmptyState, Input, Skeleton)
├── features/                   # Domain Feature Slices
│   ├── auth/                   # Authentication & session token management
│   ├── crafts/                 # Craft definitions & queries
│   ├── artisans/               # Artisan registration & profile queries
│   ├── products/               # Product catalogue helpers & ProductActions component
│   ├── orders/                 # Order creation & currency utilities
│   └── admin/                  # Admin review decisions & audit trail
├── lib/                        # Foundation Libraries
│   ├── api/                    # API client with timeout and offline fallbacks
│   ├── data/                   # Verified UP ODOP static catalogues & seed data
│   ├── store/                  # Zustand global state (cart, wishlist)
│   └── utils/                  # Currency formatting, date formatting, classname helpers
└── public/                     # Static media assets & images
```

---

## 🔧 Scripts

```bash
# Start Next.js local development server (port 3000)
pnpm dev

# Build production static pages & bundle
pnpm build

# Start production server
pnpm start

# Run TypeScript static typechecker
pnpm typecheck

# Run ESLint validation
pnpm lint

# Run Vitest component & unit tests
pnpm test
```

---

## 🌐 Environment Configuration

Create `.env.local` based on `.env.example`:

```env
# URL of the backend API
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Enable mock demo logins for testing
NEXT_PUBLIC_ENABLE_DEMO_AUTH=true
```

---

## 🎨 Design System & UI Conventions

- **Colors & Tokens**: CSS custom properties defined in `app/globals.css`.
- **CSS Modules**: Component-scoped styles in `*.module.css` for isolation and zero runtime overhead.
- **Accessibility (a11y)**: Semantic HTML elements, ARIA attributes, keyboard navigation, and explicit color contrast compliance.
