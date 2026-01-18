
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import React, { useState, useEffect, useRef } from 'react';
import { Project, Role, Message, Interaction, PersonaType } from '../types';
import { getGeminiResponse, ai } from '../services/geminiService';
import { memoryBridge } from '../services/memoryBridge';
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
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'ledger' | 'summary'>('chat');
  const [currentTranscription, setCurrentTranscription] = useState('');
  const t = translations[lang];

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);

  // Refs to accumulate transcripts during a live session
  const liveSessionData = useRef<{ user: string; model: string }>({ user: '', model: '' });
  const projectRef = useRef(project);
  const currentSessionInteractionId = useRef<string | null>(null);

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  useEffect(() => {
    if (viewMode === 'chat' && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [project.messages, isTyping, currentTranscription, viewMode]);

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

    // Log initial interaction
    const newInteraction: Interaction = {
      id: Math.random().toString(),
      type: 'text',
      summary: 'Initial Orientation',
      timestamp: new Date(),
      committed: false
    };

    updateProject(project.id, {
      messages: [assistantMsg],
      interactions: [...(project.interactions || []), newInteraction]
    });
    setIsTyping(false);
  };

  const updateSoulSummary = async () => {
    const prompt = `Synthesize the current state of this writing project "${projectRef.current.title}".
    CURRENT SUMMARY: ${projectRef.current.soulSummary}
    LATEST MESSAGES: ${projectRef.current.messages.slice(-20).map(m => `${m.role}: ${m.content}`).join('\n')}
    
    RETURN A JSON OBJECT WITH TWO FIELDS:
    1. "soulSummary": A 150-word literary summary describing the heart of the story.
    2. "lastBreadcrumb": A 20-word specific summary of the last discussion.`;

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

  const logInteraction = (type: 'voice' | 'text', summary: string) => {
    const newInteraction: Interaction = {
      id: Math.random().toString(),
      type,
      summary: summary.substring(0, 100) + (summary.length > 100 ? '...' : ''),
      timestamp: new Date(),
      committed: false
    };
    const currentInteractions = project.interactions || [];
    updateProject(project.id, { interactions: [newInteraction, ...currentInteractions] });
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

    // Optimistic update for interactions
    const newInteraction: Interaction = {
      id: Math.random().toString(),
      type: 'text',
      summary: text.substring(0, 60),
      timestamp: new Date(),
      committed: false
    };

    updateProject(project.id, {
      messages: [...history, assistantMsg],
      interactions: [newInteraction, ...(project.interactions || [])]
    });
    setIsTyping(false);

    if (history.length % 3 === 0) updateSoulSummary();
  };

  const commitToDraft = async () => {
    setCommitting(true);
    const recentContext = project.messages.slice(-20).map(m => `${m.role}: ${m.content}`).join('\n');

    const prompt = `You are a professional literary editor. 
    Transform the following raw conversation/brainstorming session into a POLISHED, STRUCTURED SCENE for a book.
    
    RULES:
    1. Do not output conversational text. Output only the story content.
    2. Use proper formatting (Scene Heading, Action, Dialogue).
    3. Maintain the tone of the genre: ${project.genre}.
    4. Focus on sensory details and "showing, not telling".
    
    CONTEXT:
    ${recentContext}
    
    OUTPUT:`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ parts: [{ text: prompt }] }]
      });

      const newProse = response.text || "";
      const updatedChapters = [...project.chapters];
      const targetChapterIndex = updatedChapters.length - 1;
      updatedChapters[targetChapterIndex].content += "\n\n" + "***\n\n" + newProse;

      updateProject(project.id, {
        chapters: updatedChapters,
        currentWordCount: updatedChapters.reduce((acc, curr) => acc + curr.content.trim().split(/\s+/).filter(Boolean).length, 0)
      });
      updateSoulSummary();
      onOpenEditor();
    } catch (e) { console.error(e); } finally { setCommitting(false); }
  };

  const saveLiveSessionData = () => {
    const { user, model } = liveSessionData.current;
    if (!user.trim() && !model.trim()) return;

    const newMessages: Message[] = [];
    if (user.trim()) {
      const userMsg: Message = { id: Math.random().toString(), role: 'user', content: user.trim(), timestamp: new Date() };
      newMessages.push(userMsg);
      // Push to memory bridge for async processing
      memoryBridge.pushInteraction(project.id, project.userId, 'user', user.trim());
    }
    if (model.trim()) {
      const modelMsg: Message = { id: Math.random().toString(), role: 'assistant', content: model.trim(), timestamp: new Date() };
      newMessages.push(modelMsg);
      // Push to memory bridge for async processing
      memoryBridge.pushInteraction(project.id, project.userId, 'assistant', model.trim());
    }

    if (newMessages.length > 0) {
      // Logic for cumulative interaction: use existing ID or create a new one
      let interactionId = currentSessionInteractionId.current;
      let existingInteractions = [...(projectRef.current.interactions || [])];

      if (!interactionId) {
        interactionId = Math.random().toString();
        currentSessionInteractionId.current = interactionId;

        const newInteraction: Interaction = {
          id: interactionId,
          type: 'voice',
          summary: user.trim().substring(0, 80) + "...",
          timestamp: new Date(),
          committed: false
        };
        existingInteractions = [newInteraction, ...existingInteractions];
      } else {
        // Update the existing interaction summary with the latest window of the conversation
        existingInteractions = existingInteractions.map(inte =>
          inte.id === interactionId
            ? { ...inte, summary: user.trim().substring(0, 80) + "..." }
            : inte
        );
      }

      updateProject(projectRef.current.id, {
        messages: [...projectRef.current.messages, ...newMessages],
        interactions: existingInteractions
      });

      liveSessionData.current = { user: '', model: '' };
      // Note: We don't clear currentTranscription here because it's used for UI feedback
      updateSoulSummary();
    }
  };

  const toggleLiveSession = async () => {
    if (isLiveActive) {
      audioRecorderRef.current?.stop();
      audioStreamerRef.current?.stop();
      setIsLiveActive(false);
      return;
    }

    setIsLiveActive(true);
    liveSessionData.current = { user: '', model: '' };
    currentSessionInteractionId.current = null; // Clear session tracking
    setCurrentTranscription('');

    audioStreamerRef.current = new AudioStreamer();
    audioRecorderRef.current = new AudioRecorder();
    const persona = PERSONAS[project.persona];

    // Increase context depth to 15 messages for better continuity
    const historyContext = projectRef.current.messages.slice(-15).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const fullSystemInstruction = `
${SYSTEM_INSTRUCTION_BASE}
${persona.instruction}

PROJECT CONTEXT:
Title: "${projectRef.current.title}"
Genre: ${projectRef.current.genre}
Current Soul Summary: ${projectRef.current.soulSummary}

RECENT CHAT HISTORY:
${historyContext}

INSTRUCTION: You are entering a voice session. Be concise, warm, and aware of the project details above.
`;

    try {
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: fullSystemInstruction,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: persona.voice } } },
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

            if (msg.serverContent?.inputTranscription) {
              const text = msg.serverContent.inputTranscription.text;
              if (text) {
                liveSessionData.current.user += " " + text;
                setCurrentTranscription(prev => prev + " " + text);
              }
            }

            if (msg.serverContent?.outputTranscription) {
              const text = msg.serverContent.outputTranscription.text;
              if (text) {
                liveSessionData.current.model += " " + text;
              }
            }

            if (msg.serverContent?.turnComplete) {
              saveLiveSessionData();
            }

            if (msg.serverContent?.interrupted) {
              audioStreamerRef.current?.stop();
              setIsModelSpeaking(false);
              saveLiveSessionData();
            }
          },
          onclose: () => {
            setIsLiveActive(false);
            saveLiveSessionData();
          },
          onerror: (e) => {
            console.error("Live Session Error", e);
            setIsLiveActive(false);
            saveLiveSessionData();
          }
        }
      });
    } catch (e) {
      console.error("Failed to connect live session", e);
      setIsLiveActive(false);
    }
  };


  const renderContent = () => {
    if (viewMode === 'summary') {
      return (
        <div className="flex-1 overflow-y-auto px-8 py-12 animate-in fade-in duration-500 bg-[#f9f8f6]">
          <div className="max-w-2xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ea580c]">{project.genre}</span>
              <h2 className="font-serif text-4xl text-stone-900">{project.title}</h2>
              <div className="w-16 h-px bg-stone-200 mx-auto" />
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#ea580c]" />
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-6">Soul Summary</h3>
              <p className="font-serif text-lg leading-loose text-stone-700 italic">
                "{project.soulSummary || "The Muse is still listening..."}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-100">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-300 mb-2">Target Volume</h4>
                <p className="font-mono text-2xl text-stone-900">{project.targetWordCount.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-stone-100">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-300 mb-2">Current Count</h4>
                <p className="font-mono text-2xl text-stone-900">{project.currentWordCount.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 pl-2">Active Milestones</h3>
              {project.milestones.map((m) => (
                <div key={m.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-100">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${m.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-stone-200'}`}>
                    {m.completed && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className={`text-sm ${m.completed ? 'text-stone-400 line-through' : 'text-stone-700'}`}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (viewMode === 'ledger') {
      const interactions = project.interactions || [];
      return (
        <div className="flex-1 overflow-y-auto px-6 py-8 animate-in fade-in duration-500 bg-[#f5f2eb]">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-400 mb-8 pl-2">Interaction Log</h2>

            {interactions.length === 0 ? (
              <div className="text-center py-20 opacity-50">
                <p className="font-serif text-xl italic text-stone-400">No recorded sessions yet.</p>
              </div>
            ) : (
              interactions.map((interaction) => (
                <div key={interaction.id} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex gap-4 items-start">
                  <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${interaction.type === 'voice' ? 'bg-[#ea580c]' : 'bg-stone-800'}`}>
                    {interaction.type === 'voice' ? 'MIC' : 'TXT'}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-300">{interaction.type} Session</span>
                      <span className="text-[10px] font-mono text-stone-300">{new Date(interaction.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-stone-700 leading-relaxed">
                      {interaction.summary || "Conversation logged."}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    // Default Chat View with High Contrast Bubbles
    return (
      <div className="flex-1 overflow-hidden flex flex-col relative bg-stone-50">
        <div ref={scrollRef} className={`flex-1 overflow-y-auto px-6 py-6 space-y-6 scroll-smooth ${isLiveActive ? 'opacity-5 blur-xl' : 'opacity-100'} transition-all`}>
          {project.messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
              <div className={`max-w-[85%] px-6 py-4 text-[14px] leading-relaxed rounded-2xl shadow-sm border ${m.role === 'user'
                ? 'bg-[#1c1917] text-white rounded-tr-none border-[#1c1917] font-medium'
                : 'bg-white text-stone-800 rounded-tl-none font-serif border-stone-200'
                }`}>
                {m.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white px-6 py-4 rounded-2xl rounded-tl-none border border-stone-200">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {isLiveActive && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-stone-900/90 backdrop-blur-xl animate-in fade-in">
            <div className="w-32 h-32 rounded-full border-2 border-white/10 flex items-center justify-center mb-8 relative">
              <div className={`absolute inset-0 rounded-full bg-[#ea580c] opacity-20 ${isModelSpeaking ? 'animate-ping' : ''}`}></div>
              <div className="w-24 h-24 rounded-full bg-[#ea580c] flex items-center justify-center shadow-[0_0_30px_rgba(234,88,12,0.4)]">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </div>
            </div>
            {currentTranscription && (
              <div className="absolute bottom-32 px-8 text-center animate-in slide-in-from-bottom-2 w-full max-w-lg">
                <p className="text-white/90 font-serif text-xl italic leading-relaxed">"{currentTranscription}"</p>
              </div>
            )}
            <button onClick={toggleLiveSession} className="px-12 py-4 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-stone-200 transition-colors shadow-2xl">End Session</button>
          </div>
        )}
      </div>
    );
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
            <button onClick={() => setViewMode('chat')} className={`px-2 py-1 rounded-sm text-[7px] font-bold uppercase tracking-widest transition-all ${viewMode === 'chat' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-400 hover:text-stone-900'}`}>{t.muse_chat}</button>
            <button onClick={() => setViewMode('ledger')} className={`px-2 py-1 rounded-sm text-[7px] font-bold uppercase tracking-widest transition-all ${viewMode === 'ledger' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-400 hover:text-stone-900'}`}>{t.muse_ledger}</button>
            <button onClick={() => setViewMode('summary')} className={`px-2 py-1 rounded-sm text-[7px] font-bold uppercase tracking-widest transition-all ${viewMode === 'summary' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-400 hover:text-stone-900'}`}>{t.muse_summary}</button>
          </div>
        </div>

        <button
          onClick={commitToDraft}
          disabled={committing || project.messages.length < 1}
          className="px-4 py-1.5 bg-[#ea580c] text-white rounded-lg text-[7px] font-bold uppercase tracking-widest hover:bg-[#c2410c] transition-all disabled:opacity-20 shadow-sm"
        >
          {committing ? "Structuring..." : t.muse_commit}
        </button>
      </header>

      {renderContent()}

      <div className="p-4 border-t border-stone-200 bg-white">
        <div className="max-w-xl mx-auto flex items-center gap-3 bg-stone-50 p-1 rounded-full border border-stone-100 focus-within:border-stone-400 focus-within:ring-1 focus-within:ring-stone-200 transition-all">
          <button onClick={toggleLiveSession} className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${isLiveActive ? 'bg-red-600 text-white scale-110 shadow-lg' : 'bg-stone-900 text-white hover:bg-stone-800'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </button>
          <input
            className="flex-1 bg-transparent px-3 text-[14px] font-light focus:outline-none placeholder:text-stone-400 text-stone-900"
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
