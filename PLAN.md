# Summit MVP Plan

## Core Philosophy

**SummitCoach is a coach, not a concierge.** It should be direct, opinionated, and grounded in training science. It doesn't over-cater to user preferences—it gives honest guidance based on context.

---

## Current Problems

### 1. Testing Friction
- Have to click through entire onboarding every time
- No way to persist a test profile
- Need simple auth or stored profile for development

### 2. Onboarding Doesn't Make Sense
- "Are you advanced?" has no bearing on the plan
- Sport selection (Trail Running, Alpine Climbing, etc.) is too rigid
  - If goal is "El Cap", selecting "trail running" makes no sense
- Questions aren't connected to plan generation logic

### 3. Plan Generation Issues
- **Hours don't ramp up** - uses max hours from day 1
- Should start lower and progressively build (periodization)
- Plan overview should be clear before acceptance
- After acceptance → generate week-by-week

### 4. Missing Context Awareness
- Plan should adapt based on:
  - Athletic background (free text context)
  - Goal complexity/timeline
  - Current fitness level (inferred, not self-reported)

---

## MVP Requirements

### Phase 1: Dev Experience & Auth (Priority: HIGH)

**Goal:** Remove testing friction, persist user data

| Task | Description | Effort |
|------|-------------|--------|
| Simple auth | Email magic link OR Google OAuth via Supabase | M |
| Persist profile | Store user profile in Supabase after onboarding | S |
| Skip onboarding | If profile exists, go straight to dashboard | S |
| Dev seed profile | Hardcoded test profile for rapid testing | S |

### Phase 2: Simplified Onboarding (Priority: HIGH)

**Goal:** Fluid, context-aware onboarding that actually matters

**New Flow (4 screens max):**

1. **Mountain Objective** (free text)
   - "What's your mountain objective?"
   - Examples: "Climb El Cap in 6 months", "Run UTMB next September", "Get strong for ski season"

2. **Athletic Background** (free text)
   - "Tell us about your athletic background in a sentence or two"
   - "Any health conditions or injuries we should know about?"

3. **Physical Stats** (quick form)
   - Age, height, weight
   - These matter for training load calculations

4. **Availability** (simple)
   - "How many hours per week can you train?"
   - "Any days that are completely off-limits?"

**Remove:**
- Sport selection dropdown (infer from objective)
- Experience level dropdown (infer from background)
- Years training (captured in background text)

### Phase 3: Proper Periodization (Priority: HIGH)

**Goal:** Plans that actually ramp up correctly

**Current Problem:**
```
User says: 12 hours/week available
Plan does: 12 hours/week from Week 1
```

**Should be:**
```
User says: 12 hours/week available (this is their MAX)
Plan does:
  - Week 1-4: 6-8 hours (base building, ~60% of max)
  - Week 5-8: 8-10 hours (build, ~75% of max)
  - Week 9-11: 10-12 hours (peak, ~90% of max)
  - Week 12: 6 hours (taper, ~50% of max)
```

**Implementation:**
- `hoursPerWeek` = maximum, not constant
- Calculate weekly hours based on phase and week number
- Progressive overload built into plan generation

### Phase 4: Plan Review & Acceptance (Priority: MEDIUM)

**Goal:** Clear overview before commitment

**Plan Review Screen should show:**
- Total duration and phases breakdown
- Weekly hour progression chart (visual)
- Key workouts and their purpose
- What success looks like

**After acceptance:**
- Generate detailed Week 1
- Show week-by-week view (not all weeks at once)
- Each week unlocks as previous completes

### Phase 5: Workout Logging (Priority: MEDIUM)

**Goal:** Track what actually happened

**Manual logging:**
- Mark workout complete/skipped
- Actual duration vs planned
- RPE (1-10)
- Notes

**Future (not MVP):**
- Strava/Garmin sync
- Auto-import workouts
- Match planned vs actual

### Phase 6: Coach Persona (Priority: LOW - mostly prompts)

**Goal:** Direct, coach-like responses

**Current:** "I understand you'd like to discuss the plan..."
**Should be:** "Here's what I'd change and why..."

This is mostly prompt engineering in `summit-ai` - update `COACH_PERSONA` and response prompts.

---

## Task Triage

### Must Have (MVP)

1. [ ] **Dev seed profile** - Skip onboarding for testing
2. [ ] **Simplified onboarding** - 4 screens, free text objective
3. [ ] **Fix periodization** - Hours ramp up, not flat
4. [ ] **Week-by-week generation** - Don't show all weeks upfront

### Should Have

5. [ ] **Supabase auth** - Email magic link or Google OAuth
6. [ ] **Persist to Supabase** - Profile, plan, logs
7. [ ] **Workout logging** - Manual completion tracking
8. [ ] **Weekly hour chart** - Visual in plan review

### Nice to Have

9. [ ] **Coach persona tuning** - Prompt updates in summit-ai
10. [ ] **Strava integration** - Auto-import workouts
11. [ ] **Watch connection** - Garmin, Apple Watch

---

## Data Model (Supabase)

```sql
-- Users (managed by Supabase Auth)

-- Profiles
create table profiles (
  id uuid references auth.users primary key,
  mountain_objective text,
  athletic_background text,
  health_conditions text,
  age int,
  height_cm int,
  weight_kg int,
  max_hours_per_week int,
  off_days int[], -- 0=Sun, 1=Mon, etc.
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Training Plans
create table training_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  objective text,
  total_weeks int,
  start_date date,
  phases jsonb, -- [{name, weekStart, weekEnd, focus}]
  status text default 'active', -- active, completed, abandoned
  created_at timestamptz default now()
);

-- Weekly Plans (generated on demand)
create table weekly_plans (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references training_plans(id),
  week_number int,
  phase text,
  target_hours numeric,
  workouts jsonb,
  coach_note text,
  generated_at timestamptz default now()
);

-- Workout Logs
create table workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  weekly_plan_id uuid references weekly_plans(id),
  planned_workout_id text,
  completed_at timestamptz,
  actual_duration_minutes int,
  rpe int check (rpe between 1 and 10),
  notes text,
  skipped boolean default false
);
```

---

## Next Steps

1. **Immediate:** Add dev seed profile to skip onboarding
2. **This week:** Simplify onboarding flow (4 screens)
3. **This week:** Fix periodization (hours ramp up)
4. **Next week:** Supabase integration (auth + persistence)

---

## Open Questions

- Should we infer sport from objective, or ask explicitly?
- How detailed should Week 1 be vs overview?
- Do we generate all weeks upfront or on-demand?
- What's the minimum viable Strava integration?
