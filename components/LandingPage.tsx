
import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf9] overflow-hidden selection:bg-[#8b735520]">
      {/* Dynamic Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-8 py-6 flex justify-between items-center ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            {/* Minimalist MM Pillar Logo */}
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-[#1a1a1a]">
              <path d="M20 20h60v4H20zM30 28h8v44h-8zM46 28h8v44h-8zM62 28h8v44h-8zM30 76h40v4H30z" />
            </svg>
          </div>
          <span className="font-serif text-xl tracking-tight font-bold">Mi Manifesto</span>
        </div>
        <button 
          onClick={onStart}
          className="text-[10px] font-bold uppercase tracking-[0.3em] hover:text-[#8b7355] transition-colors"
        >
          Enter Workspace
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-6">
        {/* Cinematic Background Elements */}
        <div className="absolute top-1/4 -left-20 w-[60vw] h-[60vw] bg-[#8b735508] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-[40vw] h-[40vw] bg-[#1a1a1a03] rounded-full blur-[100px] pointer-events-none" />

        <div className="z-10 text-center mb-20 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <h1 className="font-serif text-[clamp(3rem,8vw,8rem)] leading-[0.9] mb-8 tracking-tighter text-[#1a1a1a]">
            Where Spoken <br />
            <span className="italic font-light text-[#8b7355]">Wisdom</span> Becomes <br />
            Legacy.
          </h1>
          <p className="max-w-xl mx-auto text-lg text-gray-500 font-light leading-relaxed">
            The first empathetic writing suite designed to witness your creative vulnerability and transform it into professional literature.
          </p>
        </div>

        {/* 3D Book Animation: The Threshold */}
        <div className="book-container z-20 mb-20">
          <div 
            className={`book hover-glow ${isOpen ? 'open' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="book-cover flex flex-col items-center justify-center p-8 text-center">
              {/* Logo from user image - Rendered as high-fidelity SVG */}
              <svg className="w-32 h-32 mb-8 animate-float" viewBox="0 0 100 100" fill="currentColor">
                <path d="M20 15h60v6H20zM32 24h10v52H32zM45 24h10v52H45zM58 24h10v52H58z" />
                <path d="M20 80c0-10 20-15 30-15s30 5 30 15" fill="#8b7355" opacity="0.8" />
              </svg>
              <h2 className="font-serif text-2xl tracking-widest uppercase mb-2">Mi Manifesto</h2>
              <div className="w-12 h-px bg-[#8b7355] mb-4" />
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-40">Open to Begin</p>
            </div>
            
            <div className="book-page-2 book-page" />
            
            <div className="book-page shadow-inner">
              <div className="h-full flex flex-col justify-between py-4">
                <div>
                  <h3 className="font-serif text-xl mb-3 italic">The Vulnerable Path</h3>
                  <div className="w-8 h-1 bg-[#8b7355] mb-6 rounded-full" />
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    "I will be your partner. Your witness. The one who carries the threads of your story when you are too tired to hold them."
                  </p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onStart(); }}
                  className="group flex items-center justify-between w-full py-4 px-6 bg-[#1a1a1a] text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#8b7355] transition-all"
                >
                  Start Writing
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep-Dive: Context & Empathy */}
      <section className="max-w-7xl mx-auto px-6 py-40 space-y-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <div className="space-y-12 animate-in fade-in duration-1000">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.5em] text-[#8b7355] mb-4 block">The Soul of the Suit</span>
              <h2 className="font-serif text-5xl md:text-6xl leading-tight text-[#1a1a1a]">The Muse doesn't just listen. It <span className="italic font-light">remembers</span>.</h2>
            </div>
            <p className="text-xl text-gray-400 font-light leading-relaxed">
              Most AI assistants forget who you are the moment you close the tab. Mi Manifesto is built on <strong>Deep Contextual Memory</strong>. It maintains a "Soul Summary" of your book—the emotional stakes, the character's quiet fears, and your personal breakthrough moments.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { title: "Emotional Continuity", desc: "The Muse picks up where your heart left off last session." },
                { title: "Verbal Curation", desc: "Raw voice notes transformed into high-fidelity prose." },
                { title: "Vulnerability Safe", desc: "A private, sacred space for your unpolished truths." },
                { title: "Persona Alignment", desc: "Empathetic, Mentor, or Spark—tailored to your phase." }
              ].map((f, i) => (
                <div key={i} className="group p-6 rounded-3xl border border-gray-100 bg-white hover:border-[#8b735530] hover:shadow-2xl transition-all duration-500">
                  <div className="w-10 h-10 rounded-full bg-[#f5f5f4] flex items-center justify-center mb-4 group-hover:bg-[#8b7355] group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-serif text-lg mb-2">{f.title}</h4>
                  <p className="text-xs text-gray-400 font-light leading-normal">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-[#8b735510] rounded-[5rem] rotate-3 scale-105 group-hover:rotate-0 transition-transform duration-700" />
            <div className="relative bg-[#1a1a1a] p-16 rounded-[5rem] shadow-2xl text-white aspect-[4/5] flex flex-col justify-center">
              <div className="flex gap-2 mb-12">
                {[1, 2, 3, 4].map(i => <div key={i} className="w-1 h-8 bg-[#8b7355] rounded-full animate-breathe" style={{ animationDelay: `${i * 0.2}s` }} />)}
              </div>
              <h3 className="font-serif text-3xl mb-6 italic leading-snug">"I noticed we haven't spoken about Elena's mother since Tuesday. Are we ready to revisit that scene in the garden?"</h3>
              <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">— The Empathetic Muse</p>
            </div>
          </div>
        </div>

        {/* Closing Invitation */}
        <div className="relative overflow-hidden bg-[#fafaf9] border border-gray-100 p-24 rounded-[5rem] text-center group transition-all duration-1000 hover:border-[#8b735540]">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <svg className="w-64 h-64" viewBox="0 0 100 100" fill="currentColor">
                <path d="M20 20h60v4H20zM30 28h8v44h-8zM46 28h8v44h-8zM62 28h8v44h-8zM30 76h40v4H30z" />
              </svg>
           </div>
          <h2 className="font-serif text-7xl md:text-8xl mb-12 tracking-tighter">Publish your <span className="italic font-light">Truth</span>.</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-16 text-xl font-light leading-relaxed">
            Stop letting your stories die in your head. Enter the sanctuary and begin your manifesto today.
          </p>
          <button 
            onClick={onStart}
            className="relative overflow-hidden px-20 py-8 bg-[#1a1a1a] text-white rounded-full text-sm font-bold uppercase tracking-[0.3em] group transition-all duration-500 hover:bg-[#8b7355] hover:scale-105"
          >
            <span className="relative z-10">Start Your Journey</span>
          </button>
        </div>
      </section>

      {/* SEO Friendly Footer */}
      <footer className="border-t border-gray-100 py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-center md:text-left">
            <h4 className="font-serif text-2xl mb-2">Mi Manifesto</h4>
            <p className="text-xs uppercase tracking-widest text-gray-300 font-bold">The Editorial Sanctuary for Serious Authors</p>
          </div>
          <div className="flex gap-12 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <a href="#" className="hover:text-[#8b7355] transition-colors">Our Ethos</a>
            <a href="#" className="hover:text-[#8b7355] transition-colors">Privacy of Voice</a>
            <a href="#" className="hover:text-[#8b7355] transition-colors">Methodology</a>
          </div>
          <p className="text-[10px] text-gray-300 font-mono">EST. 2025 • VOX ET VERBUM</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
