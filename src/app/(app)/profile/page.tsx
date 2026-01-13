'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageShell, ContentContainer, Header, Avatar } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { formatDateFull } from '@/lib/utils/date';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <PageShell
      header={
        <Header
          title="Profile"
          variant="dark"
          rightContent={
            <Avatar
              name={user?.email || 'User'}
              size="lg"
            />
          }
        />
      }
    >
      <ContentContainer className="space-y-4">
        {/* Account Section */}
        <SettingsSection title="Account">
          <SettingsItem
            icon={<EmailIcon />}
            label="Email"
            value={user?.email || 'Not set'}
          />
          <SettingsItem
            icon={<CreditCardIcon />}
            label="Subscription"
            value={formatSubscriptionStatus(profile?.subscription_status || 'trial')}
            valueColor={profile?.subscription_status === 'active' ? 'success' : 'default'}
            onClick={() => {
              // TODO: Open Stripe portal
              console.log('Manage billing');
            }}
            hasChevron
          />
        </SettingsSection>

        {/* Goals Section */}
        <SettingsSection title="Goals">
          <SettingsItem
            icon={<TargetIcon />}
            label="Current Goal"
            value={profile?.goal_text || 'Not set'}
            onClick={() => {
              // TODO: Open edit modal
              console.log('Edit goal');
            }}
            hasChevron
          />
          {profile?.goal_date && (
            <SettingsItem
              icon={<CalendarIcon />}
              label="Target Date"
              value={formatDateFull(profile.goal_date)}
            />
          )}
        </SettingsSection>

        {/* Schedule Section */}
        <SettingsSection title="Training Schedule">
          <SettingsItem
            icon={<ClockIcon />}
            label="Weekly Hours"
            value={profile?.hours_per_week ? `${profile.hours_per_week} hours` : 'Not set'}
            onClick={() => {
              console.log('Edit schedule');
            }}
            hasChevron
          />
          <SettingsItem
            icon={<CalendarDaysIcon />}
            label="Training Days"
            value={profile?.days_per_week ? `${profile.days_per_week} days/week` : 'Not set'}
          />
        </SettingsSection>

        {/* Disciplines */}
        <SettingsSection title="Disciplines">
          <div className="p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
            {profile?.disciplines && profile.disciplines.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.disciplines.map((discipline) => (
                  <span
                    key={discipline}
                    className="px-3 py-1 bg-[var(--color-accent-light)] text-amber-800 rounded-full text-sm font-medium capitalize"
                  >
                    {formatDiscipline(discipline)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-caption text-[var(--color-text-muted)]">
                No disciplines selected
              </p>
            )}
          </div>
        </SettingsSection>

        {/* Connections Section */}
        <SettingsSection title="Connections">
          <SettingsItem
            icon={<WatchIcon />}
            label="Watch"
            value={profile?.terra_provider ? `${formatProvider(profile.terra_provider)} Connected` : 'Not connected'}
            valueColor={profile?.terra_provider ? 'success' : 'muted'}
            onClick={() => {
              console.log('Manage watch');
            }}
            hasChevron
          />
        </SettingsSection>

        {/* Sign Out */}
        <div className="pt-4">
          <Button
            variant="ghost"
            className="w-full text-[var(--color-error)]"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>

        {/* Version info */}
        <p className="text-center text-micro text-[var(--color-text-muted)] pt-4 pb-8">
          Summit v0.1.0
        </p>
      </ContentContainer>
    </PageShell>
  );
}

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div>
      <h2 className="text-caption font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2 px-1">
        {title}
      </h2>
      <Card padding="none" className="divide-y divide-[var(--color-border-light)]">
        {children}
      </Card>
    </div>
  );
}

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: 'default' | 'success' | 'muted';
  onClick?: () => void;
  hasChevron?: boolean;
}

function SettingsItem({
  icon,
  label,
  value,
  valueColor = 'default',
  onClick,
  hasChevron,
}: SettingsItemProps) {
  const Wrapper = onClick ? 'button' : 'div';

  const valueColors = {
    default: 'text-[var(--color-text-secondary)]',
    success: 'text-[var(--color-success)]',
    muted: 'text-[var(--color-text-muted)]',
  };

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex items-center justify-between w-full px-4 py-3',
        onClick && 'tap-highlight-none hover:bg-[var(--color-surface-secondary)]'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-[var(--color-text-muted)]">{icon}</span>
        <span className="text-body text-[var(--color-text-primary)]">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn('text-caption truncate max-w-[150px]', valueColors[valueColor])}>
          {value}
        </span>
        {hasChevron && (
          <ChevronRightIcon className="w-4 h-4 text-[var(--color-text-muted)]" />
        )}
      </div>
    </Wrapper>
  );
}

// Helpers
function formatSubscriptionStatus(status: string): string {
  const labels: Record<string, string> = {
    trial: 'Free Trial',
    active: 'Pro',
    canceled: 'Canceled',
    past_due: 'Payment Due',
  };
  return labels[status] || status;
}

function formatDiscipline(discipline: string): string {
  const labels: Record<string, string> = {
    climbing: 'Climbing',
    ultra: 'Ultra Running',
    skimo: 'Ski Mountaineering',
    mountaineering: 'Mountaineering',
    trail_running: 'Trail Running',
    alpinism: 'Alpinism',
  };
  return labels[discipline] || discipline;
}

function formatProvider(provider: string): string {
  const labels: Record<string, string> = {
    garmin: 'Garmin',
    apple: 'Apple Watch',
    whoop: 'WHOOP',
    coros: 'COROS',
  };
  return labels[provider] || provider;
}

// Icons
function EmailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function CalendarDaysIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
    </svg>
  );
}

function WatchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}
