
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TrainingLogProvider } from './contexts/TrainingLogContext';
import { Layout } from './components/Layout';
import { LandingPage } from './views/LandingPage';
import { Onboarding } from './views/Onboarding';
import { PlanReview } from './views/PlanReview';
import { Dashboard } from './views/Dashboard';
import { ChatView } from './views/ChatView';
import { ProgressView } from './views/ProgressView';
import { PlanView } from './views/PlanView';
import { DevLogin } from './views/DevLogin';
import { Mountain } from 'lucide-react';

// Placeholder views
const SettingsPlaceholder = () => {
  const { signOut, user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-serif">Settings</h1>
      <div className="max-w-xl space-y-8">
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-amber-500">Profile</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#262626] rounded-xl border border-white/5">
              <span className="text-[#737373]">Name</span>
              <span>{user?.name || 'Athlete'}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#262626] rounded-xl border border-white/5">
              <span className="text-[#737373]">Email</span>
              <span>{user?.email || 'athlete@summit.io'}</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-amber-500">Integrations</h3>
          <div className="p-4 bg-[#262626] rounded-xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#fc4c02] rounded-lg flex items-center justify-center text-white font-bold italic">S</div>
              <span>Strava</span>
            </div>
            <button className="text-xs font-bold text-[#737373] uppercase">Connect</button>
          </div>
        </div>
        <div className="pt-4">
          <button
            onClick={signOut}
            className="w-full p-4 bg-red-600/10 text-red-500 rounded-xl border border-red-600/20 hover:bg-red-600/20 transition-colors font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading spinner for auth initialization
const AuthLoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
    <div className="flex flex-col items-center space-y-6">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-amber-600/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <Mountain className="absolute inset-0 m-auto text-amber-500" size={32} />
      </div>
      <p className="text-[#737373] text-sm">Loading...</p>
    </div>
  </div>
);

// Protected route wrapper - requires auth + onboarding + plan accepted
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, hasCompletedOnboarding, hasAcceptedPlan, isLoading } = useAuth();

  if (isLoading) return <AuthLoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!hasAcceptedPlan) {
    return <Navigate to="/plan-review" replace />;
  }

  return <>{children}</>;
};

// Route that requires auth but not onboarding (for onboarding flow itself)
const OnboardingRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, hasCompletedOnboarding, hasAcceptedPlan, isLoading } = useAuth();

  if (isLoading) return <AuthLoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  if (hasCompletedOnboarding && hasAcceptedPlan) {
    return <Navigate to="/" replace />;
  }

  if (hasCompletedOnboarding && !hasAcceptedPlan) {
    return <Navigate to="/plan-review" replace />;
  }

  return <>{children}</>;
};

// Route for plan review - requires onboarding but not plan acceptance
const PlanReviewRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, hasCompletedOnboarding, hasAcceptedPlan, isLoading } = useAuth();

  if (isLoading) return <AuthLoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (hasAcceptedPlan) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Public route - redirect based on auth state
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, hasCompletedOnboarding, hasAcceptedPlan, isLoading } = useAuth();

  if (isLoading) return <AuthLoadingScreen />;

  if (isAuthenticated && hasCompletedOnboarding && hasAcceptedPlan) {
    return <Navigate to="/" replace />;
  }

  if (isAuthenticated && hasCompletedOnboarding && !hasAcceptedPlan) {
    return <Navigate to="/plan-review" replace />;
  }

  if (isAuthenticated && !hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/landing"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />

      {/* Onboarding - requires auth but not completion */}
      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <Onboarding />
          </OnboardingRoute>
        }
      />

      {/* Plan Review - requires onboarding but not plan acceptance */}
      <Route
        path="/plan-review"
        element={
          <PlanReviewRoute>
            <PlanReview />
          </PlanReviewRoute>
        }
      />

      {/* Protected routes - requires auth + onboarding + plan accepted */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Layout>
              <ChatView />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <Layout>
              <ProgressView />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/plan"
        element={
          <ProtectedRoute>
            <Layout>
              <PlanView />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <SettingsPlaceholder />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Dev login - bypasses onboarding for testing */}
      <Route path="/dev" element={<DevLogin />} />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <TrainingLogProvider>
          <AppRoutes />
        </TrainingLogProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
