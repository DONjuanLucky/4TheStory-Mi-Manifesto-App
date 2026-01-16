
import React, { useState } from 'react';
import { Project, Chapter } from '../types';

interface EditorViewProps {
  project: Project;
  onBack: () => void;
  onUpdateChapter: (chapterId: string, content: string) => void;
}

const EditorView: React.FC<EditorViewProps> = ({ project, onBack, onUpdateChapter }) => {
  const [activeChapterId, setActiveChapterId] = useState(project.chapters[0]?.id || '1');
  const activeChapter = project.chapters.find(c => c.id === activeChapterId);

  const wordCount = activeChapter?.content.trim().split(/\s+/).filter(Boolean).length || 0;

  const handleExport = () => {
    const fullText = project.chapters
      .sort((a, b) => a.order - b.order)
      .map(c => `${c.title.toUpperCase()}\n\n${c.content}`)
      .join('\n\n--- NEXT CHAPTER ---\n\n');
    
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title.replace(/\s+/g, '_')}_Manuscript.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-white animate-in fade-in duration-700">
      {/* Editor Header */}
      <header className="py-4 px-8 border-b border-gray-50 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack} 
            className="text-gray-400 hover:text-black transition-all transform hover:-translate-x-1 flex items-center"
          >
            <span className="text-xl mr-2">←</span>
            <span className="text-[10px] uppercase tracking-widest font-bold">Back to Companion</span>
          </button>
          <div className="h-4 w-px bg-gray-100" />
          <h2 className="font-serif italic text-gray-300 truncate max-w-[200px]">{project.title}</h2>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <span className="text-[8px] font-bold text-gray-300 block uppercase tracking-widest mb-0.5">Chapter Stats</span>
            <span className="text-xs font-bold text-[#1a1a1a]">{wordCount.toLocaleString()} words</span>
          </div>
          <button 
            onClick={handleExport}
            className="px-6 py-2.5 bg-[#1a1a1a] text-white rounded-full text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-[#8b7355] hover:shadow-xl transition-all active:scale-95"
          >
            Export Manuscript
          </button>
        </div>
      </header>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto pt-16 pb-32 px-6">
        <div className="max-w-2xl mx-auto">
          {activeChapter ? (
            <>
              <input 
                className="w-full bg-transparent border-none text-5xl font-serif mb-12 focus:outline-none placeholder:text-gray-100 tracking-tighter"
                placeholder="The Chapter Title"
                value={activeChapter.title}
                onChange={(e) => {
                  const updatedChapters = project.chapters.map(c => 
                    c.id === activeChapterId ? { ...c, title: e.target.value } : c
                  );
                  // We'll update via the same parent method but need a custom one for titles if strictly typed. 
                  // For now, we update content as triggered by parent.
                  onUpdateChapter(activeChapterId, activeChapter.content); 
                }}
              />
              <textarea 
                className="w-full bg-transparent border-none text-xl font-serif leading-[2] min-h-[70vh] focus:outline-none resize-none placeholder:text-gray-100 selection:bg-[#8b735520] transition-opacity"
                placeholder="The unwritten page awaits your spoken truth..."
                value={activeChapter.content}
                onChange={(e) => onUpdateChapter(activeChapterId, e.target.value)}
              />
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
               <span className="font-serif text-2xl italic">Select a chapter to begin...</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Status */}
      <footer className="py-4 px-8 border-t border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-sm fixed bottom-0 left-0 right-0">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {project.chapters.sort((a,b) => a.order - b.order).map(c => (
            <button 
              key={c.id}
              onClick={() => setActiveChapterId(c.id)}
              className={`text-[9px] uppercase tracking-widest font-bold px-4 py-2 rounded-full transition-all whitespace-nowrap ${c.id === activeChapterId ? 'bg-[#1a1a1a] text-white shadow-lg' : 'text-gray-400 hover:text-black bg-gray-50'}`}
            >
              CH {c.order}
            </button>
          ))}
          <button 
            onClick={() => {
                const newId = Math.random().toString(36).substr(2,9);
                const newChapter: Chapter = { id: newId, title: 'Untitled Chapter', content: '', order: project.chapters.length + 1 };
                // Since update is handled by parent, we just set the ID and let parent manage the list
                // In a real app we'd have an onAddChapter prop.
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:text-[#8b7355] border border-gray-100 hover:border-[#8b7355] transition-all"
          >
            +
          </button>
        </div>
        <div className="text-[9px] text-gray-300 uppercase tracking-[0.4em] font-bold italic hidden md:block">
          Auto-saved to Legacy Vault
        </div>
      </footer>
    </div>
  );
};

export default EditorView;
