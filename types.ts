
export type Role = 'user' | 'assistant';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  tourCompleted?: boolean;
  memberSince?: Date;
}

export interface Interaction {
  id: string;
  type: 'voice' | 'text';
  summary: string;
  timestamp: Date;
  committed: boolean;
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

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  timestamp: Date;
}

export type PersonaType = 'empathetic' | 'mentor' | 'provocateur' | 'espiritu';

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
  userId: string;
  title: string;
  genre: string;
  persona: PersonaType;
  targetWordCount: number;
  currentWordCount: number;
  soulSummary: string;
  lastInteractionSummary?: string;
  chapters: Chapter[];
  messages: Message[];
  milestones: Milestone[];
  interactions: Interaction[];
  updatedAt: Date;
  orientationDone: boolean;
}

export enum AppTab {
  LIBRARY = 'LIBRARY',
  MUSE = 'MUSE',
  JOURNAL = 'JOURNAL',
  COMMUNITY = 'COMMUNITY',
  MILESTONES = 'MILESTONES',
  SEARCH = 'SEARCH'
}

export enum View {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  MAIN = 'MAIN',
  EDITOR = 'EDITOR',
  ONBOARDING = 'ONBOARDING'
}
