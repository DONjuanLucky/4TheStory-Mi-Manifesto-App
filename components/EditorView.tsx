
import React, { useState, useRef } from 'react';
import { Project, Chapter } from '../types';
import { countWords } from '../utils/textUtils';

interface EditorViewProps {
  project: Project;
  onBack: () => void;
  onUpdateChapter: (chapterId: string, content: string) => void;
  onAddChapter: (projectId: string) => void;
  onUpdateTitle: (chapterId: string, title: string) => void;
}

const EditorView: React.FC<EditorViewProps> = ({ project, onBack, onUpdateChapter, onAddChapter, onUpdateTitle }) => {
  const [activeChapterId, setActiveChapterId] = useState(project.chapters[0]?.id || '1');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeChapter = project.chapters.find(c => c.id === activeChapterId);

  const wordCount = activeChapter ? countWords(activeChapter.content) : 0;

  const handleExport = () => {
    const fullText = project.chapters
      .sort((a, b) => a.order - b.order)
      .map(c => `SECTION ${c.order}: ${c.title.toUpperCase()}\n\n${c.content}`)
      .join('\n\n--- NEXT SECTION ---\n\n');
    
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title.replace(/\s+/g, '_')}_Draft.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (activeChapterId) {
        onUpdateChapter(activeChapterId, content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-screen bg-white animate-in fade-in duration-700 overflow-hidden">
      <header className="py-4 px-8 border-b-2 border-stone-200 flex justify-between items-center bg-stone-50/90 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="flex items-center gap-3 text-stone-900 font-bold group">
            <div className="w-10 h-10 rounded-xl border-2 border-stone-900 flex items-center justify-center group-hover:bg-[#1c1917] group-hover:text-white transition-all shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em]">Exit</span>
          </button>
          
          <div className="h-8 w-px bg-stone-200" />
          
          <div className="space-y-0.5">
            <h2 className="text-[8px] font-bold uppercase tracking-[0.3em] text-stone-400">Project</h2>
            <p className="font-serif italic text-xl text-stone-900 tracking-tight truncate max-w-[200px]">{project.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.md" className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 border-2 border-stone-200 text-stone-400 hover:text-stone-900 hover:border-stone-900 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all bg-white"
          >Import</button>
          <button 
            onClick={handleExport}
            className="px-8 py-4 bg-[#1c1917] text-white rounded-full text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-[#78350f] shadow-lg transition-all active:scale-95"
          >Export</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pt-16 pb-48 px-8 bg-white">
        <div className="max-w-3xl mx-auto space-y-12">
          {activeChapter ? (
            <>
              <div className="text-center space-y-6 animate-in fade-in duration-1000">
                <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-[#78350f]">Section {activeChapter.order}</span>
                <input 
                  className="w-full text-5xl font-serif text-center border-none focus:outline-none placeholder:text-stone-100 text-stone-900 tracking-tighter bg-transparent"
                  placeholder="The Title"
                  value={activeChapter.title}
                  onChange={(e) => onUpdateTitle(activeChapterId, e.target.value)}
                />
                <div className="w-12 h-1 bg-[#78350f20] mx-auto rounded-full" />
              </div>
              
              <textarea 
                className="w-full text-xl md:text-2xl font-serif leading-[2] min-h-[70vh] border-none focus:outline-none resize-none placeholder:text-stone-100 text-stone-800 bg-transparent selection:bg-[#78350f10]"
                placeholder="The unwritten page awaits your voice..."
                value={activeChapter.content}
                onChange={(e) => onUpdateChapter(activeChapterId, e.target.value)}
              />
            </>
          ) : (
            <div className="text-center py-48 italic text-stone-200 font-serif text-3xl">Begin with a single truth.</div>
          )}
        </div>
      </div>

      <footer className="py-6 px-8 border-t-2 border-stone-200 flex flex-col md:flex-row justify-between items-center bg-stone-50/95 backdrop-blur-xl fixed bottom-0 left-0 right-0 z-50 shadow-inner gap-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar w-full md:w-auto">
          {project.chapters.map(c => (
            <button 
              key={c.id}
              onClick={() => setActiveChapterId(c.id)}
              className={`px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border-2 ${c.id === activeChapterId ? 'bg-[#1c1917] text-white border-[#1c1917] shadow-lg scale-105' : 'bg-white text-stone-400 hover:text-stone-900 border-stone-100 hover:border-stone-300'}`}
            >SEC {c.order}: {c.title.substring(0, 10) || "Untitled"}</button>
          ))}
          <button 
            onClick={() => onAddChapter(project.id)}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white text-stone-900 border-2 border-stone-200 hover:bg-[#1c1917] hover:text-white transition-all shadow-sm font-bold text-lg"
          >+</button>
        </div>
        
        <div className="flex items-center gap-8 text-right w-full md:w-auto justify-between md:justify-end">
          <div className="space-y-0.5">
            <span className="text-[8px] font-bold text-stone-400 block uppercase tracking-widest">Active Section</span>
            <span className="text-lg font-bold text-stone-900">{wordCount.toLocaleString()} words</span>
          </div>
          <div className="h-8 w-px bg-stone-200 hidden md:block" />
          <div className="space-y-0.5">
            <span className="text-[8px] font-bold text-stone-400 block uppercase tracking-widest">Total Manuscript</span>
            <span className="text-lg font-bold text-stone-900">{project.currentWordCount.toLocaleString()} words</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EditorView;
