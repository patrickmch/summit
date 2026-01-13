# Summit - AI Training Plans for Mountain Athletes

## Current Status: LLM Router Integration Complete ✅

Both backend and frontend are implemented. LLM calls now route through `llm_router` service instead of direct Anthropic API.

---

## LLM Router Integration

### Architecture Change

Summit now uses `llm_router` service to handle AI completions instead of direct Anthropic SDK calls.

```
┌─────────────────┐     HTTP POST      ┌─────────────────┐     API Calls    ┌─────────────────┐
│     Summit      │ ──────────────────▶│   llm_router    │ ───────────────▶│  Claude/Gemini  │
│  (Next.js API)  │  /api/query        │   (FastAPI)     │                  │   (LLM APIs)    │
└─────────────────┘                    └─────────────────┘                  └─────────────────┘
```

### Benefits
- **Provider abstraction**: Switch between Claude and Gemini without code changes
- **Centralized configuration**: LLM settings managed in one place
- **Context loading**: Can load context from files, JSON, or SQLite
- **Reusable**: Other projects can use the same llm_router instance

### Files Changed
| File | Change |
|------|--------|
| `src/lib/llm-router/client.ts` | New client for llm_router HTTP API |
| `src/app/api/chat/route.ts` | Import from llm-router instead of anthropic |
| `src/app/api/plans/generate/route.ts` | Import from llm-router instead of anthropic |
| `.env.local` | Added `LLM_ROUTER_URL`, `DEFAULT_LLM`; removed `ANTHROPIC_API_KEY` |
| `.env.example` | Updated with llm_router config |

### Running with LLM Router

```bash
# Terminal 1: Start llm_router service
cd ~/code/llm_router
python main.py  # Runs on http://localhost:8000

# Terminal 2: Start Summit
cd ~/code/summit
npm run dev
```

### Environment Variables

```bash
# Required for AI features
LLM_ROUTER_URL=http://localhost:8000
DEFAULT_LLM=claude  # or "gemini"
```

---

## Frontend Implementation

### What's Done

#### Design System (`src/app/globals.css`)
- [x] CSS custom properties for colors, typography
- [x] Dark header / light content theme
- [x] Amber accent, emerald success colors
- [x] Intensity colors (easy/moderate/hard/max)
- [x] Mobile-safe viewport handling
- [x] Animations (fade-in, slide-up, pulse)

#### Components

**Base UI (`src/components/ui/`)**
- [x] Button (primary, secondary, ghost, danger variants)
- [x] Card (with Header, Title, Content, Footer)
- [x] Badge (status variants + MetricBadge)
- [x] Input & Textarea (with labels, errors, icons)
- [x] Skeleton (loading states)

**Layout (`src/components/layout/`)**
- [x] BottomNav (4 tabs with icons)
- [x] Header (dark variant with subtitle/title/avatar)
- [x] PageShell (app shell with nav padding)
- [x] Avatar (initials or image)

**Today Screen (`src/components/today/`)**
- [x] MetricsStrip (HRV, Sleep, Load, Recovery)
- [x] WorkoutCard (with rest day and completed states)
- [x] WorkoutBlock (expandable exercise blocks)

**Plan Screen (`src/components/plan/`)**
- [x] WeekNav (week navigation with phase)
- [x] DayStrip (horizontal day selector)
- [x] DayCell (status-colored indicators)
- [x] WorkoutDetail (selected day view)

**Chat Screen (`src/components/chat/`)**
- [x] MessageBubble (user/assistant styling)
- [x] StructuredContent (plan change cards)
- [x] ChatInput (auto-resize textarea)

**Onboarding (`src/components/onboarding/`)**
- [x] StepIndicator (progress dots)

#### Pages

**Auth (`src/app/auth/`)**
- [x] `/auth/login` - Email/password + OAuth
- [x] `/auth/signup` - Registration with confirmation

**App (`src/app/(app)/`)**
- [x] `/today` - Today's workout, metrics, streak
- [x] `/plan` - Week calendar view
- [x] `/chat` - AI coach conversation
- [x] `/profile` - Settings and account

**Onboarding (`src/app/onboarding/`)**
- [x] `/discipline` - Multi-select disciplines
- [x] `/goal` - Goal text and target date
- [x] `/schedule` - Days and hours per week
- [x] `/equipment` - Equipment and fitness level
- [x] `/generating` - Plan generation with loading animation

#### Hooks (`src/hooks/`)
- [x] useToday - Today's workout and metrics
- [x] useWeek - Week navigation and workouts
- [x] useChat - Chat messages and streaming
- [x] useOnboarding - Multi-step form state

#### Core (`src/lib/`, `src/contexts/`)
- [x] API client with auth (`src/lib/api/client.ts`)
- [x] Browser Supabase client (`src/lib/supabase/browser.ts`)
- [x] Date utilities (`src/lib/utils/date.ts`)
- [x] AuthContext with session management

### Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Custom Tailwind components | Lighter bundle, tailored to design spec, no Radix dependencies |
| CSS variables for theming | Tailwind v4 CSS-first approach, works in JS too |
| Route groups `(app)` | Shared layout with bottom nav for auth-protected routes |
| sessionStorage for onboarding | Persists data across page navigations, clears on completion |
| Custom hooks for API | Simple data fetching without heavy state libraries |

---

## Backend (Previously Completed)

### API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/profiles` | GET/POST/PUT | User profile CRUD |
| `/api/plans` | GET | List user's plans |
| `/api/plans/generate` | POST | Generate AI training plan |
| `/api/workouts` | GET | Get workouts (by date/week/plan) |
| `/api/workouts/log` | POST | Log workout completion |
| `/api/today` | GET | Today's workout + metrics + streak |
| `/api/week` | GET | This week's training overview |
| `/api/chat` | GET/POST | Chat with AI coach |
| `/api/metrics` | GET/POST | Health metrics CRUD |
| `/api/stripe/checkout` | POST | Create subscription checkout |
| `/api/stripe/portal` | POST | Customer billing portal |
| `/api/webhooks/stripe` | POST | Stripe event webhook |
| `/api/auth/callback` | GET | OAuth/magic link callback |

### AI System
- Training methodology prompts based on TFTNA, Hörst, Uphill Athlete
- Plan generation with proper periodization
- Adaptive coaching via chat
- Context-aware responses with user metrics

---

## What's Next

### Immediate
1. Add environment variables (`.env.local`)
2. Test full flow: signup → onboarding → plan generation → daily use
3. Fix any integration issues

### Future Enhancements
- [ ] Workout logging modal (RPE, duration, notes)
- [ ] Profile edit modals
- [ ] Terra watch connection widget
- [ ] Offline workout viewing (PWA)
- [ ] Push notifications for workouts

---

## Environment Setup

```bash
# Required in .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# LLM Router (replaces ANTHROPIC_API_KEY)
LLM_ROUTER_URL=http://localhost:8000
DEFAULT_LLM=claude

# Stripe (Payments)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_MONTHLY_PRICE_ID=

NEXT_PUBLIC_APP_URL=
```

## Running Locally

```bash
# Install dependencies
npm install

# Start Supabase (requires Docker)
supabase start

# Start llm_router service (separate terminal)
cd ~/code/llm_router && python main.py

# Start dev server
npm run dev

# Listen for Stripe webhooks (separate terminal)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Session Context

### Key Frontend Files
- `src/app/globals.css` - Design system tokens
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/lib/api/client.ts` - Authenticated API client
- `src/components/ui/*` - Base UI components
- `src/components/layout/*` - Layout shell components
- `src/app/(app)/*` - Main app pages
- `src/app/onboarding/*` - Onboarding flow

### Key Backend Files
- `src/lib/llm-router/client.ts` - LLM Router HTTP client
- `src/prompts/training-methodology.ts` - Training science knowledge
- `src/app/api/plans/generate/route.ts` - Plan generation
- `src/app/api/chat/route.ts` - AI coach interface
- `src/types/database.ts` - All TypeScript types

---

## Blockers/Questions

- None for MVP - ready for integration testing
- Terra Integration deferred to post-MVP
- Rate limiting recommended for production
