
import React from 'react';
import { Project, User } from '../types';

interface DashboardProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onLogout: () => void;
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onSelectProject, onNewProject, onLogout, user }) => {
  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-12 animate-in fade-in duration-1000">
      <div className="flex justify-between items-start mb-16">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-300">Workspace of {user?.displayName || 'Author'}</h2>
            <div className="w-1 h-1 rounded-full bg-gray-200" />
            <a 
              href="https://github.com/DONjuanLucky/4TheStory" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8b7355] hover:opacity-50 transition-all flex items-center gap-1.5"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.627-5.373-12-12-12z"/></svg>
              GitHub Source
            </a>
          </div>
          <h1 className="font-serif text-5xl tracking-tight">Your Library</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onLogout}
            className="px-6 py-3 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-300 hover:text-red-400 transition-all active:scale-95"
          >
            Logout
          </button>
          <button 
            onClick={onNewProject}
            className="px-6 py-3 bg-white border border-gray-100 shadow-sm rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-[#8b7355] hover:text-[#8b7355] transition-all transform hover:scale-105 active:scale-95"
          >
            + New Book
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {projects.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-gray-100 rounded-[3rem] bg-white/40 flex flex-col items-center">
            <p className="text-gray-300 font-serif italic text-xl mb-6">Your shelf is waiting for its first story...</p>
            <button 
              onClick={onNewProject}
              className="px-8 py-3 bg-[#1a1a1a] text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#8b7355] transition-all transform hover:scale-110"
            >
              Start Your Manifesto
            </button>
          </div>
        ) : (
          projects.map(p => (
            <div 
              key={p.id} 
              onClick={() => onSelectProject(p.id)}
              className="group relative bg-white border border-gray-100 p-10 rounded-[3rem] hover:shadow-2xl hover:shadow-[#8b735515] transition-all cursor-pointer border-l-0 hover:border-l-[12px] hover:border-l-[#8b7355] transform active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="font-serif text-4xl mb-2 group-hover:text-[#8b7355] transition-colors">{p.title}</h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-bold">{p.genre}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-serif text-[#8b7355] leading-none">{Math.round((p.currentWordCount / p.targetWordCount) * 100)}%</span>
                  <p className="text-[9px] text-gray-300 uppercase tracking-widest font-bold">Complete</p>
                </div>
              </div>

              <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden mb-8">
                <div 
                  className="h-full bg-[#8b7355] transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, (p.currentWordCount / p.targetWordCount) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">
                <div className="flex gap-6">
                  <span className="text-[#1a1a1a] flex items-center gap-1.5">
                    {p.currentWordCount.toLocaleString()} 
                    <span className="text-gray-200">Words</span>
                  </span>
                  <span className="text-[#1a1a1a] flex items-center gap-1.5">
                    {p.chapters.length} 
                    <span className="text-gray-200">Chapters</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  <span className="italic">Last whisper {new Date(p.updatedAt).toLocaleDateString()}</span>
                  <div className="w-px h-3 bg-gray-100 mx-2" />
                  <span className="text-[#8b7355]">Vault Synced</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {projects.length > 0 && (
        <div className="mt-24">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 mb-10 border-b border-gray-50 pb-4">Literary Milestones</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <MilestoneCard label="The Threshold" status="complete" />
            <MilestoneCard label="First 1k" status={projects[0].currentWordCount >= 1000 ? 'complete' : 'locked'} />
            <MilestoneCard label="The Heart" status={projects[0].chapters.length > 3 ? 'complete' : 'locked'} />
            <MilestoneCard label="Manifested" status={projects[0].currentWordCount >= projects[0].targetWordCount ? 'complete' : 'locked'} />
          </div>
        </div>
      )}
    </div>
  );
};

const MilestoneCard = ({ label, status }: { label: string, status: 'complete' | 'locked' }) => (
  <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 ${status === 'complete' ? 'bg-[#2d5a3d05] border-[#2d5a3d10] text-[#2d5a3d] hover:shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-300 opacity-40 grayscale'}`}>
    <div className="text-3xl mb-4 transition-transform group-hover:scale-110">{status === 'complete' ? '🖋️' : '🔒'}</div>
    <span className="text-[9px] font-bold uppercase tracking-widest block">{label}</span>
  </div>
);

export default Dashboard;
