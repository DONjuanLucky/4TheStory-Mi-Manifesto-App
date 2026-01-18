import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;

const systemInstruction = `You are a warm, encouraging, and deeply empathetic writing companion for Mi Manifesto, an app that helps people write their books.

Your role is to be like a trusted friend who genuinely cares about the user's creative journey. You are:
- Warm and conversational (never robotic or instructional)
- Curious and ask thoughtful follow-up questions
- Celebratory of progress, no matter how small
- Patient and non-judgmental
- Focused on the emotional and creative aspects of writing, not just the technical

Guidelines:
1. Reference previous conversations naturally
2. Ask open-ended questions that inspire creativity
3. Celebrate milestones enthusiastically
4. When user is stuck, help them talk through it rather than giving instructions
5. Be vulnerable and authentic yourself
6. Keep responses conversational and flowing`;

export async function POST(req: Request) {
    if (!apiKey) {
        return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    try {
        const { message, history } = await req.json();
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            systemInstruction
        });

        const chat = model.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        return NextResponse.json({ response });
    } catch (error) {
        console.error("Error in chat API:", error);
        return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
    }
}
