# Summit | Train with Intention

## Current Status: Vite + React SPA + Summit-AI Backend

Frontend using Vite + React 19, connected to summit-ai for RAG-enhanced coaching.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vite + React SPA                     │
├─────────────────────────────────────────────────────────┤
│  Views: Landing → Onboarding → Dashboard/Chat/Progress  │
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
│   ├── components/      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Layout.tsx
│   │   ├── MetricCard.tsx
│   │   └── WorkoutCard.tsx
│   ├── views/           # Page components
│   │   ├── LandingPage.tsx
│   │   ├── Onboarding.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ChatView.tsx
│   │   └── ProgressView.tsx
│   ├── services/
│   │   └── summitAiService.ts  # Calls summit-ai backend
│   ├── App.tsx          # Router + Layout
│   ├── index.tsx        # Entry point
│   ├── index.css        # Tailwind + custom styles
│   ├── types.ts         # TypeScript types
│   └── constants.tsx    # Mock data
├── supabase/            # Database (preserved)
├── public/              # Static assets
├── index.html           # HTML entry
├── vite.config.ts       # Vite config
├── tailwind.config.js   # Tailwind config
└── package.json
```

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/landing` | LandingPage | Marketing/hero page |
| `/onboarding` | Onboarding | User onboarding flow |
| `/` | Dashboard | Main dashboard (today's workout, metrics) |
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

---

## What's Preserved

- `supabase/` - Database migrations and config
- `public/` - Static assets

## What's Done

- [x] Vite + React SPA frontend
- [x] Authentication flow (signup + protected routes)
- [x] Onboarding flow (6 steps)
- [x] Dashboard with today's workout (mock data)
- [x] AI coach chat via summit-ai (RAG-enhanced)
- [x] Progress visualization

## What's Next

- [ ] Connect to Supabase for real auth and data persistence
- [ ] Replace mock workout data with database queries
- [ ] Build out Plan calendar view
- [ ] Add workout logging functionality
- [ ] Deploy summit-ai to Railway
