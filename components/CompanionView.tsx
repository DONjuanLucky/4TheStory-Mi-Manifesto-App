
import { GoogleGenAI, Modality } from "@google/genai";
import React, { useState, useEffect, useRef } from 'react';
import { Project, Role, PersonaType } from '../types';
import { getGeminiResponse } from '../services/geminiService';
import { AudioRecorder, AudioStreamer } from '../utils/audio';
import { PERSONAS, SYSTEM_INSTRUCTION_BASE } from "../constants";

interface CompanionViewProps {
  project: Project;
  onOpenEditor: () => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
}

const CompanionView: React.FC<CompanionViewProps> = ({ project, onOpenEditor, updateProject }) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [committing, setCommitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const liveSessionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [project.messages, isTyping]);

  const currentPersona = PERSONAS[project.persona];

  // If a live session is active and persona changes, we might want to restart it
  // But for now, we'll just ensure the next session uses the new settings.

  const updateSoulSummary = async () => {
    if (project.messages.length < 2) return;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Review this creative writing session. Update the "Soul Summary" of the book. 
    Focus on specific emotional beats and plot developments. 
    Avoid generic praise; be an authentic editor summarizing progress.
    CURRENT SUMMARY: ${project.soulSummary}
    LATEST CONVERSATION: ${project.messages.slice(-8).map(m => `${m.role}: ${m.content}`).join('\n')}
    RETURN ONLY THE UPDATED SUMMARY. NO PREAMBLE.`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }]
      });
      if (response.text) {
        updateProject(project.id, { soulSummary: response.text.trim() });
      }
    } catch (e) {
      console.error("Continuity update failed", e);
    }
  };

  const handleSend = async (content?: string) => {
    const text = content || inputValue;
    if (!text.trim()) return;
    setInputValue('');
    const newMessage = { id: Math.random().toString(), role: 'user' as const, content: text, timestamp: new Date() };
    const history = [...project.messages, newMessage];
    updateProject(project.id, { messages: history });
    
    setIsTyping(true);
    const context = `Project: ${project.title} (${project.genre}). \nSoul Continuity: ${project.soulSummary} \nPersona: ${currentPersona.instruction}`;
    const response = await getGeminiResponse(text, project.messages, context);
    const assistantMsg = { id: Math.random().toString(), role: 'assistant' as const, content: response, timestamp: new Date() };
    updateProject(project.id, { messages: [...history, assistantMsg] });
    setIsTyping(false);

    if (history.length % 6 === 0) updateSoulSummary();
  };

  const commitToDraft = async () => {
    if (project.messages.length < 2) return;
    setCommitting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `As a world-class literary ghostwriter, curate this conversation into professional prose for "${project.title}". 
    Do not use AI buzzwords. Write with authentic human depth. Return only the prose.\n\nCONVERSATION:\n${project.messages.slice(-12).map(m => `${m.role}: ${m.content}`).join('\n')}`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }]
      });
      
      const newProse = response.text || "";
      const updatedChapters = [...project.chapters];
      updatedChapters[updatedChapters.length - 1].content += "\n\n" + newProse;
      
      updateProject(project.id, { chapters: updatedChapters });
      await updateSoulSummary();
      alert("Whisper committed. The draft has been updated.");
    } catch (e) {
      console.error(e);
    } finally {
      setCommitting(false);
    }
  };

  const toggleLiveSession = async () => {
    if (isLiveActive) {
      audioRecorderRef.current?.stop();
      audioStreamerRef.current?.stop();
      setIsLiveActive(false);
      updateSoulSummary();
      return;
    }

    setIsLiveActive(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    audioStreamerRef.current = new AudioStreamer();
    audioRecorderRef.current = new AudioRecorder();

    try {
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION_BASE + "\n" + currentPersona.instruction + `\nContext: ${project.soulSummary}`,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: currentPersona.voice } } },
        },
        callbacks: {
          onopen: async () => {
            await audioRecorderRef.current?.start((base64) => {
              sessionPromise.then(s => s.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: base64 } }));
            });
          },
          onmessage: (msg) => {
            const data = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (data) audioStreamerRef.current?.play(data);
            if (msg.serverContent?.interrupted) audioStreamerRef.current?.stop();
          },
          onclose: () => setIsLiveActive(false),
          onerror: () => setIsLiveActive(false)
        }
      });
      liveSessionRef.current = sessionPromise;
    } catch (e) {
      console.error("Live session failed", e);
      setIsLiveActive(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fafaf9] animate-in fade-in duration-1000">
      <header className="px-8 py-6 flex justify-between items-center border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="relative">
          <button 
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-3 group transition-transform hover:scale-105 bg-[#f5f5f4] px-4 py-2 rounded-2xl border border-gray-100"
            aria-label="Change Muse Persona"
          >
            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center font-serif italic text-white text-xs">
              {currentPersona.name[0]}
            </div>
            <div className="text-left">
              <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 block">Personality</span>
              <span className="text-xs font-bold text-[#1a1a1a] flex items-center gap-1">
                {currentPersona.name}
                <svg className={`w-3 h-3 transition-transform ${showPersonaMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </span>
            </div>
          </button>
          
          {showPersonaMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowPersonaMenu(false)} />
              <div className="absolute top-full left-0 mt-3 w-72 bg-white border border-gray-100 shadow-2xl rounded-3xl p-4 z-40 animate-in fade-in slide-in-from-top-2">
                <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-3 px-2">Select Companion Tone</h4>
                <div className="space-y-1">
                  {Object.values(PERSONAS).map(p => (
                    <button
                      key={p.id}
                      onClick={() => { updateProject(project.id, { persona: p.id }); setShowPersonaMenu(false); }}
                      className={`w-full text-left p-3 rounded-xl transition-all ${project.persona === p.id ? 'bg-[#1a1a1a] text-white shadow-lg' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex justify-between items-center mb-0.5">
                        <p className="font-bold text-xs">{p.name}</p>
                        <span className={`text-[8px] uppercase tracking-widest ${project.persona === p.id ? 'text-white/50' : 'text-gray-300'}`}>{p.voice} Voice</span>
                      </div>
                      <p className={`text-[10px] leading-snug ${project.persona === p.id ? 'text-white/70' : 'text-gray-400'}`}>{p.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={commitToDraft}
            disabled={committing || project.messages.length < 2}
            className="px-4 py-2 border border-[#8b735540] text-[#8b7355] rounded-xl text-[9px] font-bold uppercase tracking-[0.1em] hover:bg-[#8b7355] hover:text-white transition-all disabled:opacity-20 flex items-center gap-2"
          >
            {committing && <div className="w-2.5 h-2.5 border-2 border-t-transparent border-current rounded-full animate-spin" />}
            {committing ? "Curation..." : "Commit Draft"}
          </button>
          <button 
            onClick={onOpenEditor} 
            className="px-5 py-2 bg-[#1a1a1a] text-white rounded-xl text-[9px] font-bold uppercase tracking-[0.1em] hover:bg-[#8b7355] transition-all shadow-sm active:scale-95"
          >
            Editor
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div ref={scrollRef} className={`flex-1 overflow-y-auto px-6 py-10 space-y-10 scroll-smooth ${isLiveActive ? 'opacity-10 blur-xl grayscale' : 'opacity-100'} transition-all duration-1000`}>
          {project.messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto opacity-30">
              <svg className="w-12 h-12 mb-6 text-[#8b7355]" viewBox="0 0 100 100" fill="currentColor">
                <path d="M20 20h60v4H20zM30 28h8v44h-8zM46 28h8v44h-8zM62 28h8v44h-8zM30 76h40v4H30z" />
              </svg>
              <h3 className="font-serif text-xl italic mb-1">A quiet space for your truth.</h3>
              <p className="text-[9px] uppercase tracking-widest font-bold">The {currentPersona.name} is listening.</p>
            </div>
          )}

          {project.messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
              <div className={`max-w-[80%] px-8 py-6 text-lg leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-white text-[#1a1a1a] rounded-[2rem] rounded-tr-none border border-gray-100' : 'bg-[#f3f0ed] text-[#1a1a1a] rounded-[2rem] rounded-tl-none font-serif italic'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
               <div className="bg-[#f3f0ed] rounded-full px-6 py-3 flex gap-1.5">
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                 <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}} />
               </div>
            </div>
          )}
        </div>

        {isLiveActive && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/20 animate-in fade-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-[#8b735520] rounded-full animate-ping opacity-20" style={{ animationDuration: '3s' }} />
              <div className="w-64 h-64 bg-white rounded-full shadow-2xl flex items-center justify-center border border-gray-50">
                <div className="w-48 h-48 bg-[#1a1a1a] rounded-full flex flex-col items-center justify-center overflow-hidden">
                  <div className="flex gap-1.5 h-12 mb-2 items-center">
                    {[1,2,3,4,5,6,7].map(i => (
                      <div 
                        key={i} 
                        className="w-1 bg-white/60 rounded-full animate-breathe" 
                        style={{ 
                          height: `${10 + Math.random()*30}px`, 
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: '2s' 
                        }} 
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-white/40 uppercase tracking-[0.4em] font-bold">Authentic Partner</span>
                </div>
              </div>
            </div>
            <h2 className="mt-12 font-serif text-3xl italic text-[#1a1a1a]">Just speak...</h2>
            <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.3em] text-[#8b7355]">{currentPersona.name} is with you</p>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-gray-50 bg-white/40">
        <div className="max-w-3xl mx-auto flex items-center gap-4 bg-white p-2 rounded-[2.5rem] shadow-xl border border-gray-100">
          <button 
            onClick={toggleLiveSession} 
            className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-500 ${isLiveActive ? 'bg-red-500 text-white scale-90' : 'bg-[#1a1a1a] text-white hover:bg-[#8b7355]'}`}
            aria-label={isLiveActive ? "End Session" : "Start Session"}
          >
            {isLiveActive ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            )}
          </button>
          <input 
            className="flex-1 bg-transparent px-4 text-lg font-light focus:outline-none placeholder:text-gray-200" 
            placeholder={isLiveActive ? "Listening to your thoughts..." : `Message your ${currentPersona.name.split(' ').pop()}...`} 
            value={inputValue} 
            onChange={e => setInputValue(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleSend()} 
            disabled={isLiveActive} 
          />
          {!isLiveActive && (
            <button 
              onClick={() => handleSend()} 
              disabled={!inputValue.trim()}
              className="w-12 h-12 flex items-center justify-center rounded-full text-gray-200 hover:text-[#1a1a1a] transition-colors disabled:opacity-20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          )}
        </div>
        <p className="mt-3 text-center text-[8px] text-gray-300 uppercase tracking-widest font-bold">Your privacy is my priority</p>
      </div>
    </div>
  );
};

export default CompanionView;
