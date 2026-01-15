# Summit | Train with Intention

## Current Status: Vite + React SPA

New frontend using Vite + React 19 + Google Gemini AI.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vite + React SPA                     │
├─────────────────────────────────────────────────────────┤
│  Views: Landing → Onboarding → Dashboard/Chat/Progress  │
│  AI: Google Gemini (client-side)                        │
│  Styling: Tailwind CSS + Inter/Playfair fonts           │
│  Routing: React Router (HashRouter)                     │
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
│   │   └── geminiService.ts
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
- **Google Gemini** - AI chat (via @google/genai)
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Tailwind CSS 3** - Styling

## Environment Variables

```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key
```

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server
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

## What's Next

- [ ] Connect to Supabase for auth and data
- [ ] Implement real workout data from database
- [ ] Add user authentication flow
- [ ] Build out Plan calendar view
- [ ] Add workout logging functionality
