
import React, { useState, useEffect } from 'react';
import { Project, Chapter } from '../types';

interface EditorViewProps {
  project: Project;
  onBack: () => void;
  onUpdateChapter: (chapterId: string, content: string) => void;
}

const EditorView: React.FC<EditorViewProps> = ({ project, onBack, onUpdateChapter }) => {
  const [activeChapterId, setActiveChapterId] = useState(project.chapters[0]?.id || '1');
  const activeChapter = project.chapters.find(c => c.id === activeChapterId);

  const wordCount = activeChapter?.content.split(/\s+/).filter(Boolean).length || 0;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Editor Header */}
      <header className="py-4 px-8 border-b border-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="text-gray-400 hover:text-black transition-colors">
            ← <span className="text-xs uppercase tracking-widest font-medium ml-1">Back to Companion</span>
          </button>
          <div className="h-4 w-px bg-gray-100" />
          <h2 className="font-serif italic text-gray-400">{project.title}</h2>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs font-mono text-gray-400 block uppercase tracking-tighter">Current Session</span>
            <span className="text-sm font-medium">{wordCount.toLocaleString()} words</span>
          </div>
          <button className="px-5 py-2 border border-gray-200 rounded-full text-xs font-medium uppercase tracking-widest hover:bg-gray-50 transition-all">
            Export
          </button>
        </div>
      </header>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto py-24 px-6">
        <div className="max-w-2xl mx-auto">
          {activeChapter && (
            <>
              <input 
                className="w-full bg-transparent border-none text-4xl font-serif mb-12 focus:outline-none placeholder:text-gray-100"
                placeholder="Chapter Title..."
                defaultValue={activeChapter.title}
              />
              <textarea 
                className="w-full bg-transparent border-none text-xl font-serif leading-loose min-h-[70vh] focus:outline-none resize-none placeholder:text-gray-100 selection:bg-[#8b735520]"
                placeholder="Once upon a time..."
                value={activeChapter.content}
                onChange={(e) => onUpdateChapter(activeChapterId, e.target.value)}
              />
            </>
          )}
        </div>
      </div>

      {/* Footer Status */}
      <footer className="py-3 px-8 border-t border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-sm">
        <div className="flex gap-4">
          {project.chapters.map(c => (
            <button 
              key={c.id}
              onClick={() => setActiveChapterId(c.id)}
              className={`text-xs uppercase tracking-widest font-medium px-3 py-1 rounded-full transition-all ${c.id === activeChapterId ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}
            >
              Ch {c.order}
            </button>
          ))}
          <button className="text-gray-300 hover:text-[#8b7355] text-xs font-bold">+</button>
        </div>
        <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em] italic">
          Drafting in "Editorial Elegance" Mode • Auto-saved
        </div>
      </footer>
    </div>
  );
};

export default EditorView;
