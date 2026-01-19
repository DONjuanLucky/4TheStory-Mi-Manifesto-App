
import React, { useState, useEffect } from 'react';
import { Language, translations } from '../translations';
import Logo from './Logo';

interface LandingPageProps {
  onStart: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-stone-800 last:border-0 group">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 flex justify-between items-center text-left transition-all duration-300 outline-none"
      >
        <span className="font-serif text-xl md:text-2xl text-stone-200 leading-tight pr-8 group-hover:text-[#ea580c] transition-colors">{question}</span>
        <div className={`w-8 h-8 rounded-full border border-stone-700 flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isOpen ? 'bg-[#ea580c] text-white rotate-180 border-[#ea580c]' : 'bg-transparent text-stone-500 group-hover:border-[#ea580c] group-hover:text-[#ea580c]'}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-8' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="text-stone-400 text-lg font-light leading-relaxed max-w-3xl pl-4 border-l-2 border-[#ea580c]/30">{answer}</p>
        </div>
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ badge: string; title: string; subtitle?: string; align?: 'center' | 'left'; theme?: 'light' | 'dark' }> = ({ badge, title, subtitle, align = 'center', theme = 'light' }) => (
  <div className={`mb-24 space-y-8 ${align === 'center' ? 'text-center' : 'text-left'} relative z-10`}>
    <div className={`inline-flex items-center px-4 py-1.5 rounded-full ${theme === 'dark' ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-200'} border shadow-sm backdrop-blur-sm`}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] mr-3 animate-pulse"></span>
      <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ea580c]">{badge}</span>
    </div>
    <h2 className={`font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.1] ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
      {title.split(' ').map((word, i) => (
        <span key={i} className={`inline-block hover:italic transition-all duration-300 ${theme === 'dark' ? 'hover:text-[#ea580c]' : 'hover:text-[#ea580c]'} cursor-default mr-3 md:mr-4`}>{word}</span>
      ))}
    </h2>
    {subtitle && <p className={`max-w-2xl mx-auto text-xl md:text-2xl ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'} font-light leading-relaxed font-serif italic`}>{subtitle}</p>}
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onStart, lang, setLang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 overflow-x-hidden selection:bg-[#ea580c] selection:text-white">
      {/* Background Texture & Ambient Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#fbf9f6]">
         {/* Architectural Grid Pattern */}
         <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
         {/* Radial Vignette for Focus */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#fbf9f6_80%)]"></div>
      </div>
      
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 flex justify-between items-center px-6 md:px-12 ${
          scrolled 
            ? 'h-20 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-sm' 
            : 'h-28 bg-transparent'
        }`}
      >
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Logo className="w-12 h-12" />
          <span className="font-serif text-2xl tracking-tight font-bold text-stone-900 hidden sm:block ml-2">Mi Manifesto</span>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden lg:flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-600">
            {['Process', t.nav_ethos, 'FAQ'].map((item, i) => (
                <button key={i} onClick={() => scrollToSection(item.toLowerCase().replace(/\s/g, '-'))} className="relative hover:text-[#ea580c] transition-colors font-bold uppercase">{item}</button>
            ))}
          </div>
          
          <div className="hidden sm:flex bg-stone-100 p-1 rounded-full border border-stone-200">
            {['en', 'es'].map((l) => (
               <button 
                key={l}
                onClick={() => setLang(l as Language)}
                className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${lang === l ? 'bg-stone-900 text-white shadow-md' : 'text-stone-400 hover:text-stone-900'}`}
              >{l.toUpperCase()}</button>
            ))}
          </div>

          <button 
            onClick={onStart}
            className="relative px-8 py-3 bg-[#ea580c] text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-[#c2410c] hover:-translate-y-1 active:translate-y-0 shadow-lg hover:shadow-orange-500/30 overflow-hidden group"
          >
            <span className="relative z-10">{t.nav_enter}</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center pt-32 pb-48 px-6 overflow-hidden">
        {/* Kinetic Background Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] -rotate-12 pointer-events-none opacity-[0.03] select-none mix-blend-multiply">
            <div className="whitespace-nowrap font-serif text-[12vw] leading-none text-stone-900 marquee-left font-black">
                SANCTUARY • VERITAS • MEMORIA • SANCTUARY • VERITAS • MEMORIA •
            </div>
            <div className="whitespace-nowrap font-serif text-[12vw] leading-none text-stone-900 marquee-right ml-32 font-black">
                 VOX ET VERBUM • LEGACY • VOX ET VERBUM • LEGACY •
            </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center mb-16 max-w-6xl reveal-up">
          <div className="inline-block mb-8 px-5 py-2 border border-[#ea580c]/20 rounded-full bg-[#ea580c]/5 backdrop-blur-md">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#ea580c] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ea580c]"></span>
                Voice-First Editorial Suite
            </span>
          </div>
          
          <h1 className="font-serif text-[clamp(4rem,11vw,9rem)] leading-[0.9] mb-10 tracking-tight text-stone-950 drop-shadow-sm">
            {t.hero_title.split('.')[0]}<span className="text-[#ea580c]">.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl md:text-2xl text-stone-600 font-light leading-relaxed px-4 mb-12">
            {t.hero_subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
                onClick={onStart} 
                className="px-10 py-5 bg-stone-950 text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#ea580c] transition-all shadow-2xl hover:scale-105 active:scale-95 border-2 border-stone-950 hover:border-[#ea580c]"
            >
                Start Writing
            </button>
            <button 
                onClick={() => scrollToSection('process')} 
                className="px-10 py-5 bg-white text-stone-900 border-2 border-stone-200 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-stone-50 transition-all hover:border-stone-900 hover:scale-105 active:scale-95"
            >
                Explore Process
            </button>
          </div>
        </div>

        {/* 3D BOOK STAGE - Adjusted for contrast */}
        <div className="relative z-20 mt-8 perspective-2000 flex flex-col items-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#ea580c]/20 rounded-full blur-[90px] pointer-events-none"></div>
          
          <div className="book-scene group scale-75 md:scale-100 hover:scale-[1.02] transition-transform duration-700 ease-out">
            <div 
              className={`book-body ${isOpen ? 'open' : ''}`}
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="book-cover book-cover-back" />
              <div className="book-side-spine" />
              <div className="book-side-edge" />
              <div className="book-page-stack" />
              
              <div className="book-page-item page-p3 flex items-end justify-center pb-10 p-8">
                 <span className="text-[8px] uppercase tracking-widest text-stone-400 font-bold opacity-50">LIBER PRIMUS • MMXXV</span>
              </div>

              <div className="book-page-item page-p2 flex flex-col justify-center p-12 bg-white border-l border-stone-100">
                 <div className="space-y-10">
                    <h3 className="font-serif text-4xl italic text-stone-900 tracking-tight leading-none">{t.book_threshold}</h3>
                    <div className="w-12 h-1 bg-[#ea580c]" />
                    <p className="text-sm text-stone-600 leading-loose font-serif">
                      {t.book_threshold_desc}
                    </p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onStart(); }}
                      className="group flex items-center justify-between w-full mt-8 py-4 px-6 bg-stone-950 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#ea580c] transition-all shadow-xl active:scale-95"
                    >
                      {t.book_begin}
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                 </div>
              </div>
              
              <div className="book-page-item page-p1 flex flex-col justify-center text-center p-14 bg-[#f9f9f9]">
                 <div className="space-y-8 border-4 border-double border-stone-200 h-full flex flex-col justify-center p-4">
                    <div className="w-20 h-20 mx-auto mb-4">
                       <Logo className="w-full h-full opacity-80" />
                    </div>
                    <span className="font-serif italic text-2xl text-stone-800 leading-snug block">
                       "{t.book_quote}"
                    </span>
                 </div>
              </div>
              
              <div className="book-cover flex flex-col items-center justify-center p-14 text-center bg-[#0c0a09] relative overflow-hidden shadow-2xl border-l-4 border-stone-800">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="relative z-10 w-full h-full border border-white/10 flex flex-col items-center justify-center">
                    <div className="w-32 h-32 mb-8 flex items-center justify-center">
                        <Logo className="w-full h-full" light />
                    </div>
                    <h2 className="font-serif text-2xl tracking-[0.3em] uppercase mb-8 text-white">{t.book_cover_title}</h2>
                    <p className="text-[9px] uppercase tracking-[0.6em] font-bold text-[#ea580c] animate-pulse">{t.book_open_prompt}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Dedication Text */}
          <p className="mt-12 font-serif text-sm italic text-stone-400 tracking-widest opacity-60">For Irma</p>
        </div>
      </section>

      {/* GRADIENT TRANSITION from Light to Dark */}
      <div className="h-40 bg-gradient-to-b from-[#fbf9f6] via-[#1c1917] to-[#0c0a09] pointer-events-none -mt-20 relative z-10"></div>

      {/* THE PROCESS SECTION - DARK THEME for Contrast */}
      <section id="process" className="section-spacing bg-[#0c0a09] relative overflow-hidden text-white pt-24">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <SectionHeader 
            badge="THE ARCHITECTURE" 
            title={t.process_title} 
            subtitle={t.process_subtitle} 
            theme="dark"
          />

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 pt-10">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-[4.5rem] left-[16%] right-[16%] h-px bg-stone-800 border-t border-dashed border-stone-700 z-0"></div>

            {[
              { 
                step: '01', 
                title: t.process_step1_title, 
                desc: t.process_step1_desc, 
                icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
                color: 'bg-emerald-500' 
              },
              { 
                step: '02', 
                title: t.process_step2_title, 
                desc: t.process_step2_desc, 
                icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
                color: 'bg-indigo-500'
              },
              { 
                step: '03', 
                title: t.process_step3_title, 
                desc: t.process_step3_desc, 
                icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                color: 'bg-[#ea580c]'
              }
            ].map((item, i) => (
              <div key={i} className="group relative bg-stone-900 p-10 rounded-3xl border border-stone-800 shadow-xl hover:shadow-[#ea580c]/10 hover:-translate-y-2 transition-all duration-500 z-10 flex flex-col">
                <div className={`w-16 h-16 mb-8 rounded-2xl ${item.color} text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                
                <h3 className="font-serif text-3xl text-white leading-tight mb-4">{item.title}</h3>
                <p className="text-stone-400 font-light leading-relaxed">{item.desc}</p>
                
                <div className="mt-auto pt-8 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Phase {item.step}</span>
                    <div className="h-px flex-1 mx-4 bg-stone-800"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GRADIENT TRANSITION from Dark to Light */}
      <div className="h-32 bg-gradient-to-b from-[#0c0a09] to-white pointer-events-none relative z-10"></div>

      {/* WHO IS IT FOR SECTION - Light but High Contrast */}
      <section className="bg-white section-spacing relative overflow-hidden pt-12">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-stone-100 rounded-full blur-[100px] opacity-60 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#ea580c] rounded-full blur-[150px] opacity-5 -translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <SectionHeader 
            badge="THE ARCHIVE" 
            title={t.for_title} 
            subtitle="Built for those who value the depth of a written legacy."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: t.for_persona1_title, pain: t.for_persona1_pain, sol: t.for_persona1_sol, emoji: '🖋️', color: 'border-blue-200 bg-blue-50/30' },
              { title: t.for_persona2_title, pain: t.for_persona2_pain, sol: t.for_persona2_sol, emoji: '📜', color: 'border-amber-200 bg-amber-50/30' },
              { title: t.for_persona3_title, pain: t.for_persona3_pain, sol: t.for_persona3_sol, emoji: '🕰️', color: 'border-purple-200 bg-purple-50/30' },
              { title: t.for_persona4_title, pain: t.for_persona4_pain, sol: t.for_persona4_sol, emoji: '🌐', color: 'border-emerald-200 bg-emerald-50/30' }
            ].map((card, i) => (
              <div key={i} className={`p-10 rounded-[2.5rem] border ${card.color} shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full group bg-white`}>
                <div className="flex justify-between items-start mb-8">
                    <div className="text-4xl filter grayscale-0 transition-all scale-110">{card.emoji}</div>
                </div>
                
                <h4 className="font-serif text-2xl text-stone-950 mb-6 leading-tight min-h-[3rem] font-medium">{card.title}</h4>
                
                <div className="space-y-6 flex-1 flex flex-col justify-end">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-red-500 block mb-1">Conflict</span>
                    <p className="text-stone-600 text-sm italic">"{card.pain}"</p>
                  </div>
                  <div className="p-4 bg-stone-900 rounded-2xl border border-stone-900 text-white">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#ea580c] block mb-1">Resolve</span>
                    <p className="text-sm font-medium">{card.sol}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VS COMPARISON SECTION */}
      <section id="philosophy" className="section-spacing bg-stone-50">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader 
            badge="EVOLUTION" 
            title={t.vs_title} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Traditional */}
            <div className="relative p-12 md:p-16 rounded-[3rem] bg-white border border-stone-200 shadow-sm overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] opacity-20"></div>
                <h3 className="font-serif text-3xl text-stone-400 mb-12 relative z-10 italic border-b border-stone-200 pb-4 inline-block">{t.vs_trad}</h3>
                <ul className="space-y-8 relative z-10">
                    {[t.vs_trad_item1, t.vs_trad_item2, t.vs_trad_item3, t.vs_trad_item4, t.vs_trad_item5].map((item, i) => (
                    <li key={i} className="flex items-center gap-6 text-stone-500 font-serif italic text-lg hover:text-stone-800 transition-colors">
                        <span className="w-8 h-px bg-stone-300"></span>
                        {item}
                    </li>
                    ))}
                </ul>
            </div>

            {/* Mi Manifesto - DARK CARD */}
            <div className="relative p-12 md:p-16 rounded-[3rem] bg-[#0c0a09] shadow-2xl text-white overflow-hidden group border border-stone-800">
              {/* Animated Glow */}
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#ea580c] rounded-full blur-[120px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12 border-b border-white/10 pb-6">
                  <h3 className="font-serif text-4xl text-white tracking-tight">{t.vs_mi}</h3>
                  <div className="w-10 h-10 rounded-full bg-[#ea580c] flex items-center justify-center text-white">
                    <Logo className="w-6 h-6" light />
                  </div>
                </div>
                <ul className="space-y-8">
                  {[t.vs_mi_item1, t.vs_mi_item2, t.vs_mi_item3, t.vs_mi_item4, t.vs_mi_item5].map((item, i) => (
                    <li key={i} className="flex items-center gap-6 text-white text-lg font-light group-hover:translate-x-2 transition-transform duration-300">
                      <div className="w-2 h-2 rounded-full bg-[#ea580c]"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRADIENT TRANSITION from Light to Dark for Footer */}
      <div className="h-32 bg-gradient-to-b from-stone-50 to-[#1c1917] pointer-events-none relative z-10"></div>

      {/* FAQ SECTION - Dark Theme */}
      <section id="faq" className="section-spacing bg-[#1c1917] border-t border-stone-800 pt-12">
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeader 
            badge="KNOWLEDGE" 
            title={t.faq_title} 
            subtitle={t.faq_subtitle} 
            theme="dark"
          />

          <div className="space-y-4">
            <FAQItem question={t.faq_q1} answer={t.faq_a1} />
            <FAQItem question={t.faq_q2} answer={t.faq_a2} />
            <FAQItem question={t.faq_q3} answer={t.faq_a3} />
            <FAQItem question={t.faq_q4} answer={t.faq_a4} />
            <FAQItem question={t.faq_q5} answer={t.faq_a5} />
            <FAQItem question={t.faq_q6} answer={t.faq_a6} />
            <FAQItem question={t.faq_q7} answer={t.faq_a7} />
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="relative py-48 bg-stone-50 text-center overflow-hidden">
        <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-12">
          <div className="w-px h-24 bg-gradient-to-b from-transparent via-[#ea580c] to-transparent mx-auto"></div>
          
          <h2 className="font-serif text-6xl md:text-9xl text-stone-900 tracking-tighter leading-none">
            Your legacy <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea580c] to-[#9a3412] italic">awaits.</span>
          </h2>
          
          <p className="text-stone-500 text-xl font-light tracking-wide max-w-2xl mx-auto">
            Step into the sanctuary. Speak your truth.
          </p>
          
          <button 
            onClick={onStart}
            className="group relative inline-flex items-center gap-4 px-12 py-6 bg-[#0c0a09] text-white rounded-full text-sm font-bold uppercase tracking-[0.3em] transition-all hover:scale-105 shadow-2xl hover:shadow-orange-900/20"
          >
            <span>{t.nav_enter}</span>
            <span className="w-8 h-px bg-[#ea580c] group-hover:w-12 transition-all"></span>
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-24 bg-white border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <Logo className="w-12 h-12" />
            <div>
                <h4 className="font-serif text-2xl text-stone-900">Mi Manifesto</h4>
                <p className="text-[10px] uppercase tracking-widest text-stone-400">Vox et Verbum</p>
            </div>
          </div>
          
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
            {['Privacy', 'Terms', 'Manifesto', 'Contact'].map(link => (
                <a key={link} href="#" className="hover:text-stone-900 transition-colors">{link}</a>
            ))}
          </div>
          
          <div className="text-[10px] text-stone-300 font-mono tracking-widest">
            © 2025 INFINITY HOUSE
          </div>
        </div>
      </footer>
      
      <style>{`
        @keyframes float-slow {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
            50% { transform: translateY(-20px) rotate(5deg); opacity: 0.3; }
        }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .marquee-left { animation: marquee-left 60s linear infinite; }
        .marquee-right { animation: marquee-right 60s linear infinite; }
        @keyframes marquee-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
};

export default LandingPage;
