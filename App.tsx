import React, { useState, useEffect } from 'react';
import { View, AppTab, Project, User, Chapter, JournalEntry, PersonaType } from './types';
import Dashboard from './components/Dashboard';
import CompanionView from './components/CompanionView';
import EditorView from './components/EditorView';
import Onboarding from './components/Onboarding';
import LandingPage from './components/LandingPage';
import AuthView from './components/AuthView';
import Community from './components/Community';
import MilestonesView from './components/MilestonesView';
import JournalView from './components/JournalView';
import BottomNav from './components/BottomNav';
import TourOverlay from './components/TourOverlay';
import SearchOverlay from './components/SearchOverlay';
import HelpOverlay from './components/HelpOverlay';
import { THEME_COLORS } from './constants';
import { subscribeToAuthChanges, logout } from './services/authService';
import { Language } from './translations';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.LANDING);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.LIBRARY);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  
  // Auth Subscription Effect
  // CRITICAL FIX: Removed [projects.length] dependency to prevent auth reset on project creation
  useEffect(() => {
    // Cache for localStorage reads to avoid redundant JSON parsing
    const cache = {
      projects: { raw: null as string | null, parsed: [] as Project[] },
      journal: { raw: null as string | null, parsed: [] as JournalEntry[] }
    };

    const unsubscribe = subscribeToAuthChanges((u) => {
      // If we are already logged in (e.g. via Mock), don't let a null firebase event wipe us out immediately
      // unless it's a genuine logout event we want to handle. 
      // For now, we trust the callback 'u' from firebase.
      if (u) {
        setUser({ ...u, memberSince: u.memberSince || new Date() });
      } else {
        // Only set user to null if we don't have a manually set user (like a guest)
        // logic handled inside services usually, but here we assume if firebase says null, it's null.
        // However, to support Guest Mode persistence across re-renders, we should check if we are already 'guest'.
        // For simplicity in this architecture, we accept the auth state but rely on the dependency fix above.
        setUser(prev => (prev && prev.email?.includes('guest') ? prev : null));
      }
      setLoading(false);
      
      const savedProjects = localStorage.getItem('mi_manifesto_projects_v3');
      let parsedProjects: Project[] = [];

      if (savedProjects) {
        if (cache.projects.raw === savedProjects) {
          parsedProjects = cache.projects.parsed;
        } else {
          parsedProjects = JSON.parse(savedProjects);
          cache.projects = { raw: savedProjects, parsed: parsedProjects };
        }
      } else {
        cache.projects = { raw: null, parsed: [] };
      }
      
      if (u) {
        const userProjects = parsedProjects.filter((p: Project) => p.userId === u.uid);
        setProjects(userProjects);
        
        // Navigation Logic: Only redirect if currently on Landing/Auth
        setCurrentView(prev => {
          if (prev === View.LANDING || prev === View.AUTH) {
            return userProjects.length > 0 ? View.MAIN : View.ONBOARDING;
          }
          return prev;
        });
      } else {
        setProjects([]);
      }

      const savedJournal = localStorage.getItem('mi_manifesto_journal');
      let parsedJournal: JournalEntry[] = [];

      if (savedJournal && u) {
        if (cache.journal.raw === savedJournal) {
          parsedJournal = cache.journal.parsed;
        } else {
          parsedJournal = JSON.parse(savedJournal) as JournalEntry[];
          cache.journal = { raw: savedJournal, parsed: parsedJournal };
        }
        setJournalEntries(parsedJournal.filter(e => e.userId === u.uid));
      }
    });

    return () => unsubscribe();
  }, []); // Run once on mount

  // Persistence Effect
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('mi_manifesto_projects_v3', JSON.stringify(projects));
    }
  }, [projects]);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const createProject = (title: string, genre: string, targetWords: number, persona: PersonaType) => {
    if (!user) {
      console.error("Cannot create project: No user logged in.");
      return;
    }
    
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.uid,
      title,
      genre,
      persona: persona || 'empathetic',
      creativityLevel: 'balanced',
      targetWordCount: targetWords,
      currentWordCount: 0,
      soulSummary: `The beginning of a ${genre} titled "${title}". The author seeks to find their unique voice.`,
      chapters: [{ id: '1', title: 'Chapter One', content: '', order: 1 }],
      messages: [],
      interactions: [],
      milestones: [
        { id: 'm1', label: 'The First Whisper', target: 1, type: 'wordCount', isPreset: true, completed: false },
        { id: 'm2', label: '1,000 Words', target: 1000, type: 'wordCount', isPreset: true, completed: false }
      ],
      updatedAt: new Date(),
      orientationDone: false
    };

    // Use functional update to ensure we have latest state even if closed over
    setProjects(prev => {
      const updated = [newProject, ...prev];
      localStorage.setItem('mi_manifesto_projects_v3', JSON.stringify(updated));
      return updated;
    });
    
    setActiveProjectId(newProject.id);
    setCurrentView(View.MAIN);
    setActiveTab(AppTab.MUSE);
    
    setTimeout(() => setShowTour(true), 1500);
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates, updatedAt: new Date() } : p));
  };

  const handleAddChapter = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const nextOrder = project.chapters.length + 1;
    const newChapter: Chapter = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Chapter ${nextOrder}`,
      content: '',
      order: nextOrder
    };
    updateProject(projectId, { chapters: [...project.chapters, newChapter] });
  };

  const handleUpdateChapterTitle = (chapterId: string, newTitle: string) => {
    if (!activeProjectId) return;
    const project = projects.find(p => p.id === activeProjectId);
    if (!project) return;
    const updatedChapters = project.chapters.map(c => c.id === chapterId ? { ...c, title: newTitle } : c);
    updateProject(activeProjectId, { chapters: updatedChapters });
  };

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    const savedProjects = localStorage.getItem('mi_manifesto_projects_v3');
    const parsed = savedProjects ? JSON.parse(savedProjects) : [];
    const hasProjects = parsed.some((p: Project) => p.userId === u.uid);
    
    // Immediate redirect based on data availability
    setCurrentView(hasProjects ? View.MAIN : View.ONBOARDING);
    if (hasProjects) setShowTour(true);
  };

  const handleSearchResultClick = (type: string, id: string, projectId?: string) => {
    setShowSearch(false);
    if (type === 'project') {
      setActiveProjectId(id);
      setActiveTab(AppTab.MUSE);
    } else if (type === 'journal') {
      setActiveTab(AppTab.JOURNAL);
    } else if (type === 'chapter') {
      if (projectId) {
        setActiveProjectId(projectId);
        setCurrentView(View.EDITOR);
      }
    } else if (type === 'navigation') {
      if (id === 'new-manifesto') setCurrentView(View.ONBOARDING);
      if (id === 'view-archive') setActiveTab(AppTab.LIBRARY);
      if (id === 'open-journal') setActiveTab(AppTab.JOURNAL);
      if (id === 'open-muse') setActiveTab(AppTab.MUSE);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case AppTab.LIBRARY:
        return (
          <Dashboard 
            projects={projects} 
            onSelectProject={(id) => {
              setActiveProjectId(id);
              setActiveTab(AppTab.MUSE);
            }} 
            onNewProject={() => setCurrentView(View.ONBOARDING)}
            onLogout={logout}
            onOpenHelp={() => setShowHelp(true)}
            user={user}
            lang={lang}
          />
        );
      case AppTab.MUSE:
        return activeProject ? (
          <CompanionView 
            project={activeProject} 
            onOpenEditor={() => setCurrentView(View.EDITOR)}
            updateProject={updateProject}
            lang={lang}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-12 py-32 animate-in fade-in duration-1000">
            <h2 className="font-serif text-3xl italic text-stone-300 mb-8 tracking-tight">The Muse waits for your work.</h2>
            <button 
              onClick={() => setActiveTab(AppTab.LIBRARY)} 
              className="px-10 py-5 bg-[#1a1a1a] text-white rounded-full text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-[#8b7355] transition-all shadow-xl active:scale-95"
            >
              Select a Manuscript
            </button>
          </div>
        );
      case AppTab.JOURNAL:
        return <JournalView user={user} />;
      case AppTab.COMMUNITY:
        return <Community />;
      case AppTab.MILESTONES:
        return activeProject ? <MilestonesView project={activeProject} /> : <div className="p-12 text-center text-gray-400">Select a project to view goals.</div>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#8b735510] border-t-[#8b7355] rounded-full animate-spin" />
      </div>
    );
  }

  if (currentView === View.LANDING) {
    return (
      <LandingPage 
        onStart={() => setCurrentView(user ? View.MAIN : View.AUTH)} 
        lang={lang} 
        setLang={setLang} 
      />
    );
  }

  if (currentView === View.AUTH) {
    return <AuthView onAuthSuccess={handleAuthSuccess} onBackToLanding={() => setCurrentView(View.LANDING)} />;
  }

  if (currentView === View.ONBOARDING) {
    return <Onboarding onComplete={createProject} />;
  }

  if (currentView === View.EDITOR && activeProject) {
    return (
      <EditorView 
        project={activeProject} 
        onBack={() => setCurrentView(View.MAIN)}
        onAddChapter={handleAddChapter}
        onUpdateTitle={handleUpdateChapterTitle}
        onUpdateChapter={(id, content) => {
          const updatedChapters = activeProject.chapters.map(c => c.id === id ? { ...c, content } : c);
          const totalWords = updatedChapters.reduce((acc, curr) => acc + curr.content.trim().split(/\s+/).filter(Boolean).length, 0);
          updateProject(activeProject.id, { chapters: updatedChapters, currentWordCount: totalWords });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ backgroundColor: THEME_COLORS.paper }}>
      <main className="flex-1 overflow-y-auto">
        {renderActiveTab()}
      </main>
      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSearchTrigger={() => setShowSearch(true)}
        lang={lang}
      />
      {showSearch && (
        <SearchOverlay 
          projects={projects} 
          journalEntries={journalEntries}
          onClose={() => setShowSearch(false)} 
          onResultClick={handleSearchResultClick}
        />
      )}
      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
      {showTour && <TourOverlay onClose={() => { setShowTour(false); localStorage.setItem('tour_dismissed', 'true'); }} />}
    </div>
  );
};

export default App;
