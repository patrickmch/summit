import { UserProfile, StructuredPlan, WeekPlan, PlannedWorkout, Phase, WorkoutBlock, WorkoutType, Intensity, WeekSummary, PlanAdjustment } from '../types';

// Use relative URL in dev (proxied by Vite) or env var in production
const SUMMIT_AI_URL = import.meta.env.VITE_SUMMIT_AI_URL || '';

const COACH_PERSONA = `You are SummitCoach, a world-class training assistant for elite mountain athletes (climbers, ultra runners, alpinists, skimo racers).
Your tone is professional, encouraging, data-driven, and stoic.
You understand training methodologies like Uphill Athlete, periodization, and the nuances of mountain sports.
When athletes are tired or tweaked, you provide advice on whether to push or rest based on physiological principles.
Always maintain a premium, helpful, and slightly mysterious "mountain mentor" vibe.
Keep responses concise but high-impact.`;

interface QueryRequest {
  prompt: string;
  context_source?: 'vector';
  context_config?: {
    collection: string;
    top_k: number;
  };
  llm?: 'claude' | 'gemini';
}

interface QueryResponse {
  response: string;
  llm_used: string;
  context_loaded: boolean;
}

export const getCoachResponse = async (
  userMessage: string,
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> => {
  // Build prompt with conversation history
  const conversationContext = history
    .map((h) => `${h.role === 'user' ? 'User' : 'Coach'}: ${h.content}`)
    .join('\n');

  const userQuery = conversationContext
    ? `${conversationContext}\nUser: ${userMessage}`
    : userMessage;

  const fullPrompt = `${COACH_PERSONA}\n\n${userQuery}`;

  const request: QueryRequest = {
    prompt: fullPrompt,
    context_source: 'vector',
    context_config: {
      collection: 'endurance-training',
      top_k: 5,
    },
    llm: 'claude',
  };

  const res = await fetch(`${SUMMIT_AI_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error(`Summit AI error: ${res.status}`);
  }

  const data: QueryResponse = await res.json();
  return data.response;
};

const PLAN_GENERATION_PROMPT = `You are SummitCoach. Generate a concise training plan in markdown.

Include:
1. **Overview** - 2-3 sentences on approach
2. **Phases** - Base, Build, Peak (brief description of each)
3. **Sample Week** - One typical week schedule
4. **Key Workouts** - 3-4 most important sessions

Be concise. Use ##/### headers and bullet points.`;

const MOCK_PLAN = `## Plan Overview

This is a periodized training program designed to progressively build your aerobic base, develop sport-specific strength, and peak for your goal event. The plan balances training stress with recovery to maximize adaptation.

## Phase 1: Base Building (Weeks 1-6)

**Focus:** Aerobic development, movement quality, injury prevention

### Typical Week
- **Monday:** Rest or active recovery (yoga, easy walk)
- **Tuesday:** Easy aerobic session (Zone 2) - 45-60 min
- **Wednesday:** Strength training - 45 min
- **Thursday:** Easy aerobic session (Zone 2) - 45-60 min
- **Friday:** Rest
- **Saturday:** Long aerobic session - 90-120 min
- **Sunday:** Easy recovery session - 30-45 min

### Key Workouts
- **Long Aerobic Session:** The cornerstone of base building. Keep heart rate in Zone 2, focus on time on feet.
- **Strength Training:** Full body emphasis on posterior chain, core stability, and single-leg strength.

## Phase 2: Build (Weeks 7-12)

**Focus:** Increasing volume, introducing tempo work, sport-specific training

### Typical Week
- **Monday:** Rest
- **Tuesday:** Tempo intervals - 60 min (with 20 min @ Zone 3)
- **Wednesday:** Strength training - 45 min
- **Thursday:** Easy aerobic - 60 min
- **Friday:** Short intervals or hill work - 45 min
- **Saturday:** Long session with vertical gain - 2-3 hours
- **Sunday:** Easy recovery - 45 min

### Key Workouts
- **Tempo Intervals:** 4x8 min at lactate threshold with 3 min recovery
- **Hill Repeats:** 6-8 x 3 min uphill efforts at Zone 4

## Phase 3: Peak (Weeks 13-16)

**Focus:** Race-specific intensity, maintaining volume, sharpening

### Typical Week
- **Monday:** Rest
- **Tuesday:** Race-pace intervals - 60 min
- **Wednesday:** Easy + strides - 45 min
- **Thursday:** Strength (maintenance) - 30 min
- **Friday:** Rest
- **Saturday:** Goal-specific long session - 3-4 hours
- **Sunday:** Easy recovery - 30 min

## Taper (Final 1-2 Weeks)

Reduce volume by 40-50% while maintaining some intensity. Focus on sleep, nutrition, and mental preparation.

---

*This plan adapts based on your feedback and recovery status. Let's discuss any adjustments.*`;

export const generatePlan = async (
  profile: Partial<UserProfile>
): Promise<string> => {
  const athleteContext = `
Athlete Profile:
- Sports: ${profile.sports?.join(', ') || 'Not specified'}
- Experience Level: ${profile.experienceLevel || 'Not specified'}
- Years Training: ${profile.yearsTraining || 'Not specified'}
- Athletic Background: ${profile.athleticHistory || 'None provided'}

Physical Stats:
- Age: ${profile.age || 'Not specified'}
- Height: ${profile.heightCm ? `${profile.heightCm}cm` : 'Not specified'}
- Weight: ${profile.weightKg ? `${profile.weightKg}kg` : 'Not specified'}

Goal:
- Primary Objective: ${profile.primaryGoal || 'General fitness'}
- Target Date: ${profile.targetDate || 'No specific date'}

Availability:
- Training Days: ${profile.daysPerWeek || 4} days per week
- Weekly Hours: ${profile.hoursPerWeek || 8} hours per week
`;

  const fullPrompt = `${PLAN_GENERATION_PROMPT}

${athleteContext}

Generate a training plan for this athlete. Keep it concise but actionable.`;

  const request: QueryRequest = {
    prompt: fullPrompt,
    context_source: 'vector',
    context_config: {
      collection: 'endurance-training',
      top_k: 5,  // Reduced for faster generation
    },
    llm: 'claude',
  };

  try {
    // Use AbortController for 90 second timeout (plan generation can be slow)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    const res = await fetch(`${SUMMIT_AI_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Summit AI error: ${res.status}`);
    }

    const data: QueryResponse = await res.json();
    return data.response;
  } catch (error) {
    // Return mock plan for development when backend is unavailable
    console.warn('Summit AI unavailable, using mock plan:', error);
    return MOCK_PLAN;
  }
};

export const chatAboutPlan = async (
  message: string,
  currentPlan: string,
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> => {
  const conversationContext = history
    .map((h) => `${h.role === 'user' ? 'User' : 'Coach'}: ${h.content}`)
    .join('\n');

  const prompt = `${COACH_PERSONA}

The athlete is reviewing their training plan. Here is the current plan:

---
${currentPlan}
---

${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ''}User: ${message}

Respond to their question or feedback about the plan. If they want modifications, describe how you would adjust the plan. Be specific and helpful.`;

  const request: QueryRequest = {
    prompt,
    context_source: 'vector',
    context_config: {
      collection: 'endurance-training',
      top_k: 5,
    },
    llm: 'claude',
  };

  try {
    const res = await fetch(`${SUMMIT_AI_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      throw new Error(`Summit AI error: ${res.status}`);
    }

    const data: QueryResponse = await res.json();
    return data.response;
  } catch (error) {
    // Return mock response for development when backend is unavailable
    console.warn('Summit AI unavailable for chat, using mock response:', error);
    return "I understand you'd like to discuss the plan. When summit-ai is running, I can provide personalized advice based on training science. For now, the plan follows proven periodization principles - building your aerobic base first, then adding intensity as you approach your goal. Feel free to accept when you're ready!";
  }
};

// ============================================
// Streaming Chat for Plan Review
// ============================================

/**
 * Build the chat prompt for plan discussions
 */
function buildChatPrompt(
  message: string,
  currentPlan: string,
  history: { role: 'user' | 'assistant'; content: string }[]
): string {
  const conversationContext = history
    .map((h) => `${h.role === 'user' ? 'User' : 'Coach'}: ${h.content}`)
    .join('\n');

  return `${COACH_PERSONA}

The athlete is reviewing their training plan. Here is the current plan:

---
${currentPlan}
---

${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ''}User: ${message}

Respond to their question or feedback about the plan. If they want modifications, describe how you would adjust the plan. Be specific and helpful.`;
}

/**
 * Stream chat responses using SSE for faster perceived response time.
 * Yields chunks of text as they arrive from the server.
 */
export async function* chatAboutPlanStream(
  message: string,
  currentPlan: string,
  history: { role: 'user' | 'assistant'; content: string }[]
): AsyncGenerator<string, void, unknown> {
  const prompt = buildChatPrompt(message, currentPlan, history);

  const request: QueryRequest = {
    prompt,
    context_source: 'vector',
    context_config: {
      collection: 'endurance-training',
      top_k: 5,
    },
    llm: 'claude',
  };

  try {
    const response = await fetch(`${SUMMIT_AI_URL}/api/query/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Summit AI error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body for streaming');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE format: "data: {chunk}\n\n"
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data && data !== '[DONE]') {
            yield data;
          }
        }
      }
    }

    // Process any remaining buffer
    if (buffer.startsWith('data: ')) {
      const data = buffer.slice(6);
      if (data && data !== '[DONE]') {
        yield data;
      }
    }
  } catch (error) {
    // Fallback to non-streaming response
    console.warn('Streaming unavailable, falling back to standard request:', error);
    const response = await chatAboutPlan(message, currentPlan, history);
    yield response;
  }
}

// ============================================
// Plan Regeneration with Changes
// ============================================

/**
 * Regenerate a structured plan incorporating the requested changes.
 * Returns the updated plan or the original if regeneration fails.
 */
export const regeneratePlanWithChanges = async (
  currentPlan: StructuredPlan,
  changeDescription: string
): Promise<StructuredPlan> => {
  const prompt = `You are SummitCoach. Modify this training plan based on the requested changes.

Current plan structure:
${JSON.stringify(currentPlan, null, 2)}

Requested changes based on conversation:
${changeDescription}

Return the COMPLETE updated plan as JSON matching the StructuredPlan schema.
Keep unchanged parts the same. Only modify what was requested.
Make sure the markdownSummary reflects the changes.
Return ONLY the JSON, no markdown code blocks or explanation.`;

  const request: QueryRequest = {
    prompt,
    context_source: 'vector',
    context_config: {
      collection: 'endurance-training',
      top_k: 3,
    },
    llm: 'claude',
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const res = await fetch(`${SUMMIT_AI_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Summit AI error: ${res.status}`);
    }

    const data: QueryResponse = await res.json();

    // Parse the JSON response
    let jsonStr = data.response.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    const parsed = JSON.parse(jsonStr) as StructuredPlan;

    // Validate minimum structure
    if (!parsed.weeks || !Array.isArray(parsed.weeks) || parsed.weeks.length === 0) {
      throw new Error('Invalid plan structure');
    }

    return parsed;
  } catch (error) {
    console.warn('Failed to regenerate plan with changes, keeping original:', error);
    return currentPlan;
  }
};

// ============================================
// Structured Plan Generation
// ============================================

const STRUCTURED_PLAN_PROMPT = `You are SummitCoach. Generate a structured training plan as JSON.

Return ONLY valid JSON matching this schema:
{
  "overview": "2-3 sentences on approach",
  "totalWeeks": number,
  "phases": [{ "name": string, "weekStart": number, "weekEnd": number, "focus": string }],
  "weeks": [{
    "weekNumber": number,
    "phase": string,
    "theme": string,
    "workouts": [{
      "id": "w{weekNumber}d{dayOfWeek}",
      "dayOfWeek": number, // 0=Sun, 1=Mon, ... 6=Sat
      "title": string,
      "type": "Strength" | "Endurance" | "Mobility" | "Rest" | "Technical" | "Recovery" | "Tempo" | "Intervals",
      "duration": string,
      "durationMinutes": number,
      "intensity": "Low" | "Moderate" | "High" | "Max",
      "blocks": [{ "title": string, "duration": string, "instructions": string }]
    }],
    "coachNote": string
  }],
  "markdownSummary": "Full markdown plan with headers, phases, and key workouts"
}`;

// Helper to generate unique workout ID
function generateWorkoutId(weekNumber: number, dayOfWeek: number): string {
  return `w${weekNumber}d${dayOfWeek}_${Math.random().toString(36).substr(2, 6)}`;
}

// Mock structured plan for development
function calculateWeeksUntilTarget(targetDate?: string): number {
  if (!targetDate) return 8; // Default fallback

  const target = new Date(targetDate);
  const today = new Date();
  const diffTime = target.getTime() - today.getTime();
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));

  // Clamp between 4 and 24 weeks
  return Math.max(4, Math.min(24, diffWeeks));
}

function getMockStructuredPlan(profile: Partial<UserProfile>): StructuredPlan {
  const totalWeeks = calculateWeeksUntilTarget(profile.targetDate);
  const daysPerWeek = profile.daysPerWeek || 4;
  const maxHoursPerWeek = profile.hoursPerWeek || 10; // This is MAX capacity, not constant

  // Calculate phase boundaries based on total weeks
  // Base: ~50%, Build: ~35%, Peak: ~15%
  const baseEnd = Math.max(1, Math.floor(totalWeeks * 0.5));
  const buildEnd = Math.max(baseEnd + 1, Math.floor(totalWeeks * 0.85));
  const peakStart = buildEnd + 1;

  const phases: Phase[] = [
    { name: 'Base Building', weekStart: 1, weekEnd: baseEnd, focus: 'Aerobic development and movement quality' },
    { name: 'Build', weekStart: baseEnd + 1, weekEnd: buildEnd, focus: 'Increasing intensity and sport-specific work' },
    { name: 'Peak', weekStart: peakStart, weekEnd: totalWeeks, focus: 'Race-specific preparation and taper' },
  ];

  /**
   * Check if a week is a deload/recovery week.
   * Uses 3:1 pattern (3 weeks build, 1 week recovery) which is standard
   * in endurance training per Uphill Athlete methodology.
   */
  const isDeloadWeek = (weekNum: number): boolean => {
    // Every 4th week is a deload (weeks 4, 8, 12, 16, etc.)
    // Exception: don't deload in final 2 weeks (that's taper territory)
    if (weekNum >= totalWeeks - 1) return false;
    return weekNum % 4 === 0;
  };

  /**
   * Calculate target hours for a given week based on periodization principles.
   * Follows 3:1 loading pattern with deload weeks at ~50-60% volume.
   *
   * Base phase: Start at 50%, build to 70% of max (with deloads)
   * Build phase: 70% to 90% of max (with deloads)
   * Peak phase: 85% of max, then taper to 50% in final week(s)
   */
  const calculateTargetHours = (weekNum: number, phase: Phase): number => {
    // Deload weeks get 50-60% of what would have been prescribed
    if (isDeloadWeek(weekNum)) {
      // Calculate what week 3 of this mesocycle would have been
      const prevWeekHours = calculateBaseHours(weekNum - 1, phase);
      return Math.round(prevWeekHours * 0.55 * 10) / 10; // 55% for recovery
    }

    return calculateBaseHours(weekNum, phase);
  };

  /**
   * Calculate base hours without deload adjustment (used for progression calc)
   */
  const calculateBaseHours = (weekNum: number, phase: Phase): number => {
    const phaseWeekNum = weekNum - phase.weekStart + 1;
    const phaseLength = phase.weekEnd - phase.weekStart + 1;
    const progressInPhase = phaseLength > 1 ? (phaseWeekNum - 1) / (phaseLength - 1) : 0;

    if (phase.name === 'Base Building') {
      // Ramp from 50% to 70% of max
      const startPct = 0.5;
      const endPct = 0.7;
      return Math.round(maxHoursPerWeek * (startPct + progressInPhase * (endPct - startPct)) * 10) / 10;
    } else if (phase.name === 'Build') {
      // Ramp from 70% to 90% of max
      const startPct = 0.7;
      const endPct = 0.9;
      return Math.round(maxHoursPerWeek * (startPct + progressInPhase * (endPct - startPct)) * 10) / 10;
    } else {
      // Peak phase: 85% then taper
      // Last 1-2 weeks are taper (50-60%)
      const weeksUntilEnd = phase.weekEnd - weekNum;
      if (weeksUntilEnd === 0) {
        return Math.round(maxHoursPerWeek * 0.5 * 10) / 10; // Final week taper
      } else if (weeksUntilEnd === 1 && phaseLength > 2) {
        return Math.round(maxHoursPerWeek * 0.65 * 10) / 10; // Pre-taper
      }
      return Math.round(maxHoursPerWeek * 0.85 * 10) / 10;
    }
  };

  const workoutTemplates: { type: WorkoutType; title: string; intensity: Intensity; durationMin: number; blocks: WorkoutBlock[] }[] = [
    {
      type: 'Strength',
      title: 'Full Body Strength',
      intensity: 'Moderate',
      durationMin: 45,
      blocks: [
        { title: 'Warm-up', duration: '10 min', instructions: 'Dynamic stretching and activation' },
        { title: 'Main Set', duration: '30 min', instructions: '3 rounds: Squats, Deadlifts, Push-ups, Rows' },
        { title: 'Cool-down', duration: '5 min', instructions: 'Static stretching' },
      ],
    },
    {
      type: 'Endurance',
      title: 'Zone 2 Aerobic',
      intensity: 'Low',
      durationMin: 60,
      blocks: [
        { title: 'Warm-up', duration: '10 min', instructions: 'Easy pace, build gradually' },
        { title: 'Main Effort', duration: '45 min', instructions: 'Maintain Zone 2 heart rate (conversational pace)' },
        { title: 'Cool-down', duration: '5 min', instructions: 'Easy pace, bring heart rate down' },
      ],
    },
    {
      type: 'Mobility',
      title: 'Active Recovery',
      intensity: 'Low',
      durationMin: 30,
      blocks: [
        { title: 'Foam Rolling', duration: '10 min', instructions: 'Full body myofascial release' },
        { title: 'Mobility Flow', duration: '15 min', instructions: 'Hip openers, thoracic rotation, ankle mobility' },
        { title: 'Breathing', duration: '5 min', instructions: 'Box breathing: 4-4-4-4' },
      ],
    },
    {
      type: 'Technical',
      title: 'Skill Session',
      intensity: 'Moderate',
      durationMin: 60,
      blocks: [
        { title: 'Warm-up', duration: '15 min', instructions: 'Progressive activation' },
        { title: 'Skill Work', duration: '35 min', instructions: 'Sport-specific drills and technique focus' },
        { title: 'Cool-down', duration: '10 min', instructions: 'Easy movement and stretching' },
      ],
    },
    {
      type: 'Tempo',
      title: 'Tempo Session',
      intensity: 'High',
      durationMin: 50,
      blocks: [
        { title: 'Warm-up', duration: '15 min', instructions: 'Progressive build to moderate effort' },
        { title: 'Tempo Intervals', duration: '25 min', instructions: '4x5 min at lactate threshold, 2 min recovery' },
        { title: 'Cool-down', duration: '10 min', instructions: 'Easy pace, full recovery' },
      ],
    },
    {
      type: 'Endurance',
      title: 'Long Aerobic',
      intensity: 'Low',
      durationMin: 90,
      blocks: [
        { title: 'Warm-up', duration: '15 min', instructions: 'Easy build' },
        { title: 'Main Effort', duration: '70 min', instructions: 'Steady Zone 2, focus on time on feet' },
        { title: 'Cool-down', duration: '5 min', instructions: 'Walk and stretch' },
      ],
    },
  ];

  // Generate weekly schedule based on days per week
  const weeklySchedule: number[] = daysPerWeek === 3
    ? [1, 3, 6] // Mon, Wed, Sat
    : daysPerWeek === 4
      ? [1, 2, 4, 6] // Mon, Tue, Thu, Sat
      : daysPerWeek === 5
        ? [1, 2, 3, 5, 6] // Mon, Tue, Wed, Fri, Sat
        : [1, 2, 3, 4, 5, 6]; // Mon-Sat

  // Generate dynamic coach notes based on phase and deload status
  const getCoachNote = (week: number, phase: Phase): string => {
    // Deload weeks get special messaging
    if (isDeloadWeek(week)) {
      return "Recovery week. Reduced volume allows adaptation from previous weeks. Keep intensity low, prioritize sleep and nutrition. This is where fitness gains are consolidated.";
    }

    const phaseWeekNum = week - phase.weekStart + 1;
    const phaseLength = phase.weekEnd - phase.weekStart + 1;
    const isFirstWeek = phaseWeekNum === 1;
    const isLastWeek = week === phase.weekEnd;
    const isMidPhase = phaseWeekNum === Math.ceil(phaseLength / 2);

    if (phase.name === 'Base Building') {
      if (isFirstWeek) return "Focus on building consistency this week. Quality over quantity.";
      if (isMidPhase) return "You're adapting well. Pay attention to recovery between sessions.";
      if (isLastWeek) return "Last week of base phase. Prepare for increased intensity ahead.";
      return "Building your aerobic foundation. Keep the effort conversational.";
    } else if (phase.name === 'Build') {
      if (isFirstWeek) return "Build phase begins - embrace the challenge, listen to your body.";
      if (isMidPhase) return "Progressive overload week. Push when fresh, rest when tired.";
      if (isLastWeek) return "Final build week - mental preparation is as important as physical.";
      return "Stay consistent with the increased intensity. Recovery is key.";
    } else {
      if (isFirstWeek) return "Peak phase - sharpen your fitness while managing fatigue.";
      if (isLastWeek) return "Taper week. Trust your training, focus on execution.";
      return "Race-specific work. Quality over volume now.";
    }
  };

  const weeks: WeekPlan[] = [];

  for (let week = 1; week <= totalWeeks; week++) {
    const phase = phases.find(p => week >= p.weekStart && week <= p.weekEnd)!;
    const targetHours = calculateTargetHours(week, phase);
    const targetMinutes = targetHours * 60;
    const workouts: PlannedWorkout[] = [];

    // Calculate base durations from templates, then scale to fit target hours
    const baseTemplates = weeklySchedule.map((day, idx) => {
      // Weekend long session
      if (day === 6 && idx === weeklySchedule.length - 1) {
        return workoutTemplates.find(t => t.title === 'Long Aerobic')!;
      }
      return workoutTemplates[idx % workoutTemplates.length];
    });

    const baseTotalMinutes = baseTemplates.reduce((sum, t) => sum + t.durationMin, 0);
    const scaleFactor = targetMinutes / baseTotalMinutes;

    weeklySchedule.forEach((day, idx) => {
      const template = baseTemplates[idx];

      // Scale duration based on target hours (min 20 min, max 180 min)
      const scaledDuration = Math.max(20, Math.min(180, Math.round(template.durationMin * scaleFactor)));

      // Adjust intensity based on phase and deload status
      let intensity = template.intensity;
      if (isDeloadWeek(week)) {
        // Deload weeks: keep all intensities low
        intensity = 'Low';
      } else if (phase.name === 'Build' && template.intensity === 'Low') {
        intensity = 'Moderate';
      } else if (phase.name === 'Peak' && template.intensity === 'Moderate') {
        intensity = 'High';
      }

      // Scale block durations proportionally
      const blockScale = scaledDuration / template.durationMin;
      const scaledBlocks = template.blocks.map(block => {
        const blockMinutes = parseInt(block.duration) || 10;
        const newMinutes = Math.max(5, Math.round(blockMinutes * blockScale));
        return {
          ...block,
          duration: `${newMinutes} min`,
        };
      });

      workouts.push({
        id: generateWorkoutId(week, day),
        dayOfWeek: day,
        title: template.title,
        type: template.type,
        duration: `${scaledDuration} min`,
        durationMinutes: scaledDuration,
        intensity,
        blocks: scaledBlocks,
      });
    });

    // Determine theme based on phase and deload status
    let theme: string;
    if (isDeloadWeek(week)) {
      theme = 'Recovery';
    } else if (phase.name === 'Base Building') {
      theme = 'Foundation';
    } else if (phase.name === 'Build') {
      theme = 'Development';
    } else {
      theme = 'Sharpening';
    }

    weeks.push({
      weekNumber: week,
      phase: phase.name,
      theme,
      targetHours,
      workouts,
      coachNote: getCoachNote(week, phase),
    });
  }

  const formatPhaseWeeks = (phase: Phase) =>
    phase.weekStart === phase.weekEnd
      ? `Week ${phase.weekStart}`
      : `Weeks ${phase.weekStart}-${phase.weekEnd}`;

  // Calculate hour ranges for each phase
  const getPhaseHourRange = (phase: Phase): string => {
    const startHours = calculateTargetHours(phase.weekStart, phase);
    const endHours = calculateTargetHours(phase.weekEnd, phase);
    if (Math.abs(startHours - endHours) < 0.5) {
      return `~${startHours}`;
    }
    return `${startHours}→${endHours}`;
  };

  const markdownSummary = `## Training Plan Overview

${profile.primaryGoal ? `**Goal:** ${profile.primaryGoal}` : ''}
${profile.targetDate ? `**Target Date:** ${profile.targetDate}` : ''}

This is a periodized ${totalWeeks}-week training program designed to progressively build your fitness while managing fatigue and maximizing adaptation.

## Volume Progression

Your max capacity is **${maxHoursPerWeek} hours/week**. The plan ramps up progressively:

| Phase | Weeks | Hours/Week |
|-------|-------|------------|
| Base Building | ${formatPhaseWeeks(phases[0])} | ${getPhaseHourRange(phases[0])} hrs |
| Build | ${formatPhaseWeeks(phases[1])} | ${getPhaseHourRange(phases[1])} hrs |
| Peak & Taper | ${formatPhaseWeeks(phases[2])} | ${getPhaseHourRange(phases[2])} hrs |

## Training Phases

### Phase 1: Base Building (${formatPhaseWeeks(phases[0])})
Focus on aerobic development, movement quality, and injury prevention. Start conservative and build consistency.

### Phase 2: Build (${formatPhaseWeeks(phases[1])})
Increase training load and introduce more intensity. Sport-specific work becomes more prominent.

### Phase 3: Peak & Taper (${formatPhaseWeeks(phases[2])})
Fine-tune fitness, then reduce volume while maintaining intensity for your goal.

## Weekly Structure

- **${daysPerWeek} training days** per week
- **Balance of:** Strength, Endurance, Mobility, and Skill work
- **Long session:** Saturday for building endurance capacity
- **Rest days:** Strategic recovery for adaptation

## Key Principles

- **3:1 Loading Pattern:** Three weeks of progressive building followed by one recovery week (deload). This allows adaptation and prevents overtraining.
- **Progressive overload:** Hours ramp up within each mesocycle, not monotonically
- **Specificity:** Training matches your goal demands
- **Recovery:** Deload weeks at ~55% volume consolidate fitness gains
- **Taper:** Final weeks reduce volume while maintaining intensity

---

*This plan adapts based on your feedback and recovery status. Let's discuss any adjustments.*`;

  return {
    overview: `A ${totalWeeks}-week periodized program focusing on ${phases[0].focus.toLowerCase()} before building intensity toward your goal.`,
    totalWeeks,
    phases,
    weeks,
    markdownSummary,
  };
}

export const generateStructuredPlan = async (
  profile: Partial<UserProfile>
): Promise<StructuredPlan> => {
  const athleteContext = `
Athlete Profile:
- Sports: ${profile.sports?.join(', ') || 'Not specified'}
- Experience Level: ${profile.experienceLevel || 'Not specified'}
- Years Training: ${profile.yearsTraining || 'Not specified'}
- Athletic Background: ${profile.athleticHistory || 'None provided'}

Physical Stats:
- Age: ${profile.age || 'Not specified'}
- Height: ${profile.heightCm ? `${profile.heightCm}cm` : 'Not specified'}
- Weight: ${profile.weightKg ? `${profile.weightKg}kg` : 'Not specified'}

Goal:
- Primary Objective: ${profile.primaryGoal || 'General fitness'}
- Target Date: ${profile.targetDate || 'No specific date'}

Availability:
- Training Days: ${profile.daysPerWeek || 4} days per week
- Weekly Hours: ${profile.hoursPerWeek || 8} hours per week
`;

  const fullPrompt = `${STRUCTURED_PLAN_PROMPT}

${athleteContext}

Generate a structured training plan for this athlete. Output ONLY the JSON, no markdown code blocks or explanation.`;

  const request: QueryRequest = {
    prompt: fullPrompt,
    context_source: 'vector',
    context_config: {
      collection: 'endurance-training',
      top_k: 5,
    },
    llm: 'claude',
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min timeout

    const res = await fetch(`${SUMMIT_AI_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Summit AI error: ${res.status}`);
    }

    const data: QueryResponse = await res.json();

    // Try to parse the JSON response
    try {
      // Clean potential markdown code blocks
      let jsonStr = data.response.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
      }

      const parsed = JSON.parse(jsonStr) as StructuredPlan;

      // Validate minimum structure
      if (!parsed.weeks || !Array.isArray(parsed.weeks) || parsed.weeks.length === 0) {
        throw new Error('Invalid plan structure');
      }

      return parsed;
    } catch (parseError) {
      console.warn('Failed to parse AI response as JSON, using mock:', parseError);
      return getMockStructuredPlan(profile);
    }
  } catch (error) {
    console.warn('Summit AI unavailable, using mock structured plan:', error);
    return getMockStructuredPlan(profile);
  }
};

// ============================================
// Weekly Analysis and Adjustments
// ============================================

const WEEKLY_ANALYSIS_PROMPT = `You are SummitCoach analyzing an athlete's training week.

Based on:
1. What was planned
2. What they actually completed
3. Their feedback

Suggest adjustments for next week. Consider:
- If they struggled, reduce volume/intensity
- If they felt strong, consider progression
- Address any reported issues (fatigue, injury, life stress)

Respond with JSON:
{
  "suggestedChanges": "Brief summary of recommended changes",
  "rationale": "Why these changes make sense",
  "adjustedWeek": { ...WeekPlan structure if changes needed, or null }
}`;

export const analyzeWeekAndSuggestAdjustments = async (
  profile: Partial<UserProfile>,
  currentPlan: StructuredPlan,
  weekNumber: number,
  summary: WeekSummary
): Promise<PlanAdjustment> => {
  const completedWeek = currentPlan.weeks.find(w => w.weekNumber === weekNumber);
  const nextWeek = currentPlan.weeks.find(w => w.weekNumber === weekNumber + 1);

  if (!completedWeek || !nextWeek) {
    return {
      weekNumber: weekNumber + 1,
      suggestedChanges: 'Continue with the planned training.',
      rationale: 'You completed the week as planned. Keep up the good work!',
    };
  }

  const prompt = `${WEEKLY_ANALYSIS_PROMPT}

Athlete: ${profile.name || 'Athlete'}
Week ${weekNumber} Summary:
- Completed: ${summary.completedWorkouts}/${summary.totalWorkouts} workouts
- Total Time: ${summary.totalMinutes} minutes
- Average RPE: ${summary.averageRpe}/10
- Notes: ${summary.athleteNotes || 'None'}

Planned workouts for Week ${weekNumber}:
${JSON.stringify(completedWeek.workouts.map(w => ({ title: w.title, type: w.type, duration: w.duration })), null, 2)}

Next week (Week ${weekNumber + 1}) currently planned:
${JSON.stringify(nextWeek.workouts.map(w => ({ title: w.title, type: w.type, duration: w.duration, intensity: w.intensity })), null, 2)}

Analyze and suggest adjustments for Week ${weekNumber + 1}. Return ONLY JSON.`;

  const request: QueryRequest = {
    prompt,
    context_source: 'vector',
    context_config: {
      collection: 'endurance-training',
      top_k: 3,
    },
    llm: 'claude',
  };

  try {
    const res = await fetch(`${SUMMIT_AI_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      throw new Error(`Summit AI error: ${res.status}`);
    }

    const data: QueryResponse = await res.json();

    try {
      let jsonStr = data.response.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
      }

      const parsed = JSON.parse(jsonStr);

      return {
        weekNumber: weekNumber + 1,
        suggestedChanges: parsed.suggestedChanges || 'Continue with planned training.',
        rationale: parsed.rationale || 'Based on your week performance.',
        adjustedWeek: parsed.adjustedWeek || undefined,
      };
    } catch {
      // Fallback analysis
      return generateFallbackAdjustment(summary, weekNumber, nextWeek);
    }
  } catch (error) {
    console.warn('Summit AI unavailable for analysis:', error);
    return generateFallbackAdjustment(summary, weekNumber, nextWeek);
  }
};

function generateFallbackAdjustment(summary: WeekSummary, weekNumber: number, nextWeek: WeekPlan): PlanAdjustment {
  const completionRate = summary.totalWorkouts > 0 ? summary.completedWorkouts / summary.totalWorkouts : 0;
  const highRpe = summary.averageRpe > 7;
  const lowCompletion = completionRate < 0.7;

  if (lowCompletion && highRpe) {
    return {
      weekNumber: weekNumber + 1,
      suggestedChanges: 'Reduce intensity and consider adding an extra rest day. Your body needs more recovery.',
      rationale: `You completed ${Math.round(completionRate * 100)}% of workouts with an average RPE of ${summary.averageRpe}. This suggests the training load may be too high.`,
    };
  }

  if (lowCompletion) {
    return {
      weekNumber: weekNumber + 1,
      suggestedChanges: 'Maintain current intensity but focus on consistency. Consider adjusting schedule if life demands are high.',
      rationale: `Completion was lower this week (${Math.round(completionRate * 100)}%). Consistency is key - every session counts.`,
    };
  }

  if (highRpe) {
    return {
      weekNumber: weekNumber + 1,
      suggestedChanges: 'Add recovery activities and consider slightly reducing the longest session.',
      rationale: `Your RPE averaged ${summary.averageRpe}. While you completed the work, recovery should be prioritized.`,
    };
  }

  return {
    weekNumber: weekNumber + 1,
    suggestedChanges: 'Continue with the planned progression. You handled this week well!',
    rationale: `Great work completing ${Math.round(completionRate * 100)}% of workouts at a manageable effort level. Ready for the next step.`,
  };
}
