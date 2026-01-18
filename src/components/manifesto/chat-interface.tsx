"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VoiceRecorder } from "@/components/voice/voice-recorder";
import { cn } from "@/lib/utils";
import { ArrowUp, User as UserIcon, Bot } from "lucide-react";

interface Message {
    role: "user" | "model";
    content: string;
}

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "model", content: "Hello! I'm so excited to meet you. I'm here to help you write your book. This is a safe space for your creativity. Shall we get started?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        const userMsg: Message = { role: "user", content };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            }));

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: content, history }),
            });

            if (!res.ok) throw new Error("Failed to send message");

            const data = await res.json();
            const assistantMsg: Message = { role: "model", content: data.response };
            setMessages((prev) => [...prev, assistantMsg]);
        } catch (error) {
            console.error(error);
            // Fallback for demo/error
            setMessages((prev) => [...prev, { role: "model", content: "I'm having trouble connecting right now, but I'm still listening. Tell me more?" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
        setInput("");
    };

    const handleVoiceRecording = async (blob: Blob) => {
        // For MVP, we'll pretend the audio was transcribed
        // In a real app, send blob to Whisper or Gemini API for transcription
        console.log("Audio blob captured:", blob.size);
        // Simulate transcription for demo
        const simulatedTranscription = "I was thinking about my main character, Sarah. She's struggling with her past.";
        sendMessage(simulatedTranscription);
    };

    return (
        <div className="flex flex-col h-full bg-paper w-full max-w-3xl mx-auto rounded-xl overflow-hidden shadow-sm border border-paper-dark">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "flex w-full",
                            msg.role === "user" ? "justify-end" : "justify-start"
                        )}
                    >
                        <div
                            className={cn(
                                "max-w-[80%] rounded-2xl px-5 py-3 text-sm md:text-base leading-relaxed animate-fade-in shadow-sm",
                                msg.role === "user"
                                    ? "bg-accent-light text-ink rounded-tr-none"
                                    : "bg-white text-ink rounded-tl-none border border-paper-dark"
                            )}
                        >
                            <p>{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start w-full">
                        <div className="bg-white border border-paper-dark rounded-2xl rounded-tl-none px-5 py-3 shadow-sm flex items-center space-x-2">
                            <div className="w-2 h-2 bg-ink-light rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-ink-light rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-ink-light rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-paper-dark">
                <div className="flex flex-col items-center space-y-4">

                    <VoiceRecorder onRecordingComplete={handleVoiceRecording} />

                    <form onSubmit={handleTextSubmit} className="flex w-full items-center space-x-2">
                        <input
                            className="flex-1 h-12 px-4 rounded-full border border-paper-dark bg-paper focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all font-sans text-ink"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="h-12 w-12 rounded-full bg-ink hover:bg-ink-light text-paper"
                            disabled={!input.trim() || isLoading}
                        >
                            <ArrowUp className="h-5 w-5" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
