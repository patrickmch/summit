'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToday } from '@/hooks/useToday';
import { PageShell, ContentContainer } from '@/components/layout';
import { Header, Avatar } from '@/components/layout';
import { MetricsStrip, WorkoutCard } from '@/components/today';
import { Card } from '@/components/ui/Card';
import { SkeletonCard, SkeletonMetricsStrip } from '@/components/ui/Skeleton';
import { formatDateFull } from '@/lib/utils/date';

export default function TodayPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { data, loading, error } = useToday();

  const handleStartWorkout = () => {
    // TODO: Navigate to workout tracking view
    console.log('Start workout');
  };

  const handleLogWorkout = () => {
    // TODO: Open log workout modal
    console.log('Log workout');
  };

  const handleModifyWorkout = () => {
    // Navigate to chat with context about modifying today's workout
    router.push('/chat?context=modify-today');
  };

  // Calculate current week/phase info from profile's plan
  // This would ideally come from the API, but we'll derive it for now
  const weekInfo = data?.workout?.week_number
    ? `Week ${data.workout.week_number}`
    : 'This Week';

  return (
    <PageShell
      header={
        <Header
          subtitle={weekInfo}
          title={getPhaseTitle(data)}
          rightContent={
            <Avatar
              name={profile?.goal_text || 'User'}
              size="md"
            />
          }
          bottomContent={
            <span className="text-caption text-slate-400">
              {formatDateFull(new Date())}
            </span>
          }
        />
      }
    >
      <ContentContainer className="space-y-4">
        {/* Metrics Strip */}
        {loading ? (
          <SkeletonMetricsStrip />
        ) : (
          <MetricsStrip metrics={data?.metrics ?? null} className="-mx-4" />
        )}

        {/* Workout Card */}
        {loading ? (
          <SkeletonCard />
        ) : error ? (
          <ErrorCard message={error.message} />
        ) : (
          <WorkoutCard
            workout={data?.workout ?? null}
            onStartWorkout={handleStartWorkout}
            onLogWorkout={handleLogWorkout}
            onModifyWorkout={handleModifyWorkout}
          />
        )}

        {/* Streak/Motivation Message */}
        {data && !loading && (
          <MotivationCard
            streak={data.streak}
            message={data.message}
          />
        )}
      </ContentContainer>
    </PageShell>
  );
}

function getPhaseTitle(data: ReturnType<typeof useToday>['data']): string {
  // TODO: Get actual phase from plan data
  // For now, return a generic title or derive from workout
  if (!data?.workout) return 'Rest Day';
  return data.workout.title || 'Training Day';
}

interface MotivationCardProps {
  streak: number;
  message?: string;
}

function MotivationCard({ streak, message }: MotivationCardProps) {
  if (!streak && !message) return null;

  return (
    <div className="px-4 -mx-4">
      <Card className="bg-gradient-to-br from-[var(--color-header-bg)] to-slate-700 border-0">
        <div className="flex items-center gap-4">
          {streak > 0 && (
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
              <div className="text-center">
                <span className="text-xl font-bold text-[var(--color-accent)]">{streak}</span>
                <span className="block text-micro text-slate-400">days</span>
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            {streak > 0 && (
              <p className="text-sm font-medium text-white">
                {streak} day streak!
              </p>
            )}
            <p className="text-caption text-slate-300 mt-0.5">
              {message || getDefaultMotivation(streak)}
            </p>
          </div>
          <FireIcon className="w-6 h-6 text-[var(--color-accent)] flex-shrink-0" />
        </div>
      </Card>
    </div>
  );
}

function getDefaultMotivation(streak: number): string {
  if (streak >= 30) return "Incredible consistency. You're built different.";
  if (streak >= 14) return "Two weeks strong. The gains are compounding.";
  if (streak >= 7) return "One week down. Keep showing up.";
  if (streak >= 3) return "Building momentum. Don't stop now.";
  if (streak > 0) return "Every session counts. Keep it going.";
  return "Ready to start your training journey?";
}

interface ErrorCardProps {
  message: string;
}

function ErrorCard({ message }: ErrorCardProps) {
  return (
    <div className="px-4">
      <Card className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--color-error-light)] flex items-center justify-center">
          <ExclamationIcon className="w-6 h-6 text-[var(--color-error)]" />
        </div>
        <h3 className="text-title text-[var(--color-text-primary)] mb-2">
          Unable to load
        </h3>
        <p className="text-caption text-[var(--color-text-secondary)]">
          {message}
        </p>
      </Card>
    </div>
  );
}

// Icons
function FireIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z" clipRule="evenodd" />
    </svg>
  );
}

function ExclamationIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
    </svg>
  );
}
