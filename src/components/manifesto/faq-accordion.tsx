"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: "How does Mi Manifesto work?",
        answer: "Simply speak your thoughts into the app using your device's microphone. Our AI transcribes and structures your words into coherent chapters and sections. You can then refine and edit the content in our manuscript editor."
    },
    {
        question: "Is my writing private and secure?",
        answer: "Absolutely. Your manuscripts are encrypted and stored securely in your private account. We never share your content with third parties, and you maintain full ownership of everything you create."
    },
    {
        question: "What languages are supported?",
        answer: "Mi Manifesto currently supports English, Spanish, French, German, Italian, Portuguese, and Mandarin Chinese, with more languages being added regularly based on user demand."
    },
    {
        question: "Can I export my manuscript?",
        answer: "Yes! You can export your completed manuscript as a Word document (.docx), PDF, or plain text file. You can also copy and paste directly into other writing tools."
    },
    {
        question: "Do I need any special equipment?",
        answer: "No special equipment needed! Mi Manifesto works with any device that has a microphone - your computer, tablet, or smartphone. A quiet space for recording is helpful but not required."
    },
    {
        question: "How is this different from dictation software?",
        answer: "Unlike basic dictation, Mi Manifesto uses advanced AI to understand context, organize your thoughts into coherent structure, and provide guidance throughout your writing journey. It's like having a writing coach and editor combined."
    },
    {
        question: "What if I get stuck or have writer's block?",
        answer: "Our AI companion is trained to help you overcome creative blocks. It can suggest prompts, ask guiding questions, and help you explore different angles for your story based on what you've already shared."
    },
    {
        question: "Is there a free trial?",
        answer: "Yes! We offer a 14-day free trial with full access to all features. No credit card required to start. You can write up to 10,000 words during your trial period."
    }
];

function FAQItemComponent({ faq }: { faq: FAQItem }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-ink/10 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left group hover:text-accent-dark transition-colors"
            >
                <h3 className="text-lg md:text-xl font-serif font-medium pr-8">
                    {faq.question}
                </h3>
                <div className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                    <ChevronDown className="h-5 w-5 text-accent-primary" />
                </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                <p className="pb-6 text-ink-light font-sans leading-relaxed">
                    {faq.answer}
                </p>
            </div>
        </div>
    );
}

export function FAQAccordion() {
    return (
        <section className="relative py-24 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <span className="font-sans text-xs font-bold tracking-widest uppercase text-accent-dark/80">
                        Common Questions
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif text-ink">
                        Frequently Asked Questions
                    </h2>
                    <p className="max-w-2xl mx-auto text-ink-light font-sans text-lg">
                        Everything you need to know about Mi Manifesto
                    </p>
                </div>

                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-ink/5 shadow-lg">
                    {faqs.map((faq, index) => (
                        <FAQItemComponent key={index} faq={faq} />
                    ))}
                    <p className="text-[10px] uppercase tracking-widest text-ink/30 font-sans font-bold pt-6 border-t border-ink/5 mt-4 text-center">
                        Install NPM dependencies:
                    </p>
                </div>
            </div>
        </section>
    );
}
