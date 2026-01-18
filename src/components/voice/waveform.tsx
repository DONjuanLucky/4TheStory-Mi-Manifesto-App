"use client";

import { cn } from "@/lib/utils";

interface WaveformProps {
    isRecording: boolean;
    className?: string;
}

export function Waveform({ isRecording, className }: WaveformProps) {
    // Mock bars for the waveform
    const bars = Array.from({ length: 12 }, (_, i) => i);

    return (
        <div className={cn("flex items-center justify-center gap-1 h-12", className)}>
            {bars.map((i) => (
                <div
                    key={i}
                    className={cn(
                        "w-1 rounded-full bg-accent-primary transition-all duration-300",
                        isRecording ? "animate-waveform" : "h-2 opacity-30"
                    )}
                    style={{
                        height: isRecording ? undefined : '4px',
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '1s' // varying duration could be better but CSS simple for now
                    }}
                />
            ))}
        </div>
    );
}
