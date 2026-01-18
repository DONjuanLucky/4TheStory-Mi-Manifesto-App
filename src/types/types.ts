export type Role = 'user' | 'assistant' | 'system';
export type PersonaType = 'empathetic' | 'mentor' | 'provocateur' | 'espiritu';

export interface Persona {
    id: PersonaType;
    name: string;
    voice: string;
    description: string;
    instruction: string;
}

export interface Message {
    id: string;
    role: Role;
    content: string;
    timestamp: Date;
}

export interface Interaction {
    id: string;
    type: 'voice' | 'text';
    summary: string;
    timestamp: Date;
    committed: boolean;
}

export interface Chapter {
    id: string;
    title: string;
    content: string;
    order: number;
}

export interface Project {
    id: string;
    userId: string;
    title: string;
    description?: string;
    genre?: string;
    soulSummary: string;
    lastInteractionSummary?: string;
    messages: Message[];
    interactions: Interaction[];
    chapters: Chapter[];
    persona: PersonaType;
    targetWordCount: number;
    currentWordCount: number;
    createdAt: any;
    updatedAt: any;
}

export interface CreateProjectData {
    title: string;
    description?: string;
    genre?: string;
}

