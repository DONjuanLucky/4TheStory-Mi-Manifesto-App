<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Mi Manifesto

**A voice-first book writing companion that guides users through their creative journey with empathy and literary elegance.**

View your app in AI Studio: [https://ai.studio/apps/drive/1V_anA4uLZYruDbRJmK1fiIWU55gTXuyv](https://ai.studio/apps/drive/1V_anA4uLZYruDbRJmK1fiIWU55gTXuyv)

## Overview

**Mi Manifesto** is a premium editorial suite designed to witness your creative vulnerability. It transforms your spoken truth into timeless literature. Unlike traditional writing tools that require you to type everything, Mi Manifesto listens to your voice, understands your intent, and structures your scattered thoughts into a cohesive manuscript.

## Features

- **Voice-First Creation**: Just start talking. The application captures your spoken words and nuances.
- **AI Muse**: A conversational AI partner powered by Gemini that helps you brainstorm, structure, and refine your work.
- **Extended Memory**: Integrated with **Pinecone** vector database to store and retrieve long-term context from your sessions.
- **Memory Bridge**: An asynchronous system that ensures your voice conversations are never blocked by data storage, while allowing third-party extraction of your creative data.
- **Multiple Personas**: Choose your ideal writing companion:
  - *The Grounded Partner (Zephyr)*: Calm, steady, real talk.
  - *The Honest Editor (Charon)*: Direct, professional, focused on structure.
  - *The Creative Catalyst (Puck)*: High energy, fast-paced brainstorming.
  - *El Guía Literario (Kore)*: A soulful mentor with a deep Mexican/Latin rhythm (English & Spanish).
- **Intelligent Structuring**: Automatically organizes your thoughts into chapters and outlines.
- **Bilingual Support**: Full support for English and Spanish, including "Spanglish" friendly interactions.
- **Project Management**: Track word counts, milestones, and chapters.
- **Journaling**: A space for daily reflections to clear your mind before writing.

## Tech Stack

- **Frontend**: React 18, Vite
- **Language**: TypeScript
- **AI**: Google GenAI (Gemini)
- **Memory**: Pinecone Vector Database
- **Authentication**: Firebase Auth (Google, Email)
- **State Management**: React Hooks & Context
- **Styling**: Tailwind CSS (inferred from class names)

## Setup & Installation

**Prerequisites:** Node.js (v18+ recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd mi-manifesto
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your API Keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PINECONE_API_KEY=your_pinecone_api_key_here
   ```
   *Note: Firebase configuration is currently hardcoded in `services/authService.ts`. For production, you should move these to environment variables as well.*

4. **Run the application:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure

- `src/App.tsx`: Main application component and state manager.
- `src/components/`: UI components for different views (Dashboard, Editor, Companion, etc.).
- `src/services/`: External services (Auth, Gemini AI, Pinecone Memory).
  - `pineconeService.ts`: Handles vector storage and retrieval.
  - `memoryBridge.ts`: Manages async data flow from voice sessions to storage.
- `src/translations.ts`: Localization strings for English and Spanish.
- `src/constants.ts`: Application constants, persona definitions, and system instructions.
- `src/types.ts`: TypeScript interfaces for data models.

## Usage Guide

1. **Sign In**: Use the "Guest Author" mock login for local testing or configure Firebase for real authentication.
2. **Create a Project**: Click "New Work", define your title, genre, and choose your Muse persona.
3. **The Muse**: Go to the "Muse" tab to chat with your AI companion. Discuss your ideas, characters, and plot.
4. **Editor**: Switch to the "Editor" view to see your chapters. Add new chapters and refine the text generated from your conversations.
5. **Journal**: Use the Journal tab for daily writing exercises.

## License

This project is private and proprietary.
