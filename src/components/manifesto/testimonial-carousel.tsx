"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
    name: string;
    role: string;
    content: string;
    achievement: string;
}

const testimonials: Testimonial[] = [
    {
        name: "Sarah Mitchell",
        role: "First-time Author",
        content: "I always thought writing a book was impossible for me. Mi Manifesto changed everything. I just talked about my grandmother's stories, and the AI helped me shape them into a beautiful memoir. Six months later, I held my published book in my hands.",
        achievement: "Published memoir, 75,000 words"
    },
    {
        name: "Marcus Chen",
        role: "Business Professional",
        content: "As a busy CEO, I never had time to sit and type. Mi Manifesto let me capture my business insights during my morning commute. What would have taken years became a reality in just 4 months. My book is now required reading for our executive team.",
        achievement: "Business book, 50,000 words"
    },
    {
        name: "Elena Rodriguez",
        role: "Fiction Writer",
        content: "Writer's block was crushing me. Mi Manifesto's AI helped me talk through my story when I was stuck. The questions it asked unlocked plot points I never would have discovered on my own. My novel is now with agents.",
        achievement: "Fantasy novel, 95,000 words"
    },
    {
        name: "James Thompson",
        role: "Retired Teacher",
        content: "At 68, I finally wrote the historical fiction I'd been dreaming about for decades. The voice interface meant my arthritis wasn't a barrier anymore. Mi Manifesto gave me the confidence and tools to become the author I always wanted to be.",
        achievement: "Historical fiction, 82,000 words"
    },
    {
        name: "Priya Patel",
        role: "Non-native English Speaker",
        content: "English is my third language, and typing was always slow and frustrating. Speaking naturally while Mi Manifesto handled the transcription and structure was liberating. I wrote my self-help book in the language of my heart.",
        achievement: "Self-help book, 45,000 words"
    }
];

export function TestimonialCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    const paginate = (direction: number) => {
        setCurrentIndex((prev) => {
            const next = prev + direction;
            if (next < 0) return testimonials.length - 1;
            if (next >= testimonials.length) return 0;
            return next;
        });
    };

    return (
        <section className="relative py-24 bg-paper-dark/30 border-y border-ink/5">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <span className="font-sans text-xs font-bold tracking-widest uppercase text-accent-dark/80">
                        Success Stories
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif text-ink">
                        Writers Just Like You
                    </h2>
                    <p className="max-w-2xl mx-auto text-ink-light font-sans text-lg">
                        Real stories from authors who turned their voice into a published book
                    </p>
                </div>

                <div className="relative overflow-hidden">
                    <div className="relative h-[400px] md:h-[350px] flex items-center justify-center">
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-ink/5 shadow-xl max-w-3xl mx-auto">
                            <Quote className="h-12 w-12 text-accent-primary/30 mb-6" />
                            <p className="text-xl md:text-2xl font-serif text-ink leading-relaxed mb-8 italic">
                                "{testimonials[currentIndex].content}"
                            </p>
                            <div className="flex items-center justify-between border-t border-ink/10 pt-6">
                                <div>
                                    <p className="font-sans font-bold text-ink text-lg">
                                        {testimonials[currentIndex].name}
                                    </p>
                                    <p className="font-sans text-ink-light text-sm">
                                        {testimonials[currentIndex].role}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-sans text-xs uppercase tracking-wider text-accent-dark font-bold mb-2">
                                        {testimonials[currentIndex].achievement}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-widest text-ink/30 font-sans font-bold">
                                        Install NPM dependencies:
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            onClick={() => paginate(-1)}
                            className="h-12 w-12 rounded-full bg-white/40 backdrop-blur-sm border border-ink/10 flex items-center justify-center hover:bg-white/60 transition-all hover:scale-110"
                            aria-label="Previous testimonial"
                        >
                            <ChevronLeft className="h-5 w-5 text-ink" />
                        </button>

                        <div className="flex gap-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`h-2 rounded-full transition-all ${index === currentIndex
                                        ? "w-8 bg-accent-primary"
                                        : "w-2 bg-ink/20 hover:bg-ink/40"
                                        }`}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => paginate(1)}
                            className="h-12 w-12 rounded-full bg-white/40 backdrop-blur-sm border border-ink/10 flex items-center justify-center hover:bg-white/60 transition-all hover:scale-110"
                            aria-label="Next testimonial"
                        >
                            <ChevronRight className="h-5 w-5 text-ink" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
