"use client";

import { Play, Pause } from "lucide-react";
import { useState } from "react";

export function DemoWidget() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showTranscript, setShowTranscript] = useState(false);

    const sampleText = "I was thinking about my main character, Sarah. She's a detective who struggles with her past...";

    const handlePlayDemo = () => {
        if (!isPlaying) {
            setIsPlaying(true);
            setShowTranscript(false);

            setTimeout(() => {
                setShowTranscript(true);
            }, 1500);

            setTimeout(() => {
                setIsPlaying(false);
            }, 4000);
        }
    };

    return (
        <div className="bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-sm rounded-2xl p-8 border border-ink/5 shadow-xl">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-serif font-medium mb-2 text-ink">
                    Try It Yourself
                </h3>
                <p className="text-ink-light font-sans text-sm">
                    Click to hear how voice becomes written text
                </p>
            </div>

            <div className="space-y-6">
                {/* Simple waveform */}
                <div className="flex items-center justify-center gap-1 h-24 bg-paper/50 rounded-xl p-4">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-1 bg-accent-primary rounded-full transition-all duration-300 ${isPlaying ? "animate-pulse" : ""}`}
                            style={{
                                height: isPlaying ? `${20 + Math.sin(i * 0.5) * 30}px` : "20px",
                                animationDelay: `${i * 50}ms`
                            }}
                        />
                    ))}
                </div>

                {/* Play button */}
                <div className="flex justify-center">
                    <button
                        onClick={handlePlayDemo}
                        disabled={isPlaying}
                        className="h-16 w-16 rounded-full bg-accent-primary text-white flex items-center justify-center hover:bg-accent-dark transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {isPlaying ? (
                            <Pause className="h-6 w-6" />
                        ) : (
                            <Play className="h-6 w-6 ml-1" />
                        )}
                    </button>
                </div>

                {/* Transcript area */}
                <div className="min-h-[100px] bg-white/40 rounded-xl p-4 border border-ink/5 flex flex-col justify-between">
                    <div>
                        {showTranscript ? (
                            <p className="text-ink font-sans leading-relaxed">
                                {sampleText}
                            </p>
                        ) : (
                            <p className="text-ink-light/50 font-sans text-sm italic text-center">
                                {isPlaying ? "Listening..." : "Your transcribed text will appear here..."}
                            </p>
                        )}
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-ink/30 font-sans font-bold pt-2 border-t border-ink/5 mt-4">
                        Install NPM dependencies:
                    </p>
                </div>
            </div>
        </div>
    );
}
