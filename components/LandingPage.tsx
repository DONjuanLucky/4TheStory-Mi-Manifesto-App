
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Language, translations } from '../translations';
import Logo from './Logo';

interface LandingPageProps {
  onStart: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, lang, setLang }) => {
  const [scrolled, setScrolled] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      {/* Dynamic Nav */}
      <nav className={`fixed top-0 inset-x-0 z-[100] px-12 transition-all duration-700 ${scrolled ? 'py-4 bg-white/80 backdrop-blur-xl border-b border-stone-100 shadow-sm' : 'py-10 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Logo className="w-12 h-12" />
            <span className="font-serif text-2xl font-bold tracking-tight text-stone-900">Mi Manifesto</span>
          </div>
          
          <div className="flex items-center gap-10">
            <div className="hidden lg:flex gap-8 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">
               <button className="hover:text-[#ea580c] transition-colors">Philosophy</button>
               <button className="hover:text-[#ea580c] transition-colors">Archive</button>
               <button className="hover:text-[#ea580c] transition-colors">Safety</button>
            </div>
            
            <button 
              onClick={onStart}
              className="px-10 py-4 bg-stone-950 text-white rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#ea580c] transition-all shadow-2xl active:scale-95"
            >
              Enter Sanctuary
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>
        
        <div className="max-w-6xl w-full magazine-grid items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="col-span-12 lg:col-span-7 space-y-10"
          >
             <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[#fef3ec] border border-[#fde1d3]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]"></span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ea580c]">The Future of Legacy</span>
             </div>
             
             <h1 className="font-serif text-[clamp(4rem,8vw,10rem)] leading-[0.85] tracking-tighter text-stone-950">
               Speak your <br /> <span className="italic text-[#ea580c]">sanctuary.</span>
             </h1>
             
             <p className="text-xl md:text-2xl text-stone-500 font-light max-w-xl leading-relaxed">
               A voice-first editorial suite designed to witness your creative vulnerability. Your spoken truth, curated into timeless literature.
             </p>
             
             <div className="flex gap-6">
               <button 
                 onClick={onStart}
                 className="px-12 py-6 bg-stone-950 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
               >
                 Start Workspace
               </button>
               <button className="px-12 py-6 bg-white border-2 border-stone-100 rounded-full text-xs font-bold uppercase tracking-widest hover:border-stone-950 transition-all">
                 Our Ethos
               </button>
             </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotateY: 45 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="hidden lg:block col-span-5 relative perspective-1000"
          >
             <div className="w-[400px] h-[600px] bg-stone-900 rounded-r-2xl shadow-[-50px_50px_100px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center p-12 border-l-[15px] border-stone-800">
                <Logo className="w-32 h-32 mb-10" light />
                <h2 className="font-serif text-white text-3xl tracking-[0.2em] uppercase text-center leading-relaxed">Liber <br /> Primus</h2>
                <div className="absolute bottom-12 text-[10px] font-mono text-white/20 uppercase tracking-[0.5em]">Infinity House</div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Row */}
      <section className="py-48 px-12 bg-stone-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
           <div className="space-y-12">
              <h2 className="font-serif text-6xl tracking-tight leading-none text-stone-950">Architecture of the <span className="italic">soul.</span></h2>
              <p className="text-xl text-stone-500 font-light leading-relaxed">
                Mi Manifesto isn't dictation. It is a witness. Our AI models are tuned for long-form creative flow, holding the silence as you gather your memories, dreams, and philosophies.
              </p>
              <div className="grid grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <span className="text-4xl">🖋️</span>
                    <h4 className="font-bold uppercase tracking-widest text-[10px]">High-Fidelity</h4>
                    <p className="text-xs text-stone-400">Capturing the cadence and breath of your natural voice.</p>
                 </div>
                 <div className="space-y-4">
                    <span className="text-4xl">🕰️</span>
                    <h4 className="font-bold uppercase tracking-widest text-[10px]">Timeless</h4>
                    <p className="text-xs text-stone-400">Export your manuscript in archival professional formats.</p>
                 </div>
              </div>
           </div>
           
           <div className="relative">
              <div className="aspect-[4/5] bg-stone-200 rounded-[3rem] overflow-hidden">
                 <img 
                   src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=1000" 
                   alt="Ink and Paper"
                   className="w-full h-full object-cover grayscale opacity-80"
                 />
              </div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white p-8 rounded-[2rem] shadow-2xl hidden md:block border border-stone-100">
                 <p className="font-serif italic text-lg leading-relaxed text-stone-600">"Every great work starts as a whisper in the dark."</p>
                 <div className="mt-6 w-10 h-1 bg-[#ea580c]"></div>
              </div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 px-12 border-t border-stone-100">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-20">
            <div className="flex items-center gap-4">
               <Logo className="w-16 h-16" />
               <div>
                  <h4 className="font-serif text-2xl font-bold">Mi Manifesto</h4>
                  <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">Vox et Verbum</p>
               </div>
            </div>
            
            <div className="flex gap-16 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">
               <a href="#" className="hover:text-stone-950 transition-colors">Manifesto</a>
               <a href="#" className="hover:text-stone-950 transition-colors">Legal</a>
               <a href="#" className="hover:text-stone-950 transition-colors">Safety</a>
               <a href="#" className="hover:text-stone-950 transition-colors">Archive</a>
            </div>
            
            <div className="text-[10px] font-mono text-stone-300">© 2025 INFINITY HOUSE</div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
