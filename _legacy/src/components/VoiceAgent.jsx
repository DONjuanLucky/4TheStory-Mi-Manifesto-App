import React from 'react';
import { Mic, MicOff, Sparkles } from 'lucide-react';
import { useVoiceAgent } from '../hooks/useVoiceAgent';

const VoiceAgent = () => {
    const { isListening, agentState, toggleListening, transcript, response } = useVoiceAgent();

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
            {/* Agent Status Bubble */}
            {agentState !== 'idle' && (
                <div className="glass-panel p-4 rounded-2xl max-w-xs mb-2 animate-float">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={16} className="text-[var(--accent-gold)]" />
                        <span className="text-xs font-bold text-[var(--accent-gold)] uppercase tracking-wider">
                            {agentState}
                        </span>
                    </div>
                    <p className="text-sm text-[var(--text-primary)]">
                        {agentState === 'listening' && "I'm listening..."}
                        {agentState === 'thinking' && "Processing..."}
                        {agentState === 'speaking' && response}
                    </p>
                    {transcript && agentState === 'thinking' && (
                        <p className="text-xs text-[var(--text-muted)] mt-2 italic">"{transcript}"</p>
                    )}
                </div>
            )}

            {/* Visualizer / Button */}
            <button
                onClick={toggleListening}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 relative ${isListening
                        ? 'bg-[var(--accent-gold)] text-black scale-110'
                        : 'bg-[var(--bg-surface)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
            >
                {isListening && (
                    <span className="absolute inset-0 rounded-full animate-[pulse-glow_2s_infinite]"></span>
                )}
                {isListening ? <Mic size={28} /> : <MicOff size={24} />}
            </button>
        </div>
    );
};

export default VoiceAgent;
