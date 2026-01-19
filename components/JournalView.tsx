
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { motion, AnimatePresence } from "framer-motion";
import { JournalEntry, User, CreativityLevel } from '../types';
import { JOURNAL_PROMPTS, PERSONAS, SYSTEM_INSTRUCTION_BASE, CREATIVITY_INSTRUCTIONS } from '../constants';
import { AudioRecorder, AudioStreamer } from '../utils/audio';

interface JournalViewProps {
  user: User | null;
}

interface TranscriptItem {
    role: 'user' | 'model';
    text: string;
}

const JournalView: React.FC<JournalViewProps> = ({ user }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [suggestedPrompt, setSuggestedPrompt] = useState('');
  
  // Voice State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [sessionTranscript, setSessionTranscript] = useState<TranscriptItem[]>([]);
  const [creativityLevel, setCreativityLevel] = useState<CreativityLevel>('balanced');
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const transcriptBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptBottomRef.current) {
        transcriptBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sessionTranscript]);

  useEffect(() => {
    const saved = localStorage.getItem('mi_manifesto_journal');
    if (saved && user) {
      const allEntries = JSON.parse(saved) as JournalEntry[];
      setEntries(allEntries.filter(e => e.userId === user.uid));
    }
    setSuggestedPrompt(JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)]);
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('mi_manifesto_journal', JSON.stringify(entries));
    }
  }, [entries, user]);

  const handleNewEntry = () => {
    if (!user) return;
    const newEntry: JournalEntry = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.uid,
      title: 'New Reflection',
      content: '',
      timestamp: new Date()
    };
    setEntries([newEntry, ...entries]);
    setActiveEntryId(newEntry.id);
    setTitle('New Reflection');
    setContent('');
    setSidebarOpen(false);
  };

  const selectEntry = (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      setActiveEntryId(id);
      setTitle(entry.title);
      setContent(entry.content);
      setSidebarOpen(false);
    }
  };

  const handleSave = () => {
    if (!activeEntryId) return;
    setEntries(prev => prev.map(e => 
      e.id === activeEntryId ? { ...e, title, content, timestamp: new Date() } : e
    ));
  };

  const toggleVoiceJournaling = async () => {
    if (isLiveActive) {
      audioRecorderRef.current?.stop();
      audioStreamerRef.current?.stop();
      setIsLiveActive(false);
      
      // Save full transcript to journal content upon closing if desired
      if (sessionTranscript.length > 0) {
        const conversationLog = sessionTranscript.map(t => 
            `${t.role === 'user' ? '[YOU]' : '[MUSE]'}: ${t.text}`
        ).join('\n');
        
        const newContent = content ? `${content}\n\n--- VOICE SESSION ---\n${conversationLog}` : conversationLog;
        setContent(newContent);
        setEntries(prev => prev.map(e => e.id === activeEntryId ? { ...e, content: newContent, timestamp: new Date() } : e));
      }
      return;
    }

    if (!activeEntryId) handleNewEntry();

    setIsLiveActive(true);
    setSessionTranscript([]);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    audioStreamerRef.current = new AudioStreamer();
    audioRecorderRef.current = new AudioRecorder();

    // Use selected creativity level
    const creativityInstruction = CREATIVITY_INSTRUCTIONS[creativityLevel];

    // Variables to hold partial transcriptions
    let currentUserContent = '';
    let currentModelContent = '';

    try {
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `
${SYSTEM_INSTRUCTION_BASE}
${creativityInstruction}
You are the Journal Muse. Listen and support the author in their reflection. Keep it warm and safe.
REMEMBER: Do not interrupt the user. Wait for them to finish their thoughts.
`,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: PERSONAS.empathetic.voice } } },
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
                setTimeout(() => setIsModelSpeaking(false), 2500);
            }
            
            // Handle User Transcription
            const userText = msg.serverContent?.inputTranscription?.text;
            if (userText) {
                currentUserContent += " " + userText;
                setSessionTranscript(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === 'user') {
                        return [...prev.slice(0, -1), { role: 'user', text: currentUserContent }];
                    } else {
                        return [...prev, { role: 'user', text: currentUserContent }];
                    }
                });
            }

            // Handle Model Transcription
            const modelText = msg.serverContent?.outputTranscription?.text;
            if (modelText) {
                currentModelContent += modelText;
                setSessionTranscript(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === 'model') {
                        return [...prev.slice(0, -1), { role: 'model', text: currentModelContent }];
                    } else {
                        return [...prev, { role: 'model', text: currentModelContent }];
                    }
                });
            }

            // Reset partials on turn complete (this logic keeps the bubbles growing until turn ends)
            if (msg.serverContent?.turnComplete) {
                if (currentUserContent.trim()) currentUserContent = '';
            }
            
            if (userText && currentModelContent.trim()) {
                currentModelContent = '';
            }

            if (msg.serverContent?.interrupted) {
              audioStreamerRef.current?.stop();
              setIsModelSpeaking(false);
            }
          },
          onclose: () => setIsLiveActive(false),
          onerror: () => setIsLiveActive(false)
        }
      });
    } catch (e) { console.error(e); setIsLiveActive(false); }
  };

  return (
    <div className="flex h-full bg-[#f5f2eb] overflow-hidden relative">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-stone-900/60 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile Responsive Drawer */}
      <div className={`fixed lg:relative z-40 h-full w-[85vw] sm:w-80 bg-white border-r-2 border-stone-200 shadow-2xl transition-transform duration-500 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b-2 border-stone-100 flex justify-between items-center bg-stone-50">
            <h2 className="text-[11px] font-bold tracking-[0.5em] uppercase text-[#78350f]">Reflection Log</h2>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full bg-stone-200 text-stone-600 transition-colors">✕</button>
          </div>
          <div className="p-6">
            <button 
              onClick={handleNewEntry}
              className="w-full py-5 bg-[#1c1917] text-white rounded-[2rem] text-[10px] font-bold uppercase tracking-widest hover:bg-[#78350f] transition-all shadow-xl active:scale-95"
            >+ New Reflection</button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-32 space-y-2">
            {entries.length ? entries.map(e => (
              <button
                key={e.id}
                onClick={() => selectEntry(e.id)}
                className={`w-full text-left p-6 rounded-[2rem] transition-all border-2 ${activeEntryId === e.id ? 'bg-[#1c1917] text-white shadow-xl border-[#1c1917]' : 'bg-white hover:border-stone-300 border-stone-100 text-stone-900'}`}
              >
                <h4 className="font-serif text-xl truncate mb-2">{e.title}</h4>
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] uppercase tracking-widest font-bold ${activeEntryId === e.id ? 'text-white/50' : 'text-stone-300'}`}>{new Date(e.timestamp).toLocaleDateString()}</span>
                  <div className={`w-1 h-1 rounded-full ${activeEntryId === e.id ? 'bg-white/30' : 'bg-stone-200'}`} />
                  <span className={`text-[9px] font-mono ${activeEntryId === e.id ? 'text-white/40' : 'text-stone-300'}`}>{e.content.length} chars</span>
                </div>
              </button>
            )) : (
              <div className="text-center py-20 px-6">
                <p className="italic text-stone-300 font-serif text-xl leading-relaxed">Your journal is a mirror to your soul. Start your first entry.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Journal Editor Content */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
        <header className="p-6 border-b-2 border-stone-100 flex items-center justify-between bg-stone-50/50">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-12 h-12 flex items-center justify-center bg-white rounded-2xl border-2 border-stone-200 shadow-sm hover:scale-105 transition-transform"
          >
            <svg className="w-6 h-6 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
          
          <div className="flex-1 px-6">
            {activeEntryId && <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300 hidden sm:inline">Active Reflection Session</span>}
          </div>

          <div className="flex gap-4 relative">
             {/* Creativity Settings */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-12 h-12 flex items-center justify-center bg-stone-100 rounded-2xl text-stone-400 hover:bg-stone-200 hover:text-stone-600 transition-all"
              >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              </button>
              {showSettings && (
                 <div className="absolute top-14 right-0 w-64 bg-white rounded-xl shadow-xl border border-stone-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-3">Muse Creativity</h3>
                    <div className="flex gap-1 bg-stone-100 p-1 rounded-lg">
                       {(['strict', 'balanced', 'creative'] as CreativityLevel[]).map(l => (
                          <button
                            key={l}
                            onClick={() => { setCreativityLevel(l); setShowSettings(false); }}
                            className={`flex-1 py-2 text-[8px] font-bold uppercase rounded-md transition-all ${creativityLevel === l ? 'bg-white shadow-sm text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
                          >
                             {l}
                          </button>
                       ))}
                    </div>
                 </div>
              )}
            </div>

            <button 
              onClick={toggleVoiceJournaling} 
              className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-md ${isLiveActive ? 'bg-red-600 text-white animate-pulse' : 'bg-[#1c1917] text-white hover:bg-[#78350f]'}`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </button>
            <button 
              onClick={handleSave}
              className="w-12 h-12 flex items-center justify-center bg-stone-100 rounded-2xl text-stone-400 hover:bg-[#166534] hover:text-white transition-all"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          {activeEntryId ? (
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
               <input 
                 className="w-full text-3xl md:text-4xl font-serif bg-transparent border-none focus:outline-none placeholder:text-stone-200 text-stone-900"
                 placeholder="Title your reflection..."
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
               />
               
               {suggestedPrompt && !content && (
                 <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 flex items-start gap-3">
                    <span className="text-xl">✨</span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Muse Prompt</p>
                      <p className="text-stone-600 italic">"{suggestedPrompt}"</p>
                    </div>
                 </div>
               )}

               <textarea 
                 className="w-full h-[60vh] resize-none text-lg leading-loose bg-transparent border-none focus:outline-none placeholder:text-stone-200 text-stone-700 font-serif"
                 placeholder="Speak or write your truth here..."
                 value={content}
                 onChange={(e) => setContent(e.target.value)}
               />
            </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                <div className="w-24 h-24 mb-6 bg-stone-100 rounded-full flex items-center justify-center">
                   <svg className="w-10 h-10 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <h3 className="font-serif text-2xl text-stone-400">Select an entry or start a new reflection.</h3>
             </div>
          )}
        </div>

        {/* FULL SCREEN JOURNAL MUSE OVERLAY */}
        <AnimatePresence>
          {isLiveActive && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 z-50 flex flex-col bg-stone-900/95 backdrop-blur-2xl"
            >
              {/* Header */}
              <div className="p-6 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-3">
                   <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                   <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Journaling Session</span>
                </div>
                <button 
                  onClick={toggleVoiceJournaling}
                  className="px-6 py-2 rounded-full border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                >
                  End Session
                </button>
              </div>

              {/* Central Visualization */}
              <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
                 <motion.div 
                    animate={{ 
                      scale: isModelSpeaking ? [1, 1.2, 1] : 1,
                      opacity: isModelSpeaking ? 0.8 : 0.3
                    }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="w-48 h-48 rounded-full bg-[#1c1917] blur-[60px] absolute"
                 />
                 <div className="relative z-10 w-32 h-32 rounded-full border border-white/10 flex items-center justify-center bg-stone-900">
                    <div className={`w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)] ${isModelSpeaking ? 'animate-pulse' : ''}`}>
                         <svg className="w-10 h-10 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    </div>
                 </div>
                 <div className="mt-8 text-center space-y-2">
                   <p className="text-stone-500 text-xs uppercase tracking-widest font-bold">
                      {isModelSpeaking ? "Reflecting..." : "Listening..."}
                   </p>
                   <p className="text-stone-600 text-[10px] uppercase tracking-widest">
                      {creativityLevel} Mode
                   </p>
                 </div>
              </div>

              {/* Real-time Transcription Log */}
              <div className="h-1/3 bg-black/20 border-t border-white/5 p-6 overflow-y-auto space-y-4">
                 <div className="max-w-2xl mx-auto space-y-4">
                    {sessionTranscript.length === 0 && (
                        <p className="text-center text-stone-600 italic">Spoken reflections will appear here...</p>
                    )}
                    {sessionTranscript.map((item, idx) => (
                        <div key={idx} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                                item.role === 'user' 
                                ? 'bg-stone-800 text-stone-200' 
                                : 'text-white font-serif italic'
                            }`}>
                                {item.text}
                            </div>
                        </div>
                    ))}
                    <div ref={transcriptBottomRef} />
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default JournalView;
