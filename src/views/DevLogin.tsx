import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, TrainingPlan } from '../contexts/AuthContext';
import { StructuredPlan } from '../types';
import { getNextMonday } from '../utils/planUtils';

/**
 * Dev-only route that auto-logs in with a test profile.
 *
 * Access via:
 * - /#/dev           → Goes to plan review (generates new plan)
 * - /#/dev?dashboard → Goes straight to dashboard with mock plan
 */
export const DevLogin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { devLogin, acceptPlan } = useAuth();

  useEffect(() => {
    devLogin();

    // Check if we should skip straight to dashboard
    const skipToDashboard = searchParams.has('dashboard');

    if (skipToDashboard) {
      // Create a minimal mock plan to satisfy the dashboard
      const mockPlan: StructuredPlan = {
        overview: 'Development mock plan for testing',
        totalWeeks: 8,
        phases: [
          { name: 'Base Building', weekStart: 1, weekEnd: 4, focus: 'Aerobic base and technique' },
          { name: 'Build', weekStart: 5, weekEnd: 7, focus: 'Intensity and sport-specific work' },
          { name: 'Peak', weekStart: 8, weekEnd: 8, focus: 'Taper and peak performance' },
        ],
        weeks: Array.from({ length: 8 }, (_, i) => ({
          weekNumber: i + 1,
          phase: i < 4 ? 'Base Building' : i < 7 ? 'Build' : 'Peak',
          theme: `Week ${i + 1} Focus`,
          targetHours: Math.round((6 + i * 0.75) * 10) / 10, // 6h → 11.25h progression
          workouts: [
            {
              id: `w${i + 1}-1`,
              dayOfWeek: 1,
              title: 'Strength Training',
              type: 'Strength' as const,
              duration: '60 min',
              durationMinutes: 60,
              intensity: 'Moderate' as const,
              blocks: [{ name: 'Full Body', duration: '60 min', description: 'Compound movements' }],
            },
            {
              id: `w${i + 1}-2`,
              dayOfWeek: 2,
              title: 'Zone 2 Cardio',
              type: 'Endurance' as const,
              duration: '90 min',
              durationMinutes: 90,
              intensity: 'Low' as const,
              blocks: [{ name: 'Easy Effort', duration: '90 min', description: 'Heart rate zone 2' }],
            },
            {
              id: `w${i + 1}-3`,
              dayOfWeek: 4,
              title: 'Technique Work',
              type: 'Skill' as const,
              duration: '45 min',
              durationMinutes: 45,
              intensity: 'Low' as const,
              blocks: [{ name: 'Drills', duration: '45 min', description: 'Sport-specific skills' }],
            },
            {
              id: `w${i + 1}-4`,
              dayOfWeek: 5,
              title: 'Intervals',
              type: 'Endurance' as const,
              duration: '60 min',
              durationMinutes: 60,
              intensity: 'High' as const,
              blocks: [{ name: 'Intervals', duration: '60 min', description: '4x8 min threshold' }],
            },
            {
              id: `w${i + 1}-5`,
              dayOfWeek: 6,
              title: 'Long Workout',
              type: 'Endurance' as const,
              duration: '120 min',
              durationMinutes: 120,
              intensity: 'Moderate' as const,
              blocks: [{ name: 'Endurance', duration: '120 min', description: 'Build aerobic capacity' }],
            },
          ],
          coachNote: `Week ${i + 1}: Focus on consistency and recovery.`,
        })),
        markdownSummary: '# Mock Training Plan\n\nThis is a development mock plan for testing the dashboard.',
      };

      const plan: TrainingPlan = {
        structured: mockPlan,
        generatedAt: new Date(),
        planStartDate: getNextMonday(),
      };

      acceptPlan(plan);
      navigate('/');
    } else {
      navigate('/plan-review');
    }
  }, [devLogin, acceptPlan, navigate, searchParams]);

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
      <p className="text-[#737373]">Loading dev profile...</p>
    </div>
  );
};
