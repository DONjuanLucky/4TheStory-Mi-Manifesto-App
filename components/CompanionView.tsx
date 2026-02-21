
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Virtuoso } from 'react-virtuoso';
import { Project, Message, Interaction, PersonaType, Chapter, CreativityLevel } from '../types';
import { getGeminiResponse } from '../services/geminiService';
import { AudioRecorder, AudioStreamer } from '../utils/audio';
import { PERSONAS, SYSTEM_INSTRUCTION_BASE, CREATIVITY_INSTRUCTIONS, ORIENTATION_PROMPT } from "../constants";
import { Language, translations } from "../translations";

interface CompanionViewProps {
  project: Project;
  onOpenEditor: () => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  lang: Language;
}

interface TranscriptItem {
    role: 'user' | 'model';
    text: string;
}

const CompanionView: React.FC<CompanionViewProps> = ({ project, onOpenEditor, updateProject, lang }) => {
  const [isTyping, setIsTyping] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'ledger'>('chat');
  const [sessionTranscript, setSessionTranscript] = useState<TranscriptItem[]>([]);
  const [committing, setCommitting] = useState(false);
  
  const transcriptBottomRef = useRef<HTMLDivElement>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const sessionHistoryBuffer = useRef<Message[]>([]);

  const t = translations[lang];

  useEffect(() => {
    if (transcriptBottomRef.current) {
        transcriptBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sessionTranscript]);

  const toggleLiveSession = async () => {
    if (isLiveActive) {
      audioRecorderRef.current?.stop();
      audioStreamerRef.current?.stop();
      setIsLiveActive(false);
      saveLiveSessionData();
      return;
    }
    
    setIsLiveActive(true);
    setSessionTranscript([]);
    sessionHistoryBuffer.current = [];
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    audioStreamerRef.current = new AudioStreamer();
    audioRecorderRef.current = new AudioRecorder();
    const persona = PERSONAS[project.persona];
    const creativity = CREATIVITY_INSTRUCTIONS[project.creativityLevel || 'balanced'];
    
    // Logic to determine if we need to run the initial questionnaire
    const isNewProject = project.messages.length < 5 || !project.soulSummary || project.soulSummary.length < 50;
    
    const contextInstruction = isNewProject 
      ? `PHASE: DISCOVERY & ONBOARDING. 
         The user is just starting. DO NOT WAIT.
         Immediately introduce yourself and ask the first question from this list to define the direction:
         ${ORIENTATION_PROMPT}
         
         Ask one question at a time. Be directive. Guide them to define the story.`
      : `PHASE: DEVELOPMENT.
         The story is in progress. 
         Review the SOUL SUMMARY and ask a qualifying question that bridges the gap between current progress and the target.
         If they seem stuck, suggest a specific direction based on the Genre.`;

    const fullInstruction = `
${SYSTEM_INSTRUCTION_BASE}
${creativity}
${persona.instruction}

${contextInstruction}

PROJECT CONTEXT:
Title: "${project.title}"
Genre: "${project.genre}"
Current Soul Summary: ${project.soulSummary}
`;

    try {
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: fullInstruction,
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
              setTimeout(() => setIsModelSpeaking(false), 3000);
            }
            
            const userText = msg.serverContent?.inputTranscription?.text;
            if (userText) {
                setSessionTranscript(prev => [...prev, { role: 'user', text: userText }]);
                sessionHistoryBuffer.current.push({
                    id: Math.random().toString(),
                    role: 'user',
                    content: userText,
                    timestamp: new Date()
                });
            }

            const modelText = msg.serverContent?.outputTranscription?.text;
            if (modelText) {
                setSessionTranscript(prev => [...prev, { role: 'model', text: modelText }]);
                sessionHistoryBuffer.current.push({
                    id: Math.random().toString(),
                    role: 'assistant',
                    content: modelText,
                    timestamp: new Date()
                });
            }
          }
        }
      });
    } catch (e) {
      setIsLiveActive(false);
    }
  };

  const saveLiveSessionData = () => {
    if (sessionHistoryBuffer.current.length > 0) {
        updateProject(project.id, { 
            messages: [...project.messages, ...sessionHistoryBuffer.current],
            interactions: [{
                id: Math.random().toString(),
                type: 'voice',
                summary: "Voice Session: " + sessionHistoryBuffer.current.length + " turns.",
                timestamp: new Date(),
                committed: false
            }, ...(project.interactions || [])]
        });
        sessionHistoryBuffer.current = [];
    }
  };

  const commitToDraft = async () => {
    setCommitting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const history = project.messages.slice(-50).map(m => `${m.role}: ${m.content}`).join('\n');
    
    const prompt = `Synthesize this entire conversation into high-quality, professional prose. 
    LEVEL: ${project.creativityLevel}. GENRE: ${project.genre}.
    
    CONVERSATION:
    ${history}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ parts: [{ text: prompt }] }]
      });
      
      const newChapter: Chapter = {
        id: Math.random().toString(),
        title: `Draft: ${new Date().toLocaleDateString()}`,
        content: response.text || "",
        order: project.chapters.length + 1
      };

      updateProject(project.id, { 
        chapters: [...project.chapters, newChapter],
        currentWordCount: project.currentWordCount + (newChapter.content.split(' ').length)
      });
      onOpenEditor();
    } finally { setCommitting(false); }
  };

  return (
    <div className="flex flex-col h-full bg-stone-50">
      {/* Header with Creativity Toggle */}
      <header className="px-10 py-6 border-b border-stone-200 bg-white flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-stone-400">Creativity</div>
          <div className="flex bg-stone-100 p-1 rounded-full border border-stone-200">
            {(['strict', 'balanced', 'creative'] as CreativityLevel[]).map(level => (
              <button
                key={level}
                onClick={() => updateProject(project.id, { creativityLevel: level })}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${project.creativityLevel === level ? 'bg-[#ea580c] text-white shadow-lg' : 'text-stone-400 hover:text-stone-900'}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={commitToDraft}
          disabled={committing}
          className="px-8 py-3 bg-stone-950 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#ea580c] transition-all disabled:opacity-20"
        >
          {committing ? "Synthesizing..." : "Commit to Draft"}
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>
        
        {project.messages.length === 0 && !isLiveActive ? (
          <div className="flex-1 overflow-y-auto p-12 flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-8">
              <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-10 h-10 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </div>
              <h2 className="font-serif text-3xl italic text-stone-300 tracking-tight">The sanctuary is silent. Speak to begin your legacy.</h2>
              <p className="text-stone-400 text-sm max-w-sm">Tap the microphone to begin the Discovery Questionnaire.</p>
          </div>
        ) : (
          <Virtuoso
            style={{ height: '100%' }}
            data={project.messages}
            followOutput="auto"
            initialTopMostItemIndex={project.messages.length - 1}
            initialItemCount={20}
            components={{
              Header: () => <div className="h-12" />,
              Footer: () => <div className="h-12" />
            }}
            itemContent={(index, m) => {
              if (!m) return null;
              return (
              <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} px-12 pb-8`}>
                <div className={`max-w-[70%] px-8 py-5 rounded-3xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-[#ea580c] text-white' : 'bg-white border border-stone-200 font-serif italic'}`}>
                  {m.content}
                </div>
              </div>
            )}}
          />
        )}

        {/* Live Overlay */}
        <AnimatePresence>
          {isLiveActive && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-xl z-40 p-12 flex flex-col items-center justify-center"
            >
              <div className="absolute top-10 left-10 flex items-center gap-3">
                 <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                 <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Sanctuary Active</span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center space-y-12">
                 <div className={`w-32 h-32 rounded-full bg-stone-950 flex items-center justify-center transition-all duration-700 ${isModelSpeaking ? 'scale-125 bg-[#ea580c]' : 'scale-100'}`}>
                    <div className="w-24 h-24 rounded-full border-2 border-white/20 animate-ink-pulse"></div>
                 </div>
                 <h3 className="font-serif text-4xl text-stone-900 italic tracking-tight text-center max-w-2xl">
                    {isModelSpeaking ? "The Muse guides you..." : "Answer freely. I am listening."}
                 </h3>
              </div>

              <div className="w-full max-w-2xl bg-stone-50 rounded-3xl p-6 border border-stone-200 max-h-48 overflow-y-auto no-scrollbar shadow-inner">
                 <div className="space-y-4">
                    {sessionTranscript.map((t, i) => (
                      <div key={i} className={`text-xs ${t.role === 'user' ? 'text-stone-900 font-bold' : 'text-stone-400 italic font-serif'}`}>
                        {t.role.toUpperCase()}: {t.text}
                      </div>
                    ))}
                    <div ref={transcriptBottomRef}></div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Control */}
        <div className="p-8 border-t border-stone-200 bg-white flex justify-center">
           <button 
             onClick={toggleLiveSession}
             className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${isLiveActive ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-stone-950 hover:bg-[#ea580c] shadow-stone-900/40 hover:shadow-[#ea580c]/40'}`}
           >
              <svg className={`w-10 h-10 text-white transition-transform ${isLiveActive ? 'rotate-135' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isLiveActive ? 'M6 18L18 6M6 6l12 12' : 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z'} />
              </svg>
           </button>
        </div>
      </div>
    </div>
  );
};

export default CompanionView;
