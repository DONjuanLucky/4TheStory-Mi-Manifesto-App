
import React, { useState } from 'react';
import { Project, Milestone } from '../types';

interface MilestonesViewProps {
  project: Project;
}

const MilestonesView: React.FC<MilestonesViewProps> = ({ project }) => {
  const [newGoal, setNewGoal] = useState('');

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-12">
        <h2 className="text-sm font-medium tracking-widest uppercase text-gray-400 mb-2">{project.title}</h2>
        <h1 className="font-serif text-5xl">Your Path</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm text-center">
          <div className="text-4xl mb-2 font-serif">{project.currentWordCount.toLocaleString()}</div>
          <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Words Authored</div>
        </div>
        <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm text-center">
          <div className="text-4xl mb-2 font-serif">{project.chapters.length}</div>
          <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Chapters Spoken</div>
        </div>
        <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm text-center">
          <div className="text-4xl mb-2 font-serif">{Math.round((project.currentWordCount / project.targetWordCount) * 100)}%</div>
          <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Of Your Vision</div>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#8b7355]">Active Intentions</h3>
          <button className="text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-black transition-colors">+ Add Goal</button>
        </div>
        
        <div className="space-y-4">
          {project.milestones.map(m => (
            <div key={m.id} className="flex items-center gap-6 p-6 bg-white border border-gray-50 rounded-2xl">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${m.completed ? 'bg-[#2d5a3d] border-[#2d5a3d] text-white' : 'border-gray-200 text-transparent'}`}>
                ✓
              </div>
              <div className="flex-1">
                <h4 className={`font-serif text-xl ${m.completed ? 'line-through text-gray-300' : ''}`}>{m.label}</h4>
                <p className="text-xs text-gray-400 uppercase tracking-tighter">Target: {m.target} {m.type === 'wordCount' ? 'words' : 'chapters'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MilestonesView;
