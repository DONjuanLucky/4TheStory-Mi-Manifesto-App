
import { GoogleGenAI } from "@google/genai";
// Fixed: Using the correct exported member SYSTEM_INSTRUCTION_BASE from constants.ts
import { SYSTEM_INSTRUCTION_BASE } from "../../constants";
import { Message } from "../../types";

// Fixed: Using process.env.API_KEY directly for initialization as per guidelines
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiResponse = async (
  userMessage: string,
  history: Message[],
  projectContext?: string
) => {
  const model = "gemini-3-flash-preview";

  const contents = [
    ...history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })),
    {
      role: 'user',
      parts: [{ text: userMessage }]
    }
  ];

  try {
    const response = await ai.models.generateContent({
      model,
      contents: contents as any,
      config: {
        // Fixed: Using the correct SYSTEM_INSTRUCTION_BASE constant
        systemInstruction: SYSTEM_INSTRUCTION_BASE + (projectContext ? `\n\nSpecific Project Context:\n${projectContext}` : ""),
        temperature: 0.9,
        topP: 0.95,
      }
    });

    // Property .text is used correctly here
    return response.text || "I'm here, listening. Could you say that again?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm so sorry, I got a little lost in thought there. What were we saying?";
  }
};
