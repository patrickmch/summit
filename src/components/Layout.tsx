
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, X, Bell, User } from 'lucide-react';
import { NAVIGATION, COLORS } from '../constants';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#f5f2ed] flex">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#1a1a1a] border-r border-white/5 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:block
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-2 mb-12 px-2">
            <div className="w-8 h-8 bg-[#d97706] rounded flex items-center justify-center font-bold text-black italic">S</div>
            <h1 className="text-2xl font-bold tracking-tight">SUMMIT</h1>
          </div>

          <nav className="flex-1 space-y-2">
            {NAVIGATION.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-amber-600/10 text-amber-500 border border-amber-600/20' 
                      : 'text-[#737373] hover:text-[#f5f2ed] hover:bg-white/5'}
                  `}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#d97706] to-[#f59e0b] flex items-center justify-center text-black font-bold">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">Jane Doe</p>
                <p className="text-xs text-[#737373] truncate">Base Building Phase</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 md:px-10 border-b border-white/5">
          <button 
            className="lg:hidden p-2 -ml-2 text-[#737373] hover:text-[#f5f2ed]"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="hidden md:flex flex-col">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#737373]">Current Phase</h2>
            <p className="text-lg font-serif">Base Building — Week 3 of 8</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-[#737373] hover:text-[#f5f2ed] transition-colors">
              <Bell size={20} />
            </button>
            <button className="p-2 text-[#737373] hover:text-[#f5f2ed] transition-colors">
              <User size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Body */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
