
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { JournalEntry, User } from '../types';
import { JOURNAL_PROMPTS, PERSONAS, SYSTEM_INSTRUCTION_BASE } from '../constants';
import { AudioRecorder, AudioStreamer } from '../utils/audio';

interface JournalViewProps {
  user: User | null;
}

const JournalView: React.FC<JournalViewProps> = ({ user }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [suggestedPrompt, setSuggestedPrompt] = useState('');
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState('');

  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const liveSessionRef = useRef<any>(null);

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

  const activeEntry = entries.find(e => e.id === activeEntryId);

  const handleNewEntry = () => {
    if (!user) return;
    const newEntry: JournalEntry = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.uid,
      title: 'New Entry',
      content: '',
      timestamp: new Date()
    };
    setEntries([newEntry, ...entries]);
    setActiveEntryId(newEntry.id);
    setTitle('New Entry');
    setContent('');
    refreshPrompt();
  };

  const handleSave = () => {
    if (!activeEntryId) return;
    setEntries(prev => prev.map(e => 
      e.id === activeEntryId ? { ...e, title, content, timestamp: new Date() } : e
    ));
  };

  const selectEntry = (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      setActiveEntryId(id);
      setTitle(entry.title);
      setContent(entry.content);
    }
  };

  const refreshPrompt = () => {
    setSuggestedPrompt(JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)]);
  };

  const toggleVoiceJournaling = async () => {
    if (isLiveActive) {
      audioRecorderRef.current?.stop();
      audioStreamerRef.current?.stop();
      setIsLiveActive(false);
      // Append transcription to content if substantial
      if (currentTranscription.trim()) {
        const newContent = content ? `${content}\n\n[Spoken Reflection]: ${currentTranscription.trim()}` : currentTranscription.trim();
        setContent(newContent);
        // Force save
        setEntries(prev => prev.map(e => 
          e.id === activeEntryId ? { ...e, content: newContent, timestamp: new Date() } : e
        ));
      }
      return;
    }

    // Must have an active entry to record voice into
    if (!activeEntryId) {
      handleNewEntry();
    }

    setIsLiveActive(true);
    setCurrentTranscription('');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    audioStreamerRef.current = new AudioStreamer();
    audioRecorderRef.current = new AudioRecorder();

    // Context for continuity
    const existingContentSnippet = content.substring(0, 500);

    try {
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `${SYSTEM_INSTRUCTION_BASE}\n\nYou are the Journaling Muse. Your role is to listen deeply as the user reflects on their day. 
          
          CONTINUITY RULE: When the session starts, warmly ask: 'What are you reflecting on today?'. 
          CRITICAL: Before or after asking, briefly reference a detail from the user's existing entry content below to show you've been listening.
          
          EXISTING CONTENT:\n${existingContentSnippet || "This is a fresh entry with no previous content yet."}`,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: PERSONAS.empathetic.voice } } },
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: async () => {
            await audioRecorderRef.current?.start((base64) => {
              sessionPromise.then(s => s.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: base64 } }));
            });
          },
          onmessage: (msg: LiveServerMessage) => {
            const data = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (data) audioStreamerRef.current?.play(data);
            if (msg.serverContent?.interrupted) audioStreamerRef.current?.stop();
            if (msg.serverContent?.inputTranscription) {
                setCurrentTranscription(prev => prev + ' ' + msg.serverContent?.inputTranscription?.text);
            }
          },
          onclose: () => setIsLiveActive(false),
          onerror: () => setIsLiveActive(false)
        }
      });
      liveSessionRef.current = sessionPromise;
    } catch (e) {
      console.error("Voice Journaling failed", e);
      setIsLiveActive(false);
    }
  };

  return (
    <div className="flex h-full bg-[#fafaf9] animate-in fade-in duration-1000 overflow-hidden">
      {/* Entries Sidebar */}
      <div className="w-80 border-r border-gray-100 bg-white/50 backdrop-blur-md flex flex-col">
        <div className="p-8 border-b border-gray-50">
          <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase text-gray-300 mb-6">Reflections</h2>
          <button 
            onClick={handleNewEntry}
            className="w-full py-4 border border-[#8b735540] text-[#8b7355] rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#8b7355] hover:text-white transition-all shadow-sm active:scale-95"
          >
            + New Whisper
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {entries.length === 0 ? (
            <div className="text-center py-12 opacity-20 italic font-serif text-sm px-6">
              "A quiet mind is a fertile garden."
            </div>
          ) : (
            entries.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(entry => (
              <button
                key={entry.id}
                onClick={() => selectEntry(entry.id)}
                className={`w-full text-left p-6 rounded-[2rem] transition-all transform active:scale-[0.98] ${activeEntryId === entry.id ? 'bg-[#1a1a1a] text-white shadow-xl' : 'hover:bg-white border border-transparent hover:border-gray-100'}`}
              >
                <h4 className="font-serif text-lg mb-1 truncate">{entry.title}</h4>
                <p className={`text-[9px] uppercase tracking-widest font-bold ${activeEntryId === entry.id ? 'text-white/40' : 'text-gray-300'}`}>
                  {new Date(entry.timestamp).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
        {activeEntryId ? (
          <div className={`flex-1 overflow-y-auto scroll-smooth ${isLiveActive ? 'opacity-20 blur-xl grayscale' : 'opacity-100'} transition-all duration-1000`}>
            <div className="max-w-3xl mx-auto w-full px-12 py-20 space-y-12">
              {/* Muse Suggestion Area */}
              <div className="bg-white border border-gray-100 p-8 rounded-[3rem] shadow-sm relative group">
                <div className="absolute -top-3 left-10 bg-[#8b7355] text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest">Muse Prompt</div>
                <div className="flex items-start justify-between gap-6">
                  <p className="font-serif italic text-xl text-[#1a1a1a] leading-relaxed">
                    "{suggestedPrompt}"
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={toggleVoiceJournaling}
                      className="p-3 rounded-full bg-[#1a1a1a] text-white hover:bg-[#8b7355] transition-all shadow-lg active:scale-90"
                      title="Speak with Muse"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    </button>
                    <button 
                      onClick={refreshPrompt}
                      className="p-3 rounded-full hover:bg-gray-50 text-gray-300 hover:text-[#8b7355] transition-all"
                      title="New Suggestion"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <input 
                  className="w-full bg-transparent border-none text-5xl font-serif focus:outline-none placeholder:text-gray-100 tracking-tighter"
                  placeholder="The Theme of My Day"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSave}
                />
                <textarea 
                  className="w-full bg-transparent border-none text-xl font-serif leading-[2] min-h-[50vh] focus:outline-none resize-none placeholder:text-gray-200 selection:bg-[#8b735520] transition-opacity"
                  placeholder="Let your thoughts flow freely here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onBlur={handleSave}
                />
              </div>
              
              <div className="flex justify-end border-t border-gray-50 pt-8">
                <span className="text-[9px] uppercase tracking-[0.5em] text-gray-200 font-bold">Inscribed in your personal sanctuary</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-12 animate-in fade-in duration-1000">
            <div className="w-24 h-24 mb-10 opacity-10">
              <svg viewBox="0 0 100 100" fill="currentColor"><path d="M20 15h60v6H20zM32 24h10v52H32zM45 24h10v52H45zM58 24h10v52H58z"/></svg>
            </div>
            <h2 className="font-serif text-4xl italic text-gray-300 mb-4 tracking-tight">Your journal is a sacred space.</h2>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-12">Capture your reflections, no strings attached.</p>
            <div className="flex gap-4">
              <button 
                onClick={handleNewEntry}
                className="px-10 py-5 bg-[#1a1a1a] text-white rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#8b7355] transition-all shadow-2xl active:scale-95"
              >
                Write an Entry
              </button>
              <button 
                onClick={toggleVoiceJournaling}
                className="px-10 py-5 border border-gray-200 text-[#1a1a1a] rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:border-[#8b7355] hover:text-[#8b7355] transition-all active:scale-95 flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                Voice Reflection
              </button>
            </div>
          </div>
        )}

        {isLiveActive && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/40 animate-in fade-in duration-700 backdrop-blur-2xl">
            <div className="relative mb-16">
              <div className="absolute inset-0 bg-[#8b735520] rounded-full animate-ping opacity-10" style={{ animationDuration: '4s' }} />
              <div className="w-72 h-72 bg-white rounded-full shadow-[0_40px_100px_rgba(0,0,0,0.1)] flex items-center justify-center border border-gray-50">
                <div className="w-56 h-56 bg-[#1a1a1a] rounded-full flex flex-col items-center justify-center overflow-hidden relative">
                  <div className="flex gap-2 h-16 items-center">
                    {[1,2,3,4,5,6,7,8].map(i => (
                      <div 
                        key={i} 
                        className="w-1.5 bg-white/60 rounded-full animate-breathe" 
                        style={{ 
                          height: `${15 + Math.random()*40}px`, 
                          animationDelay: `${i * 0.15}s`,
                          animationDuration: '1.5s' 
                        }} 
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-white/30 uppercase tracking-[0.5em] font-bold absolute bottom-12 text-center px-4">The Muse is listening...</span>
                </div>
              </div>
            </div>
            
            <div className="max-w-xl w-full px-10 text-center space-y-8">
              <h2 className="font-serif text-4xl italic text-[#1a1a1a] tracking-tight">"What are you reflecting on today?"</h2>
              <div className="min-h-[100px] p-8 bg-white/90 rounded-[3rem] border border-gray-100 shadow-2xl relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8b7355] text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest">Transcription</div>
                  <p className="text-base text-gray-500 italic font-serif leading-relaxed line-clamp-4 overflow-y-auto max-h-32">
                      {currentTranscription || "The sanctuary is open. Speak freely..."}
                  </p>
              </div>
              <button 
                onClick={toggleVoiceJournaling}
                className="px-12 py-4 bg-red-500 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl active:scale-95"
              >
                End Reflection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalView;
