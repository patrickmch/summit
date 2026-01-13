# Summit - AI Training Plans for Mountain Athletes

## Current Status: Backend MVP Complete ✅

The backend API is fully implemented and ready for frontend integration.

### What's Done

#### Infrastructure
- [x] Next.js 15 with TypeScript and App Router
- [x] Supabase database schema with RLS policies
- [x] Anthropic Claude AI integration
- [x] Stripe subscription system ($15/mo with 14-day trial)
- [x] Environment configuration template

#### Database Schema (`supabase/migrations/`)
- `profiles` - User preferences, subscription status, Terra integration
- `plans` - Training plans with full JSON structure
- `workouts` - Individual workout sessions
- `metrics` - Health data from wearables (HRV, sleep, etc.)
- `chat_history` - Conversation history with AI coach

#### API Routes

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

#### AI System
- Training methodology prompts based on TFTNA, Hörst, Uphill Athlete
- Plan generation with proper periodization
- Adaptive coaching via chat
- Context-aware responses with user metrics

### What's Next (Frontend)

1. **Authentication Pages**
   - Login/signup with Supabase Auth
   - Magic link or Google OAuth

2. **Onboarding Flow**
   - Multi-step form for profile creation
   - Discipline, goal, schedule, equipment selection

3. **Core Screens**
   - Today view (primary)
   - Week calendar view
   - Plan overview
   - Chat interface
   - Settings/subscription

4. **Mobile-First Design**
   - PWA configuration
   - Touch-friendly UI
   - Offline workout viewing

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| JSONB for plan storage | Allows flexible plan structures while maintaining queryable individual workouts |
| Dual storage (plans + workouts) | Plans store the full structure; workouts table enables efficient date-based queries |
| Non-destructive adaptations | When removing workouts, convert to rest days to preserve history |
| 80/20 training split | Evidence-based polarized training distribution embedded in prompts |
| Session-based chat context | Full user context gathered per message for accurate coaching |

### Session Context

**Key Files:**
- `src/prompts/training-methodology.ts` - Training science knowledge base
- `src/app/api/plans/generate/route.ts` - Plan generation logic
- `src/app/api/chat/route.ts` - Conversational AI interface
- `src/types/database.ts` - All TypeScript types
- `supabase/migrations/20240101000000_initial_schema.sql` - Database schema

**Dependencies:**
```json
{
  "@supabase/supabase-js": "^2.x",
  "@anthropic-ai/sdk": "^0.x",
  "stripe": "^17.x",
  "zod": "^3.x",
  "date-fns": "^4.x"
}
```

### Blockers/Questions

1. **Terra Integration** - Deferred to post-MVP. Manual metric entry supported.
2. **Rate Limiting** - Consider adding for production (Upstash Redis?)
3. **Email Notifications** - Not implemented. Add Resend/Postmark for:
   - Payment failures
   - Weekly summaries
   - Workout reminders

### Environment Setup

1. Copy `.env.example` to `.env.local`
2. Create Supabase project and add credentials
3. Get Anthropic API key
4. Set up Stripe product ($15/mo subscription)
5. Run `supabase db push` or apply migration manually

### Running Locally

```bash
# Install dependencies
npm install

# Start Supabase (requires Docker)
supabase start

# Start dev server
npm run dev

# Listen for Stripe webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
