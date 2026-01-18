"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Waveform } from "./waveform";

interface VoiceRecorderProps {
    onRecordingComplete?: (blob: Blob) => void;
    className?: string;
}

export function VoiceRecorder({ onRecordingComplete, className }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                setIsProcessing(true);
                // Simulate processing delay or immediately call callback
                setTimeout(() => {
                    setIsProcessing(false);
                    onRecordingComplete?.(blob);
                }, 1000);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.state === "inactive" && mediaRecorder.start();
            setIsRecording(true);
            setError(null);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Please check microphone permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className={cn("flex flex-col items-center space-y-4", className)}>
            <div className="relative">
                <Button
                    size="icon"
                    variant={isRecording ? "destructive" : "default"}
                    className={cn(
                        "h-20 w-20 rounded-full transition-all duration-300 shadow-xl",
                        isRecording ? "animate-pulse-slow scale-110" : "hover:scale-105"
                    )}
                    onClick={toggleRecording}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                    ) : isRecording ? (
                        <Square className="h-8 w-8 fill-current" />
                    ) : (
                        <Mic className="h-8 w-8" />
                    )}
                </Button>
                {/* Ripple effect when recording */}
                {isRecording && (
                    <div className="absolute inset-0 -z-10 h-full w-full animate-ping rounded-full bg-error/30 opacity-75 sm:h-20 sm:w-20" />
                )}
            </div>

            <div className="h-12 w-full flex justify-center">
                {isRecording ? (
                    <Waveform isRecording={true} />
                ) : isProcessing ? (
                    <span className="text-sm text-ink-light font-sans animate-pulse">Processing thoughts...</span>
                ) : error ? (
                    <span className="text-sm text-error font-sans">{error}</span>
                ) : (
                    <span className="text-sm text-ink-light font-sans opacity-50">Tap to speak</span>
                )}
            </div>
        </div>
    );
}
