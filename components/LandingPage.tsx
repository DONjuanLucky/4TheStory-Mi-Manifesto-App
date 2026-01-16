
import React, { useState, useEffect } from 'react';
import { Language, translations } from '../translations';

interface LandingPageProps {
  onStart: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-stone-200/80 last:border-0 group">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 flex justify-between items-center text-left transition-all duration-300 outline-none"
      >
        <span className="font-serif text-xl md:text-2xl text-stone-900 leading-tight pr-8">{question}</span>
        <div className={`w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isOpen ? 'bg-stone-900 text-white rotate-180' : 'bg-white text-stone-400 group-hover:border-stone-900'}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-8' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="text-stone-500 text-lg font-light leading-relaxed max-w-3xl">{answer}</p>
        </div>
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ badge: string; title: string; subtitle?: string; align?: 'center' | 'left' }> = ({ badge, title, subtitle, align = 'center' }) => (
  <div className={`mb-24 space-y-6 ${align === 'center' ? 'text-center' : 'text-left'}`}>
    <div className={`inline-flex items-center px-4 py-1.5 rounded-full bg-stone-100 border border-stone-200`}>
      <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#8b7355]">{badge}</span>
    </div>
    <h2 className="font-serif text-5xl md:text-7xl tracking-tighter leading-[1.05] text-stone-900">{title}</h2>
    {subtitle && <p className="max-w-2xl mx-auto text-xl text-stone-400 font-light leading-relaxed">{subtitle}</p>}
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

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      {/* Navigation - Fixed & Refined */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 flex justify-between items-center px-6 md:px-12 ${
          scrolled 
            ? 'h-20 nav-blur border-b border-stone-200/60 shadow-glass' 
            : 'h-24 bg-transparent'
        }`}
      >
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 flex items-center justify-center bg-stone-950 rounded-2xl group-hover:rotate-6 transition-all duration-500 shadow-2xl group-hover:shadow-[#8b735540]">
            <svg viewBox="0 0 100 100" className="w-5 h-5 fill-current text-white">
              <path d="M20 20h60v4H20zM30 28h8v44h-8zM46 28h8v44h-8zM62 28h8v44h-8zM30 76h40v4H30z" />
            </svg>
          </div>
          <span className="font-serif text-2xl tracking-tighter font-bold text-stone-950 hidden sm:block">Mi Manifesto</span>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8">
          {/* Desktop Links */}
          <div className="hidden lg:flex gap-8 text-[11px] font-bold uppercase tracking-[0.4em] text-stone-400">
            <a href="#process" className="hover:text-stone-950 transition-colors">Process</a>
            <a href="#philosophy" className="hover:text-stone-950 transition-colors">{t.nav_ethos}</a>
            <a href="#faq" className="hover:text-stone-950 transition-colors">FAQ</a>
          </div>
          
          <div className="h-4 w-px bg-stone-200 hidden lg:block" />
          
          {/* Language Toggle - Hidden on very small screens to save space */}
          <div className="hidden sm:flex bg-stone-100 p-1 rounded-full border border-stone-200">
            <button 
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${lang === 'en' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
            >EN</button>
            <button 
              onClick={() => setLang('es')}
              className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${lang === 'es' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
            >ES</button>
          </div>

          <button 
            onClick={onStart}
            className="group relative px-6 py-3 bg-stone-950 text-white rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] transition-all hover:scale-[1.03] active:scale-95 shadow-xl whitespace-nowrap"
          >
            <span className="relative z-10">{t.nav_enter}</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-24 px-6 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-[#8b735504] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] -right-[10%] w-[40vw] h-[40vw] bg-[#8b735503] rounded-full blur-[100px] pointer-events-none" />
        
        <div className="z-10 text-center mb-20 max-w-5xl reveal-up">
          <h1 className="font-serif text-[clamp(3rem,11vw,7.5rem)] leading-[0.9] mb-10 tracking-tighter text-stone-950">
            {t.hero_title.split('.')[0]}<br />
            <span className="italic font-light text-[#8b7355]">{t.hero_title.split('.')[1]}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl md:text-2xl text-stone-400 font-light leading-relaxed px-4">
            {t.hero_subtitle}
          </p>
        </div>

        {/* 3D BOOK CENTERPIECE */}
        <div className="flex flex-col items-center z-20 space-y-20 scale-95 lg:scale-110 reveal-up" style={{ animationDelay: '0.2s' }}>
          <div className="book-scene group">
            <div 
              className={`book-body ${isOpen ? 'open' : ''}`}
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="book-cover book-cover-back" />
              <div className="book-side-spine" />
              <div className="book-side-edge" />
              <div className="book-page-stack" />
              
              <div className="book-page-item page-p3 flex items-end justify-center pb-10 p-8">
                 <span className="text-[8px] uppercase tracking-widest text-stone-200 font-bold opacity-30">LIBER PRIMUS • MMXXV</span>
              </div>

              <div className="book-page-item page-p2 flex flex-col justify-center p-12 bg-white">
                 <div className="space-y-10">
                    <h3 className="font-serif text-4xl italic text-stone-950 tracking-tight leading-none">{t.book_threshold}</h3>
                    <div className="w-16 h-px bg-[#8b7355] rounded-full" />
                    <p className="text-base text-stone-500 leading-relaxed font-light italic">
                      {t.book_threshold_desc}
                    </p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onStart(); }}
                      className="group flex items-center justify-between w-full mt-12 py-5 px-8 bg-stone-950 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#8b7355] transition-all shadow-2xl active:scale-95"
                    >
                      {t.book_begin}
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                 </div>
              </div>
              
              <div className="book-page-item page-p1 flex flex-col justify-center text-center p-14 bg-white">
                 <div className="space-y-8">
                    <div className="w-14 h-14 mx-auto text-[#8b7355]/10 mb-2">
                       <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16L9.01705 16C7.91248 16 7.01705 16.8954 7.01705 18L7.01705 21L4.01705 21L4.01705 18C4.01705 15.2386 6.25562 13 9.01705 13L12.017 13C14.7785 13 17.017 15.2386 17.017 18L17.017 21L14.017 21Z" /></svg>
                    </div>
                    <span className="font-serif italic text-3xl text-[#8b7355] leading-snug block">
                       "{t.book_quote}"
                    </span>
                    <div className="w-12 h-px bg-stone-100 mx-auto" />
                    <span className="text-[10px] text-stone-300 uppercase tracking-[0.5em] font-bold">{t.book_preface_title}</span>
                 </div>
              </div>
              
              <div className="book-cover flex flex-col items-center justify-center p-14 text-center">
                <div className="w-24 h-24 mb-12 animate-float flex items-center justify-center text-[#8b7355]">
                  <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full opacity-90 drop-shadow-3xl">
                    <path d="M20 15h60v6H20zM32 24h10v52H32zM45 24h10v52H45zM58 24h10v52H58z" />
                  </svg>
                </div>
                <h2 className="font-serif text-3xl tracking-[0.4em] uppercase mb-8 text-white">{t.book_cover_title}</h2>
                <div className="w-24 h-px bg-[#8b7355]/40 mb-12" />
                <p className="text-[10px] uppercase tracking-[0.8em] font-bold text-white/20 animate-pulse">{t.book_open_prompt}</p>
                <div className="cover-inside" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-5">
            <span className="text-[10px] uppercase tracking-[1.2em] text-stone-400 font-bold ml-[1.2em]">MMXXV • MI MANIFESTO</span>
            <div className="flex items-center gap-4">
              <div className="h-px w-10 bg-stone-200" />
              <span className="text-[12px] uppercase tracking-[0.6em] text-[#8b7355] font-bold italic ml-[0.6em]">For Irma</span>
              <div className="h-px w-10 bg-stone-200" />
            </div>
          </div>
        </div>
      </section>

      {/* THE PROCESS SECTION */}
      <section id="process" className="section-spacing bg-white border-y border-stone-200/60 relative">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader 
            badge="THE PROCESS" 
            title={t.process_title} 
            subtitle={t.process_subtitle} 
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {[
              { 
                step: '01', 
                title: t.process_step1_title, 
                desc: t.process_step1_desc, 
                icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' 
              },
              { 
                step: '02', 
                title: t.process_step2_title, 
                desc: t.process_step2_desc, 
                icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' 
              },
              { 
                step: '03', 
                title: t.process_step3_title, 
                desc: t.process_step3_desc, 
                icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' 
              }
            ].map((item, i) => (
              <div key={i} className="group relative p-12 bg-[#fdfcfb] rounded-[3.5rem] border border-stone-200/80 hover:border-stone-900 shadow-sm transition-all duration-700">
                <div className="absolute -top-8 left-12 w-20 h-20 rounded-[2.2rem] bg-stone-950 flex items-center justify-center text-white shadow-3xl group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <div className="pt-14 space-y-8">
                  <span className="text-[12px] font-bold text-stone-300 uppercase tracking-widest">Phase {item.step}</span>
                  <h3 className="font-serif text-3xl text-stone-950 leading-tight pr-4">{item.title}</h3>
                  <p className="text-stone-500 font-light leading-relaxed text-lg">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IS IT FOR SECTION */}
      <section className="bg-stone-50/50 section-spacing relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader 
            badge="THE ARCHIVE" 
            title={t.for_title} 
            subtitle="Built for those who value the depth of a written legacy."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: t.for_persona1_title, pain: t.for_persona1_pain, sol: t.for_persona1_sol, emoji: '🖋️' },
              { title: t.for_persona2_title, pain: t.for_persona2_pain, sol: t.for_persona2_sol, emoji: '📜' },
              { title: t.for_persona3_title, pain: t.for_persona3_pain, sol: t.for_persona3_sol, emoji: '🕰️' },
              { title: t.for_persona4_title, pain: t.for_persona4_pain, sol: t.for_persona4_sol, emoji: '🌐' }
            ].map((card, i) => (
              <div key={i} className="bg-white p-12 rounded-[3.5rem] border border-stone-200 shadow-sm transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 flex flex-col items-start h-full group">
                <div className="w-16 h-16 mb-12 bg-stone-50 rounded-2xl flex items-center justify-center text-3xl grayscale group-hover:grayscale-0 transition-all duration-500 border border-stone-100">
                  {card.emoji}
                </div>
                <h4 className="font-serif text-2xl text-stone-950 mb-10 leading-tight">{card.title}</h4>
                <div className="space-y-8 flex-1">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 block">The Conflict</span>
                    <p className="text-stone-500 text-base leading-relaxed font-light italic opacity-80">"{card.pain}"</p>
                  </div>
                  <div className="w-10 h-px bg-stone-100" />
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 block">The Resolve</span>
                    <p className="text-stone-700 text-base leading-relaxed font-medium">{card.sol}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VS COMPARISON SECTION */}
      <section id="philosophy" className="section-spacing bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader 
            badge="EVOLUTION" 
            title={t.vs_title} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            {/* Traditional */}
            <div className="relative p-12 md:p-20 rounded-[4.5rem] bg-stone-50 border border-stone-200 overflow-hidden">
              <h3 className="font-serif text-4xl text-stone-300 mb-16">{t.vs_trad}</h3>
              <ul className="space-y-10">
                {[t.vs_trad_item1, t.vs_trad_item2, t.vs_trad_item3, t.vs_trad_item4, t.vs_trad_item5].map((item, i) => (
                  <li key={i} className="flex items-start gap-8 text-stone-400 text-xl font-light">
                    <div className="mt-1.5 w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mi Manifesto */}
            <div className="relative p-12 md:p-20 rounded-[4.5rem] bg-stone-950 shadow-3xl text-white overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#8b735515] rounded-full blur-[100px] transition-all duration-1000 group-hover:bg-[#8b735520]" />
              <div className="relative z-10">
                <div className="flex items-center gap-6 mb-16">
                  <h3 className="font-serif text-5xl text-white tracking-tighter italic">{t.vs_mi}</h3>
                  <span className="px-4 py-1.5 bg-[#8b735520] rounded-full border border-[#8b735540] text-[9px] font-bold uppercase tracking-widest text-[#8b7355] animate-pulse">Superior</span>
                </div>
                <ul className="space-y-10">
                  {[t.vs_mi_item1, t.vs_mi_item2, t.vs_mi_item3, t.vs_mi_item4, t.vs_mi_item5].map((item, i) => (
                    <li key={i} className="flex items-start gap-8 text-white/90 text-xl font-light">
                      <div className="mt-1.5 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 transition-all duration-300">
                        <svg className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="section-spacing bg-stone-50/50 border-t border-stone-200/60">
        <div className="max-w-5xl mx-auto px-6">
          <SectionHeader 
            badge="KNOWLEDGE BASE" 
            title={t.faq_title} 
            subtitle={t.faq_subtitle} 
          />

          <div className="bg-white rounded-[4rem] p-10 md:p-20 shadow-sm border border-stone-200">
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
      <section className="relative py-64 bg-stone-950 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#8b7355_0%,_transparent_70%)]" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-16">
          <h2 className="font-serif text-7xl md:text-9xl text-white tracking-tighter leading-tight italic">
            Witness your <br /> <span className="text-[#8b7355]">unwritten legacy.</span>
          </h2>
          <p className="text-stone-400 text-2xl md:text-3xl font-light leading-relaxed max-w-3xl mx-auto">
            The silence is over. It is time to speak your sanctuary into existence.
          </p>
          <button 
            onClick={onStart}
            className="group relative px-16 py-7 bg-white text-stone-950 rounded-full text-[14px] font-bold uppercase tracking-[0.4em] transition-all hover:scale-105 active:scale-95 shadow-3xl overflow-hidden"
          >
            <span className="relative z-10">{t.nav_enter}</span>
            <div className="absolute inset-0 bg-[#8b7355] -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-24">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-stone-950 rounded-2xl text-white text-[14px] font-serif shadow-xl">M</div>
              <h4 className="font-serif text-4xl text-stone-950 tracking-tighter">Mi Manifesto</h4>
            </div>
            <p className="text-[12px] uppercase tracking-[0.8em] text-stone-300 font-bold ml-1">{t.footer_tagline}</p>
          </div>
          <div className="flex flex-wrap gap-12 text-[12px] font-bold uppercase tracking-[0.4em] text-stone-400">
            <a href="#" className="hover:text-stone-950 transition-colors">{t.footer_philosophy}</a>
            <a href="#" className="hover:text-stone-950 transition-colors">{t.footer_privacy}</a>
            <a href="#" className="hover:text-stone-950 transition-colors">Manifesto</a>
            <a href="#" className="hover:text-stone-950 transition-colors">Archive</a>
          </div>
          <div className="text-[12px] text-stone-200 font-mono tracking-[0.4em] uppercase">
            © 2025 • VOX ET VERBUM
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
