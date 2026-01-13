# Summit

AI training plans for mountain athletes that adapt to your life.

## What is Summit?

Summit is an intelligent training platform for climbers, ultra runners, ski mountaineers, and alpinists. Tell it your goal (send a V10, finish Leadville, climb Denali), your schedule, and your current fitness. It builds you a periodized training plan based on proven methodology.

The plan adapts as you go. When life happens, you just tell it.

## Features

- **Smart Plan Generation** - AI-powered periodized training plans based on TFTNA, Hörst, and Uphill Athlete methodology
- **Daily Guidance** - Open the app and see exactly what to do today
- **Adaptive Coaching** - Chat with your AI coach to adjust the plan when life happens
- **Watch Integration** (coming soon) - Pull data from Garmin, Apple Watch, Whoop, or Coros to auto-adjust based on recovery
- **Progress Tracking** - Log workouts, track streaks, see your training load

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL + Auth)
- **AI**: Anthropic Claude
- **Payments**: Stripe ($15/mo)
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for local Supabase)
- Supabase CLI
- Stripe CLI (for webhook testing)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/summit.git
cd summit

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Fill in your API keys in .env.local
```

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your-api-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_MONTHLY_PRICE_ID=price_your-price-id

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db push

# Or manually apply the migration in Supabase dashboard
```

### Development

```bash
# Start the dev server
npm run dev

# In another terminal, listen for Stripe webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/profiles` | GET/POST/PUT | User profile management |
| `/api/plans/generate` | POST | Generate new training plan |
| `/api/plans` | GET | List user's plans |
| `/api/workouts` | GET | Get workouts by date/week |
| `/api/workouts/log` | POST | Log workout completion |
| `/api/today` | GET | Today's workout + context |
| `/api/week` | GET | This week's overview |
| `/api/chat` | GET/POST | Chat with AI coach |
| `/api/metrics` | GET/POST | Health metrics |
| `/api/stripe/checkout` | POST | Start subscription |
| `/api/stripe/portal` | POST | Manage subscription |

## Training Philosophy

Summit's AI is trained on evidence-based endurance training principles:

- **80/20 Polarized Training** - 80% easy, 20% hard, avoid the "gray zone"
- **Progressive Overload** - 5-10% weekly increases, 3:1 build:recovery
- **Specificity** - Training gets more sport-specific as goals approach
- **Recovery is Training** - Adaptation happens during rest

## Project Structure

```
summit/
├── src/
│   ├── app/
│   │   └── api/           # API routes
│   ├── lib/
│   │   ├── supabase/      # Database client
│   │   ├── anthropic/     # AI client
│   │   ├── stripe/        # Payment client
│   │   └── auth/          # Auth middleware
│   ├── prompts/           # AI system prompts
│   └── types/             # TypeScript types
├── supabase/
│   └── migrations/        # Database schema
└── PROGRESS.md            # Development progress
```

## Roadmap

### MVP (Current)
- [x] Backend API
- [ ] Frontend UI
- [ ] Authentication
- [ ] Onboarding flow

### V1.1
- [ ] Terra watch integration
- [ ] Progress charts
- [ ] Email notifications

### V2
- [ ] Multiple active disciplines
- [ ] Plan templates
- [ ] Social features

## License

MIT
