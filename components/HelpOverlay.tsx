
import React, { useState } from 'react';

const HelpOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('basics');

  const content = {
    basics: {
      title: "The Basics",
      items: [
        { q: "What is the Muse?", a: "The Muse is an AI-driven editorial partner. It listens to your spoken ideas and helps structure them into coherent narratives." },
        { q: "How do I start?", a: "Click 'Start New Manuscript' on the dashboard. You'll go through a brief onboarding to set your intention." },
        { q: "Does it write for me?", a: "It collaborates. You speak, it transcribes and organizes. You can ask it to 'Commit to Draft' to turn conversation into prose." }
      ]
    },
    voice: {
      title: "Voice Features",
      items: [
        { q: "Live Sessions", a: "In the Companion View, click the microphone icon to start a real-time voice session. The Muse will speak back to you." },
        { q: "Personas", a: "You can change the Muse's personality (e.g., Empathetic, Mentor, Provocateur) to suit your creative mood." }
      ]
    },
    export: {
      title: "Saving & Exporting",
      items: [
        { q: "Is my work saved?", a: "Yes, everything is saved automatically to your local browser storage and synced when you are online." },
        { q: "Exporting", a: "Go to the Editor view and click 'Export' to download a plain text file of your manuscript." }
      ]
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-stone-900/40 backdrop-blur-sm flex justify-end animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-500 border-l border-stone-200">
        <div className="flex justify-between items-center mb-10">
          <h2 className="font-serif text-3xl text-stone-900">Guide & Help</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {Object.keys(content).map(key => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${activeSection === key ? 'bg-[#9a3412] text-white shadow-md' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
            >
              {(content as any)[key].title}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {(content as any)[activeSection].items.map((item: any, i: number) => (
            <div key={i} className="group">
              <h3 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9a3412]"></span>
                {item.q}
              </h3>
              <p className="text-sm text-stone-500 leading-relaxed pl-3.5 border-l border-stone-200 group-hover:border-[#9a3412] transition-colors duration-300">
                {item.a}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-stone-100">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Keyboard Shortcuts</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between text-xs text-stone-600">
              <span>Search</span>
              <kbd className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200 font-mono">Cmd+K</kbd>
            </div>
            <div className="flex justify-between text-xs text-stone-600">
              <span>Close</span>
              <kbd className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200 font-mono">Esc</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpOverlay;
