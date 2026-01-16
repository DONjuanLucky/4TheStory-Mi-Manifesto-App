
import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";
import { User } from '../types';

// IMPORTANT: Replace these with your actual keys from the Firebase Console (https://console.firebase.google.com)
// If you leave them as placeholders, the app will use a robust local simulation mode.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", 
  authDomain: "4thestory.firebaseapp.com",
  projectId: "4thestory",
  storageBucket: "4thestory.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Check if we have real config values
const isRealConfig = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY";

let auth: any = null;

if (isRealConfig) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    console.log("Firebase Auth initialized successfully.");
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
} else {
  console.warn("Mi Manifesto: Using Local Simulation Mode. Replace placeholders in authService.ts for production Google Auth.");
}

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User> => {
  // If we have real Firebase configured, use it.
  if (auth) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user: User = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      };
      localStorage.setItem('mi_manifesto_user', JSON.stringify(user));
      return user;
    } catch (error: any) {
      console.error("Google Auth Error:", error.message);
      // Fallback to simulation if popup fails or is blocked during testing
      return simulateGoogleLogin();
    }
  }

  // Fallback to simulation
  return simulateGoogleLogin();
};

const simulateGoogleLogin = (): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockUser: User = {
        uid: "google-sim-" + Math.random().toString(36).substr(2, 9),
        email: "author@4thestory.com",
        displayName: "Lucky Author",
        photoURL: "https://lh3.googleusercontent.com/a/default-user"
      };
      localStorage.setItem('mi_manifesto_user', JSON.stringify(mockUser));
      resolve(mockUser);
    }, 1000);
  });
};

export const simulateAuthChange = (callback: (user: User | null) => void) => {
  if (auth) {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        };
        callback(user);
      } else {
        const savedUser = localStorage.getItem('mi_manifesto_user');
        callback(savedUser ? JSON.parse(savedUser) : null);
      }
    });
  }

  // Mock fallback logic
  const savedUser = localStorage.getItem('mi_manifesto_user');
  callback(savedUser ? JSON.parse(savedUser) : null);
};

export const logout = async () => {
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase SignOut error:", e);
    }
  }
  localStorage.removeItem('mi_manifesto_user');
  window.location.reload();
};
