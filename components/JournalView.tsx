
import React, { useState, useEffect, useRef } from 'react';
import { Modality, LiveServerMessage } from "@google/genai";
import { motion, AnimatePresence } from "framer-motion";
import { JournalEntry, User, CreativityLevel } from '../types';
import { PERSONAS, SYSTEM_INSTRUCTION_BASE, CREATIVITY_INSTRUCTIONS } from '../constants';
import { AudioRecorder, AudioStreamer } from '../utils/audio';
import { ai } from '../services/geminiService';

interface JournalViewProps {
  user: User | null;
}

const JournalView: React.FC<JournalViewProps> = ({ user }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [sessionTranscript, setSessionTranscript] = useState<{role: string, text: string}[]>([]);
  
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mi_manifesto_journal_v2');
    if (saved && user) setEntries(JSON.parse(saved).filter((e: any) => e.userId === user.uid));
  }, [user]);

  const toggleVoiceJournal = async () => {
    if (isLiveActive) {
      audioRecorderRef.current?.stop();
      audioStreamerRef.current?.stop();
      setIsLiveActive(false);
      return;
    }

    setIsLiveActive(true);
    setSessionTranscript([]);
    audioStreamerRef.current = new AudioStreamer();
    audioRecorderRef.current = new AudioRecorder();

    const fullInstruction = `
${SYSTEM_INSTRUCTION_BASE}
You are the Journal Muse. Focus on emotional resonance and reflection. 
Listen for long periods. Do not interrupt the User.
`;

    try {
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: fullInstruction,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: async () => {
            await audioRecorderRef.current?.start((base64) => {
              sessionPromise.then(s => s.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: base64 } }));
            });
          },
          onmessage: (msg: LiveServerMessage) => {
            const data = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (data) {
              setIsModelSpeaking(true);
              audioStreamerRef.current?.play(data);
              setTimeout(() => setIsModelSpeaking(false), 3000);
            }
            
            const userText = msg.serverContent?.inputTranscription?.text;
            if (userText) setSessionTranscript(prev => [...prev, { role: 'user', text: userText }]);
            
            const modelText = msg.serverContent?.outputTranscription?.text;
            if (modelText) setSessionTranscript(prev => [...prev, { role: 'model', text: modelText }]);
          }
        }
      });
    } catch (e) { setIsLiveActive(false); }
  };

  return (
    <div className="h-full bg-stone-50 overflow-hidden flex flex-col">
      <header className="p-10 border-b border-stone-200 bg-white flex justify-between items-center">
         <h1 className="font-serif text-4xl text-stone-950 italic tracking-tight">Reflection Log</h1>
         <button 
           onClick={toggleVoiceJournal}
           className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${isLiveActive ? 'bg-red-500 text-white' : 'bg-stone-950 text-white hover:bg-[#ea580c]'}`}
         >
           {isLiveActive ? "End Session" : "Voice Journal"}
         </button>
      </header>

      <div className="flex-1 overflow-y-auto p-12 relative">
        <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>
        
        {isLiveActive ? (
          <div className="h-full flex flex-col items-center justify-center space-y-12">
             <div className={`w-24 h-24 rounded-full bg-stone-900 flex items-center justify-center transition-all duration-500 ${isModelSpeaking ? 'scale-125 shadow-2xl' : 'scale-100 shadow-lg'}`}>
                <div className="w-16 h-16 rounded-full border border-white/10 animate-ink-pulse"></div>
             </div>
             <div className="w-full max-w-2xl space-y-4">
                {sessionTranscript.map((t, i) => (
                  <div key={i} className={`p-5 rounded-2xl text-sm ${t.role === 'user' ? 'bg-[#ea580c] text-white ml-auto max-w-[80%]' : 'bg-white border border-stone-200 mr-auto max-w-[80%] italic'}`}>
                    {t.text}
                  </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-10 border-2 border-dashed border-stone-200 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-4">
               <p className="font-serif text-xl italic text-stone-300 leading-relaxed">Your journal is a mirror. Tap Voice Journal to reflect on your day.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalView;
