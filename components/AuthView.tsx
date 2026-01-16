
import React, { useState } from 'react';
import { User } from '../types';
import { signInWithGoogle } from '../services/authService';

interface AuthViewProps {
  onAuthSuccess: (user: User) => void;
  onBackToLanding: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess, onBackToLanding }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate Email Auth
    setTimeout(() => {
      const mockUser: User = {
        uid: Math.random().toString(36).substr(2, 9),
        email: email,
        displayName: email.split('@')[0],
        photoURL: null
      };
      localStorage.setItem('mi_manifesto_user', JSON.stringify(mockUser));
      onAuthSuccess(mockUser);
      setLoading(false);
    }, 1500);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      onAuthSuccess(user);
    } catch (error) {
      console.error("Google Sign In failed:", error);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-6 animate-in fade-in duration-1000 relative">
      {/* Decorative blurred spots */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#8b735505] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1a1a1a03] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full z-10">
        <div className="text-center mb-10">
          <button 
            onClick={onBackToLanding}
            className="mb-8 text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 hover:text-[#8b7355] transition-all hover:tracking-[0.5em]"
          >
            ← Exit Threshold
          </button>
          <div className="w-16 h-16 mx-auto mb-6 transition-transform hover:scale-110 duration-500">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-[#1a1a1a]">
              <path d="M20 20h60v4H20zM30 28h8v44h-8zM46 28h8v44h-8zM62 28h8v44h-8zM30 76h40v4H30z" />
            </svg>
          </div>
          <h2 className="font-serif text-4xl mb-3 tracking-tight">{isLogin ? 'Welcome Back' : 'Create a Sanctuary'}</h2>
          <p className="text-gray-400 font-light text-sm italic">"The unwritten page awaits its master."</p>
        </div>

        <div className="space-y-4 mb-8">
          <button 
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-white border border-gray-100 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 hover:shadow-xl hover:shadow-[#00000005] hover:border-[#8b735520] transition-all disabled:opacity-50 group"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-t-transparent border-[#8b7355] rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <div className="relative flex items-center justify-center py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <span className="relative bg-[#fafaf9] px-4 text-[9px] uppercase tracking-[0.4em] text-gray-300 font-bold">Or use ink</span>
          </div>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2 px-1">Writer's Identity</label>
            <input 
              required
              type="email"
              className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[#8b7355] focus:shadow-xl focus:shadow-[#8b735505] transition-all placeholder:text-gray-200"
              placeholder="email@manifesto.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || googleLoading}
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2 px-1">Sacred Key</label>
            <input 
              required
              type="password"
              className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[#8b7355] focus:shadow-xl focus:shadow-[#8b735505] transition-all placeholder:text-gray-200"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || googleLoading}
            />
          </div>

          <button 
            disabled={loading || googleLoading}
            className="w-full py-5 bg-[#1a1a1a] text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#8b7355] transition-all shadow-xl disabled:opacity-50 transform hover:-translate-y-1 active:translate-y-0"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin" />
                Inscribing...
              </div>
            ) : (
              isLogin ? 'Enter Sanctuary' : 'Initiate Manifesto'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors"
          >
            {isLogin ? "New voice? Start here." : "Existing master? Sign in."}
          </button>
        </div>

        <p className="mt-20 text-center text-[9px] uppercase tracking-[0.5em] text-gray-200 font-mono">
          VOX ET VERBUM • 2025
        </p>
      </div>
    </div>
  );
};

export default AuthView;
