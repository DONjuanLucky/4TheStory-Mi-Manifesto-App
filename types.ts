
export type Role = 'user' | 'assistant';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

export type PersonaType = 'empathetic' | 'mentor' | 'provocateur' | 'stoic';

export interface Persona {
  id: PersonaType;
  name: string;
  voice: string;
  description: string;
  instruction: string;
}

export interface Milestone {
  id: string;
  label: string;
  target: number;
  type: 'wordCount' | 'chapterCount';
  isPreset: boolean;
  completed: boolean;
}

export interface Project {
  id: string;
  userId: string; // Tied to the user
  title: string;
  genre: string;
  persona: PersonaType;
  targetWordCount: number;
  currentWordCount: number;
  soulSummary: string;
  chapters: Chapter[];
  messages: Message[];
  milestones: Milestone[];
  updatedAt: Date;
}

export enum AppTab {
  LIBRARY = 'LIBRARY',
  MUSE = 'MUSE',
  COMMUNITY = 'COMMUNITY',
  MILESTONES = 'MILESTONES'
}

export enum View {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  MAIN = 'MAIN',
  EDITOR = 'EDITOR',
  ONBOARDING = 'ONBOARDING'
}
