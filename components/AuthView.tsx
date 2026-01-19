
import React, { useState } from 'react';
import { User } from '../types';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, signInMock } from '../services/authService';
import Logo from './Logo';

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
          <div className="w-24 h-24 mx-auto mb-8 flex items-center justify-center rotate-3 hover:rotate-0 transition-all duration-500">
            <Logo className="w-full h-full" />
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
            className="w-full flex items-center justify-center gap-4 py-5 px-8 bg-white border-2 border-stone-100 rounded-3xl text-[11px] font-bold uppercase tracking-widest text-stone-600 hover:border-stone-900 hover:text-stone-900 hover:shadow-lg transition-all active:scale-95 group"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
            ) : (
              <>
                 <svg className="w-5 h-5 group-hover:opacity-80 transition-opacity" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4"/>
                  <path d="M12.24 24.0008C15.4765 24.0008 18.2058 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.24 24.0008Z" fill="#34A853"/>
                  <path d="M5.50253 14.3003C5.00309 12.8099 5.00309 11.1961 5.50253 9.70575V6.61481H1.5166C-0.18551 10.0056 -0.18551 14.0004 1.5166 17.3912L5.50253 14.3003Z" fill="#FBBC05"/>
                  <path d="M12.24 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.24 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50253 9.70575C6.45064 6.86173 9.10947 4.74966 12.24 4.74966Z" fill="#EA4335"/>
                 </svg>
                 <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-200 w-full absolute"></div>
            <span className="bg-[#f5f2eb] px-4 text-[9px] font-bold uppercase tracking-widest text-stone-400 relative z-10">Or with Email</span>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
             <input 
               type="email" 
               placeholder="Email Address" 
               className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-stone-100 focus:border-stone-400 focus:outline-none text-stone-800 placeholder:text-stone-300 transition-colors"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               required
             />
             <input 
               type="password" 
               placeholder="Password" 
               className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-stone-100 focus:border-stone-400 focus:outline-none text-stone-800 placeholder:text-stone-300 transition-colors"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
             />
             <button 
               type="submit" 
               disabled={loading}
               className="w-full py-5 bg-[#1c1917] text-white rounded-3xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#ea580c] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
             >
               {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
               <span>{isLogin ? 'Enter Sanctuary' : 'Create Account'}</span>
             </button>
          </form>
        </div>

        <div className="text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 border-b border-transparent hover:border-stone-900 pb-1 transition-all"
          >
            {isLogin ? "New here? Create an account" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
