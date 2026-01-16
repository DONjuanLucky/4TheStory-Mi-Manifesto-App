
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import React, { useState, useEffect, useRef } from 'react';
import { Project, Role, Message, Interaction, PersonaType } from '../types';
import { getGeminiResponse } from '../services/geminiService';
import { AudioRecorder, AudioStreamer } from '../utils/audio';
import { PERSONAS, SYSTEM_INSTRUCTION_BASE, ORIENTATION_PROMPT } from "../constants";
import { Language, translations } from "../translations";

interface CompanionViewProps {
  project: Project;
  onOpenEditor: () => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  lang: Language;
}

const CompanionView: React.FC<CompanionViewProps> = ({ project, onOpenEditor, updateProject, lang }) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [isModelProcessing, setIsModelProcessing] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'ledger' | 'summary'>('chat');
  const [currentTranscription, setCurrentTranscription] = useState('');
  const t = translations[lang];
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const lastSavedTranscriptionLength = useRef<number>(0);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [project.messages, isTyping, currentTranscription, isModelProcessing]);

  useEffect(() => {
    if (project.messages.length === 0 && !isTyping) {
      handleInitialIcebreaker();
    }
  }, []);

  const handleInitialIcebreaker = async () => {
    setIsTyping(true);
    const context = `NEW PROJECT STARTING. ${ORIENTATION_PROMPT}`;
    const response = await getGeminiResponse("Hello. I'm ready to begin.", [], context);
    const assistantMsg: Message = { id: 'init-msg', role: 'assistant', content: response, timestamp: new Date() };
    updateProject(project.id, { messages: [assistantMsg] });
    setIsTyping(false);
  };

  const updateSoulSummary = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Synthesize the current state of this writing project "${project.title}".
    CURRENT SUMMARY: ${project.soulSummary}
    LATEST MESSAGES: ${project.messages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n')}
    
    RETURN A JSON OBJECT WITH TWO FIELDS:
    1. "soulSummary": A 150-word literary summary.
    2. "lastBreadcrumb": A 20-word specific summary.`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' }
      });
      
      const result = JSON.parse(response.text || '{}');
      if (result.soulSummary) {
        updateProject(project.id, { 
          soulSummary: result.soulSummary,
          lastInteractionSummary: result.lastBreadcrumb 
        });
      }
    } catch (e) { console.error("Continuity update failed", e); }
  };

  const handleSend = async (content?: string) => {
    const text = content || inputValue;
    if (!text.trim()) return;
    setInputValue('');
    const newMessage: Message = { id: Math.random().toString(), role: 'user', content: text, timestamp: new Date() };
    const history = [...project.messages, newMessage];
    updateProject(project.id, { messages: history });
    
    setIsTyping(true);
    const context = `Project: ${project.title}. Soul Summary: ${project.soulSummary}. Persona: ${PERSONAS[project.persona].instruction}`;
    const response = await getGeminiResponse(text, project.messages, context);
    
    const assistantMsg: Message = { id: Math.random().toString(), role: 'assistant', content: response, timestamp: new Date() };
    updateProject(project.id, { messages: [...history, assistantMsg] });
    setIsTyping(false);

    if (history.length % 3 === 0) updateSoulSummary();
  };

  const commitToDraft = async () => {
    setCommitting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const recentContext = project.messages.slice(-15).map(m => `${m.role}: ${m.content}`).join('\n');
    const prompt = `Convert this raw dialogue into professional literature. CONTENT:\n${recentContext}`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ parts: [{ text: prompt }] }]
      });
      
      const newProse = response.text || "";
      const updatedChapters = [...project.chapters];
      updatedChapters[updatedChapters.length - 1].content += "\n\n" + newProse;
      
      updateProject(project.id, { 
        chapters: updatedChapters,
        currentWordCount: updatedChapters.reduce((acc, curr) => acc + curr.content.trim().split(/\s+/).filter(Boolean).length, 0)
      });
      updateSoulSummary();
      onOpenEditor();
    } catch (e) { console.error(e); } finally { setCommitting(false); }
  };

  const toggleLiveSession = async () => {
    if (isLiveActive) {
      audioRecorderRef.current?.stop();
      audioStreamerRef.current?.stop();
      setIsLiveActive(false);
      return;
    }
    setIsLiveActive(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    audioStreamerRef.current = new AudioStreamer();
    audioRecorderRef.current = new AudioRecorder();
    const persona = PERSONAS[project.persona];
    try {
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION_BASE + "\n" + persona.instruction,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: persona.voice } } },
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
            if (data) {
              setIsModelSpeaking(true);
              audioStreamerRef.current?.play(data);
              setTimeout(() => setIsModelSpeaking(false), 2500); 
            }
            if (msg.serverContent?.inputTranscription) {
              setCurrentTranscription(prev => prev + ' ' + msg.serverContent?.inputTranscription?.text);
            }
            if (msg.serverContent?.interrupted) {
              audioStreamerRef.current?.stop();
              setIsModelSpeaking(false);
            }
          },
          onclose: () => setIsLiveActive(false)
        }
      });
    } catch (e) { setIsLiveActive(false); }
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f2eb] animate-in fade-in duration-400 overflow-hidden" onClick={() => setShowPersonaMenu(false)}>
      <header className="px-5 py-2 flex justify-between items-center border-b border-stone-200 bg-white sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2 relative" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-2 bg-stone-50 hover:bg-stone-100 px-3 py-1 rounded-md border border-stone-100 transition-all active:scale-95"
          >
            <div className="w-5 h-5 rounded-md bg-stone-900 flex items-center justify-center text-white font-serif text-[8px]">
              {PERSONAS[project.persona].name[0]}
            </div>
            <span className="text-[7px] font-bold text-stone-900 uppercase tracking-widest">{PERSONAS[project.persona].name}</span>
            <svg className={`w-3 h-3 text-stone-400 transition-transform ${showPersonaMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showPersonaMenu && (
            <div className="absolute top-10 left-0 w-64 bg-white rounded-xl shadow-2xl border border-stone-100 p-2 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
               <div className="text-[8px] font-bold uppercase tracking-widest text-stone-400 px-3 py-2">Select Voice Agent</div>
               {Object.values(PERSONAS).map((p) => (
                 <button
                   key={p.id}
                   onClick={() => { updateProject(project.id, { persona: p.id as PersonaType }); setShowPersonaMenu(false); }}
                   className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-colors ${project.persona === p.id ? 'bg-stone-900 text-white' : 'hover:bg-stone-50 text-stone-600'}`}
                 >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center font-serif text-[10px] ${project.persona === p.id ? 'bg-white text-stone-900' : 'bg-stone-200 text-stone-500'}`}>
                      {p.name[0]}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">{p.name}</div>
                      <div className={`text-[9px] leading-tight line-clamp-1 ${project.persona === p.id ? 'text-stone-400' : 'text-stone-400'}`}>{p.description}</div>
                    </div>
                 </button>
               ))}
            </div>
          )}
          
          <div className="flex gap-1 bg-stone-50 p-0.5 rounded-md border border-stone-100">
            <button onClick={() => setViewMode('chat')} className={`px-2 py-1 rounded-sm text-[7px] font-bold uppercase tracking-widest transition-all ${viewMode === 'chat' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-300 hover:text-stone-600'}`}>{t.muse_chat}</button>
            <button onClick={() => setViewMode('ledger')} className={`px-2 py-1 rounded-sm text-[7px] font-bold uppercase tracking-widest transition-all ${viewMode === 'ledger' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-300 hover:text-stone-600'}`}>{t.muse_ledger}</button>
            <button onClick={() => setViewMode('summary')} className={`px-2 py-1 rounded-sm text-[7px] font-bold uppercase tracking-widest transition-all ${viewMode === 'summary' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-300 hover:text-stone-600'}`}>{t.muse_summary}</button>
          </div>
        </div>

        <button 
          onClick={commitToDraft}
          disabled={committing || project.messages.length < 1}
          className="px-4 py-1.5 bg-[#78350f] text-white rounded-lg text-[7px] font-bold uppercase tracking-widest hover:bg-stone-900 transition-all disabled:opacity-20 shadow-sm"
        >
          {committing ? "..." : t.muse_commit}
        </button>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div ref={scrollRef} className={`flex-1 overflow-y-auto px-6 py-6 space-y-5 scroll-smooth ${isLiveActive ? 'opacity-5 blur-xl' : 'opacity-100'} transition-all`}>
          {project.messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
              <div className={`max-w-[85%] px-4 py-3 text-[13px] md:text-[14px] leading-relaxed border ${m.role === 'user' ? 'bg-white text-stone-800 rounded-xl rounded-tr-none border-stone-100' : 'bg-stone-50 text-stone-900 rounded-xl rounded-tl-none font-serif border-stone-200 italic shadow-sm'}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        {isLiveActive && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-stone-50/70 backdrop-blur-xl animate-in fade-in">
            <div className="w-24 h-24 rounded-full bg-stone-900 flex items-center justify-center mb-6">
               <div className="flex gap-1 h-6 items-center">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-1 bg-[#8b7355] rounded-full animate-breathe" style={{ animationDelay: `${i*0.2}s` }} />
                  ))}
               </div>
            </div>
            <button onClick={toggleLiveSession} className="px-10 py-2.5 bg-red-700 text-white rounded-full text-[8px] font-bold uppercase tracking-widest">End Session</button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-stone-200 bg-white">
        <div className="max-w-xl mx-auto flex items-center gap-3 bg-stone-50 p-1 rounded-full border border-stone-100">
          <button onClick={toggleLiveSession} className={`w-10 h-10 flex items-center justify-center rounded-full ${isLiveActive ? 'bg-red-600 text-white' : 'bg-stone-900 text-white'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </button>
          <input 
            className="flex-1 bg-transparent px-3 text-[14px] font-light focus:outline-none placeholder:text-stone-300 text-stone-900" 
            placeholder={t.muse_placeholder} 
            value={inputValue} 
            onChange={e => setInputValue(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleSend()} 
          />
        </div>
      </div>
    </div>
  );
};

export default CompanionView;
