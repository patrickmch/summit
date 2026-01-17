# Summit | Train with Intention

## Current Status: Weekly Training System Implemented

Frontend using Vite + React 19, connected to summit-ai for RAG-enhanced coaching.
**New:** Structured training plans with weekly tracking and AI-powered adjustments.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vite + React SPA                     │
├─────────────────────────────────────────────────────────┤
│  Flow: Landing → Onboarding → Plan Review → Dashboard   │
│  Styling: Tailwind CSS + Inter/Playfair fonts           │
│  Routing: React Router (HashRouter)                     │
└───────────────────────────┬─────────────────────────────┘
                            │ POST /api/query
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Summit-AI (FastAPI)                    │
├─────────────────────────────────────────────────────────┤
│  RAG: pgvector semantic search over training docs       │
│  LLM: Routes to Claude or Gemini                        │
│  Embeddings: OpenAI text-embedding-3-small              │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
summit/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Layout.tsx
│   │   ├── MetricCard.tsx
│   │   ├── WorkoutCard.tsx
│   │   ├── WorkoutLogModal.tsx       # NEW - log workout completion
│   │   ├── WeeklyReviewBanner.tsx    # NEW - weekly review prompt
│   │   ├── WeeklyReviewModal.tsx     # NEW - collect week feedback
│   │   └── AdjustmentReviewModal.tsx # NEW - show AI suggestions
│   ├── contexts/
│   │   ├── AuthContext.tsx           # Auth + plan storage
│   │   └── TrainingLogContext.tsx    # NEW - workout logging
│   ├── views/              # Page components
│   │   ├── LandingPage.tsx
│   │   ├── Onboarding.tsx
│   │   ├── PlanReview.tsx  # Updated - structured plans
│   │   ├── Dashboard.tsx   # Updated - real plan data
│   │   ├── ChatView.tsx
│   │   └── ProgressView.tsx
│   ├── services/
│   │   └── summitAiService.ts  # Updated - structured plan generation
│   ├── utils/
│   │   └── planUtils.ts    # NEW - week/workout helpers
│   ├── App.tsx             # Router + Providers
│   ├── index.tsx           # Entry point
│   ├── index.css           # Tailwind + custom styles
│   ├── types.ts            # Updated - new training types
│   └── constants.tsx       # Mock data (retained for fallback)
├── supabase/               # Database (preserved)
├── public/                 # Static assets
├── index.html              # HTML entry
├── vite.config.ts          # Vite config
├── tailwind.config.js      # Updated - typography plugin
└── package.json            # Updated - typography package
```

## Training System Flow

```
Plan Generated → Week 1 shown on Dashboard → Athlete logs workouts
     ↓
Day before Week 2 → Weekly review banner → Upload week's data to AI
     ↓
AI analyzes → Suggests adjustments → Athlete accepts/rejects → Week 2 proceeds
```

## Key Types

```typescript
// Structured plan with weekly breakdown
interface StructuredPlan {
  overview: string;
  totalWeeks: number;
  phases: Phase[];
  weeks: WeekPlan[];
  markdownSummary: string;
}

// Week with scheduled workouts
interface WeekPlan {
  weekNumber: number;
  phase: string;
  theme: string;
  workouts: PlannedWorkout[];
  coachNote?: string;
}

// Individual workout
interface PlannedWorkout {
  id: string;
  dayOfWeek: number; // 0=Sun, 1=Mon...
  title: string;
  type: WorkoutType;
  duration: string;
  durationMinutes: number;
  intensity: 'Low' | 'Moderate' | 'High' | 'Max';
  blocks: WorkoutBlock[];
}

// Workout completion log
interface WorkoutLog {
  id: string;
  plannedWorkoutId: string;
  weekNumber: number;
  completedAt: Date;
  actualDurationMinutes: number;
  rpe: number; // 1-10
  notes: string;
  skipped: boolean;
}
```

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/landing` | LandingPage | Marketing/hero page |
| `/onboarding` | Onboarding | User onboarding flow |
| `/plan-review` | PlanReview | AI-generated structured plan + chat |
| `/` | Dashboard | Week view with real workouts, logging |
| `/chat` | ChatView | AI coach conversation |
| `/progress` | ProgressView | Training progress charts |
| `/plan` | (placeholder) | Full training calendar |
| `/settings` | (placeholder) | User settings |

## Tech Stack

- **React 19** - UI framework
- **Vite 6** - Build tool
- **React Router 7** - Client-side routing
- **Summit-AI** - RAG-enhanced coaching (Claude/Gemini via FastAPI)
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Tailwind CSS 3** - Styling
- **@tailwindcss/typography** - NEW - Prose styling for markdown
- **date-fns** - Date manipulation

## Environment Variables

```bash
# .env.local
VITE_SUMMIT_AI_URL=http://localhost:8000  # or Railway URL
```

## Running Locally

```bash
# 1. Start summit-ai backend (in separate terminal)
cd ~/code/summit-ai && python -m uvicorn main:app --reload

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# Build for production
npm run build
```

---

## Design System

### Colors
- Background: `#1a1a1a` (dark)
- Card: `#262626`
- Text: `#f5f2ed` (warm white)
- Muted: `#737373`
- Accent: Amber-500 (`#f59e0b`)

### Typography
- Body: Inter (sans-serif)
- Headings: Playfair Display (serif)
- Markdown: prose-invert prose-amber (typography plugin)

---

## What's Done

- [x] Vite + React SPA frontend
- [x] Authentication flow (signup + protected routes)
- [x] Onboarding flow (6 steps)
- [x] Plan review screen (AI-generated plan + chat for modifications)
- [x] AI coach chat via summit-ai (RAG-enhanced)
- [x] Progress visualization
- [x] **Structured training plans** (JSON with markdown summary)
- [x] **Dashboard connected to real plan** (current week, today's workout)
- [x] **Workout logging** (complete/skip with RPE and notes)
- [x] **Weekly review flow** (banner → modal → AI adjustment suggestions)
- [x] **Markdown rendering fixed** (@tailwindcss/typography installed)
- [x] **Streaming chat responses** (SSE for faster perceived response time)
- [x] **Smart plan updates** (detect change requests, regenerate plan)

## What's Next

- [ ] Connect to Supabase for real auth and data persistence
- [ ] Build out Plan calendar view (full weeks visible)
- [ ] Add biometric data integration (Strava, etc.)
- [ ] Deploy summit-ai to Railway

---

## Session Context

Last updated: 2026-01-16

### Files Modified This Session
- `src/services/summitAiService.ts`:
  - Added `chatAboutPlanStream()` - SSE streaming for chat
  - Added `regeneratePlanWithChanges()` - regenerate plan with modifications
  - Added `calculateWeeksUntilTarget()` - dynamic week count from target date
  - Fixed phase week calculations to be dynamic instead of hardcoded
  - Fixed coach notes to be phase-aware
- `src/views/PlanReview.tsx` - Streaming state, async generator consumption, update confirmation UI

### Key Decisions
- **JSON + Markdown hybrid**: AI returns structured JSON with markdown summary for display
- **Week start**: Monday (dayOfWeek: 1=Mon, 2=Tue, ... 0=Sun)
- **Week calculation**: `Math.floor(daysSincePlanStart / 7) + 1` from planStartDate
- **Plan duration**: Calculated from target date (4-24 weeks), defaults to 8 if no target
- **Storage**: localStorage initially (can migrate to Supabase later)
- **Review trigger**: Time-based check on app load (Sunday, 24hrs before Monday)
- **Streaming**: SSE with async generator pattern for clean consumption
- **Change detection**: Heuristic pattern matching (fast, no extra API call)
- **Plan update**: Full regeneration via backend (returns original if backend unavailable)
- **UX**: Streaming cursor + bottom confirmation banner (non-intrusive)
