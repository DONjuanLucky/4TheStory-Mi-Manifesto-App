
import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { User } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyAs5z8PBxvy8b_kaSb8sN0nBQfAAmfBIbg",
  authDomain: "infinityhouse-1794f.firebaseapp.com",
  databaseURL: "https://infinityhouse-1794f-default-rtdb.firebaseio.com",
  projectId: "infinityhouse-1794f",
  storageBucket: "infinityhouse-1794f.firebasestorage.app",
  messagingSenderId: "750858809775",
  appId: "1:750858809775:web:6591bbf57fcfdc3899bf5a",
  measurementId: "G-HXGV6TNPSS"
};

// Initialize Firebase once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const MOCK_USER_KEY = 'MI_MANIFESTO_MOCK_USER';

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL
    };
  } catch (error: any) {
    console.error("Google Auth Error:", error.message);
    throw error;
  }
};

/**
 * Provides a mock sign-in capability for environments where Firebase 
 * domain whitelisting is not configured (e.g., local preview sandboxes).
 */
export const signInMock = async (): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockUser: User = {
        uid: "mock-user-" + Math.random().toString(36).substr(2, 5),
        email: "guest@mimanifesto.art",
        displayName: "Guest Author",
        photoURL: null
      };
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
      resolve(mockUser);
    }, 800);
  });
};

export const signUpWithEmail = async (email: string, pass: string): Promise<User> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const displayName = email.split('@')[0];
    await updateProfile(result.user, { displayName });
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: displayName,
      photoURL: null
    };
  } catch (error: any) {
    console.error("Email SignUp Error:", error.message);
    throw error;
  }
};

export const signInWithEmail = async (email: string, pass: string): Promise<User> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL
    };
  } catch (error: any) {
    console.error("Email SignIn Error:", error.message);
    throw error;
  }
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  // Check for local mock user immediately to prevent flashing
  const mockUserJson = localStorage.getItem(MOCK_USER_KEY);
  if (mockUserJson) {
    try {
      const mockUser = JSON.parse(mockUserJson);
      callback(mockUser);
    } catch (e) {
      console.error("Failed to parse mock user", e);
    }
  }

  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      // If a real user is logged in, clear any mock user data to prevent conflicts
      localStorage.removeItem(MOCK_USER_KEY);

      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL
      };
      callback(user);
    } else {
      // Fallback to mock user if available
      const storedMock = localStorage.getItem(MOCK_USER_KEY);
      if (storedMock) {
        try {
          callback(JSON.parse(storedMock));
        } catch {
          callback(null);
        }
      } else {
        callback(null);
      }
    }
  });
};

export const logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('mi_manifesto_user');
    localStorage.removeItem(MOCK_USER_KEY);
    window.location.reload();
  } catch (e) {
    console.error("Firebase SignOut error:", e);
  }
};
