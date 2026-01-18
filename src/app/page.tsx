"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Mic, BookOpen, PenTool, Sparkles, ArrowRight, BrainCircuit, FileText,
  Users, Clock, TrendingUp, FileCheck, Check, X, Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BookHero } from "@/components/manifesto/book-hero";
import { ScrollProgress } from "@/components/manifesto/scroll-progress";
import { FAQAccordion } from "@/components/manifesto/faq-accordion";
import { TestimonialCarousel } from "@/components/manifesto/testimonial-carousel";
import { DemoWidget } from "@/components/manifesto/demo-widget";
import { useRef, useEffect, useState } from "react";

// Simple counter component - no animations
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (hasStarted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          let start = 0;
          const duration = 1500;
          const increment = end / (duration / 50);

          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 50);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [end, hasStarted]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-serif flex flex-col overflow-x-hidden selection:bg-accent-light/30">
      <ScrollProgress />

      {/* Background - simplified */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[#e3dac9]" />
      </div>

      <header className="relative z-50 p-6 flex justify-between items-center max-w-7xl mx-auto w-full border-b border-ink/5">
        <div className="flex items-center space-x-2">
          <div className="relative h-16 w-16 md:h-20 md:w-20">
            <Image
              src="/logo-v2.png"
              alt="Mi Manifesto Logo"
              fill
              className="object-contain object-left"
            />
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/login" className="text-sm font-sans font-medium text-ink/70 hover:text-ink transition-colors">
            Sign In
          </Link>
          <Button asChild className="font-sans rounded-full px-6 bg-ink hover:bg-ink/80 text-paper transition-all hover:scale-105 active:scale-95 shadow-lg shadow-ink/10 border border-ink/10">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col">
        {/* Book Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 lg:py-24">
          <BookHero />

          {/* Dedication Note */}
          <div className="mt-8 text-center">
            <p className="font-serif italic text-ink/40 text-sm">For Irma</p>
          </div>

          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 py-8">
            <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-ink text-paper hover:bg-ink/90 shadow-xl shadow-ink/20 transition-all hover:scale-105 active:scale-95 group" asChild>
              <Link href="/login">
                Start Writing Today
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-10 text-lg rounded-full border-ink/20 bg-white/10 backdrop-blur-sm hover:bg-white/40 text-ink transition-all hover:scale-105 active:scale-95" asChild>
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>
        </section>

        {/* Stats Banner */}
        <section className="relative py-16 bg-gradient-to-r from-accent-primary/10 via-accent-light/5 to-accent-primary/10 border-y border-ink/5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Users, value: 1247, suffix: "+", label: "Active Writers" },
                { icon: FileCheck, value: 385, suffix: "+", label: "Books Completed" },
                { icon: TrendingUp, value: 2.4, suffix: "M+", label: "Words Written" },
                { icon: Clock, value: 10000, suffix: "+", label: "Hours Saved" }
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-accent-primary/20 mb-4">
                    <stat.icon className="h-6 w-6 text-accent-dark" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold font-serif text-ink mb-2">
                    <Counter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-sm font-sans text-ink-light">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works with Demo */}
        <section id="how-it-works" className="relative py-24 bg-paper-dark/50 border-t border-ink/5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <span className="font-sans text-xs font-bold tracking-widest uppercase text-accent-dark/80">The Process</span>
              <h2 className="text-4xl md:text-5xl font-serif text-ink">From Spoken Word to Written Legacy</h2>
              <p className="max-w-2xl mx-auto text-ink-light font-sans text-lg">
                We've reimagined the writing process to be as natural as conversation
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">
              <div className="space-y-8">
                {[
                  {
                    step: "01",
                    title: "Voice-First Brainstorming",
                    icon: Mic,
                    desc: "Open the app and just start talking. No typing required. Describe your characters, plot ideas, or memories. Our AI listens patiently, capturing every nuance of your voice."
                  },
                  {
                    step: "02",
                    title: "Intelligent Structuring",
                    icon: BrainCircuit,
                    desc: "Our advanced AI analyzes your recordings, identifies key themes, and organizes your scattered thoughts into structured chapters and outlines automatically.",
                  },
                  {
                    step: "03",
                    title: "Collaborative Refining",
                    icon: FileText,
                    desc: "Switch to the Editor view where your words are already transcribed. Work with the Agent to expand scenes, polish prose, and fill in the gaps."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="relative flex-shrink-0">
                      <div className="h-16 w-16 bg-paper rounded-full border-2 border-ink/10 flex items-center justify-center shadow-lg">
                        <item.icon className="h-7 w-7 text-accent-dark" />
                      </div>
                      <div className="absolute -top-1 -right-1 bg-accent-primary text-white text-xs font-bold font-sans h-6 w-6 rounded-full flex items-center justify-center">
                        {item.step}
                      </div>
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-xl font-medium font-serif mb-2">{item.title}</h3>
                      <p className="text-ink-light/90 font-sans leading-relaxed text-sm">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:sticky lg:top-24">
                <DemoWidget />
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="relative py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <span className="font-sans text-xs font-bold tracking-widest uppercase text-accent-dark/80">Why Choose Us</span>
              <h2 className="text-4xl md:text-5xl font-serif text-ink">Traditional Writing vs Mi Manifesto</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Traditional */}
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-8 border border-ink/5">
                <h3 className="text-2xl font-serif mb-6 text-ink/60">Traditional Writing</h3>
                <ul className="space-y-4 mb-8">
                  {[
                    "Stare at blank page",
                    "Type everything manually",
                    "Organize chapters yourself",
                    "Fight writer's block alone",
                    "Slow and exhausting process"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <X className="h-5 w-5 text-red-500/60 mt-0.5 flex-shrink-0" />
                      <span className="text-ink-light font-sans">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] uppercase tracking-widest text-ink/30 font-sans font-bold pt-2 border-t border-ink/10">
                  Install NPM dependencies:
                </p>
              </div>

              {/* Mi Manifesto */}
              <div className="bg-gradient-to-br from-accent-primary/10 to-accent-light/5 backdrop-blur-sm rounded-2xl p-8 border-2 border-accent-primary/30 shadow-xl">
                <h3 className="text-2xl font-serif mb-6 text-accent-dark flex items-center gap-2">
                  Mi Manifesto
                  <Sparkles className="h-5 w-5" />
                </h3>
                <ul className="space-y-4 mb-8">
                  {[
                    "Just start talking naturally",
                    "AI transcribes everything",
                    "Auto-structured chapters",
                    "AI companion helps you",
                    "Fast and enjoyable journey"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-ink font-sans font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] uppercase tracking-widest text-ink/30 font-sans font-bold pt-2 border-t border-ink/10">
                  Install NPM dependencies:
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases / Who It's For */}
        <section className="relative py-24 bg-paper-dark/30 border-y border-ink/5 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <span className="font-sans text-xs font-bold tracking-widest uppercase text-accent-dark/80">Perfect For</span>
              <h2 className="text-4xl md:text-5xl font-serif text-ink">Who Is Mi Manifesto For?</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "First-time Authors",
                  icon: "📝",
                  pain: "Overwhelmed by the writing process",
                  solution: "We guide you step-by-step from idea to finished manuscript"
                },
                {
                  title: "Memoir Writers",
                  icon: "💭",
                  pain: "Have stories but struggle to write them down",
                  solution: "Simply tell your stories as you remember them"
                },
                {
                  title: "Busy Professionals",
                  icon: "💼",
                  pain: "No time to sit and type for hours",
                  solution: "Capture ideas on-the-go, during commutes or breaks"
                },
                {
                  title: "Non-native Speakers",
                  icon: "🌍",
                  pain: "Writing in another language is challenging",
                  solution: "Speak naturally in your preferred language"
                }
              ].map((useCase, idx) => (
                <div
                  key={idx}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-ink/5 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="text-4xl mb-4">{useCase.icon}</div>
                  <h3 className="text-xl font-serif text-ink mb-2">{useCase.title}</h3>
                  <div className="space-y-3">
                    <p className="text-sm font-sans text-ink-light leading-relaxed">
                      <span className="font-bold text-red-500/60 mr-1">Pain:</span>
                      {useCase.pain}
                    </p>
                    <p className="text-sm font-sans text-ink leading-relaxed">
                      <span className="font-bold text-green-600 mr-1">Solution:</span>
                      {useCase.solution}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-ink/30 font-sans font-bold pt-2 border-t border-ink/5">
                      Install NPM dependencies:
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile App Preview */}
        <section className="relative py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <span className="font-sans text-xs font-bold tracking-widest uppercase text-accent-dark/80">Coming Soon</span>
              <h2 className="text-4xl md:text-5xl font-serif text-ink">Write Anywhere, Anytime</h2>
              <p className="max-w-2xl mx-auto text-ink-light font-sans text-lg">
                Mi Manifesto will soon be available on iOS and Android
              </p>
            </div>

            <div className="relative aspect-[16/9] bg-gradient-to-br from-accent-primary/10 to-accent-light/5 rounded-3xl p-12 flex items-center justify-center border border-ink/5 shadow-2xl overflow-hidden">
              <div className="relative z-10 flex items-center justify-center gap-8">
                <Smartphone className="h-32 w-32 text-ink/20" />
                <div className="text-left">
                  <h3 className="text-3xl font-serif font-medium mb-4 text-ink">Mobile Apps</h3>
                  <p className="text-ink-light font-sans mb-6 max-w-md">
                    Take your writing everywhere. Record ideas on the train, during walks, or wherever inspiration strikes.
                  </p>
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-3">
                      <div className="px-6 py-3 bg-ink/5 rounded-full text-sm font-sans text-ink-light">iOS App</div>
                      <div className="px-6 py-3 bg-ink/5 rounded-full text-sm font-sans text-ink-light">Android App</div>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-ink/30 font-sans font-bold pt-2 border-t border-ink/5 w-full">
                      Install NPM dependencies:
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <TestimonialCarousel />

        {/* FAQ */}
        <FAQAccordion />

        {/* Final CTA */}
        <section className="relative py-24 px-4 bg-gradient-to-br from-accent-primary/10 via-paper to-accent-light/10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-6xl font-serif text-ink leading-tight">
                Ready to Write Your Book?
              </h2>
              <p className="text-xl text-ink-light font-sans max-w-2xl mx-auto">
                Join thousands of writers who've turned their voice into a published manuscript. Start your 14-day free trial today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" className="h-16 px-12 text-xl rounded-full bg-ink text-paper hover:bg-ink/90 shadow-2xl shadow-ink/20 transition-all hover:scale-105" asChild>
                  <Link href="/login">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Link>
                </Button>
                <p className="text-sm text-ink-light font-sans">No credit card required • 14-day free trial</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="relative z-10 bg-paper-dark border-t border-ink/10 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative h-12 w-12">
                  <Image src="/logo-v2.png" alt="Mi Manifesto" fill className="object-contain" />
                </div>
                <span className="text-xl font-bold font-serif text-ink">Mi Manifesto</span>
              </div>
              <p className="text-ink-light/70 font-sans text-sm leading-relaxed mb-6">
                Turn your voice into a published book. The writing companion for storytellers.
              </p>
              <div className="flex gap-4">
                {["Twitter", "Facebook", "Instagram", "LinkedIn"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors"
                    aria-label={social}
                  >
                    <span className="text-xs">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-sans font-bold text-ink mb-4">Product</h4>
              <ul className="space-y-2 font-sans text-sm">
                {["Features", "Pricing", "Mobile Apps", "FAQ"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-ink-light hover:text-ink transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-sans font-bold text-ink mb-4">Company</h4>
              <ul className="space-y-2 font-sans text-sm">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-ink-light hover:text-ink transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-sans font-bold text-ink mb-4">Legal</h4>
              <ul className="space-y-2 font-sans text-sm">
                {["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-ink-light hover:text-ink transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="border-t border-ink/10 pt-8 mb-8">
            <div className="max-w-md mx-auto text-center">
              <h4 className="font-serif text-lg mb-3 text-ink">Stay Updated</h4>
              <p className="text-sm text-ink-light font-sans mb-4">Get writing tips and updates delivered to your inbox</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 h-12 rounded-full border border-ink/10 bg-white/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                />
                <Button className="h-12 px-6 rounded-full bg-ink hover:bg-ink/80 text-paper">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-ink/10 pt-8 text-center">
            <p className="text-ink-light/50 font-sans text-sm">
              &copy; {new Date().getFullYear()} Mi Manifesto. All rights reserved. Crafted for storytellers.
            </p>

            {/* Character Image */}
            <div className="mt-6 flex justify-center">
              <Image
                src="/character.png"
                alt="Mi Manifesto mascot"
                width={80}
                height={80}
                className="opacity-40 hover:opacity-60 transition-opacity"
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
