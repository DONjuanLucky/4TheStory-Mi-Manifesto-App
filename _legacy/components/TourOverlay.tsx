
import React, { useState } from 'react';

interface TourStep {
  targetId: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'center';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'voice-toggle',
    title: 'Your Voice Sanctuary',
    description: 'The Muse listens best to your spoken truth. Toggle voice mode here to begin our Discovery Session.',
    position: 'top'
  },
  {
    targetId: 'persona-selector',
    title: 'Choose Your Partner',
    description: 'Swap between Empathetic listening, Editorial mentorship, or Creative catalysis at any time.',
    position: 'bottom'
  },
  {
    targetId: 'editor-button',
    title: 'The Drafting Table',
    description: 'When you are ready, ask me to "Commit to Draft." Your spoken wisdom will be curated into professional prose here.',
    position: 'bottom'
  },
  {
    targetId: 'bottom-nav',
    title: 'Your Library',
    description: 'Switch between your active Muse, your full Library of books, and your literary milestones.',
    position: 'top'
  }
];

const TourOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TOUR_STEPS[currentStep];

  const next = () => {
    if (currentStep < TOUR_STEPS.length - 1) setCurrentStep(currentStep + 1);
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-500 flex items-center justify-center p-6">
      <div className="max-w-xs w-full bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="mb-6 flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8b7355]">The Muse Guide</span>
            <span className="text-[10px] text-gray-300">{currentStep + 1} / {TOUR_STEPS.length}</span>
        </div>
        
        <h3 className="font-serif text-2xl mb-3 text-[#1a1a1a]">{step.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">{step.description}</p>
        
        <div className="flex gap-3">
            <button 
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-gray-100 hover:bg-gray-50 transition-all"
            >
                Skip
            </button>
            <button 
                onClick={next}
                className="flex-[2] py-3 px-6 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#1a1a1a] text-white hover:bg-[#8b7355] transition-all"
            >
                {currentStep === TOUR_STEPS.length - 1 ? 'Begin My Journey' : 'Next Step'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default TourOverlay;
