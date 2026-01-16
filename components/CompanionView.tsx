
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import React, { useState, useEffect, useRef } from 'react';
import { Project, Role, Message } from '../types';
import { getGeminiResponse } from '../services/geminiService';
import { AudioRecorder, AudioStreamer } from '../utils/audio';
import { PERSONAS, SYSTEM_INSTRUCTION_BASE, ORIENTATION_PROMPT } from "../constants";

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
  const [showDraftPad, setShowDraftPad] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const liveSessionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [project.messages, isTyping, currentTranscription]);

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

  const currentPersona = PERSONAS[project.persona];

  const updateSoulSummary = async () => {
    if (project.messages.length < 2) return;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Review this creative writing session. Update the "Soul Summary" of the book. 
    Focus on specific emotional beats and plot developments. 
    CURRENT SUMMARY: ${project.soulSummary}
    LATEST CONVERSATION: ${project.messages.slice(-8).map(m => `${m.role}: ${m.content}`).join('\n')}
    RETURN ONLY THE UPDATED SUMMARY.`;
    
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
    const newMessage: Message = { id: Math.random().toString(), role: 'user', content: text, timestamp: new Date() };
    const history = [...project.messages, newMessage];
    updateProject(project.id, { messages: history });
    
    setIsTyping(true);
    const context = `Project: ${project.title} (${project.genre}). \nSoul Continuity: ${project.soulSummary} \nPersona: ${currentPersona.instruction} ${!project.orientationDone ? '\nRun Discovery Questionnaire logic.' : ''}`;
    const response = await getGeminiResponse(text, project.messages, context);
    
    if (!project.orientationDone && (response.toLowerCase().includes("ready to") || response.toLowerCase().includes("let's begin"))) {
        updateProject(project.id, { orientationDone: true });
    }

    const assistantMsg: Message = { id: Math.random().toString(), role: 'assistant', content: response, timestamp: new Date() };
    updateProject(project.id, { messages: [...history, assistantMsg] });
    setIsTyping(false);

    if (history.length % 6 === 0) updateSoulSummary();
  };

  const commitToDraft = async (overrideContent?: string) => {
    const sourceContent = overrideContent || project.messages.slice(-12).map(m => `${m.role}: ${m.content}`).join('\n');
    setCommitting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `As a world-class literary ghostwriter, curate this conversation into professional prose for "${project.title}". 
    Write with authentic human depth. Return only the prose.\n\nCONTENT:\n${sourceContent}`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }]
      });
      
      const newProse = response.text || "";
      const updatedChapters = [...project.chapters];
      updatedChapters[updatedChapters.length - 1].content += "\n\n" + newProse;
      
      updateProject(project.id, { 
        chapters: updatedChapters,
        currentWordCount: updatedChapters.reduce((acc, curr) => acc + curr.content.trim().split(/\s+/).filter(Boolean).length, 0)
      });
      await updateSoulSummary();
      setShowDraftPad(true);
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
      if (currentTranscription.length > 50) {
        handleSend(`[Spoken Truth]: ${currentTranscription}`);
      }
      updateSoulSummary();
      return;
    }

    setIsLiveActive(true);
    setCurrentTranscription('');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    audioStreamerRef.current = new AudioStreamer();
    audioRecorderRef.current = new AudioRecorder();

    // Prepare history snippet for continuity
    const recentHistory = project.messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');

    try {
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION_BASE + "\n" + currentPersona.instruction + 
            `\nContext: ${project.soulSummary}` + 
            (!project.orientationDone ? `\nORIENTATION MODE ACTIVE: ${ORIENTATION_PROMPT}` : '') +
            `\n\nCONTINUITY RULE: Start the session by briefly referencing a specific detail or emotional beat from the recent conversation history below. 
            Demonstrate that you remember where we left off.
            RECENT HISTORY:\n${recentHistory}`,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: currentPersona.voice } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {}
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
      console.error("Live session failed", e);
      setIsLiveActive(false);
    }
  };

  const lastChapterContent = project.chapters[project.chapters.length - 1]?.content || "";

  return (
    <div className="flex h-full bg-[#fafaf9] animate-in fade-in duration-1000 overflow-hidden">
      {/* Sidebar: Drafting Pad */}
      <div className={`fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-100 shadow-2xl z-50 transform transition-transform duration-700 ease-in-out ${showDraftPad ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-10">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#8b7355]">Legacy Draft</h3>
            <button onClick={() => setShowDraftPad(false)} className="text-gray-300 hover:text-black p-2 transition-colors">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-8 scroll-smooth pr-2">
            <h4 className="font-serif text-3xl italic tracking-tight">{project.chapters[project.chapters.length - 1]?.title}</h4>
            <div className="text-sm leading-relaxed text-gray-500 font-serif space-y-6 whitespace-pre-wrap">
              {lastChapterContent || "Your spoken truth will appear here as curated prose..."}
            </div>
          </div>
          <button 
            onClick={onOpenEditor}
            className="mt-10 w-full py-5 bg-[#1a1a1a] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#8b7355] transition-all shadow-xl active:scale-95"
          >
            Open Full Editor
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative">
        <header className="px-8 py-6 flex justify-between items-center border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-8">
            <div className="relative" id="persona-selector">
              <button 
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-3 group transition-all hover:shadow-lg bg-[#f5f5f4] px-5 py-2.5 rounded-2xl border border-gray-100 active:scale-95"
              >
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center font-serif italic text-white text-xs">
                  {currentPersona.name[0]}
                </div>
                <div className="text-left">
                  <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 block">Personality</span>
                  <span className="text-xs font-bold text-[#1a1a1a] flex items-center gap-1.5">
                    {currentPersona.name}
                    <svg className={`w-3 h-3 transition-transform duration-500 ${showPersonaMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </div>
              </button>
              
              {showPersonaMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowPersonaMenu(false)} />
                  <div className="absolute top-full left-0 mt-4 w-72 bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-6 z-40 animate-in fade-in slide-in-from-top-4">
                    <h4 className="text-[9px] uppercase tracking-[0.3em] font-bold text-gray-300 mb-4 px-2">Select Your Guide</h4>
                    <div className="space-y-2">
                      {Object.values(PERSONAS).map(p => (
                        <button
                          key={p.id}
                          onClick={() => { updateProject(project.id, { persona: p.id }); setShowPersonaMenu(false); }}
                          className={`w-full text-left p-4 rounded-2xl transition-all ${project.persona === p.id ? 'bg-[#1a1a1a] text-white shadow-xl scale-105' : 'hover:bg-gray-50'}`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-bold text-xs">{p.name}</p>
                            <span className={`text-[8px] uppercase tracking-widest ${project.persona === p.id ? 'text-white/40' : 'text-gray-200'}`}>{p.voice}</span>
                          </div>
                          <p className={`text-[10px] leading-relaxed ${project.persona === p.id ? 'text-white/60' : 'text-gray-400'}`}>{p.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <button 
              onClick={() => setShowDraftPad(!showDraftPad)}
              className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-[#8b7355] transition-all group"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-100 group-hover:border-[#8b7355] group-hover:bg-[#8b735505] transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              {showDraftPad ? "Focus View" : "View Progress"}
            </button>
          </div>

          <div className="flex gap-4">
            <button 
              id="commit-button"
              onClick={() => commitToDraft()}
              disabled={committing || project.messages.length < 2}
              className="px-6 py-3 border border-[#8b735540] text-[#8b7355] rounded-full text-[10px] font-bold uppercase tracking-[0.1em] hover:bg-[#8b7355] hover:text-white transition-all disabled:opacity-20 flex items-center gap-2 shadow-sm active:scale-95"
            >
              {committing && <div className="w-3 h-3 border-2 border-t-transparent border-current rounded-full animate-spin" />}
              {committing ? "Curation..." : "Commit to Draft"}
            </button>
            <button 
              id="editor-button"
              onClick={onOpenEditor} 
              className="px-6 py-3 bg-[#1a1a1a] text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#8b7355] transition-all shadow-xl active:scale-95"
            >
              Full Editor
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col relative">
          {!project.orientationDone && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-[#8b735508] border border-[#8b735530] px-6 py-2.5 rounded-full backdrop-blur-xl animate-pulse shadow-sm">
                  <span className="text-[10px] font-bold text-[#8b7355] uppercase tracking-[0.3em]">Discovery Session</span>
              </div>
          )}
          
          <div ref={scrollRef} className={`flex-1 overflow-y-auto px-8 py-12 space-y-12 scroll-smooth ${isLiveActive ? 'opacity-10 blur-xl scale-[0.98]' : 'opacity-100'} transition-all duration-1000`}>
            {project.messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                <div className={`max-w-[75%] px-10 py-8 text-xl leading-[1.7] shadow-sm ${m.role === 'user' ? 'bg-white text-[#1a1a1a] rounded-[3rem] rounded-tr-none border border-gray-100' : 'bg-[#f3f0ed] text-[#1a1a1a] rounded-[3rem] rounded-tl-none font-serif italic'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                 <div className="bg-[#f3f0ed] rounded-full px-8 py-4 flex gap-2">
                   <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0s'}} />
                   <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                   <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0.4s'}} />
                 </div>
              </div>
            )}
          </div>

          {isLiveActive && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 animate-in fade-in duration-1000 backdrop-blur-2xl">
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
                    <span className="text-[10px] text-white/30 uppercase tracking-[0.5em] font-bold absolute bottom-12">Listening...</span>
                  </div>
                </div>
              </div>
              
              <div className="max-w-xl w-full px-10 text-center space-y-8">
                <h2 className="font-serif text-4xl italic text-[#1a1a1a] tracking-tight">Speak your truth...</h2>
                <div className="min-h-[100px] p-8 bg-white/90 rounded-[3rem] border border-gray-100 shadow-2xl relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8b7355] text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest">Live Transcription</div>
                    <p className="text-base text-gray-500 italic font-serif leading-relaxed line-clamp-3 overflow-y-auto max-h-24">
                        {currentTranscription || "The Muse is capturing your spoken whisper..."}
                    </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#8b7355]">{currentPersona.name} is with you</p>
                    <div className="w-12 h-0.5 bg-gray-100 rounded-full" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-10 border-t border-gray-50 bg-white/40">
          <div className="max-w-3xl mx-auto flex items-center gap-5 bg-white p-3 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 focus-within:shadow-[0_20px_50px_rgba(139,115,85,0.1)] transition-all">
            <button 
              id="voice-toggle"
              onClick={toggleLiveSession} 
              className={`w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-500 shadow-lg transform active:scale-90 ${isLiveActive ? 'bg-red-500 text-white animate-pulse' : 'bg-[#1a1a1a] text-white hover:bg-[#8b7355] hover:rotate-3'}`}
            >
              {isLiveActive ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              )}
            </button>
            <input 
              className="flex-1 bg-transparent px-6 text-xl font-light focus:outline-none placeholder:text-gray-200" 
              placeholder={isLiveActive ? "Transcribing live..." : `Speak with your ${currentPersona.name.split(' ').pop()}...`} 
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSend()} 
              disabled={isLiveActive} 
            />
            {!isLiveActive && (
              <button 
                onClick={() => handleSend()} 
                disabled={!inputValue.trim()}
                className="w-14 h-14 flex items-center justify-center rounded-full text-gray-200 hover:text-[#1a1a1a] hover:bg-gray-50 transition-all disabled:opacity-20 active:scale-95"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            )}
          </div>
          <p className="mt-5 text-center text-[9px] text-gray-300 uppercase tracking-[0.4em] font-bold">Sacred Silence • Pure Intent • Authentic Voice</p>
        </div>
      </div>
    </div>
  );
};

export default CompanionView;
