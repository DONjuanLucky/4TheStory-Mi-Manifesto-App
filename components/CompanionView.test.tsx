
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CompanionView from './CompanionView';
import { Project, Message, PersonaType, CreativityLevel } from '../types';

// Mocks
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    live = {
      connect: vi.fn().mockResolvedValue({
        sendRealtimeInput: vi.fn(),
      }),
    };
    models = {
      generateContent: vi.fn(),
    };
  },
  Modality: {},
}));

vi.mock('../services/geminiService', () => ({
  getGeminiResponse: vi.fn(),
}));

vi.mock('../utils/audio', () => ({
  AudioRecorder: class {
    start = vi.fn();
    stop = vi.fn();
  },
  AudioStreamer: class {
    play = vi.fn();
    stop = vi.fn();
  },
}));

// Mock Project Data
const createMockProject = (messageCount: number): Project => {
  const messages: Message[] = Array.from({ length: messageCount }, (_, i) => ({
    id: `msg-${i}`,
    role: i % 2 === 0 ? 'user' : 'assistant',
    content: `Message content ${i}`,
    timestamp: new Date(),
  }));

  return {
    id: 'p1',
    userId: 'u1',
    title: 'Test Project',
    genre: 'Fantasy',
    persona: 'mentor' as PersonaType,
    creativityLevel: 'balanced' as CreativityLevel,
    targetWordCount: 50000,
    currentWordCount: 0,
    soulSummary: 'Summary',
    chapters: [],
    messages,
    milestones: [],
    interactions: [],
    updatedAt: new Date(),
    orientationDone: true,
  };
};

describe('CompanionView Performance', () => {
  it('renders a large list of messages efficiently', async () => {
    const project = createMockProject(1000);
    render(
      <CompanionView
        project={project}
        onOpenEditor={vi.fn()}
        updateProject={vi.fn()}
        lang="en"
      />
    );

    // Wait for virtualization to render something
    await waitFor(() => {
        const elements = screen.getAllByText(/Message content/);
        expect(elements.length).toBeGreaterThan(0);
    }, { timeout: 2000 });

    const messageElements = screen.getAllByText(/Message content/);

    expect(messageElements.length).toBeLessThan(100);
  });
});
