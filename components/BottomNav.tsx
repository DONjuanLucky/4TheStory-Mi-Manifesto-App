
import React from 'react';
import { AppTab } from '../types';
import { Language, translations } from '../translations';

interface BottomNavProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onSearchTrigger?: () => void;
  lang: Language;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onSearchTrigger, lang }) => {
  const t = translations[lang];
  const tabs = [
    { id: AppTab.LIBRARY, label: t.nav_archive, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: AppTab.MUSE, label: 'The Muse', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
    { id: AppTab.SEARCH, label: t.nav_search, icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', isAction: true },
    { id: AppTab.COMMUNITY, label: 'Community', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: AppTab.JOURNAL, label: t.nav_journal, icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { id: AppTab.MILESTONES, label: t.nav_goals, icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-1.947 3.42 3.42 0 016.438 0 3.42 3.42 0 001.946 1.947' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90]">
      <nav className="bg-white/90 backdrop-blur-xl border border-stone-200/50 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 md:gap-8 transition-all hover:scale-[1.02]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.isAction && onSearchTrigger) {
                onSearchTrigger();
              } else {
                setActiveTab(tab.id);
              }
            }}
            className="group flex flex-col items-center gap-1.5 relative px-2"
          >
            {activeTab === tab.id && (
              <span className="absolute -top-1 w-1 h-1 rounded-full bg-[#9a3412]" />
            )}
            <div className={`transition-all duration-300 ${activeTab === tab.id ? 'text-[#9a3412] -translate-y-0.5' : 'text-stone-400 group-hover:text-stone-900'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === tab.id ? 2 : 1.5} d={tab.icon} />
              </svg>
            </div>
            <span className={`text-[7px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === tab.id ? 'text-stone-900 opacity-100' : 'text-stone-400 opacity-0 w-0 overflow-hidden group-hover:w-auto group-hover:opacity-100'}`}>
              {activeTab === tab.id ? tab.label : ''}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default BottomNav;
