
import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './views/LandingPage';
import { Onboarding } from './views/Onboarding';
import { Dashboard } from './views/Dashboard';
import { ChatView } from './views/ChatView';
import { ProgressView } from './views/ProgressView';

// Simple placeholder views
const PlanPlaceholder = () => (
  <div className="space-y-6">
    <h1 className="text-4xl font-serif">Training Plan</h1>
    <div className="bg-[#262626] p-20 rounded-2xl border border-white/5 text-center italic text-[#737373]">
      Your full calendar view is being generated. 
      Check back shortly.
    </div>
  </div>
);

const SettingsPlaceholder = () => (
  <div className="space-y-6">
    <h1 className="text-4xl font-serif">Settings</h1>
    <div className="max-w-xl space-y-8">
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-amber-500">Profile</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#262626] rounded-xl border border-white/5">
            <span className="text-[#737373]">Name</span>
            <span>Jane Doe</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-[#262626] rounded-xl border border-white/5">
            <span className="text-[#737373]">Email</span>
            <span>jane@summit.io</span>
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
          <button className="text-xs font-bold text-[#737373] uppercase">Connected</button>
        </div>
      </div>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const location = useLocation();
  const isPublic = location.pathname === '/landing' || location.pathname === '/onboarding';

  if (isPublic) {
    return (
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chat" element={<ChatView />} />
        <Route path="/progress" element={<ProgressView />} />
        <Route path="/plan" element={<PlanPlaceholder />} />
        <Route path="/settings" element={<SettingsPlaceholder />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
