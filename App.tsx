
import React, { useState, useEffect } from 'react';
import { View, AppTab, Project, User } from './types';
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
import { THEME_COLORS } from './constants';
import { simulateAuthChange, logout } from './services/authService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.LANDING);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.LIBRARY);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);
  
  useEffect(() => {
    simulateAuthChange((u) => {
      setUser(u);
      setLoading(false);
      
      const savedProjects = localStorage.getItem('mi_manifesto_projects_v2');
      if (savedProjects) {
        const parsed = JSON.parse(savedProjects) as Project[];
        if (u) {
          const userProjects = parsed.filter(p => p.userId === u.uid);
          setProjects(userProjects);
        } else {
          setProjects([]);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('mi_manifesto_projects_v2', JSON.stringify(projects));
    }
  }, [projects]);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const createProject = (title: string, genre: string, targetWords: number) => {
    if (!user) return;
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.uid,
      title,
      genre,
      persona: 'empathetic',
      targetWordCount: targetWords,
      currentWordCount: 0,
      soulSummary: `A fresh journey into the world of ${genre}. The author is beginning to find the voice of "${title}".`,
      chapters: [{ id: '1', title: 'Chapter One', content: '', order: 1 }],
      messages: [],
      milestones: [
        { id: 'm1', label: 'The First Whisper', target: 1, type: 'wordCount', isPreset: true, completed: false },
        { id: 'm2', label: '1,000 Words', target: 1000, type: 'wordCount', isPreset: true, completed: false }
      ],
      updatedAt: new Date(),
      orientationDone: false
    };
    setProjects([newProject, ...projects]);
    setActiveProjectId(newProject.id);
    setCurrentView(View.MAIN);
    setActiveTab(AppTab.MUSE);
    
    setTimeout(() => setShowTour(true), 1500);
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates, updatedAt: new Date() } : p));
  };

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    setCurrentView(projects.length > 0 ? View.MAIN : View.ONBOARDING);
    if (projects.length > 0) setShowTour(true);
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
            user={user}
          />
        );
      case AppTab.MUSE:
        return activeProject ? (
          <CompanionView 
            project={activeProject} 
            onOpenEditor={() => setCurrentView(View.EDITOR)}
            updateProject={updateProject}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-20 animate-in fade-in duration-1000">
            <h2 className="font-serif text-3xl mb-4 italic text-gray-400">The Muse is waiting in the wings.</h2>
            <button onClick={() => setActiveTab(AppTab.LIBRARY)} className="px-8 py-3 bg-[#1a1a1a] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#8b7355] transition-all shadow-sm">Select a project</button>
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
        <div className="w-12 h-12 border-4 border-[#8b735520] border-t-[#8b7355] rounded-full animate-spin" />
      </div>
    );
  }

  if (currentView === View.LANDING) {
    return <LandingPage onStart={() => setCurrentView(user ? View.MAIN : View.AUTH)} />;
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
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      {showTour && <TourOverlay onClose={() => { setShowTour(false); localStorage.setItem('tour_dismissed', 'true'); }} />}
    </div>
  );
};

export default App;
