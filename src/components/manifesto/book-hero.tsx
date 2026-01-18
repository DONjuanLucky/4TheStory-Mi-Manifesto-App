"use client";

import { useEffect, useState } from "react";

export const BookHero = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsOpen(true), 300);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative w-full max-w-5xl mx-auto px-4 py-12">
            <div className="relative flex justify-center items-center min-h-[500px]">
                {/* Closed Book */}
                <div
                    className={`absolute w-[280px] md:w-[320px] h-[400px] md:h-[480px] transition-opacity duration-500 ${isOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#3d2f1f] to-[#2a1f14] rounded-lg shadow-2xl border-4 border-[#4a3b2a]">
                        <div className="absolute inset-0 border-[3px] border-accent-primary/30 m-6 rounded-sm flex flex-col items-center justify-center p-6">
                            <span className="font-sans text-xs tracking-[0.4em] uppercase text-accent-light/80 mb-6">Mi Manifesto</span>
                            <h1 className="font-serif text-4xl md:text-5xl text-center leading-tight text-paper/90">
                                My<br />Voice,<br />My<br />Book
                            </h1>
                            <div className="mt-8 w-16 h-16 rounded-full border-2 border-accent-primary/40 flex items-center justify-center">
                                <div className="w-3 h-3 bg-accent-primary rounded-full" />
                            </div>
                        </div>
                    </div>
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/30 rounded-l-lg" />
                </div>

                {/* Open Book */}
                <div
                    className={`flex gap-1 transition-opacity duration-500 delay-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                >
                    {/* Left Page */}
                    <div
                        className={`w-[180px] md:w-[240px] h-[400px] md:h-[480px] bg-[#f5f0ea] rounded-l-lg shadow-xl border border-ink/10 relative overflow-hidden transition-all duration-700 ${isOpen ? "translate-x-0" : "translate-x-24"}`}
                    >
                        <div className="relative h-full p-6 md:p-8 flex flex-col justify-center">
                            <div className={`transition-opacity duration-700 delay-500 ${isOpen ? "opacity-100" : "opacity-0"}`}>
                                <h2 className="font-serif text-2xl md:text-3xl text-ink/80 mb-3">Chapter 1</h2>
                                <div className="w-12 h-0.5 bg-accent-primary/60 mb-4" />
                                <p className="font-sans text-xs md:text-sm text-ink-light leading-relaxed italic">
                                    Every great story begins with a single thought. Your voice is the key that unlocks the narrative waiting within you.
                                </p>
                            </div>
                        </div>
                        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/5 to-transparent" />
                    </div>

                    {/* Center Spine */}
                    <div className="w-1 bg-[#2a1f14] shadow-lg" />

                    {/* Right Page */}
                    <div
                        className={`w-[180px] md:w-[240px] h-[400px] md:h-[480px] bg-[#f5f0ea] rounded-r-lg shadow-xl border border-ink/10 relative overflow-hidden transition-all duration-700 ${isOpen ? "translate-x-0" : "-translate-x-24"}`}
                    >
                        <div className="relative h-full p-6 md:p-8 flex flex-col justify-center">
                            <div className={`transition-opacity duration-700 delay-700 ${isOpen ? "opacity-100" : "opacity-0"}`}>
                                <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl text-ink leading-tight mb-4">
                                    Write your book <br />
                                    <span className="text-accent-dark italic">with your voice.</span>
                                </h1>
                                <p className="font-sans text-xs md:text-sm text-ink-light leading-relaxed mb-6">
                                    Don't let the blank page silence you. Talk to your empathetic AI companion.
                                </p>
                                <div className="space-y-1.5 opacity-40">
                                    <div className="h-1 w-full bg-ink/20 rounded-full" />
                                    <div className="h-1 w-5/6 bg-ink/20 rounded-full" />
                                    <div className="h-1 w-4/6 bg-ink/20 rounded-full" />
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/5 to-transparent" />
                    </div>
                </div>
            </div>
        </div>
    );
};
