
import React, { useState } from 'react';
import { THEME_COLORS, PERSONAS } from '../constants';
import { PersonaType } from '../types';

interface OnboardingProps {
  onComplete: (title: string, genre: string, targetWords: number, persona: PersonaType) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<{ title: string; genre: string; targetWords: number; persona: PersonaType }>({ 
    title: '', 
    genre: '', 
    targetWords: 50000,
    persona: 'empathetic'
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      // Ensure defaults if user cleared inputs
      const safeTitle = data.title.trim() || "Untitled Project";
      const safeGenre = data.genre || "Fiction";
      const safeWords = data.targetWords > 0 ? data.targetWords : 50000;
      onComplete(safeTitle, safeGenre, safeWords, data.persona);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 flex flex-col items-center text-center">
      <h1 className="font-serif text-4xl mb-6">Mi Manifesto</h1>
      
      <div className="w-full space-y-10">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-lg mb-8 leading-relaxed italic text-gray-600">
              "Every great work begins with a single whisper of intention. What shall we call your journey?"
            </p>
            <input 
              autoFocus
              className="w-full bg-transparent border-b-2 border-gray-200 py-3 text-2xl font-serif text-center focus:outline-none focus:border-[#8b7355] transition-colors"
              placeholder="The Title of Your Heart"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            />
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-lg mb-8 leading-relaxed italic text-gray-600">
              "And what shape does this story take?"
            </p>
            <div className="grid grid-cols-2 gap-3">
              {['Fiction', 'Non-Fiction', 'Poetry', 'Memoir', 'Journal', 'Script'].map(g => (
                <button
                  key={g}
                  onClick={() => { setData({ ...data, genre: g }); handleNext(); }}
                  className={`py-3 px-5 border rounded-2xl text-sm transition-all ${data.genre === g ? 'bg-[#8b7355] text-white border-[#8b7355] shadow-lg' : 'hover:border-[#8b7355] border-gray-200'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-lg mb-8 leading-relaxed italic text-gray-600">
              "How many words shall we aim for together?"
            </p>
            <input 
              type="number"
              className="w-full bg-transparent border-b-2 border-gray-200 py-3 text-2xl font-serif text-center focus:outline-none focus:border-[#8b7355] transition-colors"
              value={data.targetWords || ''}
              placeholder="50000"
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setData({ ...data, targetWords: isNaN(val) ? 0 : val });
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            />
            <p className="mt-4 text-[10px] text-gray-400 uppercase tracking-widest">A standard volume is roughly 50,000 words.</p>
          </div>
        )}

        {step === 4 && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-lg mb-8 leading-relaxed italic text-gray-600">
              "Who shall accompany you on this path?"
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {Object.values(PERSONAS).map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setData({ ...data, persona: p.id as PersonaType }); handleNext(); }}
                  className={`p-4 border rounded-2xl transition-all group ${data.persona === p.id ? 'bg-[#1c1917] text-white border-[#1c1917] shadow-xl' : 'bg-white hover:border-stone-900 border-gray-200'}`}
                >
                   <div className="flex items-center gap-3 mb-2">
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-serif text-sm ${data.persona === p.id ? 'bg-white text-stone-900' : 'bg-stone-100 text-stone-900'}`}>{p.name[0]}</div>
                     <span className="text-[11px] font-bold uppercase tracking-widest">{p.name}</span>
                   </div>
                   <p className={`text-xs leading-relaxed ${data.persona === p.id ? 'text-stone-400' : 'text-stone-500'}`}>{p.description}</p>
                </button>
              ))}
            </div>
           </div>
        )}

        <button 
          onClick={handleNext}
          className="mt-10 px-10 py-4 bg-[#1a1a1a] text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#8b7355] transition-all transform hover:scale-105 shadow-xl"
        >
          {step < 4 ? 'Continue' : 'Begin My Story'}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
