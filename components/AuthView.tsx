
import React, { useState } from 'react';
import { User } from '../types';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, signInMock } from '../services/authService';

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
  const [error, setError] = useState<{ message: string; isDomainError?: boolean } | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let user: User;
      if (isLogin) {
        user = await signInWithEmail(email, password);
      } else {
        user = await signUpWithEmail(email, password);
      }
      onAuthSuccess(user);
    } catch (err: any) {
      console.error("Auth Error:", err.code, err.message);
      let message = "An unexpected error occurred.";
      let isDomainError = false;
      
      if (err.code === 'auth/wrong-password') message = "Incorrect password.";
      else if (err.code === 'auth/user-not-found') message = "No account found with this email.";
      else if (err.code === 'auth/email-already-in-use') message = "This email is already registered.";
      else if (err.code === 'auth/invalid-email') message = "Please enter a valid email address.";
      else if (err.code === 'auth/unauthorized-domain' || err.message.includes('unauthorized-domain')) {
        message = `Security Notice: The domain '${window.location.hostname}' is not yet whitelisted in Firebase. Please use Guest Mode.`;
        isDomainError = true;
      }
      
      setError({ message, isDomainError });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      onAuthSuccess(user);
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('unauthorized-domain'))) {
        setError({ 
          message: `The domain ${window.location.hostname} is not whitelisted. Use Guest Mode to continue.`, 
          isDomainError: true 
        });
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError({ message: "Google sign-in failed. Please ensure cookies are enabled." });
      }
      console.error("Google Sign In failed:", err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleMockSignIn = async () => {
    setLoading(true);
    try {
      const user = await signInMock();
      onAuthSuccess(user);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f2eb] flex items-center justify-center p-6 animate-in fade-in duration-1000 relative">
      <div className="max-w-md w-full z-10 bg-white p-12 rounded-[4rem] shadow-2xl border-2 border-stone-200">
        <div className="text-center mb-12">
          <button 
            onClick={onBackToLanding}
            className="mb-10 text-[10px] font-bold uppercase tracking-[0.5em] text-stone-300 hover:text-stone-900 transition-all"
          >
            ← Exit Sanctuary
          </button>
          <div className="w-20 h-20 mx-auto mb-8 bg-stone-900 rounded-3xl flex items-center justify-center text-white shadow-xl rotate-3 hover:rotate-0 transition-all duration-500">
            <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current">
              <path d="M12,2A10,10,0,0,0,2,12a10,10,0,0,0,10,10,10,10,0,0,0,10-10A10,10,0,0,0,12,2Zm5,11H7V11H17Z" />
            </svg>
          </div>
          <h2 className="font-serif text-4xl mb-4 text-stone-900 tracking-tight">{isLogin ? 'Welcome Back' : 'Join the Sanctuary'}</h2>
          <p className="text-stone-400 font-serif italic text-base">"Your manuscript awaits its master."</p>
        </div>

        {error && (
          <div className={`mb-8 p-6 border-2 rounded-3xl text-[11px] font-bold uppercase tracking-widest text-center animate-in slide-in-from-top-2 flex flex-col gap-4 ${error.isDomainError ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <span className="leading-relaxed">{error.message}</span>
            {error.isDomainError && (
              <button 
                onClick={handleMockSignIn}
                className="py-3 px-6 bg-amber-800 text-white rounded-full self-center hover:bg-stone-900 transition-all shadow-lg active:scale-95 animate-pulse"
              >
                Enter as Guest Author
              </button>
            )}
          </div>
        )}

        <div className="space-y-4 mb-10">
          <button 
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-4 py-5 px-8 bg-white border-2 border-stone-100 rounded-3xl text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600 hover:shadow-2xl hover:border-stone-900 transition-all disabled:opacity-50 group shadow-sm active:scale-95"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-t-transparent border-stone-900 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 transition-transform group-hover:scale-125" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? 'Bridging...' : 'Continue with Google'}
          </button>

          <div className="relative flex items-center justify-center py-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100"></div></div>
            <span className="relative bg-white px-6 text-[10px] uppercase tracking-[0.5em] text-stone-300 font-bold">Or use ink</span>
          </div>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.4em] text-stone-400 mb-3 px-1">Writer's Portal</label>
            <input 
              required
              type="email"
              className="w-full bg-stone-50 border-2 border-transparent rounded-3xl px-8 py-5 text-base focus:outline-none focus:bg-white focus:border-stone-900 transition-all placeholder:text-stone-200"
              placeholder="email@4thestory.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || googleLoading}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.4em] text-stone-400 mb-3 px-1">Sacred Key</label>
            <input 
              required
              type="password"
              className="w-full bg-stone-50 border-2 border-transparent rounded-3xl px-8 py-5 text-base focus:outline-none focus:bg-white focus:border-stone-900 transition-all placeholder:text-stone-200"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || googleLoading}
            />
          </div>

          <button 
            disabled={loading || googleLoading}
            className="w-full py-6 bg-stone-900 text-white rounded-3xl text-[11px] font-bold uppercase tracking-[0.5em] hover:bg-[#78350f] transition-all shadow-2xl disabled:opacity-50 transform hover:-translate-y-1 active:translate-y-0"
          >
            {loading ? "Authorizing..." : (isLogin ? 'Enter Sanctuary' : 'Initiate Manifesto')}
          </button>
        </form>

        <div className="mt-12 flex flex-col items-center gap-6">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="text-[11px] font-bold uppercase tracking-[0.3em] text-stone-400 hover:text-stone-900 transition-colors border-b-2 border-transparent hover:border-stone-900"
          >
            {isLogin ? "New Voice? Start Here." : "Existing master? Sign In."}
          </button>
          
          <button 
            onClick={handleMockSignIn}
            className="text-[9px] font-bold uppercase tracking-[0.4em] text-stone-200 hover:text-[#78350f] transition-all"
          >
            Bypass for Demo Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
