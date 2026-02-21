
import React, { useState, useEffect, useMemo } from 'react';
import { Project, JournalEntry } from '../types';
import { escapeRegExp } from '../utils/stringUtils';

interface SearchOverlayProps {
  projects: Project[];
  journalEntries: JournalEntry[];
  onClose: () => void;
  onResultClick: (type: string, id: string, projectId?: string) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ projects, journalEntries, onClose, onResultClick }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setDebouncedQuery('');
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Pre-process chapters for faster searching
  const searchableChapters = useMemo(() => {
    const items: { chapter: any; project: Project }[] = [];
    for (const p of projects) {
      for (const c of p.chapters) {
        items.push({
          chapter: c,
          project: p
        });
      }
    }
    return items;
  }, [projects]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return null;

    const regex = new RegExp(escapeRegExp(debouncedQuery), 'i');

    const matchedProjects = projects.filter(p => 
      regex.test(p.title) ||
      regex.test(p.genre) ||
      regex.test(p.soulSummary)
    );

    const matchedChapters: { chapter: any; project: Project }[] = [];
    const len = searchableChapters.length;
    for (let i = 0; i < len; i++) {
        const item = searchableChapters[i];
        if (regex.test(item.chapter.title) || regex.test(item.chapter.content)) {
            matchedChapters.push({ chapter: item.chapter, project: item.project });
        }
    }

    const matchedJournal = journalEntries.filter(e => 
      regex.test(e.title) ||
      regex.test(e.content)
    );

    const q = debouncedQuery.toLowerCase();
    const navigationCommands = [
      { id: 'new-manifesto', label: 'Start New Manuscript', category: 'Navigation' },
      { id: 'view-archive', label: 'View Archive', category: 'Navigation' },
      { id: 'open-muse', label: 'Open The Muse', category: 'Navigation' },
      { id: 'open-journal', label: 'Open Reflection Log', category: 'Navigation' }
    ].filter(nav => nav.label.toLowerCase().includes(q));

    return { projects: matchedProjects, chapters: matchedChapters, journal: matchedJournal, nav: navigationCommands };
  }, [debouncedQuery, projects, journalEntries, searchableChapters]);

  return (
    <div 
        className="fixed inset-0 z-[200] bg-stone-950/80 backdrop-blur-xl animate-in fade-in duration-300 flex items-start justify-center pt-12 md:pt-24 px-4 pb-20"
        onClick={onClose}
    >
      <div 
        className="max-w-4xl w-full bg-[#fdfcfb] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20 h-[80vh] md:h-auto md:max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 border-b border-stone-200 flex items-center gap-6 bg-white sticky top-0 z-10">
          <svg className="w-8 h-8 text-[#9a3412]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            autoFocus
            className="flex-1 bg-transparent text-3xl font-serif text-stone-900 placeholder:text-stone-300 focus:outline-none"
            placeholder="Search your legacy..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-900 transition-colors hidden md:block">
            <span className="sr-only">Close</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-12 bg-noise">
          {!query.trim() ? (
            <div className="text-center py-20 space-y-8">
              <p className="font-serif text-3xl italic text-stone-300">"Search is the compass of the creative mind."</p>
              <div className="flex flex-wrap justify-center gap-4">
                {['Fiction', 'Memoir', 'Voice Session', 'Chapter One'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-5 py-2.5 bg-white rounded-full text-[10px] font-bold uppercase tracking-widest text-stone-500 border border-stone-200 hover:border-[#9a3412] hover:text-[#9a3412] transition-all shadow-sm"
                  >
                    Try "{tag}"
                  </button>
                ))}
              </div>
            </div>
          ) : results && (Object.values(results).every((arr: any) => arr.length === 0)) ? (
            <div className="text-center py-24">
              <p className="font-serif text-2xl italic text-stone-400">No echoes found for "{query}".</p>
            </div>
          ) : results && (
            <>
              {results.nav.length > 0 && (
                <section className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.5em] text-stone-400 border-b border-stone-200 pb-2">Quick Commands</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.nav.map(nav => (
                      <button 
                        key={nav.id}
                        onClick={() => onResultClick('navigation', nav.id)}
                        className="w-full text-left p-6 rounded-xl bg-white border border-stone-200 hover:border-stone-900 hover:shadow-lg transition-all group flex items-center justify-between"
                      >
                        <span className="font-bold text-stone-900 text-sm tracking-wide">{nav.label}</span>
                        <svg className="w-4 h-4 text-stone-300 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {results.projects.length > 0 && (
                <section className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.5em] text-stone-400 border-b border-stone-200 pb-2">Manuscripts</h4>
                  <div className="space-y-3">
                    {results.projects.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => onResultClick('project', p.id)}
                        className="w-full text-left p-6 rounded-2xl bg-white border border-stone-200 hover:border-[#9a3412] transition-all flex justify-between items-center group shadow-sm hover:shadow-xl"
                      >
                        <div>
                          <p className="font-serif text-2xl text-stone-900 mb-1">{p.title}</p>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#9a3412]">{p.genre}</span>
                          <span className="text-[10px] font-mono text-stone-400 ml-3">{p.currentWordCount} words</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 group-hover:bg-[#9a3412] group-hover:text-white transition-all">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {results.chapters.length > 0 && (
                <section className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.5em] text-stone-400 border-b border-stone-200 pb-2">Manuscript Snippets</h4>
                  <div className="space-y-3">
                    {results.chapters.map(({ chapter, project }) => (
                      <button 
                        key={chapter.id}
                        onClick={() => onResultClick('chapter', chapter.id, project.id)}
                        className="w-full text-left p-5 rounded-xl bg-stone-50 border border-stone-200 hover:bg-white hover:border-stone-900 transition-all space-y-2 group"
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-stone-900 text-sm font-serif">{chapter.title}</p>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">In "{project.title}"</span>
                        </div>
                        <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed font-mono">{chapter.content.substring(0, 150)}...</p>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        <div className="hidden md:flex p-4 bg-white border-t border-stone-200 justify-between items-center px-8 text-[10px] font-mono text-stone-400 uppercase">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><kbd className="bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">↵</kbd> Select</span>
            <span className="flex items-center gap-2"><kbd className="bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">ESC</kbd> Close</span>
          </div>
        </div>
      </div>
      
      {/* Mobile Close Button - Fixed at bottom */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-[210]">
        <button 
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3 bg-[#1c1917] text-white rounded-full shadow-2xl active:scale-95 transition-transform"
        >
            <span className="text-[10px] font-bold uppercase tracking-widest">Close Search</span>
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">✕</div>
        </button>
      </div>
    </div>
  );
};

export default SearchOverlay;
