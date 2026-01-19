
import React, { useState } from 'react';
import { Project, User } from '../types';
import { Language, translations } from '../translations';
import { PERSONAS } from '../constants';
import Logo from './Logo';

interface DashboardProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onLogout: () => void;
  onOpenHelp: () => void;
  user: User | null;
  lang: Language;
}

const GENRE_COLORS: Record<string, string> = {
  'Fiction': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Non-Fiction': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Poetry': 'bg-rose-100 text-rose-700 border-rose-200',
  'Memoir': 'bg-amber-100 text-amber-800 border-amber-200',
  'Journal': 'bg-stone-200 text-stone-700 border-stone-300',
  'Script': 'bg-purple-100 text-purple-700 border-purple-200'
};

const Dashboard: React.FC<DashboardProps> = ({ projects, onSelectProject, onNewProject, onLogout, onOpenHelp, user, lang }) => {
  const t = translations[lang];

  return (
    <div className="min-h-full bg-stone-50 pb-24">
      {/* Editorial Masthead Header */}
      <header className="pt-8 pb-12 px-6 md:px-12 border-b border-stone-200 relative bg-white">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Top Bar: User & Utilities */}
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Online • {new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={onOpenHelp} className="hover:text-[#ea580c] transition-colors">Help & Guide</button>
              <button onClick={onLogout} className="hover:text-stone-900 transition-colors">Log Out</button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="flex items-center gap-6">
              <Logo className="w-20 h-20 hidden md:block opacity-90" />
              <div className="space-y-2">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#ea580c] mb-1 pl-1">{t.dash_author}</h2>
                <h1 className="font-serif text-5xl md:text-6xl text-stone-900 tracking-tight leading-none">
                  {user?.displayName || 'The Writer'}
                </h1>
              </div>
            </div>

            <button 
              onClick={onNewProject}
              className="group flex items-center gap-4 bg-[#0c0a09] text-white px-8 py-4 rounded-full hover:bg-[#ea580c] transition-all shadow-xl active:scale-95 border-2 border-transparent hover:border-[#ea580c]"
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Start New Manuscript</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-16 space-y-20">
        {/* Voice Engine Showcase */}
        <section className="animate-reveal" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-8 border-b border-stone-200 pb-4">
            <h3 className="font-serif text-2xl text-stone-900 italic">Voice Engine Capabilities</h3>
            <span className="text-[10px] font-mono text-stone-400 uppercase">Available Personas</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(PERSONAS).map((p) => (
              <div key={p.id} className="p-5 bg-white border border-stone-200 rounded-xl shadow-sm hover:border-[#ea580c] hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-stone-900 font-bold ${p.id === 'espiritu' ? 'bg-rose-100 text-rose-800' : p.id === 'provocateur' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100'}`}>
                    {p.name[0]}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-stone-600">{p.name}</span>
                </div>
                <p className="text-[11px] text-stone-500 font-serif leading-tight">{p.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Manuscript Grid */}
        <section className="animate-reveal" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-[0.4em] text-stone-400 mb-2">The Archive</span>
              <h2 className="font-serif text-4xl text-stone-900">Current Manuscripts</h2>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-[11px] font-mono text-stone-500">
                Total Words: {projects.reduce((acc, p) => acc + p.currentWordCount, 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.length === 0 ? (
              <div className="col-span-full py-32 border-2 border-dashed border-stone-200 rounded-[2rem] flex flex-col items-center justify-center text-center hover:bg-white transition-colors bg-white/50">
                <div className="w-20 h-20 mb-6 text-stone-300 opacity-50">
                  <Logo className="w-full h-full filter grayscale" />
                </div>
                <h3 className="font-serif text-2xl text-stone-400 italic mb-4">No manuscripts found.</h3>
                <button onClick={onNewProject} className="text-[10px] font-bold uppercase tracking-widest text-[#ea580c] border-b border-[#ea580c] pb-1 hover:text-stone-900 hover:border-stone-900 transition-all">Begin your first work</button>
              </div>
            ) : (
              projects.map((p) => {
                const genreClass = GENRE_COLORS[p.genre] || GENRE_COLORS['Fiction'];
                return (
                  <div 
                    key={p.id}
                    onClick={() => onSelectProject(p.id)}
                    className="group relative bg-white border border-stone-200 p-8 rounded-[2rem] hover:shadow-2xl hover:-translate-y-2 hover:border-stone-300 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[340px]"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="w-10 h-10 rounded-full border border-stone-900 flex items-center justify-center bg-stone-900 text-white">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7m7-7H3" /></svg>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${genreClass}`}>
                          {p.genre}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400">{new Date(p.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-serif text-3xl md:text-4xl text-stone-900 leading-[1.1] mb-4 group-hover:underline decoration-2 underline-offset-4 decoration-[#ea580c]">{p.title}</h3>
                      <p className="text-sm text-stone-600 font-light line-clamp-3 leading-relaxed border-l-2 border-stone-100 pl-4">
                        {p.soulSummary || "No summary available yet."}
                      </p>
                    </div>

                    <div className="pt-8 border-t border-stone-100 mt-8 flex justify-between items-end">
                      <div>
                        <span className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Progress</span>
                        <div className="flex items-center gap-2">
                           <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#ea580c]" style={{ width: `${Math.min(100, (p.currentWordCount / p.targetWordCount) * 100)}%` }}></div>
                           </div>
                           <p className="font-mono text-sm text-stone-900 font-bold">{Math.round((p.currentWordCount / p.targetWordCount) * 100)}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Volume</span>
                        <p className="font-mono text-lg text-stone-900 font-bold">{p.currentWordCount.toLocaleString()} <span className="text-xs text-stone-400 font-normal">words</span></p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
