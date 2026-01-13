'use client';

import { cn } from '@/lib/utils/cn';
import type { Metrics } from '@/types/database';

interface MetricsStripProps {
  metrics: Metrics | null;
  className?: string;
}

export function MetricsStrip({ metrics, className }: MetricsStripProps) {
  // If no metrics, show connect watch prompt
  if (!metrics) {
    return (
      <div className={cn('px-4', className)}>
        <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
          <WatchIcon className="w-5 h-5 text-[var(--color-text-muted)]" />
          <div className="flex-1">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Connect your watch for recovery insights
            </p>
          </div>
          <ChevronIcon className="w-4 h-4 text-[var(--color-text-muted)]" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('px-4', className)}>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1 -mx-1 px-1">
        {/* HRV Metric */}
        {metrics.hrv !== null && (
          <MetricCard
            label="HRV"
            value={metrics.hrv}
            status={getHrvStatus(metrics.hrv)}
          />
        )}

        {/* Sleep Metric */}
        {metrics.sleep_score !== null && (
          <MetricCard
            label="Sleep"
            value={metrics.sleep_score}
            unit="%"
            status={getSleepStatus(metrics.sleep_score)}
          />
        )}

        {/* Training Load */}
        {metrics.load_ratio !== null && (
          <MetricCard
            label="Load"
            value={getLoadLabel(metrics.load_ratio)}
            status={getLoadStatus(metrics.load_ratio)}
            isTextValue
          />
        )}

        {/* Recovery Score */}
        {metrics.recovery_score !== null && (
          <MetricCard
            label="Recovery"
            value={metrics.recovery_score}
            unit="%"
            status={getRecoveryStatus(metrics.recovery_score)}
          />
        )}
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  status: 'good' | 'moderate' | 'poor';
  isTextValue?: boolean;
}

function MetricCard({ label, value, unit, status, isTextValue }: MetricCardProps) {
  const statusColors = {
    good: 'text-emerald-600',
    moderate: 'text-amber-600',
    poor: 'text-red-500',
  };

  const statusDots = {
    good: 'bg-emerald-500',
    moderate: 'bg-amber-500',
    poor: 'bg-red-500',
  };

  return (
    <div className="flex-shrink-0 flex flex-col items-center px-4 py-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] min-w-[85px]">
      <div className="flex items-center gap-1.5 mb-1">
        <div className={cn('w-1.5 h-1.5 rounded-full', statusDots[status])} />
        <span className="text-micro text-[var(--color-text-muted)] uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="flex items-baseline">
        <span className={cn(
          isTextValue ? 'text-sm font-semibold' : 'text-xl font-bold',
          statusColors[status]
        )}>
          {value}
        </span>
        {unit && (
          <span className="text-xs text-[var(--color-text-muted)] ml-0.5">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

// Status calculation helpers
function getHrvStatus(hrv: number): 'good' | 'moderate' | 'poor' {
  if (hrv >= 50) return 'good';
  if (hrv >= 30) return 'moderate';
  return 'poor';
}

function getSleepStatus(score: number): 'good' | 'moderate' | 'poor' {
  if (score >= 80) return 'good';
  if (score >= 60) return 'moderate';
  return 'poor';
}

function getLoadStatus(ratio: number): 'good' | 'moderate' | 'poor' {
  if (ratio >= 0.8 && ratio <= 1.3) return 'good';
  if (ratio >= 0.6 && ratio <= 1.5) return 'moderate';
  return 'poor';
}

function getLoadLabel(ratio: number): string {
  if (ratio < 0.8) return 'Low';
  if (ratio <= 1.3) return 'Optimal';
  if (ratio <= 1.5) return 'High';
  return 'Recover';
}

function getRecoveryStatus(score: number): 'good' | 'moderate' | 'poor' {
  if (score >= 70) return 'good';
  if (score >= 40) return 'moderate';
  return 'poor';
}

// Icons
function WatchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export default MetricsStrip;
