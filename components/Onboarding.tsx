
import React, { useState } from 'react';
import { THEME_COLORS } from '../constants';

interface OnboardingProps {
  onComplete: (title: string, genre: string, targetWords: number) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ title: '', genre: '', targetWords: 50000 });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onComplete(data.title || "Untitled Manifesto", data.genre || "Memoir", data.targetWords);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-24 flex flex-col items-center text-center">
      <h1 className="font-serif text-5xl mb-8">Mi Manifesto</h1>
      
      <div className="w-full space-y-12">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-xl mb-8 leading-relaxed italic text-gray-600">
              "Every book begins with a single whisper of intention. What shall we call your journey?"
            </p>
            <input 
              autoFocus
              className="w-full bg-transparent border-b-2 border-gray-200 py-4 text-3xl font-serif text-center focus:outline-none focus:border-[#8b7355] transition-colors"
              placeholder="The Title of Your Heart"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            />
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-xl mb-8 leading-relaxed italic text-gray-600">
              "And what shape does this story take?"
            </p>
            <div className="grid grid-cols-2 gap-4">
              {['Memoir', 'Fiction', 'Poetry', 'Non-Fiction', 'Biography', 'Fantasy'].map(g => (
                <button
                  key={g}
                  onClick={() => { setData({ ...data, genre: g }); handleNext(); }}
                  className={`py-4 px-6 border rounded-full transition-all ${data.genre === g ? 'bg-[#8b7355] text-white border-[#8b7355]' : 'hover:border-[#8b7355] border-gray-200'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="text-xl mb-8 leading-relaxed italic text-gray-600">
              "How many words shall we aim for together?"
            </p>
            <input 
              type="number"
              className="w-full bg-transparent border-b-2 border-gray-200 py-4 text-3xl font-serif text-center focus:outline-none focus:border-[#8b7355] transition-colors"
              value={data.targetWords}
              onChange={(e) => setData({ ...data, targetWords: parseInt(e.target.value) })}
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            />
            <p className="mt-4 text-sm text-gray-400">Common novel length is 50,000 to 80,000 words.</p>
          </div>
        )}

        <button 
          onClick={handleNext}
          className="mt-12 px-12 py-4 bg-[#1a1a1a] text-white rounded-full font-medium hover:bg-[#8b7355] transition-all transform hover:scale-105"
        >
          {step < 3 ? 'Continue' : 'Begin My Manifesto'}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
